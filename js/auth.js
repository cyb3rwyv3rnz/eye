// BCIA Intelligence System - Secure Authentication
const API_URL = window.location.origin;

// Liveness evidence submission re-runs face detection + landmarks + a
// descriptor on 5 frames server-side, which can take several seconds on this
// box's pure-JS TensorFlow backend (see sam.js loadFaceModels' warmup
// comment). A plain fetch() never times out on its own, so a slow-but-alive
// server and a genuinely unreachable one both eventually look like "network
// error" to the user — which is exactly the misleading message people were
// seeing. This gives a real, generous ceiling and a distinct error for it.
async function fetchWithTimeout(url, options, timeoutMs = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ============================================================================
// LIVENESS CAPTURE — required for non-admin logins. Records camera video for
// as long as it takes (no time limit) and, in real time, tracks whether the
// user actually opens their mouth, smiles, and turns their head in the
// direction the server just assigned (public/js/vendor/face-api.min.js + the
// same models/ the server loads). A printed photo or a photo of a phone/
// monitor screen can't do any of that on a random cue, which is the
// realistic spoofing case this defeats. This on-device tracking only drives
// the live checklist UI — the server independently recomputes everything
// from the submitted evidence frames before ever trusting the result (see
// verifyLivenessEvidence in sam.js).
// ============================================================================
const LIVENESS_MODEL_URL = '/models';
let livenessModelsPromise = null;
function loadLivenessModels() {
    if (!livenessModelsPromise) {
        livenessModelsPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(LIVENESS_MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(LIVENESS_MODEL_URL)
        ]);
    }
    return livenessModelsPromise;
}

// Same mouth-open / mouth-width / nose-offset math as sam.js's
// verifyLivenessEvidence — kept in sync by hand (this app has no shared
// module system), so what the live checklist shows and what the server
// ultimately checks always agree.
//
// Eye-blink/closure was dropped entirely (used to live here as an EAR
// check) — even as a sustained 3-second hold it wasn't reliably triggering.
// Eyes are small, subtle landmarks; TinyFaceDetector's precision around them
// just isn't reliable enough on this box/camera. Mouth movement has a much
// bigger dynamic range and is far more robust to detector imprecision.
function pointDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function centroid(points) {
    return {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };
}
function computeLivenessMetrics(landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const mouth = landmarks.getMouth();
    const nose = landmarks.getNose();
    const leftEyeCenter = centroid(leftEye);
    const rightEyeCenter = centroid(rightEye);
    const interocular = pointDist(leftEyeCenter, rightEyeCenter);
    // Outer mouth corners (points 48/54 -> getMouth() indices 0/6): widens on a smile.
    const mar = pointDist(mouth[0], mouth[6]) / interocular;
    // Inner upper/lower lip centers (points 62/66 -> getMouth() indices 14/18):
    // near-zero when closed, grows a lot when the mouth opens.
    const mouthOpen = pointDist(mouth[14], mouth[18]) / interocular;
    const eyeMidpoint = { x: (leftEyeCenter.x + rightEyeCenter.x) / 2, y: (leftEyeCenter.y + rightEyeCenter.y) / 2 };
    const noseOffset = (nose[6].x - eyeMidpoint.x) / interocular;
    return { mar, mouthOpen, noseOffset };
}
function average(arr) { return arr.reduce((sum, v) => sum + v, 0) / arr.length; }

// This is the strict live gate (continuous tracking, fast WebGL backend) —
// sam.js's copy of these same ratios/deltas is deliberately looser, not
// identical: it only re-checks the captured evidence frames on a slower
// backend, so it acts as a lenient backstop rather than an equally strict
// second gate. If these ever get tightened, sam.js's copy should stay looser
// than whatever this becomes.
const LIVENESS_MOUTH_OPEN_DELTA = 0.13; // mouth-open frame's opening must exceed baseline by this much (normalized)
const LIVENESS_SMILE_RISE_RATIO = 1.08;
const LIVENESS_TURN_MIN_SHIFT = 0.06; // small — real head turns in front of a laptop webcam are often modest
const LIVENESS_TRACK_INTERVAL_MS = 80;
const LIVENESS_BASELINE_SAMPLES = 5;

// Frame is drawn horizontally flipped so it matches the mirrored preview the
// user actually saw (the <video> element is CSS-mirrored for a natural
// "look in a mirror" feel, but the raw camera frame underneath isn't) — so
// "turn left" consistently means what the user themselves would call left,
// in every saved frame, on both the client's live check and the server's.
function grabMirroredFrame(video, mimeType, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL(mimeType || 'image/jpeg', quality || 0.85);
}

// Real MP4 recording via MediaRecorder only works on some browsers (mainly
// Chrome/Edge with H.264 support) — Firefox and older browsers only support
// WebM. Try MP4 first and actually record in whatever the browser can do;
// the server saves the file with a matching extension either way rather than
// mislabeling a WebM file as .mp4.
function pickVideoMimeType() {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
        'video/mp4;codecs=h264',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
    ];
    for (const type of candidates) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function buildLivenessChallenges(turnDirection) {
    const turnLabel = turnDirection === 'left' ? 'سوڕانەوەی سەر بۆ لای چەپ' : 'سوڕانەوەی سەر بۆ لای ڕاست';
    const turnInstruction = turnDirection === 'left' ? 'سەرت بەرەو لای چەپ بسوڕێنە' : 'سەرت بەرەو لای ڕاست بسوڕێنە';
    const list = [
        {
            id: 'mouthOpen', frameKey: 'mouthOpenFrame', label: 'کردنەوەی دەم', instruction: 'دەمت بە فراوانی بکەرەوە (وەک ووتنی "ئااا")',
            check: (m, b) => m.mouthOpen >= b.mouthOpen + LIVENESS_MOUTH_OPEN_DELTA
        },
        {
            id: 'smile', frameKey: 'smileFrame', label: 'پێکەنین', instruction: 'پێبکەنە',
            check: (m, b) => m.mar >= b.mar * LIVENESS_SMILE_RISE_RATIO
        },
        {
            id: 'turn', frameKey: 'turnFrame', label: turnLabel, instruction: turnInstruction,
            check: (m, b) => turnDirection === 'left'
                ? (m.noseOffset - b.noseOffset) <= -LIVENESS_TURN_MIN_SHIFT
                : (m.noseOffset - b.noseOffset) >= LIVENESS_TURN_MIN_SHIFT
        }
    ];
    // Shuffle display order only — every attempt still requires all three,
    // this just stops the checklist always asking for them in the same order.
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

const LivenessCapture = {
    run(turnDirection, hintMessage) {
        return new Promise((resolve, reject) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('unsupported'));
                return;
            }
            if (typeof faceapi === 'undefined') {
                reject(new Error('models-unavailable'));
                return;
            }

            const challenges = buildLivenessChallenges(turnDirection);

            const modal = document.createElement('div');
            modal.id = 'livenessModal';
            modal.className = 'liveness-modal';
            modal.innerHTML = `
                <div class="liveness-card">
                    <div class="liveness-head">پشتڕاستکردنەوەی زیندووبوونی ڕووخسار</div>
                    <div class="liveness-sub" id="livenessSub">ڕووخسارت لەبەردەم کامێراکە ڕابگرە</div>
                    <div class="liveness-video-wrap">
                        <video id="livenessVideo" autoplay playsinline muted></video>
                    </div>
                    <ul class="liveness-checklist" id="livenessChecklist">
                        ${challenges.map(c => `
                            <li class="liveness-check-item" data-challenge="${c.id}">
                                <span class="liveness-check-icon"></span>
                                <span>${c.label}</span>
                            </li>
                        `).join('')}
                    </ul>
                    <div class="liveness-debug" id="livenessDebug"></div>
                    <div class="liveness-error" id="livenessError">${hintMessage ? `هەوڵی پێشوو سەرکەوتوو نەبوو: ${hintMessage}` : ''}</div>
                    <div class="liveness-actions">
                        <button type="button" id="livenessCancelBtn" class="liveness-btn liveness-btn-ghost">پاشگەزبوونەوە</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const video = modal.querySelector('#livenessVideo');
            const subEl = modal.querySelector('#livenessSub');
            const errorEl = modal.querySelector('#livenessError');
            const debugEl = modal.querySelector('#livenessDebug');
            const cancelBtn = modal.querySelector('#livenessCancelBtn');
            const itemEls = {};
            challenges.forEach(c => { itemEls[c.id] = modal.querySelector(`[data-challenge="${c.id}"]`); });

            let stream = null;
            let settled = false;
            let trackTimer = null;
            let hardErrorShown = false;
            let baseline = null;
            let mediaRecorder = null;
            let recordedChunks = [];
            let videoMimeType = '';
            // Sequential, one-gesture-at-a-time state machine (see beginTracking):
            // 'baseline' (collecting a fresh neutral reading) -> 'gesture' (checking
            // challenges[currentIndex] only) -> 'pause' (cooldown, nothing checked)
            // -> back to 'baseline' for the next gesture, or 'final-pause' after the
            // last one. Only ever ONE challenge is evaluated at a time, which is what
            // stops a single motion (e.g. opening the mouth wide) from also reading
            // as a smile — the smile check simply isn't running while mouth-open is
            // the active gesture.
            let phase = 'baseline';
            let currentIndex = 0;
            let phaseStartedAt = null;
            const baselineSamples = [];
            const frames = {};
            const PAUSE_MS = 3000;
            const FINAL_PAUSE_MS = 5000;

            function stopMediaRecorderQuietly() {
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    try { mediaRecorder.stop(); } catch (e) { /* already stopping/stopped */ }
                }
            }
            function cleanup() {
                if (trackTimer) clearInterval(trackTimer);
                stopMediaRecorderQuietly();
                if (stream) stream.getTracks().forEach(t => t.stop());
                modal.remove();
            }
            // Waits for the recorder's last chunk before resolving, so a video that
            // was still writing at the moment of success isn't cut short. Has its
            // own short safety timeout — a stuck recorder should never be able to
            // hang the whole login (video is a nice-to-have record, not a gate).
            function stopRecordingAndGetBlob() {
                return new Promise((resolveBlob) => {
                    if (!mediaRecorder || mediaRecorder.state === 'inactive') { resolveBlob(null); return; }
                    let resolved = false;
                    const safety = setTimeout(() => {
                        if (resolved) return;
                        resolved = true;
                        resolveBlob(null);
                    }, 5000);
                    mediaRecorder.onstop = () => {
                        if (resolved) return;
                        resolved = true;
                        clearTimeout(safety);
                        resolveBlob(recordedChunks.length ? new Blob(recordedChunks, { type: videoMimeType || 'video/webm' }) : null);
                    };
                    try {
                        mediaRecorder.stop();
                    } catch (e) {
                        if (!resolved) { resolved = true; clearTimeout(safety); resolveBlob(null); }
                    }
                });
            }
            async function finish(result) {
                if (settled) return;
                settled = true;
                if (trackTimer) clearInterval(trackTimer);
                try {
                    const videoBlob = await stopRecordingAndGetBlob();
                    if (videoBlob && videoBlob.size > 0) {
                        result.video = await blobToDataURL(videoBlob);
                        result.videoMimeType = videoMimeType || 'video/webm';
                    }
                } catch (e) {
                    // Best-effort — a failed recording should never block a
                    // successful liveness result from reaching the server.
                }
                cleanup(); // recorder is already inactive by now; this just stops the camera tracks and removes the modal
                resolve(result);
            }
            function fail(err) {
                if (settled) return;
                settled = true;
                cleanup();
                reject(err);
            }

            cancelBtn.addEventListener('click', () => fail(new Error('cancelled')));

            function startRecording(mediaStream) {
                videoMimeType = pickVideoMimeType();
                try {
                    mediaRecorder = new MediaRecorder(mediaStream, {
                        ...(videoMimeType ? { mimeType: videoMimeType } : {}),
                        videoBitsPerSecond: 1000000
                    });
                    recordedChunks = [];
                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
                    };
                    mediaRecorder.start(1000);
                } catch (e) {
                    // Recording isn't supported/failed to start — the liveness check
                    // itself doesn't depend on it, so just carry on without video.
                    mediaRecorder = null;
                }
            }

            function startStream(constraints) {
                return navigator.mediaDevices.getUserMedia(constraints).then(s => {
                    stream = s;
                    video.srcObject = s;
                    video.play().catch(() => {});
                    startRecording(s);
                });
            }

            const cameraReady = startStream({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
                audio: false
            })
                .catch(err => {
                    // Some devices (mostly desktops/webcams) reject facingMode/frameRate
                    // as unsatisfiable constraints — retry with a plain video request
                    // before giving up entirely.
                    if (err && err.name === 'OverconstrainedError') {
                        return startStream({ video: true, audio: false });
                    }
                    throw err;
                })
                .catch(err => {
                    const messages = {
                        NotAllowedError: 'دەستگەیشتنی کامێرا ڕەتکرایەوە. تکایە لە ڕێکخستنەکانی وێبگەڕ ڕێگە بدە بە کامێرا و دووبارە هەوڵ بدەرەوە.',
                        NotFoundError: 'هیچ کامێرایەک نەدۆزرایەوە لەسەر ئەم ئامێرە.',
                        NotReadableError: 'کامێراکە لەلایەن بەرنامەیەکی تر بەکاردەهێنرێت. تکایە بەرنامەکانی تر دابخە و دووبارە هەوڵ بدەرەوە.',
                        SecurityError: 'وێبگەڕەکەت پەیوەندییەکی پارێزراو (HTTPS) پێویستە بۆ بەکارهێنانی کامێرا.'
                    };
                    hardErrorShown = true;
                    errorEl.textContent = messages[err && err.name] || 'ناتوانرێت دەستت بگات بە کامێرا. تکایە ڕێگە بدە بە بەکارهێنانی کامێرا.';
                    throw err;
                });

            Promise.all([cameraReady, loadLivenessModels()])
                .then(() => {
                    if (settled) return;
                    if (!video.videoWidth) {
                        video.addEventListener('loadedmetadata', beginTracking, { once: true });
                    } else {
                        beginTracking();
                    }
                })
                .catch(() => {
                    if (!settled && !hardErrorShown) {
                        hardErrorShown = true;
                        errorEl.textContent = 'ئامادەکردنی پشتڕاستکردنەوە سەرکەوتوو نەبوو. تکایە دووبارە هەوڵ بدەرەوە.';
                    }
                });

            // Live numeric readout of what the tracker is actually seeing, shown
            // under the checklist the whole time. There's no way to test a real
            // camera/face from here, so this is the difference between guessing at
            // thresholds blind and being able to actually see why a check isn't
            // triggering (no face found at all? found, but never crosses the
            // target?) and fix the right thing.
            function updateDebugPanel(metrics) {
                if (phase === 'pause') {
                    const remain = Math.max(0, PAUSE_MS - (Date.now() - phaseStartedAt));
                    debugEl.textContent = `پشوودان پێش نەخشەی داهاتوو... ${(remain / 1000).toFixed(1)}s`;
                    return;
                }
                if (phase === 'final-pause') {
                    const remain = Math.max(0, FINAL_PAUSE_MS - (Date.now() - phaseStartedAt));
                    debugEl.textContent = `تەواو بوو، چاوەڕێی هەنگاوی داهاتوو... ${(remain / 1000).toFixed(1)}s`;
                    return;
                }
                if (!metrics) {
                    debugEl.textContent = 'ڕووخسار نەدۆزرایەوە';
                    return;
                }
                if (phase === 'baseline') {
                    debugEl.textContent = `دەمکردنەوە ${metrics.mouthOpen.toFixed(3)}   پێکەنین ${metrics.mar.toFixed(3)}   سەر ${metrics.noseOffset.toFixed(3)}   (بنەما ئامادەدەکرێت ${baselineSamples.length}/${LIVENESS_BASELINE_SAMPLES})`;
                    return;
                }
                // phase === 'gesture' — only the currently-active challenge's numbers
                // are relevant, since it's the only one being evaluated right now.
                const current = challenges[currentIndex];
                if (current.id === 'mouthOpen') {
                    const target = baseline.mouthOpen + LIVENESS_MOUTH_OPEN_DELTA;
                    debugEl.textContent = `دەمکردنەوە ${metrics.mouthOpen.toFixed(3)} / ئامانج ≥ ${target.toFixed(3)}`;
                } else if (current.id === 'smile') {
                    const target = baseline.mar * LIVENESS_SMILE_RISE_RATIO;
                    debugEl.textContent = `پێکەنین ${metrics.mar.toFixed(3)} / ئامانج ≥ ${target.toFixed(3)}`;
                } else {
                    const target = turnDirection === 'left' ? baseline.noseOffset - LIVENESS_TURN_MIN_SHIFT : baseline.noseOffset + LIVENESS_TURN_MIN_SHIFT;
                    debugEl.textContent = `سەر ${metrics.noseOffset.toFixed(3)} / ئامانج ${turnDirection === 'left' ? '≤' : '≥'} ${target.toFixed(3)}`;
                }
            }

            function enterBaselinePhase() {
                phase = 'baseline';
                baselineSamples.length = 0;
                subEl.textContent = 'ئارامبە، ئامادەکردن...';
            }
            function enterGesturePhase() {
                phase = 'gesture';
                const current = challenges[currentIndex];
                challenges.forEach((c, i) => itemEls[c.id].classList.toggle('active', i === currentIndex));
                subEl.textContent = current.instruction;
            }
            function enterPausePhase() {
                phase = 'pause';
                phaseStartedAt = Date.now();
                const next = challenges[currentIndex];
                subEl.textContent = next ? `باشە! پشووبدە... دواتر: ${next.label}` : 'باشە! پشووبدە...';
            }
            function enterFinalPause() {
                phase = 'final-pause';
                phaseStartedAt = Date.now();
                subEl.textContent = 'هەموو شتێک تەواو بوو! تکایە چاوەڕێ بکە...';
            }

            function beginTracking() {
                enterBaselinePhase();

                // No time limit — this runs until all three gestures pass (each with
                // its own 3s cooldown before the next one starts checking, plus a
                // final 5s pause) or the user cancels. detectSingleFace is async and
                // can occasionally take longer than the tick interval; the `ticking`
                // guard stops setInterval from firing overlapping detections that
                // would race on the shared state below.
                let ticking = false;
                trackTimer = setInterval(async () => {
                    if (ticking || settled || !video.videoWidth) return;

                    if (phase === 'pause') {
                        updateDebugPanel(null);
                        if (Date.now() - phaseStartedAt >= PAUSE_MS) enterBaselinePhase();
                        return;
                    }
                    if (phase === 'final-pause') {
                        updateDebugPanel(null);
                        if (Date.now() - phaseStartedAt >= FINAL_PAUSE_MS) {
                            // PNG, not JPEG like the other evidence frames: this is the
                            // one frame the server keeps as the permanent audit-record
                            // image (saved to disk as image.png); the rest are only ever
                            // used for one-shot verification and never written to disk.
                            frames.finalFrame = grabMirroredFrame(video, 'image/png');
                            finish(frames);
                        }
                        return;
                    }

                    ticking = true;
                    let detection;
                    try {
                        detection = await faceapi
                            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
                            .withFaceLandmarks();
                    } catch (e) {
                        ticking = false;
                        return;
                    }
                    ticking = false;
                    if (settled) return;
                    if (!detection) {
                        subEl.textContent = 'ڕووخسارت لەبەردەم کامێراکە ڕابگرە';
                        updateDebugPanel(null);
                        return;
                    }

                    const metrics = computeLivenessMetrics(detection.landmarks);
                    updateDebugPanel(metrics);

                    if (phase === 'baseline') {
                        baselineSamples.push(metrics);
                        if (baselineSamples.length >= LIVENESS_BASELINE_SAMPLES) {
                            baseline = {
                                mar: average(baselineSamples.map(s => s.mar)),
                                mouthOpen: average(baselineSamples.map(s => s.mouthOpen)),
                                noseOffset: average(baselineSamples.map(s => s.noseOffset))
                            };
                            // Only the very first baseline is sent as evidence — later
                            // re-baselines (before gestures 2 and 3) are purely a
                            // client-side accuracy improvement, the server still
                            // compares every gesture frame against this one original
                            // neutral reading.
                            if (currentIndex === 0 && !frames.baseline) {
                                frames.baseline = grabMirroredFrame(video);
                            }
                            enterGesturePhase();
                        }
                        return;
                    }

                    // phase === 'gesture': only challenges[currentIndex] is ever
                    // evaluated here — the others simply aren't checked until their
                    // own turn, which is what stops one motion (e.g. a wide mouth-
                    // open) from also satisfying a different challenge (e.g. smile).
                    const current = challenges[currentIndex];
                    if (current.check(metrics, baseline)) {
                        frames[current.frameKey] = grabMirroredFrame(video);
                        itemEls[current.id].classList.add('done');
                        itemEls[current.id].classList.remove('active');
                        currentIndex++;
                        if (currentIndex >= challenges.length) {
                            enterFinalPause();
                        } else {
                            enterPausePhase();
                        }
                    }
                }, LIVENESS_TRACK_INTERVAL_MS);
            }
        });
    }
};

// ============================================================================
// PHONE CAPTURE — asked right after a successful face check. Just collects
// and lightly validates a phone number; the server does the real validation.
// ============================================================================
const PhoneCapture = {
    prompt(hintMessage) {
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.id = 'phoneCaptureModal';
            modal.className = 'liveness-modal';
            modal.innerHTML = `
                <div class="liveness-card liveness-card-narrow">
                    <div class="liveness-head">ژمارە مۆبایل</div>
                    <div class="liveness-sub">تکایە ژمارە مۆبایلەکەت بنووسە بۆ تەواوکردنی چوونەژوورەوە</div>
                    <div class="form-group" style="margin:var(--sp-4) 0;">
                        <div class="input-wrap">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <input type="tel" id="phoneCaptureInput" placeholder="07XXXXXXXXX" style="direction:ltr; text-align:left;">
                        </div>
                    </div>
                    <div class="liveness-error" id="phoneCaptureError">${hintMessage ? hintMessage : ''}</div>
                    <div class="liveness-actions">
                        <button type="button" id="phoneCaptureCancelBtn" class="liveness-btn liveness-btn-ghost">پاشگەزبوونەوە</button>
                        <button type="button" id="phoneCaptureSubmitBtn" class="liveness-btn liveness-btn-primary">بنێرە</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const input = modal.querySelector('#phoneCaptureInput');
            const errorDiv = modal.querySelector('#phoneCaptureError');
            const submitBtn = modal.querySelector('#phoneCaptureSubmitBtn');
            const cancelBtn = modal.querySelector('#phoneCaptureCancelBtn');
            let settled = false;
            input.focus();

            function submit() {
                if (settled) return;
                const value = input.value.trim();
                if (!/^\+?[0-9]{7,15}$/.test(value)) {
                    errorDiv.textContent = 'ژمارە مۆبایلەکە نادروستە. تکایە دووبارە بینووسەوە.';
                    return;
                }
                settled = true;
                modal.remove();
                resolve(value);
            }

            submitBtn.addEventListener('click', submit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); submit(); }
            });

            cancelBtn.addEventListener('click', () => {
                if (settled) return;
                settled = true;
                modal.remove();
                reject(new Error('cancelled'));
            });
        });
    }
};

// Check if already logged in
// SECURITY FIX: the session token now lives ONLY in an httpOnly cookie the
// server sets on login — it is never written to localStorage, so an XSS bug
// anywhere on the site can no longer read it via localStorage.getItem() and
// exfiltrate it for full account takeover. We just ask the server (which
// reads the cookie) whether we're logged in.
verifyToken();

// Tab switching
const AUTH_TAB_COPY = {
    login: { title: 'بەخێربێیتەوە', sub: 'بچۆ ژوورەوە بە ناسنامەی ئەجێنتەکەت بۆ بەردەوامبوون' },
    register: { title: 'داوای دەستپێگەیشتن', sub: 'داوای هەژمارێکی نوێ بکە، چاوەڕوانی پەسەندکردن بێت' }
};
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
        document.getElementById(`${targetTab}Form`).classList.remove('hidden');

        const copy = AUTH_TAB_COPY[targetTab];
        if (copy) {
            const titleEl = document.getElementById('authHeadTitle');
            const subEl = document.getElementById('authHeadSub');
            if (titleEl) titleEl.textContent = copy.title;
            if (subEl) subEl.textContent = copy.sub;
        }

        clearAlert();
    });
});

// Login form handler
// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showAlert('هەموو خانەکان پێویستن', 'error');
        return;
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; margin: 0 auto; border-width: 3px;"></div>';
    btn.disabled = true;
    
    try {
        // Multi-phase login: try with just credentials first. Admin accounts succeed
        // immediately here and never see a camera or phone prompt. Non-admin accounts
        // with correct credentials go through two extra steps in order:
        //   1. faceRequired  -> open camera, capture a photo, resubmit
        //   2. phoneRequired -> ask for a phone number, resubmit with the faceToken
        //      the server handed back (so the photo itself is never re-sent)
        let body = { username, password };
        let response, data;

        for (let attempt = 0; attempt < 8; attempt++) {
            response = await fetchWithTimeout(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }, 45000);
            data = await response.json();

            if (data.faceRequired && !data.phoneRequired) {
                let faceEvidence;
                try {
                    const hint = data.livenessFailed ? data.error : null;
                    faceEvidence = await LivenessCapture.run(data.turnDirection, hint);
                } catch (captureErr) {
                    const messages = {
                        unsupported: 'وێبگەڕەکەت پشتگیری کامێرا ناکات، یان پەیوەندییەکە پارێزراو نییە (HTTPS پێویستە).',
                        'models-unavailable': 'سیستەمی پشتڕاستکردنەوە ئامادە نییە. تکایە پەڕەکە نوێ بکەرەوە و دووبارە هەوڵ بدەرەوە.'
                    };
                    const msg = messages[captureErr && captureErr.message];
                    if (msg) {
                        showAlert(msg, captureErr.message === 'unsupported' ? 'error' : 'warning');
                    } else {
                        showAlert('پێویستە پشتڕاستکردنەوەی ڕووخسار تەواو بکەیت بۆ چوونەژوورەوە.', 'warning');
                    }
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }
                body = { username, password, challengeToken: data.challengeToken, evidence: faceEvidence };
                continue;
            }

            if (data.phoneRequired) {
                let phoneNumber;
                try {
                    // If we already submitted a phone number and the server rejected
                    // it (bad format), data.error carries that message — reuse it as
                    // the prompt's hint so the user sees why they're back here.
                    const hint = body.phoneNumber ? data.error : null;
                    phoneNumber = await PhoneCapture.prompt(hint);
                } catch (promptErr) {
                    showAlert('ژمارە مۆبایل پێویستە بۆ چوونەژوورەوە.', 'warning');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }
                body = { username, password, faceToken: data.faceToken, phoneNumber };
                continue;
            }

            break; // success, or an unrelated rejection (wrong password, suspended, pending approval, etc.)
        }

        if (response.ok && data.success) {
            // SECURITY FIX: no longer storing the raw token in localStorage.
            // The server already set it as an httpOnly cookie; that cookie is
            // what actually authenticates every request now.
            localStorage.setItem('bcia_user', JSON.stringify(data.user));

            showAlert('ڕێگەپێدان وەرگیرا — پشتڕاستکردنەوە...', 'success');

            setTimeout(() => {
                if (data.user.is_admin) {
                    window.location.href = '/welcome.html';
                } else if (data.user.is_approved) {
                    window.location.href = '/welcome.html';
                } else {
                    localStorage.removeItem('bcia_user');
                    fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
                    showAlert('چاوەڕوانی مۆڵەتی ئاسایشە — چاوەڕێی ڕێگەپێدان بە', 'warning');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }, 1500);
        } else {
            // Check if error indicates suspension
            const errorMsg = data.error || 'ڕێگەپێنەدرا';

            if (errorMsg.toLowerCase().includes('suspended') ||
                errorMsg.toLowerCase().includes('account locked') ||
                errorMsg.toLowerCase().includes('revoked')) {
                showAlert('هەژمار ڕاگیراوە — پەیوەندی بە بەڕێوەبەری سیستەم بکە بۆ یارمەتی', 'suspended');
            } else {
                showAlert(errorMsg, 'error');
            }

            btn.innerHTML = originalText;
            btn.disabled = false;

            // Shake the form on error
            e.target.style.animation = 'none';
            setTimeout(() => {
                e.target.style.animation = 'formShake 0.3s';
            }, 10);
        }
    } catch (error) {
        if (error && error.name === 'AbortError') {
            showAlert('کاتی وەڵامدانەوە بەسەرچوو. تکایە دووبارە هەوڵ بدەرەوە.', 'error');
        } else {
            showAlert('هەڵەی پەیوەندی — ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت', 'error');
        }
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        showAlert('هەموو خانە پێویستەکان پێویستە پڕبکرێنەوە', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('وشەی نهێنییەکان یەکسان نین', 'error');
        return;
    }

    if (password.length < 12) {
        showAlert('وشەی نهێنی پێویستە لانیکەم ١٢ پیت بێت', 'error');
        return;
    }
    
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; margin: 0 auto; border-width: 3px;"></div>';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAlert('داواکاری نێردرا — چاوەڕوانی پەسەندکردنی بەڕێوەبەر بە', 'success');

            // Clear form
            e.target.reset();

            // Switch to login tab after 3 seconds
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 3000);
        } else {
            showAlert(data.error || 'تۆمارکردن سەرکەوتوو نەبوو', 'error');
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (error) {
        showAlert('هەڵەی پەیوەندی — ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Verify existing session (cookie-based — nothing to read from localStorage anymore)
async function verifyToken() {
    try {
        const response = await fetch(`${API_URL}/api/verify`, {
            credentials: 'same-origin'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('bcia_user', JSON.stringify(data.user));

                if (data.user.is_admin) {
                    window.location.href = '/welcome.html';
                } else if (data.user.is_approved) {
                    window.location.href = '/welcome.html';
                } else {
                    localStorage.removeItem('bcia_user');
                }
            }
        }
    } catch (error) {
        console.error('Token verification failed:', error);
    }
}

// Alert functions
// Alert functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    let alertClass = '';

    if (type === 'error') {
        alertClass = 'alert-error';
    } else if (type === 'success') {
        alertClass = 'alert-success';
    } else if (type === 'warning') {
        alertClass = 'alert-warning';
    } else if (type === 'suspended') {
        alertClass = 'alert-error alert-suspended';
    } else {
        alertClass = 'alert-success';
    }

    alertContainer.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;

    setTimeout(() => {
        if (type !== 'warning' && type !== 'success' && type !== 'suspended') {
            clearAlert();
        }
    }, type === 'suspended' ? 10000 : 5000); // Show suspended message for 10 seconds
}

function clearAlert() {
    document.getElementById('alertContainer').innerHTML = '';
}

// Enter key support
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const form = e.target.closest('form');
            if (!form.classList.contains('hidden')) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
});

