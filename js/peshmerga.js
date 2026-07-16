// Peshmerga Power - Breach / OSINT / Victims Intelligence Module
let peshmergaSearchType = 'breach';
let peshmergaQuotaData = { used: 0, max: 10 };

// All supported search types with their display labels
const PESHMERGA_TYPES = [
    { key: 'breach',             labelEn: 'BREACH SEARCH',        labelKu: 'گەڕانی دزەپێکراو',      hintEn: 'BREACH: Search by email address — finds credentials from known data breaches', hintKu: 'دزەپێکراو: گەڕان بە ئیمەیڵ — دۆزینەوەی ناسنامە لە دزەپێکراوەکانی ناسراو', placeholderEn: 'Enter email address (e.g. user@example.com)...', placeholderKu: 'ئیمەیڵ بنووسە (بۆ نموونە user@example.com)...' },
    { key: 'stealer',            labelEn: 'DEVICE informations',     labelKu: 'زانیاریەکانی ئامێر',  hintEn: 'DEVICE: Search by domain or email — finds data from malware stealer logs', hintKu: 'ئامێر: گەڕان بە دۆمەین یان ئیمەیڵ — داتای زانیاریەکانی ئامێر', placeholderEn: 'Enter domain or email (e.g. example.com)...', placeholderKu: 'دۆمەین یان ئیمەیڵ بنووسە (بۆ نموونە example.com)...' },
    { key: 'victim',             labelEn: 'VICTIMS SEARCH',       labelKu: 'گەڕانی قوربانی',        hintEn: 'VICTIMS: Search compromised device profiles — returns log summaries with file trees', hintKu: 'قوربانی: گەڕانی پرۆفایلی ئامێرە بڕاوەکان', placeholderEn: 'Enter email, IP, HWID, Discord ID, or username...', placeholderKu: 'ئیمەیڵ، IP، یان ناوی بەکارهێنەر بنووسە...' },
    { key: 'discord-userinfo',   labelEn: 'DISCORD USER INFO',    labelKu: 'زانیاری بەکارهێنەری دیسکۆرد', hintEn: 'DISCORD: Enter a Discord User ID to look up profile intelligence', hintKu: 'دیسکۆرد: ناسنامەی بەکارهێنەری دیسکۆرد بنووسە', placeholderEn: 'Enter Discord User ID...', placeholderKu: 'ناسنامەی بەکارهێنەری دیسکۆرد بنووسە...' },
    { key: 'discord-username',   labelEn: 'DISCORD USERNAME HISTORY', labelKu: 'مێژووی ناوی بەکارهێنەری دیسکۆرد', hintEn: 'DISCORD: Enter a Discord username to get history', hintKu: 'دیسکۆرد: ناوی بەکارهێنەری دیسکۆرد بنووسە', placeholderEn: 'Enter Discord username...', placeholderKu: 'ناوی بەکارهێنەری دیسکۆرد بنووسە...' },
    { key: 'ip',                 labelEn: 'IP GEOLOCATION',       labelKu: 'شوێنی IP',             hintEn: 'NETWORK: Enter an IP address for geolocation and network intelligence', hintKu: 'تۆڕ: ناونیشانی IP بنووسە', placeholderEn: 'Enter IP address (e.g. 1.2.3.4)...', placeholderKu: 'ناونیشانی IP بنووسە...' },
    { key: 'holehe',             labelEn: 'EMAIL ACCOUNT CHECK',  labelKu: 'پشکنینی ئەکاونتی ئیمەیڵ', hintEn: 'EMAIL: Enter an email address to check account presence across services', hintKu: 'ئیمەیڵ: ناونیشانی ئیمەیڵ بنووسە', placeholderEn: 'Enter email address...', placeholderKu: 'ناونیشانی ئیمەیڵ بنووسە...' },
    { key: 'ghunt',              labelEn: 'GOOGLE ACCOUNT OSINT', labelKu: 'زانیاری ئەکاونتی گووگڵ', hintEn: 'EMAIL: Enter a Google email address for Google account intelligence', hintKu: 'گووگڵ: ئیمەیڵی گووگڵ بنووسە', placeholderEn: 'Enter Google email address...', placeholderKu: 'ئیمەیڵی گووگڵ بنووسە...' }
];

const PESHMERGA_OSINT_TYPES = ['discord-userinfo','discord-username','steam','xbox','roblox','minecraft','ip','holehe','ghunt'];

// ── VICTIMS STATE ──
let victimsState = {
    results: [],
    manifest: null,
    currentLogId: null
};

function openPeshmergaModal() {
    document.getElementById('peshmergaModal').classList.add('active');
    loadPeshmergaQuota();
    renderPeshmergaTypeButtons();
    updatePeshmergaUIForType(peshmergaSearchType);
}

function closePeshmergaModal() {
    document.getElementById('peshmergaModal').classList.remove('active');
}

function setPeshmergaType(type, btn) {
    peshmergaSearchType = type;

    document.querySelectorAll('.peshmerga-type-btn').forEach(b => {
        b.style.background = 'var(--input-bg)';
        b.style.borderColor = 'var(--dark-green)';
        b.style.color = 'var(--text-dim)';
    });
    btn.style.background = 'linear-gradient(135deg, var(--dark-green), #005528)';
    btn.style.borderColor = 'var(--primary-green)';
    btn.style.color = 'var(--primary-green)';

    // Clear victims state when switching away
    if (type !== 'victim') {
        victimsState = { results: [], manifest: null, currentLogId: null };
    }

    updatePeshmergaUIForType(type);
}

function renderPeshmergaTypeButtons() {
    const container = document.querySelector('.peshmerga-type-buttons');
    if (!container) return;
    
    const lang = state.language;
    let html = '';
    PESHMERGA_TYPES.forEach(t => {
        const isActive = t.key === peshmergaSearchType;
        html += `
            <button class="peshmerga-type-btn ${isActive ? 'active' : ''}" onclick="setPeshmergaType('${t.key}', this)"
                style="padding: 7px 14px; background: ${isActive ? 'linear-gradient(135deg, var(--dark-green), #005528)' : 'var(--input-bg)'}; 
                border: 1.5px solid ${isActive ? 'var(--primary-green)' : 'var(--dark-green)'}; 
                color: ${isActive ? 'var(--primary-green)' : 'var(--text-dim)'}; 
                font-family:'Rudaw Bold',monospace; font-size: 0.78rem; border-radius: 6px; cursor: pointer; 
                font-weight: ${isActive ? 'bold' : 'normal'}; letter-spacing: 0.5px; white-space: nowrap;
                transition: all 0.25s;">
                ◈ ${lang === 'ku' ? t.labelKu : t.labelEn}
            </button>
        `;
    });
    container.innerHTML = html;
}

function updatePeshmergaUIForType(type) {
    const info = PESHMERGA_TYPES.find(x => x.key === type);
    if (!info) return;

    document.getElementById('peshmergaHint').textContent = state.language === 'ku' ? info.hintKu : info.hintEn;
    document.getElementById('peshmergaInput').placeholder = state.language === 'ku' ? info.placeholderKu : info.placeholderEn;

    // Show/hide victim-specific buttons container
    const victimActions = document.getElementById('victimActionsContainer');
    if (victimActions) {
        victimActions.style.display = (type === 'victim') ? 'flex' : 'none';
    }

    // Show search input for all types
    document.getElementById('peshmergaInput').style.display = 'block';
    document.getElementById('peshmergaSearchBtn').style.display = 'inline-flex';
}

async function loadPeshmergaQuota() {
    try {
        const res = await fetch('/api/peshmerga/quota', {
            credentials: 'same-origin'
        });
        const data = await res.json();
        if (data.success) {
            peshmergaQuotaData = data;
            updatePeshmergaQuotaUI(data.used, data.max);
        }
    } catch (e) {
        console.log('Quota load failed:', e);
    }
}

function updatePeshmergaQuotaUI(used, max) {
    document.getElementById('peshmergaQuotaUsed').textContent = used;

    const totalDots = Math.min(max, 10); // Show max 5 dots visually
    
    for (let i = 1; i <= 5; i++) {
        const dot = document.getElementById('pd' + i);
        if (!dot) continue;
        if (i <= used) {
            const color = used >= totalDots ? '#ff0000' : used >= Math.ceil(totalDots * 0.6) ? '#ffa500' : 'var(--primary-green)';
            dot.style.background = color;
            dot.style.borderColor = color;
            dot.style.boxShadow = `0 0 8px ${color}`;
        } else {
            dot.style.background = 'var(--dark-green)';
            dot.style.borderColor = 'var(--text-dim)';
            dot.style.boxShadow = 'none';
        }
    }

    const display = document.getElementById('peshmergaQuotaDisplay');
    if (used >= totalDots) {
        display.style.borderColor = '#ff0000';
        display.style.color = '#ff0000';
    } else if (used >= Math.ceil(totalDots * 0.6)) {
        display.style.borderColor = '#ffa500';
        display.style.color = '#ffa500';
    } else {
        display.style.borderColor = 'var(--primary-green)';
        display.style.color = 'var(--text-secondary)';
    }
}

async function executePeshmergaSearch() {
    const query = document.getElementById('peshmergaInput').value.trim();
    if (!query || query.length < 2) {
        showPeshmergaError('Please enter at least 2 characters.');
        return;
    }

    // If victims type, route to victims search
    if (peshmergaSearchType === 'victim') {
        return executeVictimsSearch(query);
    }

    // If OSINT type, route to OSINT endpoint
    if (PESHMERGA_OSINT_TYPES.includes(peshmergaSearchType)) {
        return executeOsintSearch(query);
    }

    // Otherwise: breach or stealer (POST-based)
    const resultsDiv = document.getElementById('peshmergaResults');
    const btn = document.getElementById('peshmergaSearchBtn');

    document.getElementById('peshmergaWelcome')?.remove();
    btn.disabled = true;
    btn.textContent = '⟳ SCANNING...';
    resultsDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;">
            <div class="loading-spinner" style="width:60px;height:60px;"></div>
            <div style="color:var(--primary-green);font-weight:bold;letter-spacing:2px;font-family:'Rudaw Bold',monospace;">⬢ SCANNING DATABASE...</div>
            <div style="color:var(--text-dim);font-size:0.8rem;">Querying for: <strong style="color:var(--primary-green);">${escapeHtmlP(query)}</strong></div>
        </div>
    `;

    let searchToken;
    try {
        const freeTokenRes = await fetch('/api/captcha/free-token', {
            credentials: 'same-origin'
        });
        const freeTokenData = await freeTokenRes.json();
        if (!freeTokenData.success) throw new Error('Token error');
        searchToken = freeTokenData.searchToken;
    } catch (err) {
        showPeshmergaError('Token error: ' + err.message);
        btn.disabled = false;
        btn.textContent = '► SEARCH';
        return;
    }

    try {
        const res = await fetch('/api/peshmerga/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-search-token': searchToken
            },
            body: JSON.stringify({ query, searchType: peshmergaSearchType, generatedsecuretoken: searchToken })
        });

        const data = await res.json();
        btn.disabled = false;
        btn.textContent = '► SEARCH';

        if (!res.ok || !data.success) {
            if (data.quotaExceeded) {
                renderPeshmergaQuotaExceeded(data);
                updatePeshmergaQuotaUI(5, 5);
                return;
            }
            showPeshmergaError(data.error || 'Search failed.');
            return;
        }

        updatePeshmergaQuotaUI(data.quotaUsed || 0, data.quotaMax || 5);
        renderPeshmergaResults(data.data, query);

    } catch (err) {
        btn.disabled = false;
        btn.textContent = '► SEARCH';
        showPeshmergaError('Connection failed. Check your network.');
    }
}

// ── OSINT SEARCH ──
async function executeOsintSearch(query) {
    const resultsDiv = document.getElementById('peshmergaResults');
    const btn = document.getElementById('peshmergaSearchBtn');

    document.getElementById('peshmergaWelcome')?.remove();
    btn.disabled = true;
    btn.textContent = '⟳ SCANNING...';
    resultsDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;">
            <div class="loading-spinner" style="width:60px;height:60px;"></div>
            <div style="color:var(--primary-green);font-weight:bold;letter-spacing:2px;">⬢ OSINT LOOKUP...</div>
            <div style="color:var(--text-dim);font-size:0.8rem;">Querying: <strong style="color:var(--primary-green);">${escapeHtmlP(query)}</strong></div>
        </div>
    `;

    let searchToken;
    try {
        const freeTokenRes = await fetch('/api/captcha/free-token', {
            credentials: 'same-origin'
        });
        const freeTokenData = await freeTokenRes.json();
        if (!freeTokenData.success) throw new Error('Token error');
        searchToken = freeTokenData.searchToken;
    } catch (err) {
        showPeshmergaError('Token error: ' + err.message);
        btn.disabled = false;
        btn.textContent = '► SEARCH';
        return;
    }

    try {
        const url = `/api/peshmerga/osint/${peshmergaSearchType}?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: {
                'x-search-token': searchToken
            }
        });
        const data = await res.json();
        btn.disabled = false;
        btn.textContent = '► SEARCH';

        if (!res.ok || !data.success) {
            if (data.quotaExceeded) {
                renderPeshmergaQuotaExceeded(data);
                updatePeshmergaQuotaUI(5, 5);
                return;
            }
            showPeshmergaError(data.error || 'OSINT lookup failed.');
            return;
        }

        updatePeshmergaQuotaUI(data.quotaUsed || 0, data.quotaMax || 5);
        renderOsintResult(data.data, query);

    } catch (err) {
        btn.disabled = false;
        btn.textContent = '► SEARCH';
        showPeshmergaError('OSINT connection failed.');
    }
}

// ── VICTIMS SEARCH ──
async function executeVictimsSearch(query) {
    const resultsDiv = document.getElementById('peshmergaResults');
    const btn = document.getElementById('peshmergaSearchBtn');

    document.getElementById('peshmergaWelcome')?.remove();
    btn.disabled = true;
    btn.textContent = '⟳ SCANNING VICTIMS...';
    resultsDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;">
            <div class="loading-spinner" style="width:60px;height:60px;"></div>
            <div style="color:var(--primary-green);font-weight:bold;letter-spacing:2px;">⬢ SEARCHING VICTIM PROFILES...</div>
            <div style="color:var(--text-dim);font-size:0.8rem;">Querying: <strong style="color:var(--primary-green);">${escapeHtmlP(query)}</strong></div>
        </div>
    `;

    let searchToken;
    try {
        const freeTokenRes = await fetch('/api/captcha/free-token', {
            credentials: 'same-origin'
        });
        const freeTokenData = await freeTokenRes.json();
        if (!freeTokenData.success) throw new Error('Token error');
        searchToken = freeTokenData.searchToken;
    } catch (err) {
        showPeshmergaError('Token error: ' + err.message);
        btn.disabled = false;
        btn.textContent = '► SEARCH';
        return;
    }

    try {
        const res = await fetch('/api/peshmerga/victims/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-search-token': searchToken
            },
            body: JSON.stringify({ query, generatedsecuretoken: searchToken })
        });

        const data = await res.json();
        btn.disabled = false;
        btn.textContent = '► SEARCH';

        if (!res.ok || !data.success) {
            if (data.quotaExceeded) {
                renderPeshmergaQuotaExceeded(data);
                updatePeshmergaQuotaUI(5, 5);
                return;
            }
            showPeshmergaError(data.error || 'Victims search failed.');
            return;
        }

        updatePeshmergaQuotaUI(data.quotaUsed || 0, data.quotaMax || 5);
        renderVictimsResults(data.data, query);

    } catch (err) {
        btn.disabled = false;
        btn.textContent = '► SEARCH';
        showPeshmergaError('Victims search connection failed.');
    }
}

// ── RENDER VICTIMS RESULTS ──
function renderVictimsResults(apiResponse, query) {
    const resultsDiv = document.getElementById('peshmergaResults');

    if (!apiResponse || !apiResponse.success) {
        showPeshmergaError('Invalid response from intelligence server.');
        return;
    }

    const items = apiResponse?.data?.items || [];
    const meta = apiResponse?.data?.meta || {};
    const total = meta.total || 0;

    if (total === 0 || items.length === 0) {
        resultsDiv.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:3rem;color:var(--text-dim);margin-bottom:15px;">◎</div>
                <div style="color:var(--text-secondary);font-size:1rem;font-weight:bold;letter-spacing:2px;margin-bottom:8px;">${translations[state.language].peshmergaNoResults}</div>
                <div style="color:var(--text-dim);font-size:0.85rem;">${translations[state.language].peshmergaNoResultsDesc}: <strong style="color:var(--primary-green);">${escapeHtmlP(query)}</strong></div>
            </div>
        `;
        return;
    }

    victimsState.results = items;

    let html = `
        <div style="background:var(--secondary-bg);border:1.5px solid var(--primary-green);border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;flex-wrap:wrap;gap:15px;align-items:center;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="color:var(--primary-green);font-size:1.5rem;">▣</span>
                <div>
                    <div style="color:var(--primary-green);font-weight:bold;font-size:1rem;">${total.toLocaleString()} VICTIM PROFILES</div>
                    <div style="color:var(--text-dim);font-size:0.72rem;">QUERY: ${escapeHtmlP(query)}</div>
                </div>
            </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
    `;

    items.forEach((item, idx) => {
        const ipStr = (item.device_ips || []).join(', ');
        const emailStr = (item.device_emails_str || []).join(', ');
        const discordStr = (item.discord_ids || []).join(', ');
        const hwidStr = (item.hwids_str || []).join(', ');

        html += `
            <div style="background:var(--secondary-bg);border:1.5px solid var(--dark-green);border-left:4px solid #ff8c00;border-radius:8px;padding:16px;transition:all 0.3s;"
                 onmouseover="this.style.borderColor='var(--primary-green)';this.style.boxShadow='0 0 20px var(--glow-green)'"
                 onmouseout="this.style.borderColor='var(--dark-green)';this.style.boxShadow='none';this.style.borderLeftColor='#ff8c00'">

                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                    <span style="color:var(--text-dim);font-size:0.72rem;font-family:'Rudaw Bold',monospace;">VICTIM #${String(idx + 1).padStart(3, '0')} • LOG: ${escapeHtmlP(item.log_id || 'N/A')}</span>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-primary" style="padding:5px 12px;font-size:0.72rem;" onclick="loadVictimManifest('${item.log_id}')">📂 VIEW FILES</button>
                        <button class="btn btn-primary" style="padding:5px 12px;font-size:0.72rem;background:rgba(255,140,0,0.2);border-color:#ff8c00;color:#ff8c00;" onclick="event.stopPropagation(); downloadPeshmergaArchive('${item.log_id}')">⬇ DOWNLOAD FILES</button>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                    ${item.device_user_str && item.device_user_str.length ? `
                    <div style="background:var(--input-bg);border-left:3px solid #00d4ff;padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">USERNAMES</div>
                        <div style="color:#00d4ff;font-size:0.8rem;font-weight:bold;">${escapeHtmlP(item.device_user_str.join(', '))}</div>
                    </div>` : ''}
                    ${ipStr ? `
                    <div style="background:var(--input-bg);border-left:3px solid #b845ff;padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">IP ADDRESSES</div>
                        <div style="color:#b845ff;font-size:0.8rem;font-family:'Rudaw Bold',monospace;">${escapeHtmlP(ipStr)}</div>
                    </div>` : ''}
                    ${emailStr ? `
                    <div style="background:var(--input-bg);border-left:3px solid var(--primary-green);padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">EMAILS</div>
                        <div style="color:var(--primary-green);font-size:0.8rem;word-break:break-all;">${escapeHtmlP(emailStr)}</div>
                    </div>` : ''}
                    ${discordStr ? `
                    <div style="background:var(--input-bg);border-left:3px solid #5865F2;padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">DISCORD IDS</div>
                        <div style="color:#5865F2;font-size:0.8rem;font-family:'Rudaw Bold',monospace;">${escapeHtmlP(discordStr)}</div>
                    </div>` : ''}
                    ${hwidStr ? `
                    <div style="background:var(--input-bg);border-left:3px solid #ff4444;padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">HWIDS</div>
                        <div style="color:#ff4444;font-size:0.72rem;font-family:'Rudaw Bold',monospace;">${escapeHtmlP(hwidStr)}</div>
                    </div>` : ''}
                    ${item.total_docs ? `
                    <div style="background:var(--input-bg);border-left:3px solid #ff8c00;padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">FILES</div>
                        <div style="color:#ff8c00;font-size:0.8rem;font-weight:bold;">${item.total_docs} documents</div>
                    </div>` : ''}
                    ${item.pwned_at ? `
                    <div style="background:var(--input-bg);border-left:3px solid var(--text-dim);padding:8px 10px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:3px;">COMPROMISED</div>
                        <div style="color:var(--text-secondary);font-size:0.78rem;">${new Date(item.pwned_at).toLocaleDateString()}</div>
                    </div>` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsDiv.innerHTML = html;
}

// ── LOAD VICTIM MANIFEST ──
async function loadVictimManifest(logId) {
    const resultsDiv = document.getElementById('peshmergaResults');
    victimsState.currentLogId = logId;
    victimsState.manifest = null;

    resultsDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;">
            <div class="loading-spinner" style="width:50px;height:50px;"></div>
            <div style="color:var(--primary-green);font-weight:bold;">⬢ LOADING VICTIM FILE TREE...</div>
            <div style="color:var(--text-dim);font-size:0.8rem;">Log: ${escapeHtmlP(logId)}</div>
        </div>
    `;

    let searchToken;
    try {
        const freeTokenRes = await fetch('/api/captcha/free-token', {
            credentials: 'same-origin'
        });
        const freeTokenData = await freeTokenRes.json();
        if (!freeTokenData.success) throw new Error('Token error');
        searchToken = freeTokenData.searchToken;
    } catch (err) {
        showPeshmergaError('Token error: ' + err.message);
        return;
    }

    try {
        const res = await fetch(`/api/peshmerga/victims/manifest/${logId}`, {
            headers: {
                'x-search-token': searchToken
            }
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            if (data.quotaExceeded) {
                renderPeshmergaQuotaExceeded(data);
                updatePeshmergaQuotaUI(5, 5);
                return;
            }
            showPeshmergaError(data.error || 'Failed to load manifest.');
            return;
        }

        updatePeshmergaQuotaUI(data.quotaUsed || 0, data.quotaMax || 5);
        
        // data.data is the raw OathNet manifest response
        const manifestData = data.data;
        victimsState.manifest = manifestData;

        // Log the actual shape for debugging
        console.log('Manifest raw response:', manifestData);

        // OathNet manifest can be:
        // Option A: { log_id, log_name, victim_tree: [...] }
        // Option B: { log_id, log_name, files: [...] } 
        // Option C: Direct array of tree nodes
        // Try to extract the tree from various possible response shapes
        let tree = [];
        let logName = logId;

        if (manifestData) {
            // Try common property names
            if (Array.isArray(manifestData.victim_tree)) {
                tree = manifestData.victim_tree;
                logName = manifestData.log_name || logId;
            } else if (Array.isArray(manifestData.files)) {
                tree = manifestData.files;
                logName = manifestData.log_name || logId;
            } else if (Array.isArray(manifestData.tree)) {
                tree = manifestData.tree;
                logName = manifestData.log_name || logId;
            } else if (Array.isArray(manifestData.items)) {
                tree = manifestData.items;
                logName = manifestData.log_name || logId;
            } else if (Array.isArray(manifestData.children)) {
                tree = manifestData.children;
                logName = manifestData.log_name || logId;
            } else if (manifestData.log_id) {
                // Flat manifest with no tree — just show the fields
                logName = manifestData.log_name || manifestData.log_id || logId;
            } else if (typeof manifestData === 'object') {
                // Check if the object itself IS the tree (object with keys as file names)
                const keys = Object.keys(manifestData);
                const hasFileKeys = keys.some(k => 
                    manifestData[k] && typeof manifestData[k] === 'object' &&
                    (manifestData[k].type || manifestData[k].size_bytes || manifestData[k].id)
                );
                if (hasFileKeys) {
                    tree = Object.entries(manifestData).map(([name, val]) => ({
                        name,
                        ...(typeof val === 'object' ? val : { type: 'file', id: val })
                    }));
                    logName = logId;
                }
            }
        }

        // Render file tree
        let html = `
            <div style="background:var(--secondary-bg);border:1.5px solid var(--primary-green);border-radius:8px;padding:14px 18px;margin-bottom:15px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                <div>
                    <div style="color:var(--primary-green);font-weight:bold;font-size:1rem;">📂 VICTIM FILE TREE</div>
                    <div style="color:var(--text-dim);font-size:0.75rem;">Log: ${escapeHtmlP(logName)} • ${tree.length} items</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn" style="padding:6px 14px;font-size:0.78rem;" onclick="closeVictimManifest()">← BACK TO RESULTS</button>
                    <button class="btn btn-primary" style="padding:6px 14px;font-size:0.78rem;" onclick="event.stopPropagation(); downloadPeshmergaArchive('${logId}')">⬇ DOWNLOAD ARCHIVE</button>
                </div>
            </div>
            <div style="background:var(--primary-bg);border:1px solid var(--dark-green);border-radius:8px;padding:10px;max-height:500px;overflow-y:auto;font-family:'Rudaw Bold',monospace;font-size:0.78rem;">
        `;

        if (tree.length > 0) {
            html += renderFileTreeRecursive(tree, logId, 0);
        } else {
            // No tree found — show the raw data as key-value pairs
            html += `<div style="padding:16px;color:var(--text-dim);">No file tree available. Showing raw manifest data:</div>`;
            for (const [key, val] of Object.entries(manifestData || {})) {
                if (val !== null && typeof val !== 'object') {
                    html += `
                        <div style="padding:4px 12px;border-bottom:1px solid var(--dark-green);display:flex;gap:10px;">
                            <span style="color:var(--primary-green);font-weight:bold;min-width:120px;">${escapeHtmlP(key)}</span>
                            <span style="color:var(--text-secondary);">${escapeHtmlP(String(val))}</span>
                        </div>`;
                }
            }
        }

        html += '</div>';
        resultsDiv.innerHTML = html;

    } catch (err) {
        showPeshmergaError('Failed to load manifest: ' + err.message);
    }
}

function renderFileTreeRecursive(items, logId, depth) {
    if (!items || !Array.isArray(items)) return '<div style="padding:16px;color:var(--text-dim);font-size:0.78rem;">No files in this victim profile.</div>';
    
    let html = '';
    const indent = depth * 20;

    items.forEach(item => {
        if (!item || typeof item !== 'object') return;
        
        const isDir = item.type === 'directory';
        const sizeStr = item.size_bytes ? ` (${formatBytes(item.size_bytes)})` : '';
        const icon = isDir ? '📁' : '📄';
        const itemName = item.name || item.file_name || item.path || item.id || 'unknown';
        const itemId = item.id;

        html += `
            <div style="padding:4px 8px;padding-left:${indent + 8}px;border-left:${depth > 0 ? '1px dashed var(--dark-green)' : 'none'};margin:2px 0;border-radius:4px;transition:all 0.2s;"
                 onmouseover="this.style.background='rgba(0,255,65,0.05)'"
                 onmouseout="this.style.background='transparent'">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span>${icon}</span>
                    <span style="color:${isDir ? '#00d4ff' : 'var(--text-secondary)'};font-weight:${isDir ? 'bold' : 'normal'};">${escapeHtmlP(itemName)}</span>
                    <span style="color:var(--text-dim);font-size:0.7rem;">${sizeStr}</span>
                    ${!isDir && itemId ? `
                        <button class="btn" style="padding:2px 8px;font-size:0.65rem;margin-left:auto;" onclick="viewVictimFile('${logId}', '${itemId}')">👁 VIEW</button>
                        <button class="btn" style="padding:2px 8px;font-size:0.65rem;" onclick="downloadVictimFile('${logId}', '${itemId}', '${escapeHtmlP(itemName)}')">⬇</button>
                    ` : ''}
                </div>
            </div>
        `;

        if (isDir && item.children && Array.isArray(item.children)) {
            html += renderFileTreeRecursive(item.children, logId, depth + 1);
        }
    });

    return html;
}

// ── VIEW VICTIM FILE CONTENT ──
async function viewVictimFile(logId, fileId) {
    // Create a modal overlay within results
    const resultsDiv = document.getElementById('peshmergaResults');

    // Inject a file viewer panel
    const viewerId = 'victimFileViewer';
    let viewer = document.getElementById(viewerId);
    if (viewer) {
        viewer.style.display = 'block';
    } else {
        viewer = document.createElement('div');
        viewer.id = viewerId;
        viewer.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            width:80%;max-width:800px;height:70vh;max-height:600px;
            background:var(--secondary-bg);border:2px solid var(--primary-green);
            border-radius:10px;z-index:9999;display:flex;flex-direction:column;
            box-shadow:0 0 50px var(--glow-green);
        `;
        viewer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--dark-green);background:var(--primary-bg);border-radius:10px 10px 0 0;">
                <span id="fileViewerTitle" style="color:var(--primary-green);font-weight:bold;font-size:0.88rem;">▣ FILE CONTENT</span>
                <button onclick="document.getElementById('victimFileViewer').style.display='none'" style="background:none;border:none;color:var(--danger-red);font-size:1.4rem;cursor:pointer;">×</button>
            </div>
            <div id="fileViewerContent" style="flex:1;overflow-y:auto;padding:16px;font-family:'Rudaw Bold',monospace;font-size:0.78rem;color:var(--text-secondary);white-space:pre-wrap;word-break:break-all;"></div>
        `;
        document.body.appendChild(viewer);
    }

    document.getElementById('fileViewerTitle').textContent = `▣ FILE: ${fileId}`;
    document.getElementById('fileViewerContent').textContent = 'Loading file content...';

    try {
        const res = await fetch(`/api/peshmerga/victims/file/${logId}/${fileId}`, {
            credentials: 'same-origin'
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            document.getElementById('fileViewerContent').textContent = 'Error: ' + (data.error || 'Failed to load file');
            return;
        }

        document.getElementById('fileViewerContent').textContent = data.content || '(empty file)';
    } catch (err) {
        document.getElementById('fileViewerContent').textContent = 'Error loading file: ' + err.message;
    }
}

// ── DOWNLOAD VICTIM FILE (as .txt download via blob) ──
async function downloadVictimFile(logId, fileId, fileName) {
    try {
        const res = await fetch(`/api/peshmerga/victims/file/${logId}/${fileId}`, {
            credentials: 'same-origin'
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.content) {
            alert('Failed to download file.');
            return;
        }

        const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (err) {
        alert('Download failed: ' + err.message);
    }
}

function closeVictimManifest() {
    victimsState.manifest = null;
    victimsState.currentLogId = null;
    // Re-run search with empty to go back — or just show welcome
    showPeshmergaWelcome();
}

function showPeshmergaWelcome() {
    const resultsDiv = document.getElementById('peshmergaResults');
    resultsDiv.innerHTML = `
        <div id="peshmergaWelcome" style="text-align:center;padding:60px 20px;">
            <div style="font-size:4rem;color:var(--primary-green);margin-bottom:18px;text-shadow:0 0 30px var(--glow-green);">⬡</div>
            <div style="color:var(--primary-green);font-size:1.2rem;font-weight:bold;letter-spacing:3px;margin-bottom:10px;font-family:'Rudaw Bold',monospace;">${translations[state.language].peshmergaOnline}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;">${translations[state.language].peshmergaOnlineDesc}</div>
            <div style="color:var(--text-dim);font-size:0.8rem;">${translations[state.language].peshmergaOnlineDesc2}</div>
        </div>
    `;
}

// ── RENDER BREACH/STEALER RESULTS ──
function renderPeshmergaResults(apiResponse, query) {
    const resultsDiv = document.getElementById('peshmergaResults');

    if (!apiResponse || !apiResponse.success) {
        showPeshmergaError('Invalid response from intelligence server.');
        return;
    }

    const meta = apiResponse?.data?.meta || {};
    const items = apiResponse?.data?.items || [];
    const total = meta.total || 0;

    if (total === 0 || items.length === 0) {
        resultsDiv.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:3rem;color:var(--text-dim);margin-bottom:15px;">◎</div>
                <div style="color:var(--text-secondary);font-size:1rem;font-weight:bold;letter-spacing:2px;margin-bottom:8px;">${translations[state.language].peshmergaNoResults}</div>
                <div style="color:var(--text-dim);font-size:0.85rem;">${translations[state.language].peshmergaNoResultsDesc}: <strong style="color:var(--primary-green);">${escapeHtmlP(query)}</strong></div>
            </div>
        `;
        return;
    }

    const typeLabel = peshmergaSearchType === 'breach' ? 'BREACH' : 'DEVICE INFORMATIONS';

    let html = `
        <div style="background:var(--secondary-bg);border:1.5px solid var(--primary-green);border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;flex-wrap:wrap;gap:20px;align-items:center;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="color:var(--primary-green);font-size:1.5rem;">▣</span>
                <div>
                    <div style="color:var(--primary-green);font-weight:bold;font-size:1.1rem;font-family:'Rudaw Bold',monospace;">${total.toLocaleString()} RECORDS</div>
                    <div style="color:var(--text-dim);font-size:0.72rem;letter-spacing:1px;">${typeLabel} • QUERY: ${escapeHtmlP(query)}</div>
                </div>
            </div>
            <div style="margin-left:auto;display:flex;gap:12px;font-size:0.75rem;color:var(--text-secondary);">
                <div>SHOWN: <strong style="color:var(--primary-green);">${items.length}</strong></div>
                ${meta.took_ms ? `<div>TIME: <strong style="color:var(--primary-green);">${meta.took_ms}ms</strong></div>` : ''}
                ${meta.has_more ? `<div style="color:#ffa500;">⚠ MORE AVAILABLE</div>` : ''}
            </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
    `;

    items.forEach((item, idx) => {
        const isRedacted = item.password && item.password.includes('REDACTED');
        const dbColor = getDatabaseColor(item.dbname || '');

        html += `
            <div style="background:var(--secondary-bg);border:1.5px solid var(--dark-green);border-left:4px solid ${dbColor};border-radius:8px;padding:16px;transition:all 0.3s;"
                 onmouseover="this.style.borderColor='var(--primary-green)';this.style.boxShadow='0 0 20px var(--glow-green)'"
                 onmouseout="this.style.borderColor='var(--dark-green)';this.style.boxShadow='none';this.style.borderLeftColor='${dbColor}'">

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="color:var(--text-dim);font-size:0.72rem;font-family:'Rudaw Bold',monospace;">RECORD #${String(idx + 1).padStart(4, '0')}</span>
                    <span style="background:${dbColor}22;border:1px solid ${dbColor};color:${dbColor};padding:3px 10px;border-radius:4px;font-size:0.7rem;font-weight:bold;letter-spacing:1px;">
                        ${escapeHtmlP(item.dbname || 'UNKNOWN')}
                    </span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
                    ${item.email ? `
                    <div style="background:var(--input-bg);border-left:3px solid var(--primary-green);padding:10px 12px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;letter-spacing:1px;margin-bottom:4px;">EMAIL</div>
                        <div style="color:var(--primary-green);font-family:'Rudaw Bold',monospace;font-size:0.85rem;font-weight:bold;word-break:break-all;">${escapeHtmlP(item.email)}</div>
                    </div>` : ''}

                    ${item.username ? `
                    <div style="background:var(--input-bg);border-left:3px solid #00d4ff;padding:10px 12px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:4px;">USERNAME</div>
                        <div style="color:#00d4ff;font-family:'Rudaw Bold',monospace;font-size:0.85rem;font-weight:bold;">${escapeHtmlP(item.username)}</div>
                    </div>` : ''}

                    ${item.password ? `
                    <div style="background:var(--input-bg);border-left:3px solid ${isRedacted ? '#555' : '#ff4444'};padding:10px 12px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:4px;">PASSWORD</div>
                        <div style="color:${isRedacted ? '#555' : '#ff4444'};font-family:'Rudaw Bold',monospace;font-size:0.85rem;font-weight:bold;">${escapeHtmlP(item.password)}</div>
                    </div>` : ''}

                    ${item.domain ? `
                    <div style="background:var(--input-bg);border-left:3px solid #b845ff;padding:10px 12px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:4px;">DOMAIN</div>
                        <div style="color:#b845ff;font-family:'Rudaw Bold',monospace;font-size:0.85rem;font-weight:bold;">${escapeHtmlP(item.domain)}</div>
                    </div>` : ''}

                    ${item.url ? `
                    <div style="background:var(--input-bg);border-left:3px solid #ff8c00;padding:10px 12px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:4px;">URL</div>
                        <div style="color:#ff8c00;font-family:'Rudaw Bold',monospace;font-size:0.75rem;word-break:break-all;">${escapeHtmlP(item.url)}</div>
                    </div>` : ''}

                    ${item.indexed_at ? `
                    <div style="background:var(--input-bg);border-left:3px solid var(--text-dim);padding:10px 12px;border-radius:4px;">
                        <div style="color:var(--text-dim);font-size:0.65rem;margin-bottom:4px;">INDEXED</div>
                        <div style="color:var(--text-secondary);font-family:'Rudaw Bold',monospace;font-size:0.78rem;">${new Date(item.indexed_at).toLocaleDateString()}</div>
                    </div>` : ''}
                </div>

                ${renderExtraFields(item)}
            </div>
        `;
    });

    html += '</div>';

    if (meta.has_more) {
        html += `
            <div style="text-align:center;margin-top:20px;padding:16px;background:rgba(255,165,0,0.06);border:1px solid #ffa500;border-radius:8px;color:#ffa500;font-size:0.85rem;">
                ⚠ ${(total - items.length).toLocaleString()} more records exist. Refine your search.
            </div>
        `;
    }

    resultsDiv.innerHTML = html;
}

function renderExtraFields(item) {
    const knownFields = ['email', 'password', 'dbname', 'indexed_at', 'username', 'domain', 'url'];
    const extra = Object.entries(item).filter(([k]) => !knownFields.includes(k) && item[k]);
    if (extra.length === 0) return '';

    let html = '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">';
    extra.forEach(([key, value]) => {
        html += `
            <div style="background:rgba(0,255,65,0.05);border:1px solid var(--dark-green);padding:5px 10px;border-radius:4px;font-size:0.72rem;">
                <span style="color:var(--text-dim);text-transform:uppercase;">${escapeHtmlP(key)}:</span>
                <span style="color:var(--text-secondary);font-family:'Rudaw Bold',monospace;margin-left:5px;">${escapeHtmlP(String(value))}</span>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function getDatabaseColor(dbname) {
    const name = dbname.toLowerCase();
    if (name.includes('linkedin')) return '#0077b5';
    if (name.includes('adobe')) return '#ff0000';
    if (name.includes('twitter') || name.includes('x_')) return '#1da1f2';
    if (name.includes('facebook')) return '#1877f2';
    if (name.includes('yahoo')) return '#720e9e';
    if (name.includes('google')) return '#4285f4';
    if (name.includes('steam')) return '#1b2838';
    const colors = ['#00ff41', '#00d4ff', '#b845ff', '#ff8c00', '#ff4444', '#00e5ff'];
    let hash = 0;
    for (let c of dbname) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function renderPeshmergaQuotaExceeded(data) {
    const t = translations[state.language];
    const maxQuota = data.quotaMax || 50;
    document.getElementById('peshmergaResults').innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;">
            <div style="font-size:4rem;color:#ff0000;">⛔</div>
            <div style="color:#ff0000;font-size:1.3rem;font-weight:bold;letter-spacing:3px;font-family:'Rudaw Bold',monospace;">${t.peshmergaDailyLimit}</div>
            <div style="background:rgba(255,0,0,0.08);border:2px solid #ff0000;border-radius:10px;padding:24px 32px;max-width:480px;text-align:center;">
                <div style="color:#ff6666;font-size:0.9rem;line-height:1.9;">
                    You have used all <strong style="color:#ff0000;">${maxQuota}/${maxQuota}</strong> daily search credits.<br>
                    Your quota resets in <strong style="color:#ffa500;">${data.hoursLeft} hours</strong>.
                </div>
                <div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,0,0,0.3);">
                    <div style="color:var(--text-dim);font-size:0.78rem;margin-bottom:10px;letter-spacing:1px;">TO UPGRADE YOUR PANEL</div>
                    <div style="color:#ffa500;font-size:0.85rem;font-weight:bold;letter-spacing:1px;">⬢ ${t.peshmergaUpgrade}</div>
                </div>
            </div>
        </div>
    `;
}

function showPeshmergaError(msg) {
    document.getElementById('peshmergaResults').innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;padding:60px 20px;gap:15px;">
            <div style="font-size:3rem;color:var(--danger-red);">⚠</div>
            <div style="color:var(--danger-red);font-size:1rem;font-weight:bold;letter-spacing:2px;">ERROR</div>
            <div style="color:var(--text-secondary);font-size:0.88rem;text-align:center;">${escapeHtmlP(msg)}</div>
        </div>
    `;
}

function escapeHtmlP(text) {
    const d = document.createElement('div');
    d.textContent = String(text);
    return d.innerHTML;
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return size.toFixed(1) + ' ' + units[i];
}

// ── RENDER OSINT RESULT ──
function renderOsintResult(data, query) {
    const resultsDiv = document.getElementById('peshmergaResults');

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        resultsDiv.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:3rem;color:var(--text-dim);margin-bottom:15px;">◎</div>
                <div style="color:var(--text-secondary);font-size:1rem;font-weight:bold;letter-spacing:2px;margin-bottom:8px;">NO DATA FOUND</div>
                <div style="color:var(--text-dim);font-size:0.85rem;">No results for: <strong style="color:var(--primary-green);">${escapeHtmlP(query)}</strong></div>
            </div>`;
        return;
    }

    function flattenObj(obj, prefix = '') {
        return Object.entries(obj).reduce((acc, [k, v]) => {
            const key = prefix ? `${prefix} › ${k}` : k;
            if (v && typeof v === 'object' && !Array.isArray(v)) {
                Object.assign(acc, flattenObj(v, key));
            } else {
                acc[key] = Array.isArray(v) ? v.join(', ') : v;
            }
            return acc;
        }, {});
    }

    const flat = flattenObj(data);
    const typeLabel = peshmergaSearchType.toUpperCase().replace('-', ' ');

    let html = `
        <div style="background:var(--secondary-bg);border:1.5px solid var(--primary-green);border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:14px;">
            <span style="color:var(--primary-green);font-size:1.5rem;">▣</span>
            <div>
                <div style="color:var(--primary-green);font-weight:bold;font-size:1rem;font-family:'Rudaw Bold',monospace;">OSINT RESULT</div>
                <div style="color:var(--text-dim);font-size:0.72rem;letter-spacing:1px;">${typeLabel} • QUERY: ${escapeHtmlP(query)}</div>
            </div>
        </div>
        <div style="background:var(--secondary-bg);border:1.5px solid var(--dark-green);border-left:4px solid var(--primary-green);border-radius:8px;padding:18px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">
    `;

    for (const [key, value] of Object.entries(flat)) {
        if (value === null || value === undefined || value === '') continue;
        html += `
            <div style="background:var(--input-bg);border-left:3px solid var(--primary-green);padding:10px 12px;border-radius:4px;">
                <div style="color:var(--text-dim);font-size:0.65rem;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;">${escapeHtmlP(key)}</div>
                <div style="color:var(--primary-green);font-family:'Rudaw Bold',monospace;font-size:0.85rem;font-weight:bold;word-break:break-all;">${escapeHtmlP(String(value))}</div>
            </div>`;
    }

    html += `</div></div>`;
    resultsDiv.innerHTML = html;
}


// ── ARCHIVE DOWNLOAD (cookie-based auth) ──
async function downloadPeshmergaArchive(logId) {
    // Show loading state
    const resultsDiv = document.getElementById('peshmergaResults');
    resultsDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;">
            <div class="loading-spinner" style="width:50px;height:50px;"></div>
            <div style="color:var(--primary-green);font-weight:bold;letter-spacing:2px;">⬢ DOWNLOADING ARCHIVE...</div>
            <div style="color:var(--text-dim);font-size:0.8rem;">Preparing ${escapeHtmlP(logId).substring(0, 20)}...</div>
        </div>
    `;

    try {
        const response = await fetch(`/api/peshmerga/victims/archive/${logId}`, {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            if (response.status === 429 && errData.quotaExceeded) {
                renderPeshmergaQuotaExceeded(errData);
                return;
            }
            throw new Error(errData.error || `Server returned ${response.status}`);
        }

        // Get filename from Content-Disposition if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `peshmergaeye_${logId}.zip`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+?)"?$/);
            if (match) filename = match[1];
        }

        // Get the binary ZIP data
        const blob = await response.blob();

        // Create download link and click it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the object URL after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);

        // Refresh quota display after download
        loadPeshmergaQuota();

        // ★ RESTORE VICTIMS RESULTS VIEW ★
        if (victimsState.results.length > 0) {
            const lastQuery = document.getElementById('peshmergaInput')?.value || '';
            renderVictimsResults({ success: true, data: { items: victimsState.results, meta: { total: victimsState.results.length } } }, lastQuery);
        } else {
            showPeshmergaWelcome();
        }

    } catch (err) {
        console.error('Archive download failed:', err);
        showPeshmergaError('Download failed: ' + err.message);
    }
}

// Expose functions globally
window.openPeshmergaModal = openPeshmergaModal;
window.closePeshmergaModal = closePeshmergaModal;
window.setPeshmergaType = setPeshmergaType;
window.executePeshmergaSearch = executePeshmergaSearch;
window.loadVictimManifest = loadVictimManifest;
window.viewVictimFile = viewVictimFile;
window.downloadVictimFile = downloadVictimFile;
window.closeVictimManifest = closeVictimManifest;