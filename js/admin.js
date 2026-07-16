// ============================================================================
// BCIA INTELLIGENCE OPERATIONS PLATFORM — ADMIN.JS v3.0
// Next-Generation SOC Dashboard Controller
// ============================================================================

const API_URL = window.location.origin;

// ── ICON LIBRARY — minimal outline SVGs, no emoji/cartoon icons anywhere ──────
function svgIcon(paths, extra = '') {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${paths}</svg>`;
}
const ICON = {
    grid: svgIcon('<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>'),
    broadcast: svgIcon('<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.3 5.3a9.3 9.3 0 000 13.4M18.7 5.3a9.3 9.3 0 010 13.4"/>'),
    alertTriangle: svgIcon('<path d="M12 4l9 16H3L12 4z"/><path d="M12 10.5v3.5"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>'),
    user: svgIcon('<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
    ban: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M5.5 5.5l13 13"/>'),
    archive: svgIcon('<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v9a2 2 0 002 2h10a2 2 0 002-2V9"/><path d="M10 13h4"/>'),
    messageAlert: svgIcon('<path d="M4 5h16v11H8l-4 4V5z"/><path d="M12 9v3"/><circle cx="12" cy="14.6" r="0.6" fill="currentColor" stroke="none"/>'),
    clipboardList: svgIcon('<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2.3" width="6" height="3" rx="1"/><path d="M9 11h6M9 14h6M9 17h4"/>'),
    barChart: svgIcon('<path d="M5 20V11M10.5 20V5M16 20v-8"/><path d="M3 20h18"/>'),
    server: svgIcon('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    arrowRightCircle: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M9 8l4 4-4 4"/>'),
    power: svgIcon('<path d="M12 3v8"/><path d="M6.3 6.3a8 8 0 1011.4 0"/>'),
    menu: svgIcon('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    search: svgIcon('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
    refresh: svgIcon('<path d="M21 12a9 9 0 10-3 6.7"/><path d="M21 8v5h-5"/>'),
    bell: svgIcon('<path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/>'),
    check: svgIcon('<path d="M5 13l4 4L19 7"/>'),
    alertOctagon: svgIcon('<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z"/><path d="M12 8v5"/><circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none"/>'),
    circleDot: svgIcon('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>'),
    globe: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 010 18 13 13 0 010-18"/>'),
    lock: svgIcon('<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7.5a4 4 0 018 0V11"/>'),
    key: svgIcon('<circle cx="8" cy="15" r="3.5"/><path d="M10.8 12.2L19 4M15.5 7.5l2.5 2.5M19 4l1.5 1.5"/>'),
    hourglass: svgIcon('<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>'),
    eye: svgIcon('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
    gear: svgIcon('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    trash: svgIcon('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    pause: svgIcon('<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>'),
    play: svgIcon('<path d="M6 4l14 8-14 8V4z"/>'),
    download: svgIcon('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>'),
    edit: svgIcon('<path d="M15 4l5 5-11 11H4v-5L15 4z"/>'),
    target: svgIcon('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/>'),
    trendingUp: svgIcon('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
    logo: svgIcon('<path d="M12 3l8 4v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4z"/>'),
    info: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>'),
    mail: svgIcon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>'),
    camera: svgIcon('<path d="M4 8h3.3L9 6h6l1.7 2H20a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.2"/>'),
    unlock: svgIcon('<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7.5a4 4 0 017.5-2"/>'),
    zap: svgIcon('<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke-linejoin="round"/>'),
};
function applyStaticIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.getAttribute('data-icon');
        if (ICON[name]) el.innerHTML = ICON[name];
    });
}

// ── STATE ────────────────────────────────────────────────────────────────────
const state = {
    // SECURITY FIX: session lives only in an httpOnly cookie now (see auth.js) —
    // no token is ever stored in localStorage or held here.
    user:          JSON.parse(localStorage.getItem('bcia_user') || '{}'),
    users:         [],
    allLogs:       [],
    filteredUsers: [],
    auditLogs:     [],
    complaints:    [],
    complaintsFiltered: [],
    complaintFilter: 'all',
    complaintPage: 1,
    complaintPageSize: 10,
    currentFilter: 'all',
    currentSort:   { col: 'created_at', dir: 'desc' },
    currentPage:   1,
    pageSize:       15,
    auditPage:     1,
    auditPageSize: 20,
    livePaused:    false,
    liveEvents:    [],
    selectedUsers: new Set(),
    startTime:     Date.now(),
    notifications: [],
    pendingExpiryUser: null,
    pendingSuspendUser: null,
    pendingPwdUser: null,
    threatData:    [],
};

// ── SESSION VALIDATION ────────────────────────────────────────────────────────
let sessionCheckInterval = null;

async function validateSession() {
    try {
        const r = await fetch(`${API_URL}/api/verify`, {
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (!r.ok || d.logout || !d.success) forceLogout(d.error || 'Session expired');
    } catch (e) { /* network hiccup, keep going */ }
}

function forceLogout(reason) {
    clearInterval(sessionCheckInterval);
    localStorage.removeItem('bcia_user');
    // SECURITY FIX: actually clear the httpOnly session cookie server-side,
    // not just local UI state — otherwise the session stays valid on a shared
    // computer even after the app "logs out".
    fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    if (reason && reason.toLowerCase().includes('session terminated')) {
        alert('SESSION TERMINATED BY ADMINISTRATOR\n\nYou have been logged out.');
    }
    window.location.href = '/';
}

function startSessionValidation() {
    validateSession();
    sessionCheckInterval = setInterval(validateSession, 10000);
}

// ── GUARD ─────────────────────────────────────────────────────────────────────
// SECURITY FIX: no client-readable token to check anymore (session lives in an
// httpOnly cookie). This is just a fast UI-level redirect for the common case;
// startSessionValidation() below makes the real, authoritative call to
// /api/verify (which reads the cookie) and force-logs-out if it's not valid.
if (!state.user.is_admin) window.location.href = '/';

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    applyStaticIcons();
    initHeader();
    setupEventListeners();
    setupKeyboardShortcuts();
    startSessionValidation();
    loadUsers();
    loadStats();
    loadAuditLog();
        loadComplaints();
    startLiveFeed();
    startUptimeClock();
    navTo('overview');
});

// ── HEADER ────────────────────────────────────────────────────────────────────
function initHeader() {
    const name = state.user.username || 'ADMIN';
    document.getElementById('headerUsername').textContent = name.toUpperCase();
    document.getElementById('headerAvatar').textContent   = name[0].toUpperCase();
    document.getElementById('currentUsername') && (document.getElementById('currentUsername').textContent = name.toUpperCase());
    setInterval(updateOverviewTime, 1000);
    updateOverviewTime();
}

function updateOverviewTime() {
    const el = document.getElementById('overviewTime');
    if (el) el.textContent = new Date().toLocaleString('en-US', {
        weekday:'short', year:'numeric', month:'short', day:'numeric',
        hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
    });
}

function startUptimeClock() {
    setInterval(() => {
        const s = Math.floor((Date.now() - state.startTime) / 1000);
        const h = String(Math.floor(s / 3600)).padStart(2,'0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2,'0');
        const sec = String(s % 60).padStart(2,'0');
        const val = `${h}:${m}:${sec}`;
        ['sysUptime','sys-uptime2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });
    }, 1000);
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
function setupEventListeners() {
    // Global search
    const gs = document.getElementById('globalSearch');
    if (gs) gs.addEventListener('input', debounce(globalSearchHandler, 220));

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.header-search')) hideSearchDropdown();
        if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) closeNotif();
    });

    // Activity modal backdrop
    const modal = document.getElementById('activityModal');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeActivityModal(); });
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCmd(); }
        if (e.key === 'Escape') { closeCmd(); closeActivityModal(); closeAllModals(); }
        if ((e.metaKey || e.ctrlKey) && e.key === 'r') { e.preventDefault(); refreshAll(); }
    });

    // Command palette navigation
    document.getElementById('cmdInput')?.addEventListener('keydown', e => {
        const items = document.querySelectorAll('.cmd-item');
        const selected = document.querySelector('.cmd-item.selected');
        let idx = Array.from(items).indexOf(selected);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(idx+1,items.length-1)]?.classList.add('selected'); selected?.classList.remove('selected'); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); items[Math.max(idx-1,0)]?.classList.add('selected'); selected?.classList.remove('selected'); }
        if (e.key === 'Enter')     { e.preventDefault(); (selected || items[0])?.click(); }
    });
    document.getElementById('cmdInput')?.addEventListener('input', filterCmdPalette);

    // Bind cmd items
    document.querySelectorAll('.cmd-item[data-action]').forEach(el => {
        el.addEventListener('click', () => handleCmdAction(el.dataset.action));
    });
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function navTo(page) {
    // Alias pages redirect to users with filter
    const aliases = { 'users-pending': 'pending', 'users-suspended': 'suspended', 'users-expired': 'expired' };
    if (aliases[page]) {
        navTo('users');
        setUserFilter(aliases[page]);
        return;
    }

    document.querySelectorAll('.ops-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    closeSidebar();

    // Lazy load page data
    if (page === 'overview')   renderOverviewKPIs();
    if (page === 'audit')      { loadAuditLog(); }
    if (page === 'analytics')  renderAnalytics();
    if (page === 'live')       renderLiveFeed();
    if (page === 'threat')     renderThreats();
    if (page === 'system')     renderSystemHealth();
}

// ── SIDEBAR MOBILE ────────────────────────────────────────────────────────────
function toggleSidebar() {
    document.getElementById('opsSidebar')?.classList.toggle('open');
    document.getElementById('sidebarBackdrop')?.classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('opsSidebar')?.classList.remove('open');
    document.getElementById('sidebarBackdrop')?.classList.remove('active');
}

// ── COMMAND PALETTE ───────────────────────────────────────────────────────────
function openCmd() {
    document.getElementById('cmdOverlay')?.classList.add('active');
    document.getElementById('cmdInput')?.focus();
}
function closeCmd() { document.getElementById('cmdOverlay')?.classList.remove('active'); }

function handleCmdAction(action) {
    closeCmd();
    const [type, val] = action.split(':');
    if (type === 'nav') navTo(val);
    if (action === 'act:refresh')   refreshAll();
    if (action === 'act:export')    exportUsersCSV();
    if (action === 'act:dashboard') window.location.href = '/dashboard.html';
    if (action === 'act:logout')    logout();
}

function filterCmdPalette() {
    const q = document.getElementById('cmdInput')?.value.toLowerCase() || '';
    document.querySelectorAll('.cmd-item').forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function toggleNotif() {
    const panel = document.getElementById('notifPanel');
    panel?.classList.toggle('visible');
}
function closeNotif() { document.getElementById('notifPanel')?.classList.remove('visible'); }

function addNotification(msg, type = 'info') {
    state.notifications.unshift({ msg, type, time: new Date() });
    renderNotifications();
    document.getElementById('notifDot')?.style.setProperty('display', 'block');
}

function renderNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;
    if (!state.notifications.length) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">${ICON.bell}</div><div class="empty-title">No notifications</div></div>`;
        return;
    }
    list.innerHTML = state.notifications.slice(0,20).map(n => `
        <div class="notif-item unread">
            <div class="notif-icon">${n.type === 'success' ? ICON.check : n.type === 'error' ? ICON.alertTriangle : ICON.bell}</div>
            <div class="notif-body">
                <div class="notif-msg">${n.msg}</div>
                <div class="notif-ts">${fmtTime(n.time)}</div>
            </div>
        </div>
    `).join('');
}

function clearNotifs() {
    state.notifications = [];
    renderNotifications();
    document.getElementById('notifDot')?.style.setProperty('display', 'none');
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    const stack = document.getElementById('toastStack');
    if (!stack) { showAlert(msg, type); return; }
    const icons = { success:ICON.check, error:ICON.alertTriangle, warning:ICON.alertTriangle, info:ICON.info };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-icon">${icons[type] || ICON.info}</div><div><div class="toast-msg">${msg}</div></div>`;
    toast.onclick = () => toast.remove();
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
    // Also add to notifications
    addNotification(msg, type);
}

// Legacy compatibility
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        const cls = type === 'error' ? 'admin-alert-error' : 'admin-alert-success';
        alertContainer.innerHTML = `<div class="admin-alert ${cls}">${message}</div>`;
        setTimeout(() => { alertContainer.innerHTML = ''; }, 5000);
    }
    showToast(message, type === 'error' ? 'error' : 'success');
}

// ── DATA LOADING ──────────────────────────────────────────────────────────────
async function loadUsers() {
    try {
        const r = await fetch(`${API_URL}/api/admin/users`, {
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) {
            state.users = d.users;
            state.filteredUsers = [...d.users];
            applyFiltersAndSort();
            renderUsersTable();
            updateFilterCounts();
            updateNavBadges();
            renderOverviewKPIs();
            renderSystemHealth();
            renderThreats();
        } else {
            showToast('Failed to load agents: ' + (d.error || 'Unknown error'), 'error');
        }
    } catch (e) {
        showToast('Connection error: ' + e.message, 'error');
    }
}

async function loadStats() {
    try {
        const r = await fetch(`${API_URL}/api/admin/stats`, {
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) {
            // Legacy stat cards
            ['totalUsers','pendingUsers','approvedUsers','adminUsers'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = String(d.stats[id] || 0).padStart(3,'0');
            });
            const as = document.getElementById('activeSessions');
            if (as) as.textContent = String(d.stats.approvedUsers || 0).padStart(3,'0');
        }
    } catch (e) { /* silent */ }
}

async function loadAuditLog() {
    try {
        const r = await fetch(`${API_URL}/api/admin/activity`, {
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) {
            state.allLogs   = d.logs || [];
            state.auditLogs = [...state.allLogs];
            renderAuditTable();
            renderLiveFeed();
            renderAnalytics();
            renderOverviewChart();
        }
    } catch (e) { /* silent */ }
}

// ── COMPLAINTS (سکالا) ────────────────────────────────────────────
async function loadComplaints() {
    try {
        const r = await fetch(`${API_URL}/api/admin/complaints`, {
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) {
            state.complaints = d.complaints || [];
            applyComplaintFilter();
            renderComplaintsTable();
            updateComplaintBadge();
        }
    } catch (e) {
        console.error('Failed to load complaints:', e);
    }
}

function applyComplaintFilter() {
    const filter = state.complaintFilter;
    if (filter === 'all') {
        state.complaintsFiltered = [...state.complaints];
    } else {
        state.complaintsFiltered = state.complaints.filter(c => c.status === filter);
    }
    state.complaintPage = 1;

    // Update tab counts
    const counts = { all: state.complaints.length };
    ['pending','read','in_progress','resolved'].forEach(s => {
        counts[s] = state.complaints.filter(c => c.status === s).length;
    });
    Object.entries(counts).forEach(([k,v]) => {
        const el = document.getElementById(`complaint-cnt-${k}`);
        if (el) el.textContent = v;
    });
}

function setComplaintFilter(filter) {
    state.complaintFilter = filter;
    document.querySelectorAll('#page-complaints .filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.filter === filter);
    });
    applyComplaintFilter();
    renderComplaintsTable();
}

function renderComplaintsTable() {
    const tbody = document.getElementById('complaintsTableBody');
    if (!tbody) return;

    const list = state.complaintsFiltered;
    const start = (state.complaintPage - 1) * state.complaintPageSize;
    const page = list.slice(start, start + state.complaintPageSize);

    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${ICON.messageAlert}</div><div class="empty-title">No complaints found</div></div></td></tr>`;
        document.getElementById('complaintPagination').innerHTML = '';
        return;
    }

    tbody.innerHTML = page.map(c => {
        const statusColors = {
            pending: 'red', read: 'blue', in_progress: 'amber', resolved: 'green'
        };
        const statusLabels = {
            pending: 'PENDING', read: 'READ', in_progress: 'IN PROGRESS', resolved: 'RESOLVED'
        };
        const color = statusColors[c.status] || 'gray';
        const label = statusLabels[c.status] || c.status;

        return `
            <tr>
                <td class="cell-id">#${c.id}</td>
                <td><div class="cell-name">${c.complainant_name || '?'}</div></td>
                <td><div class="cell-name" style="color:var(--red);">${c.accused_name || '?'}</div></td>
                <td class="cell-mono" style="font-size:0.72rem;">${c.contact_info || '—'}</td>
                <td><span class="badge badge-${color}">${label}</span></td>
                <td class="cell-dim">${fmtDate(c.created_at)}</td>
                <td>
                    <div class="action-group">
                        <button class="btn btn-info btn-sm" onclick="viewComplaint(${c.id})">${ICON.eye} View</button>
                        <button class="btn btn-primary btn-sm" onclick="updateComplaintStatus(${c.id},'in_progress')">${ICON.gear} Work</button>
                        <button class="btn btn-success btn-sm" onclick="updateComplaintStatus(${c.id},'resolved')">${ICON.check} Resolve</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteComplaint(${c.id})">${ICON.trash} Delete</button>
                    </div>
                </td>
            </tr>`;
    }).join('');

    // Pagination
    const el = document.getElementById('complaintPagination');
    if (el) {
        const totalPages = Math.ceil(list.length / state.complaintPageSize);
        if (totalPages <= 1) { el.innerHTML = ''; return; }
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === state.complaintPage ? 'active' : ''}" onclick="state.complaintPage=${i}; renderComplaintsTable();">${i}</button>`;
        }
        el.innerHTML = html;
    }
}

function updateComplaintBadge() {
    const pending = state.complaints.filter(c => c.status === 'pending').length;
    const badge = document.getElementById('complaintBadge');
    if (badge) {
        badge.textContent = pending;
        badge.className = 'nav-badge ' + (pending > 0 ? 'amber' : 'green');
    }
}

async function viewComplaint(id) {
    try {
        // Show loading state immediately
        document.getElementById('complaintDetailId').textContent = id;
        document.getElementById('complaintDetailBody').innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;padding:40px;">
                <div style="font-family:var(--font-mono);color:var(--text-3);font-size:0.82rem;">LOADING COMPLAINT...</div>
            </div>`;
        document.getElementById('complaintDetailModal').classList.add('active');

        const r = await fetch(`${API_URL}/api/admin/complaints/${id}`, {
            credentials: 'same-origin'
        });
        const d = await r.json();

        if (!r.ok || !d.success) {
            document.getElementById('complaintDetailBody').innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;padding:40px;color:var(--red);font-family:var(--font-mono);">
                    Failed to load complaint
                </div>`;
            return;
        }

        const c = d.complaint;
        document.getElementById('complaintDetailId').textContent = c.id;

        const statusLabels = {
            pending: 'PENDING', read: 'READ', in_progress: 'IN PROGRESS', resolved: 'RESOLVED'
        };
        const statusColors = {
            pending: 'red', read: 'blue', in_progress: 'amber', resolved: 'green'
        };

        // ── PROOF IMAGES HANDLING ──────────────────────────────────────
        let proofHtml = '';
        if (c.proof_image && c.proof_image.length > 10) {
            const raw = c.proof_image;
            let images = [];
            
            // Try JSON array first (multiple images)
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    images = parsed;
                } else if (typeof parsed === 'string' && parsed.length > 10) {
                    images = [parsed];
                }
            } catch (e) {
                // Not JSON — treat as single base64 string
                if (raw.length > 10) {
                    images = [raw];
                }
            }
            
            if (images.length > 0) {
                proofHtml = `<div class="info-item" style="grid-column:1/-1;">
                    <div class="info-label">PROOF IMAGE${images.length > 1 ? 'S (' + images.length + ')' : ''}</div>
                    <div style="margin-top:10px;">`;
                
                if (images.length > 1) {
                    // Grid layout for multiple images
                    proofHtml += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">`;
                    for (let idx = 0; idx < images.length; idx++) {
                        const img = images[idx];
                        const isDataUrl = img.startsWith('data:');
                        const src = isDataUrl ? img : 'data:image/jpeg;base64,' + img;
                        proofHtml += `<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.3);">
                            <div style="aspect-ratio:1;overflow:hidden;">
                                <img src="${src}" style="width:100%;height:100%;object-fit:cover;" alt="Proof ${idx+1}" loading="lazy"/>
                            </div>
                            <div style="padding:6px 10px;font-family:var(--font-mono);font-size:0.65rem;color:var(--text-3);border-top:1px solid var(--border);text-align:center;">
                                Image ${idx+1}
                            </div>
                        </div>`;
                    }
                    proofHtml += `</div>`;
                } else {
                    // Single image display
                    const img = images[0];
                    const isDataUrl = img.startsWith('data:');
                    const src = isDataUrl ? img : 'data:image/jpeg;base64,' + img;
                    proofHtml += `<div style="max-width:400px;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.3);">
                        <img src="${src}" style="width:100%;max-height:350px;object-fit:contain;" alt="Proof" loading="lazy"/>
                    </div>`;
                }
                
                proofHtml += `</div></div>`;
            }
        }

        const statusColor = statusColors[c.status] || 'gray';

        document.getElementById('complaintDetailBody').innerHTML = `
            <div class="info-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
                <div class="info-item">
                    <div class="info-label">COMPLAINANT</div>
                    <div class="info-value" style="font-size:0.9rem;">${escapeHtml(c.complainant_name)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">AGAINST</div>
                    <div class="info-value" style="color:var(--red);font-size:0.9rem;">${escapeHtml(c.accused_name)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">CONTACT</div>
                    <div class="info-value" style="font-size:0.8rem;">${escapeHtml(c.contact_info)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">STATUS</div>
                    <div class="info-value"><span class="badge badge-${statusColor}">${statusLabels[c.status] || c.status}</span></div>
                </div>
                <div class="info-item">
                    <div class="info-label">SUBMITTED</div>
                    <div class="info-value" style="font-size:0.78rem;">${fmtDate(c.created_at)}</div>
                </div>
                ${c.reviewed_at ? `
                <div class="info-item">
                    <div class="info-label">LAST REVIEWED</div>
                    <div class="info-value" style="font-size:0.78rem;">${fmtDate(c.reviewed_at)}</div>
                </div>` : ''}
                <div class="info-item" style="grid-column:1/-1;">
                    <div class="info-label">HOW THEY KNEW</div>
                    <div class="info-value" style="line-height:1.7;background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;border:1px solid var(--border);margin-top:4px;">${escapeHtml(c.knowledge_source)}</div>
                </div>
                ${c.additional_info ? `
                <div class="info-item" style="grid-column:1/-1;">
                    <div class="info-label">ADDITIONAL INFO</div>
                    <div class="info-value" style="line-height:1.7;background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;border:1px solid var(--border);margin-top:4px;">${escapeHtml(c.additional_info)}</div>
                </div>` : ''}
                ${proofHtml}
            </div>

            <!-- Admin Notes Section -->
            <div style="margin-top:20px;padding:16px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--green);font-weight:700;letter-spacing:1px;">ADMIN NOTES</div>
                    <button class="btn btn-ghost btn-sm" onclick="toggleNoteEditor()" id="noteToggleBtn">${ICON.edit} Edit</button>
                </div>
                <div id="noteDisplay" style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-2);line-height:1.6;white-space:pre-wrap;${c.admin_notes ? '' : 'color:var(--text-3);font-style:italic;'}">
                    ${c.admin_notes ? escapeHtml(c.admin_notes) : 'No notes yet. Click "Edit" to add notes.'}
                </div>
                <div id="noteEditor" style="display:none;margin-top:10px;">
                    <textarea id="adminNoteInput" style="width:100%;min-height:80px;padding:10px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-1);font-family:var(--font-mono);font-size:0.78rem;outline:none;resize:vertical;" placeholder="Enter admin notes...">${c.admin_notes ? escapeHtml(c.admin_notes) : ''}</textarea>
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <button class="btn btn-primary btn-sm" onclick="saveComplaintNote(${c.id})">Save Note</button>
                        <button class="btn btn-ghost btn-sm" onclick="toggleNoteEditor()">Cancel</button>
                    </div>
                </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border);">
                <button class="btn btn-primary" onclick="updateComplaintStatus(${c.id},'in_progress')">${ICON.gear} In Progress</button>
                <button class="btn btn-success" onclick="updateComplaintStatus(${c.id},'resolved')">${ICON.check} Resolved</button>
                <button class="btn btn-info" onclick="updateComplaintStatus(${c.id},'read')">${ICON.eye} Mark Read</button>
                <button class="btn btn-ghost" onclick="updateComplaintStatus(${c.id},'pending')">Reopen</button>
                <button class="btn btn-danger" onclick="deleteComplaint(${c.id})">${ICON.trash} Delete</button>
                <button class="btn btn-ghost" onclick="document.getElementById('complaintDetailModal').classList.remove('active')" style="margin-left:auto;">Close</button>
            </div>
        `;
    } catch (e) {
        document.getElementById('complaintDetailBody').innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;padding:40px;color:var(--red);font-family:var(--font-mono);">
                Connection error: ${escapeHtml(e.message)}
            </div>`;
    }
}

async function updateComplaintStatus(id, status) {
    try {
        const r = await fetch(`${API_URL}/api/admin/complaints/${id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const d = await r.json();
        if (r.ok && d.success) {
            showToast(`Complaint #${id} updated to ${status}`, 'success');
            document.getElementById('complaintDetailModal').classList.remove('active');
            await loadComplaints();
        } else {
            showToast(d.error || 'Update failed', 'error');
        }
    } catch (e) {
        showToast('Connection error', 'error');
    }
}

async function deleteComplaint(id) {
    if (!confirm(`Delete complaint #${id}? This cannot be undone.`)) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/complaints/${id}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) {
            showToast(`Complaint #${id} deleted`, 'success');
            document.getElementById('complaintDetailModal').classList.remove('active');
            await loadComplaints();
        } else {
            showToast(d.error || 'Delete failed', 'error');
        }
    } catch (e) {
        showToast('Connection error', 'error');
    }
}

async function refreshAll() {
    const btn = document.getElementById('refreshBtn');
    if (btn) { btn.style.transform = 'rotate(360deg)'; setTimeout(() => btn.style.transform = '', 600); }
    await Promise.all([loadUsers(), loadStats(), loadAuditLog(), loadComplaints()]);
    showToast('Data synchronized', 'success');
}

// ── OVERVIEW PAGE ─────────────────────────────────────────────────────────────
function renderOverviewKPIs() {
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;

    const total     = state.users.length;
    const active    = state.users.filter(u => u.is_approved && !isSuspended(u) && !isExpired(u)).length;
    const pending   = state.users.filter(u => !u.is_approved && !isSuspended(u)).length;
    const suspended = state.users.filter(u => isSuspended(u)).length;
    const expired   = state.users.filter(u => isExpired(u)).length;
    const admins    = state.users.filter(u => u.is_admin).length;
    const locked    = state.users.filter(u => isLocked(u)).length;

    // Today's new users
    const today = new Date(); today.setHours(0,0,0,0);
    const newToday = state.users.filter(u => new Date(u.created_at) >= today).length;

    const kpis = [
        { label:'TOTAL AGENTS',  value:total,     icon:ICON.user,    color:'green',  bar: 100, trend:'+'+newToday+' today', trendDir:'up' },
        { label:'ACTIVE',        value:active,    icon:ICON.check,   color:'green',  bar: total ? Math.round(active/total*100) : 0 },
        { label:'PENDING',       value:pending,   icon:ICON.clock,   color:'amber',  bar: total ? Math.round(pending/total*100) : 0 },
        { label:'SUSPENDED',     value:suspended, icon:ICON.ban,     color:'red',    bar: total ? Math.round(suspended/total*100) : 0 },
        { label:'EXPIRED',       value:expired,   icon:ICON.archive, color:'red',    bar: total ? Math.round(expired/total*100) : 0 },
        { label:'LOCKED',        value:locked,    icon:ICON.lock,    color:'amber',  bar: total ? Math.round(locked/total*100) : 0 },
    ];

    grid.innerHTML = kpis.map(k => `
        <div class="kpi-card ${k.color || ''}">
            <div class="kpi-top">
                <div class="kpi-icon ${k.color || 'green'}">${k.icon}</div>
                ${k.trend ? `<span class="kpi-trend ${k.trendDir || 'flat'}">${k.trend}</span>` : ''}
            </div>
            <div class="kpi-value ${k.color || ''}">${k.value}</div>
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-bar"><div class="kpi-bar-fill ${k.color || 'green'}" style="width:${k.bar}%"></div></div>
        </div>
    `).join('');

    // System status
    const sysAct = document.getElementById('sysActiveSessions');
    if (sysAct) sysAct.textContent = active;
    const sysDb = document.getElementById('sysDbStatus');
    if (sysDb) sysDb.textContent = 'CONNECTED';
}

function renderOverviewChart() {
    const chart = document.getElementById('overviewChart');
    const labels = document.getElementById('overviewChartLabels');
    if (!chart) return;

    const days = 7;
    const counts = [];
    const lbls = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        const count = state.allLogs.filter(l => {
            const t = new Date(l.timestamp);
            return t >= d && t < next;
        }).length;
        counts.push(count);
        lbls.push(d.toLocaleDateString('en-US',{weekday:'short'}));
    }
    const max = Math.max(...counts, 1);
    chart.innerHTML = counts.map((c,i) => `
        <div class="chart-bar" style="height:${Math.round(c/max*100)}%">
            <div class="bar-tip">${c} events</div>
        </div>
    `).join('');
    if (labels) labels.innerHTML = lbls.map(l => `<div class="chart-label">${l}</div>`).join('');
}

// ── LIVE FEED ─────────────────────────────────────────────────────────────────
let liveInterval = null;
let lastLogId = 0;

function startLiveFeed() {
    if (liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(async () => {
        if (state.livePaused) return;
        await loadAuditLog();
        checkForNewEvents();
    }, 8000);
}

function checkForNewEvents() {
    if (!state.allLogs.length) return;
    const newest = state.allLogs[0];
    if (newest && newest.id !== lastLogId) {
        if (lastLogId !== 0) {
            const newOnes = state.allLogs.filter(l => l.id > lastLogId);
            newOnes.forEach(l => pushLiveEvent(l));
        }
        lastLogId = newest.id;
    }
}

function pushLiveEvent(log) {
    state.liveEvents.unshift(log);
    if (state.liveEvents.length > 100) state.liveEvents.pop();
    renderLiveFeed();

    // Notifications for critical events
    if (log.action_type.includes('SUSPICIOUS') || log.action_type.includes('LOCKED') || log.action_type.includes('FAILED')) {
        addNotification(`${log.username}: ${log.action_type.replace(/_/g,' ')}`, 'error');
        document.getElementById('notifDot')?.removeAttribute('style');
    }
}

function renderLiveFeed() {
    const logs = state.liveEvents.length ? state.liveEvents : state.allLogs.slice(0, 30);
    const liveCount = document.getElementById('liveCount');
    if (liveCount) liveCount.textContent = `${logs.length} events`;

    // Update badge
    const badge = document.getElementById('liveBadge');
    if (badge) badge.textContent = 'LIVE';

    ['liveFeedMain','liveFeedSmall'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!logs.length) {
            el.innerHTML = `<div class="empty-state" style="padding:30px 20px;"><div class="empty-icon">${ICON.broadcast}</div><div class="empty-title">Awaiting activity…</div></div>`;
            return;
        }
        el.innerHTML = logs.map(log => {
            const { icon, color } = getActionMeta(log.action_type);
            return `
            <div class="feed-item">
                <div class="feed-avatar ${color}">${(log.username||'?')[0].toUpperCase()}</div>
                <div class="feed-body">
                    <div class="feed-action"><span>${log.username?.toUpperCase() || 'UNKNOWN'}</span> — ${log.action_type.replace(/_/g,' ')}</div>
                    <div class="feed-meta">
                        <span>${log.ip_address || 'N/A'}</span>
                        <span>${log.browser || '—'}</span>
                        <span>${log.os || '—'}</span>
                        ${log.action_details ? `<span>${log.action_details.substring(0,60)}${log.action_details.length > 60 ? '…' : ''}</span>` : ''}
                    </div>
                </div>
                <div class="feed-time">${fmtTime(new Date(log.timestamp))}</div>
            </div>`;
        }).join('');
    });
}

function toggleLivePause() {
    state.livePaused = !state.livePaused;
    const btn = document.getElementById('pauseLiveBtn');
    if (btn) btn.innerHTML = state.livePaused ? `${ICON.play} Resume` : `${ICON.pause} Pause`;
}

function clearLiveFeed() {
    state.liveEvents = [];
    renderLiveFeed();
}

function getActionMeta(type) {
    if (!type) return { icon:ICON.circleDot, color:'green' };
    if (type.includes('LOGIN'))      return { icon:ICON.key,           color:'green' };
    if (type.includes('LOGOUT'))     return { icon:ICON.power,         color:'blue' };
    if (type.includes('SEARCH'))     return { icon:ICON.search,        color:'blue' };
    if (type.includes('FAILED'))     return { icon:ICON.alertTriangle, color:'red' };
    if (type.includes('LOCKED'))     return { icon:ICON.lock,          color:'amber' };
    if (type.includes('SUSPEND'))    return { icon:ICON.ban,           color:'red' };
    if (type.includes('APPROVE'))    return { icon:ICON.check,         color:'green' };
    if (type.includes('DELETE'))     return { icon:ICON.trash,         color:'red' };
    if (type.includes('REGISTER'))   return { icon:ICON.edit,          color:'amber' };
    if (type.includes('SUSPICIOUS')) return { icon:ICON.alertOctagon,  color:'red' };
    if (type.includes('EXPIRE'))     return { icon:ICON.hourglass,     color:'amber' };
    return { icon:ICON.circleDot, color:'green' };
}

// ── USER MANAGEMENT ───────────────────────────────────────────────────────────
function isLocked(u)    { return u.account_locked_until && new Date(u.account_locked_until) > new Date(); }
function isSuspended(u) { return !!u.suspension_data; }
function isExpired(u)   { return u.account_expires_at && new Date(u.account_expires_at) < new Date(); }

function setUserFilter(f) {
    state.currentFilter = f;
    state.currentPage   = 1;
    state.selectedUsers.clear();
    document.getElementById('bulkBar') && (document.getElementById('bulkBar').style.display = 'none');
    document.getElementById('selectAllCb') && (document.getElementById('selectAllCb').checked = false);

    // Tab highlight
    document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.filter === f);
    });

    applyFiltersAndSort();
    renderUsersTable();
}

function applyFiltersAndSort() {
    const q = (document.getElementById('userSearchInput')?.value || '').toLowerCase();
    const f = state.currentFilter;

    let list = state.users.filter(u => {
        const matchSearch = !q || (
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.last_ip?.toLowerCase().includes(q) ||
            String(u.id).includes(q)
        );
        let matchFilter = true;
        if (f === 'active')    matchFilter = u.is_approved && !isSuspended(u) && !isExpired(u);
        if (f === 'pending')   matchFilter = !u.is_approved && !isSuspended(u);
        if (f === 'suspended') matchFilter = isSuspended(u);
        if (f === 'expired')   matchFilter = isExpired(u);
        if (f === 'locked')    matchFilter = isLocked(u);
        return matchSearch && matchFilter;
    });

    // Sort
    const { col, dir } = state.currentSort;
    list.sort((a, b) => {
        let va = a[col], vb = b[col];
        if (col === 'status') { va = getStatusOrder(a); vb = getStatusOrder(b); }
        if (col === 'expiry') { va = a.account_expires_at || ''; vb = b.account_expires_at || ''; }
        if (va === undefined || va === null) va = '';
        if (vb === undefined || vb === null) vb = '';
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return dir === 'asc' ? cmp : -cmp;
    });

    state.filteredUsers = list;
}

function getStatusOrder(u) {
    if (u.is_admin)    return 0;
    if (isExpired(u))  return 2;
    if (isLocked(u))   return 3;
    if (isSuspended(u))return 4;
    if (u.is_approved) return 1;
    return 5;
}

function filterUsers() {
    state.currentPage = 1;
    applyFiltersAndSort();
    renderUsersTable();
}

function sortUsers() {
    const val = document.getElementById('userSortSelect')?.value;
    const map = {
        'created-desc': { col:'created_at', dir:'desc' },
        'created-asc':  { col:'created_at', dir:'asc'  },
        'last-login':   { col:'last_login',  dir:'desc' },
        'username':     { col:'username',    dir:'asc'  },
        'expires':      { col:'account_expires_at', dir:'asc' },
    };
    state.currentSort = map[val] || { col:'created_at', dir:'desc' };
    applyFiltersAndSort();
    renderUsersTable();
}

function clickSort(col) {
    if (state.currentSort.col === col) {
        state.currentSort.dir = state.currentSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        state.currentSort = { col, dir: 'desc' };
    }
    // Update header classes
    document.querySelectorAll('.ops-table th').forEach(th => {
        th.classList.remove('sort-asc','sort-desc');
        if (th.dataset.col === col) th.classList.add(state.currentSort.dir === 'asc' ? 'sort-asc' : 'sort-desc');
    });
    applyFiltersAndSort();
    renderUsersTable();
}

function updateFilterCounts() {
    const cnt = {
        all:       state.users.length,
        active:    state.users.filter(u => u.is_approved && !isSuspended(u) && !isExpired(u)).length,
        pending:   state.users.filter(u => !u.is_approved && !isSuspended(u)).length,
        suspended: state.users.filter(u => isSuspended(u)).length,
        expired:   state.users.filter(u => isExpired(u)).length,
        locked:    state.users.filter(u => isLocked(u)).length,
    };
    Object.entries(cnt).forEach(([k,v]) => {
        const el = document.getElementById(`cnt-${k}`);
        if (el) el.textContent = v;
    });
}

function updateNavBadges() {
    const total = state.users.length;
    const pending = state.users.filter(u => !u.is_approved && !isSuspended(u)).length;
    document.getElementById('navTotalBadge') && (document.getElementById('navTotalBadge').textContent = total);
    document.getElementById('navPendingBadge') && (document.getElementById('navPendingBadge').textContent = pending);
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const list = state.filteredUsers;
    const start = (state.currentPage - 1) * state.pageSize;
    const page  = list.slice(start, start + state.pageSize);

    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">${ICON.user}</div><div class="empty-title">No agents found</div><div class="empty-sub">Try adjusting your filters</div></div></td></tr>`;
        document.getElementById('userPagination').innerHTML = '';
        return;
    }

    tbody.innerHTML = page.map(u => buildUserRow(u)).join('');
    renderPagination('user', list.length, state.currentPage, state.pageSize, p => { state.currentPage = p; renderUsersTable(); });
}

function buildUserRow(user) {
    const locked    = isLocked(user);
    const suspended = isSuspended(user);
    const expired   = isExpired(user);
    const lockTime  = locked ? new Date(user.account_locked_until) : null;
    const suspData  = user.suspension_data ? tryParse(user.suspension_data) : null;

    // Status badge
    let badge = '';
    if (user.is_admin)        badge = `<span class="badge badge-purple">${ICON.zap} ADMIN</span>`;
    else if (expired)         badge = `<span class="badge badge-red">${ICON.archive} EXPIRED</span>`;
    else if (locked)          badge = `<span class="badge badge-amber">${ICON.lock} LOCKED</span>`;
    else if (suspended)       badge = `<span class="badge badge-red">${ICON.ban} SUSPENDED</span>`;
    else if (user.is_approved) badge = `<span class="badge badge-green"><span class="badge-dot"></span>ACTIVE</span>`;
    else                       badge = `<span class="badge badge-gray">${ICON.clock} PENDING</span>`;

    if (!user.is_admin && user.skip_face_verification) {
        badge += ` <span class="badge badge-blue" title="Face/phone verification skipped at login">${ICON.camera} SKIP</span>`;
    }

    // Expiry cell
    const actStr = user.activated_at ? `<span style="color:var(--green);font-size:0.7rem;">${ICON.check} ${fmtDate(user.activated_at)}</span>` : `<span style="color:var(--text-3);font-size:0.7rem;">N/A</span>`;
    const expStr = user.account_expires_at ? `<br><span style="color:${expired?'var(--red)':'var(--amber)'};font-size:0.7rem;">${ICON.hourglass} ${fmtDate(user.account_expires_at)}</span>` : '';

    // Actions
    let actions = '';
    const q = s => s.replace(/'/g,"\\'").replace(/"/g,'\\"');
    const faceSkipBtn = user.skip_face_verification
        ? `<button class="btn btn-info btn-sm" onclick="toggleFaceSkip(${user.id},'${q(user.username)}',false)">${ICON.camera} Require Face</button>`
        : `<button class="btn btn-primary btn-sm" onclick="toggleFaceSkip(${user.id},'${q(user.username)}',true)">${ICON.ban} Skip Face/Phone</button>`;
    if (!user.is_admin) {
        if (expired) {
            actions = `
                <div class="action-group">
                    <button class="btn btn-warning btn-sm" onclick="openExpiryModal(${user.id},'${q(user.username)}')">${ICON.hourglass} Renew</button>
                    <button class="btn btn-info btn-sm" onclick="viewActivity(${user.id},'${q(user.username)}')">${ICON.clipboardList} Log</button>
                    ${faceSkipBtn}
                    <button class="btn btn-danger btn-sm" onclick="removeUser(${user.id})">${ICON.trash} Delete</button>
                </div>`;
        } else if (locked) {
            const mins = Math.ceil((lockTime - new Date()) / 60000);
            actions = `
                <div class="action-group">
                    <button class="btn btn-primary btn-sm" onclick="unlockAccount(${user.id},'${q(user.username)}')">${ICON.unlock} Unlock</button>
                    <button class="btn btn-info btn-sm" onclick="openPwdModal(${user.id},'${q(user.username)}')">${ICON.key} Pwd</button>
                    <button class="btn btn-warning btn-sm" onclick="openExpiryModal(${user.id},'${q(user.username)}')">${ICON.hourglass} Expiry</button>
                    <button class="btn btn-info btn-sm" onclick="viewActivity(${user.id},'${q(user.username)}')">${ICON.clipboardList} Log</button>
                    <button class="btn btn-danger btn-sm" onclick="forceLogoutUser(${user.id},'${q(user.username)}')">${ICON.power} Logout</button>
                    ${faceSkipBtn}
                </div>`;
        } else if (suspended) {
            actions = `
                <div class="suspended-info" style="margin-bottom:6px;">
                    <div class="suspended-info-title">${ICON.ban} SUSPENDED</div>
                    <div class="suspended-info-detail">By: ${suspData?.suspended_by||'Unknown'}</div>
                    <div class="suspended-info-detail">${(suspData?.reason||'').substring(0,40)}</div>
                </div>
                <div class="action-group">
                    <button class="btn btn-primary btn-sm" onclick="suspendUser(${user.id},'${q(user.username)}',true)">${ICON.check} Unsuspend</button>
                    <button class="btn btn-info btn-sm" onclick="openPwdModal(${user.id},'${q(user.username)}')">${ICON.key} Pwd</button>
                    <button class="btn btn-warning btn-sm" onclick="openExpiryModal(${user.id},'${q(user.username)}')">${ICON.hourglass} Expiry</button>
                    <button class="btn btn-info btn-sm" onclick="viewActivity(${user.id},'${q(user.username)}')">${ICON.clipboardList} Log</button>
                    <button class="btn btn-danger btn-sm" onclick="forceLogoutUser(${user.id},'${q(user.username)}')">${ICON.power} Logout</button>
                    ${faceSkipBtn}
                    <button class="btn btn-danger btn-sm" onclick="removeUser(${user.id})">${ICON.trash} Delete</button>
                </div>`;
        } else if (user.is_approved) {
            actions = `
                <div class="action-group">
                    <button class="btn btn-info btn-sm" onclick="openPwdModal(${user.id},'${q(user.username)}')">${ICON.key} Pwd</button>
                    <button class="btn btn-warning btn-sm" onclick="openSuspendModal(${user.id},'${q(user.username)}')">${ICON.ban} Suspend</button>
                    <button class="btn btn-warning btn-sm" onclick="openExpiryModal(${user.id},'${q(user.username)}')">${ICON.hourglass} Expiry</button>
                    <button class="btn btn-danger btn-sm" onclick="expireAccount(${user.id},'${q(user.username)}')">${ICON.ban} Expire Now</button>
                    <button class="btn btn-info btn-sm" onclick="viewActivity(${user.id},'${q(user.username)}')">${ICON.clipboardList} Log</button>
                    <button class="btn btn-danger btn-sm" onclick="forceLogoutUser(${user.id},'${q(user.username)}')">${ICON.power} Logout</button>
                    ${faceSkipBtn}
                    <button class="btn btn-danger btn-sm" onclick="removeUser(${user.id})">${ICON.trash} Revoke</button>
                </div>`;
        } else {
            actions = `
                <div class="action-group">
                    <button class="btn btn-primary btn-sm" onclick="approveUser(${user.id})">${ICON.check} Approve</button>
                    <button class="btn btn-warning btn-sm" onclick="openExpiryModal(${user.id},'${q(user.username)}')">${ICON.hourglass} Expiry</button>
                    <button class="btn btn-danger btn-sm" onclick="forceLogoutUser(${user.id},'${q(user.username)}')">${ICON.power} Logout</button>
                    ${faceSkipBtn}
                    <button class="btn btn-danger btn-sm" onclick="removeUser(${user.id})">${ICON.trash} Deny</button>
                </div>`;
        }
    } else {
        actions = `<span style="color:var(--text-3);font-size:0.72rem;font-family:var(--font-mono);">PROTECTED</span>`;
    }

    const checked = state.selectedUsers.has(user.id) ? 'checked' : '';
    return `
        <tr class="${state.selectedUsers.has(user.id) ? 'selected' : ''}">
            <td><input type="checkbox" ${checked} ${user.is_admin ? 'disabled' : ''} onchange="toggleSelectUser(${user.id},this)" style="accent-color:var(--green);cursor:pointer;"/></td>
            <td class="cell-id">${String(user.id).padStart(4,'0')}</td>
            <td>
                <div class="cell-user">
                    <div class="cell-avatar">${(user.username||'?')[0].toUpperCase()}</div>
                    <div>
                        <div class="cell-name">${user.username?.toUpperCase()}</div>
                        <div class="cell-email">${user.email || '—'}</div>
                    </div>
                </div>
            </td>
            <td class="cell-mono" style="font-size:0.78rem;">${user.last_ip || 'N/A'}</td>
            <td>${badge}</td>
            <td style="font-size:0.72rem;">${actStr}${expStr}</td>
            <td class="cell-dim">${fmtDate(user.created_at)}</td>
            <td class="cell-dim">${user.last_login ? fmtDate(user.last_login) : 'NEVER'}</td>
            <td style="min-width:280px;">${actions}</td>
        </tr>`;
}

// ── SELECTION / BULK ──────────────────────────────────────────────────────────
function toggleSelectUser(id, cb) {
    if (cb.checked) state.selectedUsers.add(id);
    else            state.selectedUsers.delete(id);
    updateBulkBar();
}

function toggleSelectAll(cb) {
    const visible = state.filteredUsers.slice((state.currentPage-1)*state.pageSize, state.currentPage*state.pageSize);
    visible.filter(u => !u.is_admin).forEach(u => {
        if (cb.checked) state.selectedUsers.add(u.id);
        else            state.selectedUsers.delete(u.id);
    });
    renderUsersTable();
    updateBulkBar();
}

function selectAllVisible() {
    const cb = document.getElementById('selectAllCb');
    if (cb) { cb.checked = true; toggleSelectAll(cb); }
}

function clearSelection() {
    state.selectedUsers.clear();
    document.getElementById('selectAllCb') && (document.getElementById('selectAllCb').checked = false);
    renderUsersTable();
    updateBulkBar();
}

function updateBulkBar() {
    const bar = document.getElementById('bulkBar');
    const cnt = document.getElementById('bulkCount');
    if (!bar) return;
    if (state.selectedUsers.size > 0) {
        bar.style.display = 'flex';
        if (cnt) cnt.textContent = `${state.selectedUsers.size} selected`;
    } else {
        bar.style.display = 'none';
    }
}

async function bulkApprove() {
    if (!state.selectedUsers.size) return;
    if (!confirm(`Approve ${state.selectedUsers.size} selected agents?`)) return;
    const ids = [...state.selectedUsers];
    await Promise.all(ids.map(id => fetch(`${API_URL}/api/admin/approve/${id}`, {
        method:'POST', credentials: 'same-origin'
    })));
    showToast(`Approved ${ids.length} agents`, 'success');
    clearSelection();
    await loadUsers();
}

async function bulkDelete() {
    if (!state.selectedUsers.size) return;
    if (!confirm(`Delete ${state.selectedUsers.size} selected agents? This cannot be undone.`)) return;
    const ids = [...state.selectedUsers];
    await Promise.all(ids.map(id => fetch(`${API_URL}/api/admin/users/${id}`, {
        method:'DELETE', credentials: 'same-origin'
    })));
    showToast(`Deleted ${ids.length} agents`, 'success');
    clearSelection();
    await loadUsers();
}

// ── PAGINATION ────────────────────────────────────────────────────────────────
function renderPagination(prefix, total, current, pageSize, onPage) {
    const el = document.getElementById(`${prefix}Pagination`);
    if (!el) return;
    const pages = Math.ceil(total / pageSize);
    if (pages <= 1) { el.innerHTML = ''; return; }

    const start = Math.max(1, current - 2);
    const end   = Math.min(pages, current + 2);
    let html = `<button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="${prefix}GoPage(${current-1})">‹</button>`;
    if (start > 1) html += `<button class="page-btn" onclick="${prefix}GoPage(1)">1</button>${start > 2 ? '<span style="color:var(--text-3);padding:0 4px;">…</span>' : ''}`;
    for (let i = start; i <= end; i++) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="${prefix}GoPage(${i})">${i}</button>`;
    }
    if (end < pages) html += `${end < pages - 1 ? '<span style="color:var(--text-3);padding:0 4px;">…</span>' : ''}<button class="page-btn" onclick="${prefix}GoPage(${pages})">${pages}</button>`;
    html += `<button class="page-btn" ${current === pages ? 'disabled' : ''} onclick="${prefix}GoPage(${current+1})">›</button>`;
    html += `<span class="page-info">${((current-1)*pageSize)+1}–${Math.min(current*pageSize,total)} of ${total}</span>`;
    el.innerHTML = html;
}

window.userGoPage  = p => { state.currentPage = p; renderUsersTable(); };
window.auditGoPage = p => { state.auditPage   = p; renderAuditTable(); };

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
function renderAuditTable() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    const search = (document.getElementById('auditSearch')?.value || '').toLowerCase();
    const type   = document.getElementById('auditTypeFilter')?.value || '';
    const date   = document.getElementById('auditDateFilter')?.value || '';

    let logs = state.allLogs.filter(l => {
        const matchSearch = !search || (
            l.username?.toLowerCase().includes(search) ||
            l.action_type?.toLowerCase().includes(search) ||
            l.ip_address?.toLowerCase().includes(search) ||
            l.action_details?.toLowerCase().includes(search)
        );
        const matchType = !type || l.action_type?.includes(type);
        let matchDate = true;
        if (date) {
            const t = new Date(l.timestamp);
            const now = new Date();
            if (date === 'today') { const d = new Date(); d.setHours(0,0,0,0); matchDate = t >= d; }
            if (date === '7days') { const d = new Date(now - 7*864e5); matchDate = t >= d; }
            if (date === '30days'){ const d = new Date(now - 30*864e5); matchDate = t >= d; }
        }
        return matchSearch && matchType && matchDate;
    });

    state.auditLogs = logs;

    const start = (state.auditPage - 1) * state.auditPageSize;
    const page  = logs.slice(start, start + state.auditPageSize);

    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${ICON.clipboardList}</div><div class="empty-title">No audit records found</div></div></td></tr>`;
        document.getElementById('auditPagination').innerHTML = '';
        return;
    }

    tbody.innerHTML = page.map(log => {
        const { icon, color } = getActionMeta(log.action_type);
        const tagColor = log.action_type?.includes('FAIL')||log.action_type?.includes('SUSP')||log.action_type?.includes('DELETE') ? 'var(--red)' :
                         log.action_type?.includes('APPROVE')||log.action_type?.includes('LOGIN') ? 'var(--green)' : 'var(--amber)';
        return `
            <tr>
                <td class="cell-dim" style="white-space:nowrap;">${fmtDateFull(log.timestamp)}</td>
                <td>
                    <div class="cell-user">
                        <div class="cell-avatar" style="width:26px;height:26px;font-size:0.65rem;">${(log.username||'?')[0].toUpperCase()}</div>
                        <div class="cell-name" style="font-size:0.78rem;">${log.username?.toUpperCase() || 'UNKNOWN'}</div>
                    </div>
                </td>
                <td><span class="audit-action-tag" style="background:${tagColor}22;color:${tagColor};border:1px solid ${tagColor}44;">${icon} ${log.action_type?.replace(/_/g,' ')}</span></td>
                <td style="font-size:0.72rem;max-width:300px;color:var(--text-2);">${(log.action_details||'—').substring(0,80)}${log.action_details?.length>80?'…':''}</td>
                <td class="cell-mono" style="font-size:0.72rem;">${log.ip_address||'N/A'}</td>
                <td class="cell-dim">${log.browser||'—'}</td>
                <td class="cell-dim">${log.device||'—'}</td>
            </tr>`;
    }).join('');

    renderPagination('audit', logs.length, state.auditPage, state.auditPageSize, p => { state.auditPage = p; renderAuditTable(); });
}

function filterAudit() {
    state.auditPage = 1;
    renderAuditTable();
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
function renderAnalytics() {
    const range = parseInt(document.getElementById('analyticsRange')?.value || '30');
    const since = new Date(Date.now() - range * 864e5);
    const logs  = state.allLogs.filter(l => new Date(l.timestamp) >= since);

    // KPIs
    const kpis = document.getElementById('analyticsKPIs');
    if (kpis) {
        const searches = logs.filter(l => l.action_type?.includes('SEARCH')).length;
        const logins   = logs.filter(l => l.action_type === 'LOGIN').length;
        const failed   = logs.filter(l => l.action_type?.includes('FAIL')).length;
        const unique   = new Set(logs.map(l => l.user_id)).size;
        kpis.innerHTML = [
            { label:'Total Events', value:logs.length, icon:ICON.barChart,     color:'green' },
            { label:'Searches',     value:searches,    icon:ICON.search,       color:'blue'  },
            { label:'Logins',       value:logins,      icon:ICON.key,          color:'green' },
            { label:'Failed Auth',  value:failed,      icon:ICON.alertTriangle,color:'red'   },
        ].map(k => `
            <div class="kpi-card ${k.color}">
                <div class="kpi-top"><div class="kpi-icon ${k.color}">${k.icon}</div></div>
                <div class="kpi-value ${k.color}">${k.value}</div>
                <div class="kpi-label">${k.label}</div>
            </div>`).join('');
    }

    // Bar chart
    const barChart  = document.getElementById('analyticsBarChart');
    const barLabels = document.getElementById('analyticsBarLabels');
    if (barChart) {
        const buckets = range <= 7 ? range : range <= 14 ? range : 30;
        const counts = []; const lbls = [];
        for (let i = buckets - 1; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
            const next = new Date(d); next.setDate(next.getDate() + 1);
            counts.push(logs.filter(l => { const t = new Date(l.timestamp); return t >= d && t < next; }).length);
            lbls.push(d.toLocaleDateString('en-US',{month:'short',day:'numeric'}));
        }
        const max = Math.max(...counts, 1);
        barChart.innerHTML = counts.map((c,i) => `
            <div class="chart-bar" style="height:${Math.round(c/max*100)}%">
                <div class="bar-tip">${lbls[i]}: ${c}</div>
            </div>`).join('');
        if (barLabels) barLabels.innerHTML = lbls.map((l,i) => i % Math.ceil(lbls.length/8) === 0 ? `<div class="chart-label">${l}</div>` : `<div class="chart-label"></div>`).join('');
    }

    // Action breakdown
    const breakdown = document.getElementById('actionBreakdown');
    if (breakdown) {
        const counts2 = {};
        logs.forEach(l => {
            const k = l.action_type?.split('_')[0] || 'OTHER';
            counts2[k] = (counts2[k] || 0) + 1;
        });
        const sorted = Object.entries(counts2).sort((a,b) => b[1]-a[1]).slice(0,8);
        const max2 = Math.max(...sorted.map(s=>s[1]),1);
        breakdown.innerHTML = sorted.map(([k,v]) => `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-3);min-width:80px;text-transform:uppercase;">${k}</div>
                <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${Math.round(v/max2*100)}%;background:var(--green);border-radius:3px;box-shadow:0 0 6px var(--green-glow);"></div>
                </div>
                <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-1);min-width:30px;text-align:right;">${v}</div>
            </div>`).join('');
    }

    // Top agents
    const topAgents = document.getElementById('analyticsTopAgents');
    if (topAgents) {
        const agentMap = {};
        logs.forEach(l => {
            if (!l.username) return;
            if (!agentMap[l.username]) agentMap[l.username] = { searches:0, logins:0, total:0 };
            agentMap[l.username].total++;
            if (l.action_type?.includes('SEARCH')) agentMap[l.username].searches++;
            if (l.action_type === 'LOGIN') agentMap[l.username].logins++;
        });
        const sorted = Object.entries(agentMap).sort((a,b) => b[1].total - a[1].total).slice(0,10);
        topAgents.innerHTML = sorted.map(([name, d]) => {
            const u = state.users.find(u => u.username === name);
            const badge = u ? (u.is_admin ? `<span class="badge badge-purple">ADMIN</span>` : u.is_approved ? `<span class="badge badge-green">ACTIVE</span>` : `<span class="badge badge-gray">PENDING</span>`) : '';
            return `
                <tr>
                    <td><div class="cell-user"><div class="cell-avatar" style="width:26px;height:26px;font-size:0.65rem;">${name[0].toUpperCase()}</div><div class="cell-name">${name.toUpperCase()}</div></div></td>
                    <td class="cell-mono">${d.searches}</td>
                    <td class="cell-mono">${d.logins}</td>
                    <td class="cell-mono">${d.total}</td>
                    <td>${badge}</td>
                </tr>`;
        }).join('') || `<tr><td colspan="5"><div class="empty-state" style="padding:20px;"><div class="empty-title">No data</div></div></td></tr>`;
    }
}

// ── THREAT MONITOR ────────────────────────────────────────────────────────────
function renderThreats() {
    // Analyze logs for threats
    const threats = [];
    const now = new Date();
    const hour = new Date(now - 3600000);

    // Failed logins
    const failedGroups = {};
    state.allLogs.filter(l => l.action_type?.includes('FAILED') && new Date(l.timestamp) > hour).forEach(l => {
        failedGroups[l.username] = (failedGroups[l.username] || 0) + 1;
    });
    Object.entries(failedGroups).filter(([,v]) => v >= 3).forEach(([user, count]) => {
        threats.push({ level: count >= 5 ? 'CRITICAL' : 'HIGH', user, desc: `${count} failed login attempts in last hour` });
    });

    // Locked accounts
    state.users.filter(u => isLocked(u)).forEach(u => {
        threats.push({ level: 'MEDIUM', user: u.username, desc: `Account locked — ${u.failed_login_attempts||0} failed attempts` });
    });

    // Suspended
    state.users.filter(u => isSuspended(u)).forEach(u => {
        const d = tryParse(u.suspension_data);
        threats.push({ level: 'HIGH', user: u.username, desc: `Suspended: ${d?.reason || 'No reason'}` });
    });

    // Suspicious activity logs
    state.allLogs.filter(l => l.action_type?.includes('SUSPICIOUS') || l.action_type?.includes('ENUMERATION')).forEach(l => {
        threats.push({ level: 'CRITICAL', user: l.username, desc: l.action_details || l.action_type });
    });

    state.threatData = threats;

    // Update counts
    const levels = { CRITICAL:0, HIGH:0, MEDIUM:0, LOW:0 };
    threats.forEach(t => { levels[t.level] = (levels[t.level]||0) + 1; });
    ['Critical','High','Medium','Low'].forEach(l => {
        const el = document.getElementById(`threat${l}`);
        if (el) el.textContent = levels[l.toUpperCase()] || 0;
    });

    // Badge
    const badge = document.getElementById('threatBadge');
    if (badge) badge.textContent = threats.length;

    // Threat list
    const list = document.getElementById('threatList');
    if (!list) return;
    if (!threats.length) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">${ICON.check}</div><div class="empty-title">No active threats detected</div><div class="empty-sub">All systems nominal</div></div>`;
        document.getElementById('threatSummaryCard') && (document.getElementById('threatSummaryCard').innerHTML = list.innerHTML);
        return;
    }

    list.innerHTML = threats.map(t => {
        const colors = { CRITICAL:'threat-critical', HIGH:'threat-high', MEDIUM:'threat-medium', LOW:'threat-low' };
        return `
            <div class="threat-item">
                <div class="threat-level ${colors[t.level]||'threat-low'}">${t.level}</div>
                <div class="threat-info">
                    <div class="threat-user">${t.user?.toUpperCase() || 'UNKNOWN'}</div>
                    <div class="threat-desc">${t.desc}</div>
                </div>
            </div>`;
    }).join('');

    // Summary card (overview page)
    const summary = document.getElementById('threatSummaryCard');
    if (summary) summary.innerHTML = threats.slice(0,4).map(t => {
        const colors = { CRITICAL:'threat-critical', HIGH:'threat-high', MEDIUM:'threat-medium', LOW:'threat-low' };
        return `
            <div class="threat-item">
                <div class="threat-level ${colors[t.level]||'threat-low'}">${t.level}</div>
                <div class="threat-info">
                    <div class="threat-user">${t.user?.toUpperCase()}</div>
                    <div class="threat-desc">${t.desc?.substring(0,60)}</div>
                </div>
            </div>`;
    }).join('') || `<div class="empty-state" style="padding:20px;"><div class="empty-icon">${ICON.check}</div><div class="empty-title">No active threats</div></div>`;
}

function refreshThreats() { renderThreats(); showToast('Threat scan complete', 'info'); }

// ── SYSTEM HEALTH ─────────────────────────────────────────────────────────────
function renderSystemHealth() {
    const active    = state.users.filter(u => u.is_approved && !isSuspended(u) && !isExpired(u)).length;
    const locked    = state.users.filter(u => isLocked(u)).length;
    const suspended = state.users.filter(u => isSuspended(u)).length;

    ['sysSessionCount','sysActiveSessions'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = active; });
    ['sysApprovedCount'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = active; });
    ['sysLockedCount'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = locked; });
    ['sysSuspendedCount'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = suspended; });
}

// ── GLOBAL SEARCH ─────────────────────────────────────────────────────────────
function globalSearchHandler() {
    const q = document.getElementById('globalSearch')?.value.toLowerCase() || '';
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    if (q.length < 2) { hideSearchDropdown(); return; }

    const results = state.users.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.last_ip?.toLowerCase().includes(q) ||
        String(u.id).includes(q)
    ).slice(0, 6);

    if (!results.length) { hideSearchDropdown(); return; }

    dropdown.innerHTML = results.map(u => `
        <div class="search-result-item" onclick="goToUser(${u.id})">
            <div class="search-result-avatar">${u.username[0].toUpperCase()}</div>
            <div>
                <div class="search-result-name">${u.username.toUpperCase()}</div>
                <div class="search-result-meta">${u.email||'No email'} · ${u.last_ip||'N/A'}</div>
            </div>
        </div>`).join('');
    dropdown.classList.add('visible');
}

function hideSearchDropdown() {
    document.getElementById('searchDropdown')?.classList.remove('visible');
}

function goToUser(id) {
    hideSearchDropdown();
    navTo('users');
    document.getElementById('userSearchInput') && (document.getElementById('userSearchInput').value = String(id));
    filterUsers();
}

// ── ACTIVITY MODAL ────────────────────────────────────────────────────────────
async function viewActivity(userId, username) {
    const modal = document.getElementById('activityModal');
    if (modal) { modal.classList.add('active'); }

    const el = document.getElementById('activityUsername');
    if (el) el.textContent = username.toUpperCase();

    const tbody = document.getElementById('activityTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center"><div class="loading"><div class="loading-spinner"></div><p class="loading-text terminal-text">LOADING ACTIVITY LOGS...</p></div></td></tr>`;

    try {
        const r = await fetch(`${API_URL}/api/admin/activity/${userId}`, {
            credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) {
            renderActivityLogs(d.logs);
        } else {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center terminal-text" style="color:var(--danger-red);">FAILED TO LOAD ACTIVITY LOGS</td></tr>`;
        }
    } catch (e) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center terminal-text" style="color:var(--danger-red);">CONNECTION ERROR</td></tr>`;
    }
}

function renderActivityLogs(logs) {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;

    if (!logs || !logs.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center terminal-text">NO ACTIVITY RECORDED</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const { icon, color } = getActionMeta(log.action_type);
        const ts = new Date(log.timestamp).toLocaleString('en-US',{
            year:'numeric',month:'short',day:'2-digit',
            hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
        });
        const actionDisplay = log.action_type?.replace(/_/g,' ') || '—';

        let detailsHtml = log.action_details || '—';
        if (log.action_details) {
            if (log.action_details.includes('Searched')) {
                const m = log.action_details.match(/\{[^}]+\}/);
                if (m) {
                    try {
                        const crit = JSON.parse(m[0]);
                        const fields = Object.entries(crit).map(([k,v]) =>
                            `<span style="display:inline-block;background:rgba(var(--accent-rgb),0.1);border:1px solid var(--primary-green);padding:2px 8px;margin:2px;border-radius:3px;font-size:10px;"><strong style="color:var(--primary-green);">${k}:</strong> ${v}</span>`
                        ).join('');
                        detailsHtml = `<div style="font-weight:bold;color:var(--light-green);margin-bottom:3px;">Database Search</div>${fields}`;
                    } catch(e) {}
                }
            } else if (log.action_details.includes('Successful login')) {
                detailsHtml = `<div style="color:var(--primary-green);font-weight:bold;">System Access</div><div style="font-size:10px;color:var(--text-dim);">Authentication successful</div>`;
            }
        }

        return `
            <tr>
                <td class="terminal-text" style="font-size:11px;white-space:nowrap;color:var(--text-dim);">${ts}</td>
                <td style="white-space:nowrap;"><span class="status-badge status-approved terminal-text" style="font-size:11px;">${icon} ${actionDisplay}</span></td>
                <td class="terminal-text" style="font-size:11px;max-width:400px;">${detailsHtml}</td>
                <td class="terminal-text" style="font-size:11px;white-space:nowrap;">${log.ip_address ? `<span style="color:var(--primary-green);font-family:monospace;">${log.ip_address}</span>` : 'N/A'}</td>
                <td class="terminal-text" style="font-size:11px;text-align:center;">${log.browser || '—'}</td>
                <td class="terminal-text" style="font-size:10px;text-align:center;"><div style="color:var(--light-green);">${log.os||'Unknown'}</div><div style="color:var(--text-dim);font-size:9px;">${log.device||'Unknown'}</div></td>
            </tr>`;
    }).join('');
}

function closeActivityModal() {
    document.getElementById('activityModal')?.classList.remove('active');
}

// ── MODALS ─────────────────────────────────────────────────────────────────────
function closeAllModals() {
    ['expiryModal','suspendModal','pwdModal','userModal','activityModal'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
}

// Expiry Modal
function openExpiryModal(userId, username) {
    state.pendingExpiryUser = { id: userId, username };
    document.getElementById('expiryTargetName') && (document.getElementById('expiryTargetName').textContent = username.toUpperCase());
    document.getElementById('expiryModal')?.classList.add('active');
}

function expiryQuick(n, unit) {
    document.getElementById('expiryDuration') && (document.getElementById('expiryDuration').value = n);
    document.getElementById('expiryUnit') && (document.getElementById('expiryUnit').value = unit);
}

async function submitExpiry() {
    if (!state.pendingExpiryUser) return;
    const dur  = parseInt(document.getElementById('expiryDuration')?.value);
    const unit = document.getElementById('expiryUnit')?.value;
    if (!dur || dur <= 0 || !unit) { showToast('Enter valid duration and unit', 'error'); return; }

    const { id, username } = state.pendingExpiryUser;
    try {
        const r = await fetch(`${API_URL}/api/admin/set-expiry/${id}`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ duration: dur, unit })
        });
        const d = await r.json();
        if (r.ok && d.success) {
            showToast(`Expiry set for ${username}`, 'success');
            document.getElementById('expiryModal')?.classList.remove('active');
            await loadUsers();
        } else {
            showToast(d.error || 'Failed to set expiry', 'error');
        }
    } catch (e) { showToast('Connection error', 'error'); }
}

// Suspend Modal
function openSuspendModal(userId, username) {
    state.pendingSuspendUser = { id: userId, username };
    document.getElementById('suspendTargetName') && (document.getElementById('suspendTargetName').textContent = username.toUpperCase());
    document.getElementById('suspendReason') && (document.getElementById('suspendReason').value = '');
    document.getElementById('suspendModal')?.classList.add('active');
}

async function submitSuspend() {
    if (!state.pendingSuspendUser) return;
    const reason = document.getElementById('suspendReason')?.value?.trim();
    if (!reason || reason.length < 5) { showToast('Reason must be at least 5 characters', 'error'); return; }

    const { id, username } = state.pendingSuspendUser;
    try {
        const r = await fetch(`${API_URL}/api/admin/suspend/${id}`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ suspend: true, reason })
        });
        const d = await r.json();
        if (r.ok && d.success) {
            showToast(`${username} suspended`, 'success');
            document.getElementById('suspendModal')?.classList.remove('active');
            await loadUsers();
        } else {
            showToast(d.error || 'Suspension failed', 'error');
        }
    } catch (e) { showToast('Connection error', 'error'); }
}

// Password Modal
function openPwdModal(userId, username) {
    state.pendingPwdUser = { id: userId, username };
    document.getElementById('pwdTargetName') && (document.getElementById('pwdTargetName').textContent = username.toUpperCase());
    document.getElementById('newPwdInput') && (document.getElementById('newPwdInput').value = '');
    document.getElementById('pwdModal')?.classList.add('active');
}

async function submitPwdChange() {
    if (!state.pendingPwdUser) return;
    const pwd = document.getElementById('newPwdInput')?.value;
    if (!pwd || pwd.length < 12) { showToast('Password must be at least 12 characters', 'error'); return; }
    if (!/[a-z]/.test(pwd)||!/[A-Z]/.test(pwd)||!/[0-9]/.test(pwd)||!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd)) {
        showToast('Password needs upper, lower, number & symbol', 'error'); return;
    }

    const { id, username } = state.pendingPwdUser;
    try {
        const r = await fetch(`${API_URL}/api/admin/change-password/${id}`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ newPassword: pwd })
        });
        const d = await r.json();
        if (r.ok && d.success) {
            showToast(`Password changed for ${username}`, 'success');
            document.getElementById('pwdModal')?.classList.remove('active');
        } else {
            showToast(d.error || 'Password change failed', 'error');
        }
    } catch (e) { showToast('Connection error', 'error'); }
}

// ── ADMIN ACTIONS ─────────────────────────────────────────────────────────────
async function approveUser(userId) {
    if (!confirm('GRANT SECURITY CLEARANCE TO THIS AGENT?')) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/approve/${userId}`, {
            method:'POST', credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) { showToast('Security clearance granted', 'success'); await loadUsers(); await loadStats(); }
        else showToast(d.error || 'Approval failed', 'error');
    } catch (e) { showToast('Connection error', 'error'); }
}

async function removeUser(userId) {
    if (!confirm('REVOKE AGENT ACCESS? THIS ACTION CANNOT BE UNDONE.')) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/users/${userId}`, {
            method:'DELETE', credentials: 'same-origin'
        });
        const d = await r.json();
        if (r.ok && d.success) { showToast('Agent access revoked', 'success'); await loadUsers(); await loadStats(); }
        else showToast(d.error || 'Revocation failed', 'error');
    } catch (e) { showToast('Connection error', 'error'); }
}

async function suspendUser(userId, username, currentlySuspended) {
    if (currentlySuspended) {
        if (!confirm(`UNSUSPEND ACCOUNT: ${username}?`)) return;
        try {
            const r = await fetch(`${API_URL}/api/admin/suspend/${userId}`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ suspend: false })
            });
            const d = await r.json();
            if (r.ok && d.success) { showToast('Account unsuspended', 'success'); await loadUsers(); }
            else showToast(d.error || 'Unsuspend failed', 'error');
        } catch (e) { showToast('Connection error', 'error'); }
    } else {
        openSuspendModal(userId, username);
    }
}

async function unlockAccount(userId, username) {
    if (!confirm(`UNLOCK ACCOUNT FOR: ${username}?`)) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/unlock/${userId}`, {
            method:'POST', headers:{'Content-Type':'application/json'}
        });
        const d = await r.json();
        if (r.ok && d.success) { showToast('Account unlocked', 'success'); await loadUsers(); }
        else showToast(d.error || 'Unlock failed', 'error');
    } catch (e) { showToast('Connection error', 'error'); }
}

async function forceLogoutUser(userId, username) {
    if (!confirm(`FORCE LOGOUT: ${username}?\n\nThis will immediately terminate their session.`)) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/force-logout/${userId}`, {
            method:'POST', headers:{'Content-Type':'application/json'}
        });
        const d = await r.json();
        if (r.ok && d.success) { showToast(`${username} logged out`, 'success'); await loadUsers(); }
        else showToast(d.error || 'Force logout failed', 'error');
    } catch (e) { showToast('Connection error', 'error'); }
}

async function toggleFaceSkip(userId, username, skip) {
    const msg = skip
        ? `SKIP FACE/PHONE VERIFICATION for ${username}?\n\nThey will be able to log in with just a password, like an admin.`
        : `Require face/phone verification for ${username} again?`;
    if (!confirm(msg)) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/toggle-face-skip/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skip })
        });
        const d = await r.json();
        if (r.ok && d.success) { showToast(d.message || 'Updated', 'success'); await loadUsers(); }
        else showToast(d.error || 'Update failed', 'error');
    } catch (e) { showToast('Connection error', 'error'); }
}

async function changeUserPassword(userId, username) {
    openPwdModal(userId, username);
}

async function setExpiry(userId, username) {
    openExpiryModal(userId, username);
}

async function expireAccount(userId, username) {
    if (!confirm(`EXPIRE ACCOUNT NOW: ${username}?\n\nThis will immediately prevent the user from logging in.`)) return;
    try {
        const r = await fetch(`${API_URL}/api/admin/expire-account/${userId}`, {
            method:'POST', headers:{'Content-Type':'application/json'}
        });
        const d = await r.json();
        if (r.ok && d.success) { showToast(`${username} expired`, 'success'); await loadUsers(); }
        else showToast(d.error || 'Expire failed', 'error');
    } catch (e) { showToast('Connection error', 'error'); }
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
function exportUsersCSV() {
    const data = state.users.map(u => ({
        ID: u.id, Username: u.username, Email: u.email||'',
        Status: u.is_admin?'ADMIN':isExpired(u)?'EXPIRED':isLocked(u)?'LOCKED':isSuspended(u)?'SUSPENDED':u.is_approved?'ACTIVE':'PENDING',
        LastIP: u.last_ip||'', Created: u.created_at||'', LastLogin: u.last_login||'',
        Expires: u.account_expires_at||''
    }));
    downloadCSV(data, 'bcia_agents_' + fmtDateISO(new Date()));
    showToast('CSV export downloaded', 'success');
}

function exportAuditCSV() {
    const data = state.auditLogs.map(l => ({
        Timestamp: l.timestamp, Username: l.username, Action: l.action_type,
        Details: l.action_details||'', IP: l.ip_address||'', Browser: l.browser||'', Device: l.device||''
    }));
    downloadCSV(data, 'bcia_audit_' + fmtDateISO(new Date()));
    showToast('Audit log exported', 'success');
}

function downloadCSV(data, filename) {
    if (!data.length) return;
    const cols = Object.keys(data[0]);
    const rows = [cols.join(','), ...data.map(r => cols.map(c => `"${String(r[c]||'').replace(/"/g,'""')}"`).join(','))];
    const blob = new Blob([rows.join('\n')], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '.csv';
    a.click();
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
async function logout() {
    clearInterval(sessionCheckInterval);
    clearInterval(liveInterval);
    localStorage.removeItem('bcia_user');
    // SECURITY FIX: clear the httpOnly session cookie server-side too.
    try { await fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'same-origin' }); } catch (e) {}
    window.location.href = '/';
}

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function fmtDate(str) {
    if (!str) return 'N/A';
    return new Date(str).toLocaleString('en-US',{
        month:'2-digit',day:'2-digit',year:'numeric',
        hour:'2-digit',minute:'2-digit',hour12:false
    });
}

function fmtDateFull(str) {
    if (!str) return 'N/A';
    return new Date(str).toLocaleString('en-US',{
        month:'short',day:'2-digit',year:'numeric',
        hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
    });
}

function fmtDateISO(d) {
    return d.toISOString().slice(0,10);
}

function fmtTime(d) {
    if (!d) return '—';
    if (typeof d === 'string') d = new Date(d);
    return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
}

function tryParse(s) {
    try { return JSON.parse(s); } catch(e) { return null; }
}

function debounce(fn, ms) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function escapeQuotes(str) {
    return String(str).replace(/'/g,"\\'").replace(/"/g,'\\"');
}

// ── GLOBAL WINDOW EXPORTS ─────────────────────────────────────────────────────
// ── COMPLAINT NOTE FUNCTIONS ──────────────────────────────────
function toggleNoteEditor() {
    const display = document.getElementById('noteDisplay');
    const editor = document.getElementById('noteEditor');
    const btn = document.getElementById('noteToggleBtn');
    if (!editor || !display) return;
    
    const isHidden = editor.style.display === 'none' || editor.style.display === '';
    editor.style.display = isHidden ? 'block' : 'none';
    display.style.display = isHidden ? 'none' : 'block';
    if (btn) btn.innerHTML = isHidden ? `${ICON.edit} Editing...` : `${ICON.edit} Edit`;
    
    if (isHidden) {
        document.getElementById('adminNoteInput')?.focus();
    }
}

async function saveComplaintNote(id) {
    const note = document.getElementById('adminNoteInput')?.value?.trim() || '';
    try {
        const r = await fetch(`${API_URL}/api/admin/complaints/${id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read', admin_notes: note })
        });
        const d = await r.json();
        if (r.ok && d.success) {
            showToast('Note saved', 'success');
            // Update display
            const display = document.getElementById('noteDisplay');
            if (display) {
                display.textContent = note || 'No notes yet. Click "Edit" to add notes.';
                display.style.color = note ? 'var(--text-2)' : 'var(--text-3)';
                display.style.fontStyle = note ? 'normal' : 'italic';
            }
            toggleNoteEditor();
        } else {
            showToast(d.error || 'Failed to save note', 'error');
        }
    } catch (e) {
        showToast('Connection error', 'error');
    }
}

// ── ESCAPE HTML HELPER ────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

Object.assign(window, {
    approveUser, removeUser, viewActivity, closeActivityModal,
    changeUserPassword, suspendUser, unlockAccount, forceLogoutUser, toggleFaceSkip,
    setExpiry, expireAccount,
    openExpiryModal, expiryQuick, submitExpiry,
    openSuspendModal, submitSuspend,
    openPwdModal, submitPwdChange,
    navTo, toggleSidebar, closeSidebar,
    openCmd, closeCmd,
    toggleNotif, clearNotifs,
    logout,
    refreshAll,
    filterUsers, sortUsers, clickSort, setUserFilter,
    toggleSelectUser, toggleSelectAll, selectAllVisible, clearSelection,
    bulkApprove, bulkDelete,
    filterAudit, exportAuditCSV, exportUsersCSV,
    renderAnalytics, refreshThreats,
    toggleLivePause, clearLiveFeed,
    userGoPage, auditGoPage,
    loadComplaints, setComplaintFilter, viewComplaint, updateComplaintStatus, deleteComplaint,
    toggleNoteEditor, saveComplaintNote, escapeHtml,
});

// ── AUTO-REFRESH ──────────────────────────────────────────────────────────────
setInterval(() => { loadUsers(); loadStats(); loadComplaints(); }, 30000);