// BCIA Intelligence System - Shad Intelligence Bot Controller
const shadState = {
    selectedBot: null,
    sessionId: null,
    step: 0,
    ogImageBase64: null,
    bgImageBase64: null
};

const SHAD_BOT_LABELS = {
    Facebook: 'Facebook',
    WhatsApp: 'WhatsApp',
    TikTok: 'TikTok',
    Snapchat: 'Snapchat'
};

function openShadModal() {
    resetShadSession();
    document.getElementById('shadModal').classList.add('active');
}

function closeShadModal() {
    document.getElementById('shadModal').classList.remove('active');
}

function selectShadBot(botKey) {
    shadState.selectedBot = botKey;

    // Update UI
    document.querySelectorAll('.shad-bot-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('botCard_' + botKey)?.classList.add('selected');

    // Enable start button
    const startBtn = document.getElementById('shadStartBtn');
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';

    document.getElementById('shadSelectedBot').textContent = SHAD_BOT_LABELS[botKey] || botKey;
}

function shadShowLoading(text) {
    // Hide all steps
    ['shadStep0','shadStep1','shadStep2','shadStep3','shadStep4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    document.getElementById('shadLoading').style.display = 'block';
    if (text) document.getElementById('shadLoadingText').textContent = text;
}

function shadShowStep(n) {
    document.getElementById('shadLoading').style.display = 'none';
    ['shadStep0','shadStep1','shadStep2','shadStep3','shadStep4'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (i === n) ? 'block' : 'none';
    });
    // Update progress bar
    const progress = [0, 25, 50, 75, 100];
    document.getElementById('shadProgress').style.width = (progress[n] || 0) + '%';
}

async function startShadSession() {
    if (!shadState.selectedBot) return;

    shadShowLoading(getTranslation('shadConnecting') || 'CONNECTING TO BOT...');

    try {
        const res = await fetch(`${API_URL}/api/shad/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ botKey: shadState.selectedBot })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to start session');
        }

        shadState.sessionId = data.sessionId;
        shadState.step = 1;

        // Show step 1
        const botMsgEl = document.getElementById('shadBotMsg1');
        if (botMsgEl) botMsgEl.textContent = data.botResponse || 'Please send title.';
        shadShowStep(1);

    } catch (err) {
        alert('⚠ ' + err.message);
        shadShowStep(0);
    }
}

async function sendShadTitle() {
    const title = document.getElementById('shadTitleInput').value.trim();
    if (!title) {
        alert('Please enter a title!');
        return;
    }

    shadShowLoading(getTranslation('shadSending') || 'SENDING TITLE...');

    try {
        const res = await fetch(`${API_URL}/api/shad/send-title`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: shadState.sessionId, title })
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed');

        shadState.step = 2;
        const botMsgEl = document.getElementById('shadBotMsg2');
        if (botMsgEl) botMsgEl.textContent = data.botResponse || 'Please send an image for OG.';
        shadShowStep(2);

    } catch (err) {
        alert('⚠ ' + err.message);
        shadShowStep(1);
    }
}

function previewShadImage(input, type) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;

        if (type === 'og') {
            shadState.ogImageBase64 = base64;
            document.getElementById('shadOgImg').src = base64;
            document.getElementById('shadOgPreview').style.display = 'block';
            document.getElementById('shadOgPlaceholder').style.display = 'none';
            document.getElementById('shadOgUploadZone').classList.add('has-image');

            const btn = document.getElementById('shadOgSendBtn');
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';

        } else if (type === 'bg') {
            shadState.bgImageBase64 = base64;
            document.getElementById('shadBgImg').src = base64;
            document.getElementById('shadBgPreview').style.display = 'block';
            document.getElementById('shadBgPlaceholder').style.display = 'none';
            document.getElementById('shadBgUploadZone').classList.add('has-image');

            const btn = document.getElementById('shadBgSendBtn');
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    };
    reader.readAsDataURL(file);
}

async function sendShadOgImage() {
    if (!shadState.ogImageBase64) {
        alert('Please select an image!');
        return;
    }

    shadShowLoading(getTranslation('shadSendingImage') || 'SENDING OG IMAGE...');

    try {
        const res = await fetch(`${API_URL}/api/shad/send-og-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: shadState.sessionId,
                imageBase64: shadState.ogImageBase64
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed');

        shadState.step = 3;
        const botMsgEl = document.getElementById('shadBotMsg3');
        if (botMsgEl) botMsgEl.textContent = data.botResponse || 'Please send an image for background.';
        shadShowStep(3);

    } catch (err) {
        alert('⚠ ' + err.message);
        shadShowStep(2);
    }
}

async function sendShadBgImage() {
    if (!shadState.bgImageBase64) {
        alert('Please select an image!');
        return;
    }

    shadShowLoading(getTranslation('shadSendingImage') || 'SENDING BACKGROUND IMAGE...');

    try {
        const res = await fetch(`${API_URL}/api/shad/send-bg-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: shadState.sessionId,
                imageBase64: shadState.bgImageBase64
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed');

        shadState.step = 4;
        renderShadResult(data.botResponse);
        shadShowStep(4);

    } catch (err) {
        alert('⚠ ' + err.message);
        shadShowStep(3);
    }
}

function renderShadResult(rawText) {
    const container = document.getElementById('shadResultBox');
    if (!container) return;

    // Extract links from raw bot message
    const urlRegex = /https?:\/\/[^\s\n]+/g;
    const urls = rawText.match(urlRegex) || [];

    // Try to split Kurdistan message lines
    const lines = rawText.split('\n').filter(l => l.trim());

    let html = `
        <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary-green); box-shadow: 0 0 10px var(--glow-green);"></div>
            <span style="color: var(--primary-green); font-weight: bold; letter-spacing: 1px; font-size: 0.85rem;">BOT RESPONSE</span>
        </div>
    `;

    if (urls.length >= 2) {
        // We have links — render them nicely
        html += `
            <div class="shad-link-row">
                <span class="shad-link-label">📤 ${getTranslation('shadShareLink') || 'SHARE LINK'}</span>
                <span class="shad-link-value"><a href="${urls[0]}" target="_blank">${urls[0]}</a></span>
                <button class="shad-copy-btn" onclick="shadCopy('${urls[0]}', this)">COPY</button>
            </div>
            <div class="shad-link-row">
                <span class="shad-link-label">📊 ${getTranslation('shadResultLink') || 'RESULTS LINK'}</span>
                <span class="shad-link-value"><a href="${urls[1]}" target="_blank">${urls[1]}</a></span>
                <button class="shad-copy-btn" onclick="shadCopy('${urls[1]}', this)">COPY</button>
            </div>
        `;
    } else {
        // Fallback: show raw text formatted
        html += `<div style="color: var(--text-secondary); font-size: 0.85rem; white-space: pre-wrap; line-height: 1.8;">${escapeHtml(rawText)}</div>`;
    }

    container.innerHTML = html;
}

function shadCopy(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ COPIED';
        btn.style.color = 'var(--primary-green)';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.color = '';
        }, 2000);
    });
}

function resetShadSession() {
    shadState.selectedBot = null;
    shadState.sessionId = null;
    shadState.step = 0;
    shadState.ogImageBase64 = null;
    shadState.bgImageBase64 = null;

    // Reset UI
    document.querySelectorAll('.shad-bot-card').forEach(c => c.classList.remove('selected'));

    const startBtn = document.getElementById('shadStartBtn');
    if (startBtn) { startBtn.disabled = true; startBtn.style.opacity = '0.4'; startBtn.style.cursor = 'not-allowed'; }

    const titleInput = document.getElementById('shadTitleInput');
    if (titleInput) titleInput.value = '';


    ['Og', 'Bg'].forEach(t => {
        const preview = document.getElementById(`shad${t}Preview`);
        const placeholder = document.getElementById(`shad${t}Placeholder`);
        const zone = document.getElementById(`shad${t}UploadZone`);
        const btn = document.getElementById(`shad${t}SendBtn`);
        const input = document.getElementById(`shad${t}Input`);
        if (preview) preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
        if (zone) zone.classList.remove('has-image');
        if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; }
        if (input) input.value = '';
    });

    document.getElementById('shadSelectedBot').textContent = 'SELECT A SERVER TO CONTINUE';
    document.getElementById('shadProgress').style.width = '0%';

    shadShowStep(0);
}

function getTranslation(key) {
    const t = translations && translations[state?.language];
    return t ? t[key] : null;
}


window.openShadModal = openShadModal;
window.closeShadModal = closeShadModal;
window.selectShadBot = selectShadBot;
window.startShadSession = startShadSession;
window.sendShadTitle = sendShadTitle;
window.sendShadOgImage = sendShadOgImage;
window.sendShadBgImage = sendShadBgImage;
window.previewShadImage = previewShadImage;
window.resetShadSession = resetShadSession;
window.shadCopy = shadCopy;