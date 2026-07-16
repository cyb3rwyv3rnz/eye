// CVE Intelligence Module
const CVE_API = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

let allCveData = [];
let filteredCveData = [];
let currentSortMode = 'newest';
let currentSeverityFilter = '';

function getCveT() {
    return translations[state.language];
}

function openCveModal() {
    document.getElementById('cveModal').classList.add('active');
    renderCveModalStrings();
    loadLatestCves();
}

function closeCveModal() {
    document.getElementById('cveModal').classList.remove('active');
}

function renderCveModalStrings() {
    const t = getCveT();
    const input = document.getElementById('cveSearchInput');
    const source = document.getElementById('cveSourceLabel');
    const searchBtn = document.getElementById('cveSearchBtn');
    const latestBtn = document.getElementById('cveLatestBtn');
    const severityFilter = document.getElementById('cveSeverityFilter');

    if (input) input.placeholder = t.cveSearchPlaceholder;
    if (source) source.textContent = t.cveSource;
    if (searchBtn) searchBtn.textContent = t.cveSearch;
    if (latestBtn) latestBtn.textContent = t.cveLatest;
    if (severityFilter) severityFilter.options[0].text = t.cveAllSeverities;
}

async function loadLatestCves() {
    showCveLoading();
    currentSeverityFilter = '';
    currentSortMode = 'modified';

    const severityEl = document.getElementById('cveSeverityFilter');
    const sortEl = document.getElementById('cveSortMode');
    if (severityEl) severityEl.value = '';
    if (sortEl) sortEl.value = 'modified';

    try {
        // Fetch CVEs modified in the last 30 days using lastModStartDate/lastModEndDate
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const lastModEndDate = now.toISOString().replace(/\.\d{3}Z$/, '.000');
        const lastModStartDate = thirtyDaysAgo.toISOString().replace(/\.\d{3}Z$/, '.000');

        const url = `${CVE_API}?lastModStartDate=${encodeURIComponent(lastModStartDate)}&lastModEndDate=${encodeURIComponent(lastModEndDate)}&resultsPerPage=50&startIndex=0`;

        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('API error: ' + response.status);
        const data = await response.json();
        allCveData = data.vulnerabilities || [];
        filteredCveData = [...allCveData];
        applyFiltersAndSort();
    } catch (error) {
        showCveError(error.message);
    }
}

async function searchCve() {
    const query = document.getElementById('cveSearchInput').value.trim();
    if (!query) return loadLatestCves();

    showCveLoading();
    try {
        let url = '';
        if (/^CVE-\d{4}-\d+$/i.test(query)) {
            url = `${CVE_API}?cveId=${query.toUpperCase()}`;
        } else {
            url = `${CVE_API}?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=50`;
        }
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('API error: ' + response.status);
        const data = await response.json();
        allCveData = data.vulnerabilities || [];
        filteredCveData = [...allCveData];

        const severityEl = document.getElementById('cveSeverityFilter');
        const sortEl = document.getElementById('cveSortMode');
        if (severityEl) severityEl.value = '';
        if (sortEl) sortEl.value = 'newest';
        currentSeverityFilter = '';
        currentSortMode = 'newest';

        applyFiltersAndSort();
    } catch (error) {
        showCveError(error.message);
    }
}

function filterCveBySeverity() {
    currentSeverityFilter = document.getElementById('cveSeverityFilter').value;
    applyFiltersAndSort();
}

function sortCveBy() {
    currentSortMode = document.getElementById('cveSortMode').value;
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    // Filter
    if (currentSeverityFilter) {
        filteredCveData = allCveData.filter(v => {
            const { severity } = getCvssData(v.cve);
            return severity === currentSeverityFilter;
        });
    } else {
        filteredCveData = [...allCveData];
    }

    // Sort
    filteredCveData.sort((a, b) => {
        const cveA = a.cve;
        const cveB = b.cve;
        const scoreA = getCvssData(cveA);
        const scoreB = getCvssData(cveB);

        switch (currentSortMode) {
            case 'newest':
                return new Date(cveB.published || 0) - new Date(cveA.published || 0);
            case 'oldest':
                return new Date(cveA.published || 0) - new Date(cveB.published || 0);
            case 'modified':
                return new Date(cveB.lastModified || 0) - new Date(cveA.lastModified || 0);
            case 'score_desc':
                return (parseFloat(scoreB.score) || 0) - (parseFloat(scoreA.score) || 0);
            case 'score_asc':
                return (parseFloat(scoreA.score) || 0) - (parseFloat(scoreB.score) || 0);
            case 'critical':
                return severityOrder(scoreA.severity) - severityOrder(scoreB.severity);
            case 'id_desc': {
                const [yearA, numA] = parseCveId(cveA.id);
                const [yearB, numB] = parseCveId(cveB.id);
                return yearB !== yearA ? yearB - yearA : numB - numA;
            }
            case 'id_asc': {
                const [yearA2, numA2] = parseCveId(cveA.id);
                const [yearB2, numB2] = parseCveId(cveB.id);
                return yearA2 !== yearB2 ? yearA2 - yearB2 : numA2 - numB2;
            }
            default:
                return 0;
        }
    });

    renderCveResults(filteredCveData);
}

function severityOrder(s) {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
    return order[s] ?? 4;
}

function parseCveId(id) {
    const parts = (id || '').split('-');
    return [parseInt(parts[1] || 0), parseInt(parts[2] || 0)];
}

function getCvssData(cve) {
    const metrics = cve.metrics;
    if (!metrics) return { score: 'N/A', severity: 'UNKNOWN', vector: '' };
    const v31 = metrics.cvssMetricV31?.[0]?.cvssData;
    const v30 = metrics.cvssMetricV30?.[0]?.cvssData;
    const v2  = metrics.cvssMetricV2?.[0]?.cvssData;
    const data = v31 || v30 || v2;
    if (!data) return { score: 'N/A', severity: 'UNKNOWN', vector: '' };
    return {
        score: data.baseScore ?? 'N/A',
        severity: data.baseSeverity || getSeverityFromScore(data.baseScore),
        vector: data.vectorString || ''
    };
}

function getSeverityFromScore(score) {
    if (!score || score === 'N/A') return 'UNKNOWN';
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
}

function getSeverityColor(severity) {
    const colors = {
        'CRITICAL': '#ff0000',
        'HIGH':     '#ff6600',
        'MEDIUM':   '#ffaa00',
        'LOW':      '#00cc33',
        'UNKNOWN':  '#666666'
    };
    return colors[severity] || '#666666';
}

function getSeverityBg(severity) {
    const colors = {
        'CRITICAL': 'rgba(255,0,0,0.08)',
        'HIGH':     'rgba(255,102,0,0.08)',
        'MEDIUM':   'rgba(255,170,0,0.08)',
        'LOW':      'rgba(0,204,51,0.08)',
        'UNKNOWN':  'rgba(102,102,102,0.08)'
    };
    return colors[severity] || 'rgba(102,102,102,0.08)';
}

function renderCveResults(vulns) {
    const t = getCveT();
    const container = document.getElementById('cveResults');

    if (!vulns.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:var(--text-dim);">
                <div style="font-size:2.5rem;margin-bottom:12px;">▣</div>
                <div style="color:var(--danger-red);font-size:1rem;font-weight:bold;">${t.cveNotFound}</div>
            </div>`;
        return;
    }

    // Summary bar
    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
    vulns.forEach(v => {
        const { severity } = getCvssData(v.cve);
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });

    let html = `
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;align-items:center;">
            <span style="color:var(--text-secondary);font-size:0.85rem;letter-spacing:1px;">
                ⬢ ${t.cveTotal}: <strong style="color:var(--primary-green);">${vulns.length}</strong>
            </span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:auto;">
                ${Object.entries(severityCounts).filter(([,c])=>c>0).map(([sev, count]) => `
                    <span style="background:${getSeverityBg(sev)};border:1px solid ${getSeverityColor(sev)};color:${getSeverityColor(sev)};
                          padding:4px 10px;border-radius:4px;font-size:0.72rem;font-weight:bold;cursor:pointer;"
                          onclick="quickFilterSeverity('${sev}')">
                        ${sev} ${count}
                    </span>
                `).join('')}
                ${currentSeverityFilter ? `
                    <span style="background:var(--input-bg);border:1px solid var(--text-dim);color:var(--text-dim);
                          padding:4px 10px;border-radius:4px;font-size:0.72rem;cursor:pointer;"
                          onclick="quickFilterSeverity('')">✕ CLEAR</span>
                ` : ''}
            </div>
        </div>
    `;

    vulns.forEach((v, idx) => {
        const cve = v.cve;
        const id = cve.id;
        const published = cve.published ? new Date(cve.published).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit'
        }) : 'N/A';
        const modified = cve.lastModified ? new Date(cve.lastModified).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit'
        }) : 'N/A';
        const desc = cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description available.';
        const { score, severity, vector } = getCvssData(cve);
        const color = getSeverityColor(severity);
        const bg = getSeverityBg(severity);
        const cwes = cve.weaknesses?.flatMap(w => w.description.map(d => d.value)).filter(v => v !== 'NVD-CWE-noinfo').join(', ') || 'N/A';
        const refs = cve.references?.slice(0, 3) || [];
        const truncDesc = desc.length > 220 ? desc.substring(0, 220) + '...' : desc;

        // Score ring visual
        const scoreNum = parseFloat(score) || 0;
        const scorePercent = Math.min((scoreNum / 10) * 100, 100);
        const circumference = 2 * Math.PI * 20;
        const dashOffset = circumference - (scorePercent / 100) * circumference;

        html += `
        <div style="
            background:linear-gradient(135deg,var(--secondary-bg) 0%,var(--tertiary-bg) 100%);
            border:1.5px solid var(--dark-green);
            border-left:5px solid ${color};
            border-radius:10px;
            padding:18px 20px;
            margin-bottom:12px;
            transition:all 0.25s ease;
            position:relative;
            overflow:hidden;
        "
        onmouseover="this.style.boxShadow='0 0 25px ${color}33';this.style.borderColor='${color}';this.style.transform='translateX(4px)'"
        onmouseout="this.style.boxShadow='none';this.style.borderColor='var(--dark-green)';this.style.borderLeftColor='${color}';this.style.transform='translateX(0)'">
            
            <!-- Top row -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;">
                
                <!-- Left: ID + badges -->
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
                        <span style="color:var(--primary-green);font-size:1.05rem;font-weight:bold;letter-spacing:1px;font-family:monospace;">${id}</span>
                        <span style="background:${bg};border:1px solid ${color};color:${color};padding:2px 9px;border-radius:4px;font-size:0.7rem;font-weight:bold;">${severity}</span>
                        ${cwes !== 'N/A' ? `<span style="background:var(--input-bg);border:1px solid var(--dark-green);color:var(--text-dim);padding:2px 8px;border-radius:4px;font-size:0.68rem;">${cwes}</span>` : ''}
                    </div>
                    <div style="color:var(--text-secondary);font-size:0.82rem;line-height:1.6;">${truncDesc}</div>
                </div>
                
                <!-- Right: Score ring -->
                <div style="flex-shrink:0;text-align:center;">
                    <svg width="54" height="54" viewBox="0 0 54 54">
                        <circle cx="27" cy="27" r="20" fill="none" stroke="var(--dark-green)" stroke-width="4"/>
                        <circle cx="27" cy="27" r="20" fill="none" stroke="${color}" stroke-width="4"
                            stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${dashOffset.toFixed(1)}"
                            stroke-linecap="round" transform="rotate(-90 27 27)"
                            style="transition:stroke-dashoffset 0.6s ease;"/>
                        <text x="27" y="31" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="monospace">${score}</text>
                    </svg>
                    <div style="color:var(--text-dim);font-size:0.58rem;letter-spacing:0.5px;margin-top:-2px;">${t.cveScore}</div>
                </div>
            </div>

            <!-- Meta row -->
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--dark-green);">
                <div style="display:flex;align-items:center;gap:5px;background:var(--input-bg);padding:5px 10px;border-radius:5px;font-size:0.75rem;">
                    <span style="color:var(--text-dim);">📅 ${t.cvePublished}:</span>
                    <span style="color:var(--primary-green);font-family:monospace;">${published}</span>
                </div>
                <div style="display:flex;align-items:center;gap:5px;background:var(--input-bg);padding:5px 10px;border-radius:5px;font-size:0.75rem;">
                    <span style="color:var(--text-dim);">🔄 ${t.cveModified}:</span>
                    <span style="color:var(--primary-green);font-family:monospace;">${modified}</span>
                </div>
                ${vector ? `
                <div style="display:flex;align-items:center;gap:5px;background:var(--input-bg);padding:5px 10px;border-radius:5px;font-size:0.68rem;max-width:100%;overflow:hidden;">
                    <span style="color:var(--text-dim);flex-shrink:0;">${t.cveVector}:</span>
                    <span style="color:${color};font-family:monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${vector}</span>
                </div>` : ''}
                ${refs.length ? refs.map(r => {
                    const domain = (() => { try { return new URL(r.url).hostname.replace('www.',''); } catch(e) { return r.url.substring(0,30); } })();
                    return `<a href="${r.url}" target="_blank"
                        style="display:flex;align-items:center;gap:4px;background:var(--input-bg);padding:5px 10px;border-radius:5px;
                               font-size:0.72rem;color:var(--accent-blue);text-decoration:none;border:1px solid var(--dark-green);transition:all 0.2s;"
                        onmouseover="this.style.borderColor='var(--accent-blue)';this.style.background='rgba(0,212,255,0.08)'"
                        onmouseout="this.style.borderColor='var(--dark-green)';this.style.background='var(--input-bg)'">
                        ► ${domain}
                    </a>`;
                }).join('') : ''}
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function quickFilterSeverity(severity) {
    currentSeverityFilter = severity;
    const severityEl = document.getElementById('cveSeverityFilter');
    if (severityEl) severityEl.value = severity;
    applyFiltersAndSort();
}

function showCveLoading() {
    const t = getCveT();
    document.getElementById('cveResults').innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <div class="loading-spinner" style="margin:0 auto 20px;"></div>
            <p class="loading-text terminal-text">${t.cveScanning}</p>
            <div class="scanning-line" style="margin:15px auto;"></div>
            <p style="color:var(--text-dim);font-size:0.8rem;margin-top:15px;">${t.cveDecrypting}</p>
        </div>`;
}

function showCveError(msg) {
    const t = getCveT();
    document.getElementById('cveResults').innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <div style="color:var(--danger-red);font-size:1rem;font-weight:bold;margin-bottom:10px;">${t.cveConnFailed}</div>
            <div style="color:var(--text-dim);font-size:0.85rem;margin-bottom:20px;">${msg}</div>
            <button onclick="loadLatestCves()"
                style="padding:10px 25px;background:var(--dark-green);border:1.5px solid var(--primary-green);
                       color:var(--primary-green);border-radius:6px;cursor:pointer;font-family:'Cairo',monospace;font-weight:bold;">
                ${t.cveRetry}
            </button>
        </div>`;
}

window.openCveModal        = openCveModal;
window.closeCveModal       = closeCveModal;
window.loadLatestCves      = loadLatestCves;
window.searchCve           = searchCve;
window.filterCveBySeverity = filterCveBySeverity;
window.sortCveBy           = sortCveBy;
window.quickFilterSeverity = quickFilterSeverity;