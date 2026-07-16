// BCIA Audio CAPTCHA System
const CaptchaSystem = {
    currentToken: null,
    currentDigits: [],

    async generate() {
        const response = await fetch('/api/captcha/generate', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        if (!data.success) throw new Error('Failed to generate CAPTCHA');
        this.currentToken = data.token;
        this.currentDigits = []; // digits stay server-side only
        return data;
    },

    async playAudio(digits, token) {
    for (let i = 0; i < 6; i++) {
        await this._playOne(token, i);
        await new Promise(r => setTimeout(r, 400));
    }
},
_playOne(token, index) {
    return new Promise((resolve) => {
        const audio = new Audio(`/api/captcha/audio/${token}/${index}`);
        audio.volume = 1.0;
        audio.onended = resolve;
        audio.onerror = () => {
            console.warn('Audio playback failed for index ' + index);
            resolve();
        };
        const p = audio.play();
        if (p !== undefined) p.catch(() => resolve());
    });
},

    async verify(answer) {
        const response = await fetch('/api/captcha/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: this.currentToken, answer })
        });
        return response.json();
    },

    showModal() {
        return new Promise(async (resolve, reject) => {
            try {
                const captchaData = await this.generate();
                const lang = localStorage.getItem('bcia_language') || 'en';
                const t = captchaTranslations[lang] || captchaTranslations['en'];

                const modalHtml = `
    <div id="captchaModal" style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.88); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
    ">
        <div style="
            background: var(--secondary-bg);
            border: 2px solid var(--primary-green);
            border-radius: 12px;
            padding: 35px 30px;
            max-width: 430px;
            width: 95%;
            box-shadow: 0 0 40px var(--glow-green);
            text-align: center;
        ">
            <div style="color: var(--primary-green); font-size: 1.3rem; font-weight: bold; margin-bottom: 6px; letter-spacing: 2px;">
                ⬢ ${t.title}
            </div>

            <!-- Toggle Buttons -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; background: var(--input-bg); border-radius: 8px; padding: 4px;">
                <button id="tabAudio" onclick="CaptchaSystem._switchTab('audio')" style="
                    flex:1; padding:10px; border-radius:6px; border:none; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:'Cairo',monospace; letter-spacing:1px;
                    background: linear-gradient(135deg, var(--dark-green), #005528); color: var(--primary-green); border: 1.5px solid var(--primary-green);
                ">🔊 AUDIO</button>
                <button id="tabRecaptcha" onclick="CaptchaSystem._switchTab('recaptcha')" style="
                    flex:1; padding:10px; border-radius:6px; border:1.5px solid var(--dark-green); cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:'Cairo',monospace; letter-spacing:1px;
                    background: transparent; color: var(--text-dim);
                ">🤖 reCAPTCHA</button>
            </div>

            <!-- AUDIO PANEL -->
            <div id="panelAudio">
                <div id="captchaStatus" style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 22px;">
                    ${t.subtitle}
                </div>
                <div id="captchaDigitRow" style="display: flex; justify-content: center; gap: 8px; margin-bottom: 20px;">
                    ${[0,1,2,3,4,5].map(i => `
                        <div id="captchaDigit_${i}" style="
                            width: 38px; height: 38px; border-radius: 6px;
                            background: var(--input-bg); border: 2px solid var(--dark-green);
                            display: flex; align-items: center; justify-content: center;
                            color: var(--primary-green); font-size: 1.3rem; font-weight: bold;
                        ">?</div>
                    `).join('')}
                </div>
                <button id="captchaPlayBtn" style="
                    background: linear-gradient(135deg, var(--dark-green), #005528);
                    border: 2px solid var(--primary-green); color: var(--primary-green);
                    padding: 13px 20px; border-radius: 8px; font-size: 1rem; cursor: pointer;
                    margin-bottom: 18px; width: 100%; letter-spacing: 2px; font-weight: bold;
                    font-family: 'Cairo', monospace;
                ">▶ ${t.playBtn}</button>
                <input id="captchaInput" type="text" inputmode="numeric" maxlength="6"
                    placeholder="${t.placeholder}" autocomplete="off"
                    style="
                        width: 100%; padding: 14px; background: var(--input-bg);
                        border: 2px solid var(--dark-green); color: var(--primary-green);
                        font-size: 1.6rem; letter-spacing: 10px; text-align: center;
                        border-radius: 8px; margin-bottom: 12px; font-family: monospace;
                        box-sizing: border-box; outline: none;
                    "
                >
                <div id="captchaError" style="color: #ff4444; font-size: 0.82rem; min-height: 22px; margin-bottom: 14px;"></div>
                <div style="display: flex; gap: 10px;">
                    <button id="captchaRefreshBtn" style="
                        flex: 1; background: transparent; border: 1.5px solid var(--dark-green);
                        color: var(--text-dim); padding: 12px 8px; border-radius: 8px; cursor: pointer;
                        font-size: 0.8rem; letter-spacing: 1px; font-family: 'Cairo', monospace;
                    ">↺ ${t.newBtn}</button>
                    <button id="captchaSubmitBtn" style="
                        flex: 2; background: linear-gradient(135deg, var(--dark-green), #005528);
                        border: 2px solid var(--primary-green); color: var(--primary-green);
                        padding: 12px; border-radius: 8px; cursor: pointer; font-size: 0.9rem;
                        font-weight: bold; letter-spacing: 2px; font-family: 'Cairo', monospace;
                    ">► ${t.verifyBtn}</button>
                    <button id="captchaCloseBtn" style="
                        flex: 1; background: transparent; border: 1.5px solid var(--danger-red, #dc3545);
                        color: var(--danger-red, #dc3545); padding: 12px 8px; border-radius: 8px;
                        cursor: pointer; font-size: 0.8rem; letter-spacing: 1px; font-family: 'Cairo', monospace;
                    ">× ${t.closeBtn}</button>
                </div>
            </div>

            <!-- RECAPTCHA PANEL -->
            <div id="panelRecaptcha" style="display:none;">
                <div style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 20px;">
                    Complete the reCAPTCHA below to continue
                </div>
                <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                    <div id="recaptchaWidget"></div>
                </div>
                <div id="recaptchaError" style="color: #ff4444; font-size: 0.82rem; min-height: 22px; margin-bottom: 14px;"></div>
                <button id="recaptchaCloseBtn" style="
                    width: 100%; background: transparent; border: 1.5px solid var(--danger-red, #dc3545);
                    color: var(--danger-red, #dc3545); padding: 12px 8px; border-radius: 8px;
                    cursor: pointer; font-size: 0.85rem; letter-spacing: 1px; font-family: 'Cairo', monospace;
                    margin-top: 5px;
                ">× ${t.closeBtn}</button>
            </div>

        </div>
    </div>
`;
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                CaptchaSystem._switchTab = function(tab) {
    const audioPanel = document.getElementById('panelAudio');
    const recaptchaPanel = document.getElementById('panelRecaptcha');
    const tabAudio = document.getElementById('tabAudio');
    const tabRecaptcha = document.getElementById('tabRecaptcha');

    if (tab === 'audio') {
        audioPanel.style.display = 'block';
        recaptchaPanel.style.display = 'none';
        tabAudio.style.background = 'linear-gradient(135deg, var(--dark-green), #005528)';
        tabAudio.style.color = 'var(--primary-green)';
        tabAudio.style.borderColor = 'var(--primary-green)';
        tabRecaptcha.style.background = 'transparent';
        tabRecaptcha.style.color = 'var(--text-dim)';
        tabRecaptcha.style.borderColor = 'var(--dark-green)';
    } else {
        audioPanel.style.display = 'none';
        recaptchaPanel.style.display = 'block';
        tabAudio.style.background = 'transparent';
        tabAudio.style.color = 'var(--text-dim)';
        tabAudio.style.borderColor = 'var(--dark-green)';
        tabRecaptcha.style.background = 'linear-gradient(135deg, var(--dark-green), #005528)';
        tabRecaptcha.style.color = 'var(--primary-green)';
        tabRecaptcha.style.borderColor = 'var(--primary-green)';

        // Render reCAPTCHA if not already rendered
        if (!CaptchaSystem._recaptchaRendered) {
    CaptchaSystem._recaptchaRendered = true;
    const tryRender = (attempts) => {
        const widgetDiv = document.getElementById('recaptchaWidget');
        if (widgetDiv && typeof grecaptcha !== 'undefined' && typeof grecaptcha.render === 'function') {
            try {
                widgetDiv.innerHTML = '';
                grecaptcha.render(widgetDiv, {
                    sitekey: '6LcmlVAtAAAAAIa3FJbCpPvhEpmdoonXDZJSUrcW',
                    theme: 'dark',
                    callback: function(token) {
                        CaptchaSystem._onRecaptchaSolved(token);
                    }
                });
            } catch(e) {
                console.warn('reCAPTCHA render error:', e);
            }
        } else if (attempts > 0) {
            setTimeout(() => tryRender(attempts - 1), 500);
        }
    };
    setTimeout(() => tryRender(10), 300);
}
    }
};
CaptchaSystem._recaptchaRendered = false;

                const modal       = document.getElementById('captchaModal');
                const playBtn     = document.getElementById('captchaPlayBtn');
                const input       = document.getElementById('captchaInput');
                const submitBtn   = document.getElementById('captchaSubmitBtn');
                const refreshBtn  = document.getElementById('captchaRefreshBtn');
                const errorDiv    = document.getElementById('captchaError');
                const statusDiv   = document.getElementById('captchaStatus');

                // Only allow digits in input
                input.addEventListener('input', () => {
                    input.value = input.value.replace(/[^0-9]/g, '');
                });

                input.addEventListener('focus', () => {
                    input.style.borderColor = 'var(--primary-green)';
                });
                input.addEventListener('blur', () => {
                    input.style.borderColor = 'var(--dark-green)';
                });

                // Highlight digit boxes while playing
                const highlightDigit = (index, active) => {
                    const box = document.getElementById(`captchaDigit_${index}`);
                    if (!box) return;
                    box.style.borderColor = active ? 'var(--primary-green)' : 'var(--dark-green)';
                    box.style.background  = active ? 'rgba(0,255,65,0.15)' : 'var(--input-bg)';
                    box.style.boxShadow   = active ? '0 0 12px var(--glow-green)' : 'none';
                    box.textContent       = active ? '♪' : '?';
                };

                // Reset all digit boxes
                const resetDigitBoxes = () => {
                    for (let i = 0; i < 6; i++) highlightDigit(i, false);
                };

                let isPlaying = false;

                const play = async () => {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.disabled = true;
    playBtn.textContent = `⏳ ${t.playingBtn}`;
    statusDiv.textContent = t.listenMsg;
    errorDiv.textContent = '';
    resetDigitBoxes();

    // Single merged audio request - digits not visible in network
    await this.playAudio(this.currentDigits, this.currentToken);

                    isPlaying = false;
    playBtn.disabled = false;
    playBtn.textContent = `▶ ${t.playAgainBtn}`;
    statusDiv.textContent = t.typeMsg;
    input.focus();
};

                // ← User must click play — no autoplay, avoids browser block
                playBtn.addEventListener('click', play);

                // Submit logic
                const submit = async () => {
                    const answer = input.value.trim();
                    if (answer.length !== 6) {
                        errorDiv.textContent = `⚠ ${t.errorLength}`;
                        input.focus();
                        return;
                    }

                    submitBtn.disabled = true;
                    submitBtn.textContent = `⏳ ${t.verifyingBtn}`;
                    errorDiv.textContent = '';

                    const result = await this.verify(answer);

                    if (result.success) {
                        modal.remove();
                        resolve(result.searchToken);
                    } else {
                        errorDiv.textContent = `⚠ ${t.errorWrong}`;
                        input.value = '';
                        submitBtn.disabled = false;
                        submitBtn.textContent = `► ${t.verifyBtn}`;
                        resetDigitBoxes();

                        // Auto-generate new CAPTCHA after wrong answer
                        const newData = await this.generate();
                        
                        playBtn.textContent = `▶ ${t.playBtn}`;
                        statusDiv.textContent = t.subtitle;
                        input.focus();
                    }
                };

                submitBtn.addEventListener('click', submit);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') submit();
                });

                // Refresh = new CAPTCHA + play
                refreshBtn.addEventListener('click', async () => {
                    if (isPlaying) return;
                    refreshBtn.disabled = true;
                    errorDiv.textContent = '';
                    input.value = '';
                    resetDigitBoxes();
                    const newData = await this.generate();
                    
                    refreshBtn.disabled = false;
                    playBtn.textContent = `▶ ${t.playBtn}`;
                    statusDiv.textContent = t.subtitle;
                    await play();
                });

                // reCAPTCHA solved callback
CaptchaSystem._onRecaptchaSolved = async function(recaptchaToken) {
    const errorDiv = document.getElementById('recaptchaError');
    errorDiv.textContent = 'Verifying...';

    try {
        const response = await fetch('/api/captcha/recaptcha-verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recaptchaToken })
        });
        const result = await response.json();

        if (result.success) {
            modal.remove();
            CaptchaSystem._recaptchaRendered = false;
            resolve(result.searchToken);
        } else {
            errorDiv.textContent = '⚠ Verification failed. Try again.';
            grecaptcha.reset();
        }
    } catch (err) {
        errorDiv.textContent = '⚠ Error: ' + err.message;
        grecaptcha.reset();
    }
};

// reCAPTCHA close button
document.getElementById('recaptchaCloseBtn').addEventListener('click', () => {
    modal.remove();
    CaptchaSystem._recaptchaRendered = false;
    reject(new Error('cancelled'));
});


                const closeBtn = document.getElementById('captchaCloseBtn');
closeBtn.addEventListener('click', () => {
    modal.remove();
    CaptchaSystem._recaptchaRendered = false;
    reject(new Error('cancelled'));
});

            } catch (err) {
                reject(err);
            }
        });
    }
};

// ============================================================
// TRANSLATIONS
// ============================================================
const captchaTranslations = {
en: {
        title:        'SECURITY VERIFICATION',
        subtitle:     'Click PLAY then type the numbers you hear',
        playBtn:      'PLAY AUDIO',
        playAgainBtn: 'PLAY AGAIN',
        playingBtn:   'PLAYING...',
        listenMsg:    'Listen carefully...',
        typeMsg:      'Type the numbers you heard',
        placeholder:  '000000',
        newBtn:       'NEW AUDIO',
        verifyBtn:    'VERIFY',
        verifyingBtn: 'VERIFYING...',
        errorLength:  'Please enter all 6 digits',
        errorWrong:   'Wrong answer. New audio generated. Try again.',
        closeBtn:     'CLOSE'       // ← ADD THIS
    },
    ku: {
        title:        'پشتڕاستکردنەوەی ئەمنیەت',
        subtitle:     'کرتە لە دەنگ بکە پاشان ژمارەکانت بنووسە',
        playBtn:      'دەنگ لێبدە',
        playAgainBtn: 'دووبارە لێبدە',
        playingBtn:   'دەنگ دەدرێت...',
        listenMsg:    'باش گوێ بگرە...',
        typeMsg:      'ژمارەکانت بنووسە',
        placeholder:  '000000',
        newBtn:       'دەنگی نوێ',
        verifyBtn:    'پشتڕاست بکەرەوە',
        verifyingBtn: 'پشتڕاستکردن...',
        errorLength:  'تکایە هەموو ٦ ژمارەکان بنووسە',
        errorWrong:   'وەڵامی هەڵە. دەنگی نوێ دروستکرا. دووبارە هەوڵبدەرەوە.',
        closeBtn:     'داخستن'      // ← ADD THIS
    }
};