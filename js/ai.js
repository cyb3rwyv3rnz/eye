// Cyb3r Drag0nz AI - Optimized for Unlimited Streaming & Black-Hat Ops
const AI_OLLAMA_URL = 'http://localhost:11434';
const AI_MODEL = 'Cyb3r-Drag0nz:latest';

let aiIsTyping = false;
let currentAbortController = null;

// Get current language translations
function getAiT() {
    const lang = localStorage.getItem('bcia_language') || 'en';
    return translations[lang] || translations['en'];
}

// Open AI Modal
function openAiModal() {
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.classList.add('active');
        updateAiTranslations();
        checkOllamaStatus();
        document.getElementById('aiInput').focus();
    }
}

// Close AI Modal & Stop Generation if running
function closeAiModal() {
    if (currentAbortController) currentAbortController.abort();
    document.getElementById('aiModal').classList.remove('active');
}

// Update UI Text based on Language
function updateAiTranslations() {
    const t = getAiT();
    const elements = {
        'aiInput': 'placeholder',
        'aiModelText': 'textContent',
        'aiShortcutText': 'textContent',
        'aiStatusText': 'textContent'
    };

    if (document.getElementById('aiInput')) 
        document.getElementById('aiInput').placeholder = t.aiPlaceholder || 'Enter your query for Cyb3r Drag0nz...';
    
    if (document.getElementById('aiModelText'))
        document.getElementById('aiModelText').textContent = t.aiModel || `MODEL: ${AI_MODEL} • OLLAMA LOCAL`;

    // Ensure status text updates correctly
    const statusText = document.getElementById('aiStatusText');
    if (statusText) {
        const isOnline = statusText.getAttribute('data-online') === 'true';
        statusText.textContent = isOnline ? (t.aiOnline || 'ONLINE') : (t.aiOffline || 'OFFLINE');
    }
}

// Check if Backend/Ollama is alive
async function checkOllamaStatus() {
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    const t = getAiT();

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'ping' }),
            signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
            setOnlineStatus(true);
        } else {
            setOnlineStatus(false);
        }
    } catch (e) {
        setOnlineStatus(false);
    }
}

function setOnlineStatus(isOnline) {
    const t = getAiT();
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    
    text.setAttribute('data-online', isOnline);
    if (isOnline) {
        dot.style.background = 'var(--primary-green)';
        dot.style.boxShadow = '0 0 8px var(--glow-green)';
        text.style.color = 'var(--primary-green)';
        text.textContent = t.aiOnline || 'ONLINE';
    } else {
        dot.style.background = 'var(--danger-red)';
        dot.style.boxShadow = '0 0 8px var(--glow-red)';
        text.style.color = 'var(--danger-red)';
        text.textContent = t.aiOffline || 'OFFLINE';
    }
}

// Handle message sending with STREAMING support
async function sendAiMessage() {
    if (aiIsTyping) return;

    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    if (!message) return;

    const t = getAiT();
    input.value = '';
    input.style.height = 'auto';

    appendAiMessage('user', message);

    aiIsTyping = true;
    currentAbortController = new AbortController();
    
    const btn = document.getElementById('aiSendBtn');
    btn.disabled = true;
    btn.style.opacity = '0.5';

    const typingId = 'typing-' + Date.now();
    appendTypingIndicator(typingId);

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: message, stream: true }), // REQUEST STREAM
            signal: currentAbortController.signal
        });

        removeTypingIndicator(typingId);

        if (!response.ok) throw new Error('Ollama connection failed');

        // PREPARE FOR STREAMING DATA
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        
        // Create an empty assistant bubble to fill up
        const assistantMsgBox = appendAiMessage('assistant', '');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            
            // Handle multiple JSON objects in one chunk (common in Ollama)
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        fullContent += json.response;
                        assistantMsgBox.textContent = fullContent;
                        // Auto-scroll as code prints
                        const container = document.getElementById('aiMessages');
                        container.scrollTop = container.scrollHeight;
                    }
                } catch (e) { console.error("Stream parse error", e); }
            }
        }

    } catch (error) {
        removeTypingIndicator(typingId);
        if (error.name !== 'AbortError') {
            appendAiMessage('error', '⚠ CRITICAL ERROR: ' + error.message);
            setOnlineStatus(false);
        }
    } finally {
        aiIsTyping = false;
        btn.disabled = false;
        btn.style.opacity = '1';
        currentAbortController = null;
        input.focus();
    }
}

// UI: Append message bubble
function appendAiMessage(role, text) {
    const container = document.getElementById('aiMessages');
    const t = getAiT();
    const isUser = role === 'user';
    const isError = role === 'error';

    const bubble = document.createElement('div');
    bubble.className = `ai-message-wrapper ${role}`;
    bubble.style.cssText = `display: flex; flex-direction: column; align-items: ${isUser ? 'flex-end' : 'flex-start'}; margin-bottom: 20px; animation: resultSlide 0.3s ease-out;`;

    const label = document.createElement('div');
    label.style.cssText = `font-size: 0.65rem; letter-spacing: 1px; margin-bottom: 5px; color: var(--text-dim); padding: 0 5px;`;
    label.textContent = isUser ? (t.aiYou || '▸ YOU') : isError ? (t.aiSystem || '▸ SYSTEM') : (t.aiDragon || '▸ CYBER DRAGON');

    const msgBox = document.createElement('div');
    msgBox.style.cssText = `
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.95rem;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: 'Consolas', 'Monaco', monospace;
        ${isUser 
            ? 'background: rgba(0,255,65,0.05); border: 1px solid var(--primary-green); color: var(--primary-green); border-bottom-right-radius: 2px;' 
            : isError 
                ? 'background: rgba(255,0,0,0.1); border: 1px solid var(--danger-red); color: var(--danger-red);' 
                : 'background: #0a0a0a; border: 1px solid #1a1a1a; color: #e0e0e0; border-bottom-left-radius: 2px; box-shadow: inset 0 0 10px #000;'
        }
    `;
    msgBox.textContent = text;

    bubble.appendChild(label);
    bubble.appendChild(msgBox);
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;

    return msgBox;
}

// UI: Typing indicator
function appendTypingIndicator(id) {
    const t = getAiT();
    const container = document.getElementById('aiMessages');
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.innerHTML = `
        <div style="font-size: 0.65rem; color: var(--text-dim); margin-bottom: 5px;">${t.aiDragon || '▸ CYBER DRAGON'}</div>
        <div style="background: #0a0a0a; border: 1px solid var(--dark-green); padding: 12px; border-radius: 8px; display: inline-flex; gap: 5px;">
            <div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div>
        </div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Logic: Clear & Welcome
function clearAiChat() {
    const t = getAiT();
    document.getElementById('aiMessages').innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3.5rem; filter: drop-shadow(0 0 10px var(--primary-green));">🐉</div>
            <div style="color: var(--primary-green); font-family: 'Cairo'; font-size: 1.3rem; margin-top: 15px;">${t.aiWelcomeTitle || 'CYB3R DRAG0NZ ONLINE'}</div>
            <div style="color: var(--text-dim); font-size: 0.85rem; margin-top: 5px;">${t.aiWelcomeDesc || 'Neural link active. Hardware: HP OMEN 16'}</div>
        </div>
    `;
}

// Global Init
window.addEventListener('load', () => {
    const input = document.getElementById('aiInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAiMessage();
            }
        });
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        });
    }
});

// Exports
window.openAiModal = openAiModal;
window.closeAiModal = closeAiModal;
window.sendAiMessage = sendAiMessage;
window.clearAiChat = clearAiChat;