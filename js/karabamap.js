// KARABA ELECTRICITY MAP - Viewport-based loading
let karabaMapInstance = null;
let karabaMarkerCluster = null;
let karabaCurrentMarkers = [];
let karabaLoadTimer = null;
let karabaIsLoading = false;

const karabaMapT = {
    en: {
        title: 'INFORMATIONS MAP',
        loading: 'LOADING INFORMATIONS...',
        loaded: 'informations shown',
        zoom: 'ZOOM',
        connErr: 'CONNECTION ERROR',
        notFound: 'Record not found',
        loadErr: 'Error loading details',
        openGmap: 'OPEN IN GOOGLE MAPS',
        fullDetails: '► FULL DETAILS',
        myLocation: '📍 MY LOCATION',
        locDenied: 'Location access denied',
        locNo: 'Geolocation not supported',
        meterDetails: '▣ METER DETAILS',
        electricityMap: 'INFORMATIONS MAP',
        electricityMapDesc: 'CLASSIFIED: Live informations locations on interactive map with cluster view.',
        accessMap: 'ACCESS MAP',
        zoomHint: 'Zoom in or move map to load informations',
        AccountNo: 'ID Number',
        SubscriberName: 'House Name',
        MeterSerial: 'Serial',
        Area: 'Area',
        Area_2: 'Area 2',
        Feeder: 'Feeder',
        Zone: 'Zone',
        SubZone: 'Sub Zone',
        BlockNo: 'Block Number',
        STSNo: 'STS Number',
        Status: 'Status',
        Substation: 'Substation',
        TransformerNumber: 'Transformer No',
        Reading: 'Reading',
        OldMeter: 'Old',
        Comment: 'Comment',
        UserName: 'User Name',
        Latitude: 'Latitude',
        Longitude: 'Longitude',
    },
    ku: {
        title: 'نەخشەی زانیاریەکان',
        loading: 'زانیاریەکان بارئەکرێن...',
        loaded: 'زانیاری نیشاندراوە',
        zoom: 'زوم',
        connErr: 'هەڵەی پەیوەندی',
        notFound: 'تۆمار نەدۆزرایەوە',
        loadErr: 'هەڵە لە بارکردنی وردەکاری',
        openGmap: 'کردنەوە لە گووگڵ مەپ',
        fullDetails: '► وردەکاری تەواو',
        myLocation: '📍 شوێنەکەم',
        locDenied: 'دەستگەیشتن بە شوێن ڕەتکرایەوە',
        locNo: 'Geolocation پشتگیری ناکرێت',
        meterDetails: '▣ وردەکاری زیاتر',
        electricityMap: 'نەخشەی زانیاریەکان',
        electricityMapDesc: 'نهێنی: زانیاری راستەوخۆ لەسەر نەخشەی ئینتەراکتیف.',
        accessMap: 'دەستگەیشتن بە نەخشە',
        zoomHint: 'زوم بکە یان نەخشە بگوازەوە بۆ بارکردنی زانیاریەکان',
        AccountNo: 'ژمارەی ئایدی',
        SubscriberName: 'ناوی خاوەن',
        MeterSerial: 'سریاڵ',
        Area: 'ناوچە',
        Area_2: 'ناوچەی ٢',
        Feeder: 'فیدەر',
        Zone: 'زۆن',
        SubZone: 'ژێر زۆن',
        BlockNo: 'ژمارەی بلۆک',
        STSNo: 'ژمارەی STS',
        Status: 'دۆخ',
        Substation: 'شوێن',
        TransformerNumber: 'ژمارەی ترانسفۆرمەر',
        Reading: 'خوێندنەوە',
        OldMeter: 'کۆن',
        Comment: 'تێبینی',
        UserName: 'ناو',
        Latitude: 'هێڵی پانی',
        Longitude: 'هێڵی درێژی',
    }
};

function kmT(key) {
    const lang = (typeof state !== 'undefined' && state.language) ? state.language : 'en';
    return (karabaMapT[lang] && karabaMapT[lang][key]) ? karabaMapT[lang][key] : (karabaMapT.en[key] || key);
}

function openKarabaMapModal() {
    const modal = document.getElementById('karabaMapModal');
    if (!modal) return;
    document.getElementById('karabaMapTitle').textContent = kmT('title');
    document.getElementById('karabaLocBtn').textContent = kmT('myLocation');
    document.getElementById('karabaMapLoadingTxt').textContent = kmT('loading');
    modal.classList.add('active');
    setTimeout(() => initKarabaMap(), 300);
}

function closeKarabaMapModal() {
    document.getElementById('karabaMapModal').classList.remove('active');
}

function initKarabaMap() {
    if (karabaMapInstance) {
        karabaMapInstance.invalidateSize();
        return;
    }

    const mapEl = document.getElementById('karabaMap');
    if (!mapEl) return;

    karabaMapInstance = L.map('karabaMap', {
        center: [33.34, 44.4],
        zoom: 7,
        preferCanvas: true,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© Cyb3r Drag0nz Team',
        subdomains: 'abcd',
        maxZoom: 22,
        crossOrigin: true
    }).addTo(karabaMapInstance);

    karabaMarkerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 100,
        chunkDelay: 50,
        maxClusterRadius: 60,
        disableClusteringAtZoom: 20,
        iconCreateFunction: function(cluster) {
            const n = cluster.getChildCount();
            const size = n > 1000 ? 56 : n > 200 ? 46 : 36;
            const color = n > 1000 ? '#ff4444' : n > 200 ? '#ffaa00' : '#00ff41';
            return L.divIcon({
                html: `<div style="
                    background:linear-gradient(135deg,#0a0a0a,#1a1a1a);
                    border:2px solid ${color};
                    border-radius:50%;
                    width:${size}px;height:${size}px;
                    display:flex;align-items:center;justify-content:center;
                    color:${color};font-weight:bold;font-size:${n>999?9:11}px;
                    box-shadow:0 0 10px ${color}88;
                    font-family:monospace;
                ">${n >= 10000 ? Math.floor(n/1000)+'k' : n}</div>`,
                className: '',
                iconSize: [size, size]
            });
        }
    });

    karabaMapInstance.addLayer(karabaMarkerCluster);

    // Listen for map move/zoom — debounced
    karabaMapInstance.on('moveend zoomend', () => {
        clearTimeout(karabaLoadTimer);
        karabaLoadTimer = setTimeout(() => {
            karabaLoadViewport();
        }, 600); // wait 600ms after user stops moving
    });

    // Show hint
    const status = document.getElementById('karabaMapStatus');
    if (status) status.textContent = kmT('zoomHint');
}

async function karabaLoadViewport() {
    if (!karabaMapInstance || karabaIsLoading) return;

    const zoom = karabaMapInstance.getZoom();

    // Only load when zoomed in enough (zoom 10+)
    if (zoom < 10) {
        const status = document.getElementById('karabaMapStatus');
        if (status) status.textContent = `🔍 Zoom in more to see informations (current zoom: ${zoom}, need 10+)`;
        karabaMarkerCluster.clearLayers();
        karabaCurrentMarkers = [];
        return;
    }

    const bounds = karabaMapInstance.getBounds();
    const minLat = bounds.getSouth().toFixed(6);
    const maxLat = bounds.getNorth().toFixed(6);
    const minLng = bounds.getWest().toFixed(6);
    const maxLng = bounds.getEast().toFixed(6);

    karabaIsLoading = true;
    const loadEl = document.getElementById('karabaMapLoading');
    const status = document.getElementById('karabaMapStatus');
    if (loadEl) loadEl.style.display = 'block';
    if (status) status.textContent = kmT('loading');

    try {
        const res = await fetch(
            `/api/karaba/map/viewport?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`,
            { credentials: 'same-origin' }
        );
        const data = await res.json();

        if (!data.success) throw new Error(data.error || 'Failed');

        // Clear old markers
        karabaMarkerCluster.clearLayers();
        karabaCurrentMarkers = [];

        // Render new markers
        karabaRenderMarkers(data.results);

        const countEl = document.getElementById('karabaMapCount');
        if (countEl) countEl.textContent = `${data.results.length} ${kmT('loaded')} in view`;
        if (status) status.textContent = `✓ ${data.results.length} ${kmT('loaded')}`;

    } catch (err) {
        if (status) status.textContent = kmT('connErr') + ': ' + err.message;
        console.error('Karaba viewport error:', err);
    }

    if (loadEl) loadEl.style.display = 'none';
    karabaIsLoading = false;
}

function karabaRenderMarkers(rows) {
    const greenIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;background:#00ff41;border:1.5px solid #003d1a;border-radius:50%;box-shadow:0 0 6px rgba(0,255,65,0.8);"></div>`,
        className: '',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
    });

    const markers = [];
    for (const row of rows) {
        if (!row.lat || !row.lng) continue;

        const rid = row.rid;

        const m = L.marker([row.lat, row.lng], { icon: greenIcon });

        m.bindPopup(`
            <div style="background:#0d0d0d;color:#00ff41;padding:10px;min-width:180px;font-family:monospace;border:1px solid #00ff41;border-radius:6px;font-size:13px;">
                <div style="font-weight:bold;margin-bottom:8px;">▣ INFORMATION</div>
                <button onclick="karabaShowDetailByRow(${rid})"
                    style="width:100%;padding:8px;background:linear-gradient(135deg,#003d1a,#005528);border:1px solid #00ff41;color:#00ff41;cursor:pointer;border-radius:4px;font-family:monospace;font-weight:bold;font-size:12px;">
                    ${kmT('fullDetails')}
                </button>
            </div>
        `, { className: 'karaba-popup', maxWidth: 220 });

        markers.push(m);
    }

    karabaMarkerCluster.addLayers(markers);
    karabaCurrentMarkers = markers;
}

async function karabaShowDetailByRow(rid) {
    const panel = document.getElementById('karabaDetailPanel');
    const content = document.getElementById('karabaDetailContent');
    const titleEl = document.getElementById('karabaDetailTitle');

    if (titleEl) titleEl.textContent = kmT('meterDetails');
    content.innerHTML = `<div style="text-align:center;color:#00ff41;padding:15px;">${kmT('loading')}</div>`;
    panel.style.display = 'block';

    try {
        const res = await fetch(`/api/karaba/map/detail/row/${rid}`,
            { credentials: 'same-origin' });
        const data = await res.json();

        if (data.success && data.result) {
            const r = data.result;
            const fieldKeys = ['AccountNo', 'SubscriberName', 'MeterSerial', 'Area', 'Area_2',
                'Feeder', 'Zone', 'SubZone', 'BlockNo', 'STSNo', 'Status',
                'Substation', 'TransformerNumber', 'Reading', 'OldMeter',
                'Comment', 'UserName', 'Latitude', 'Longitude'];

            let html = '';
            for (const key of fieldKeys) {
                const val = r[key];
                if (val !== null && val !== undefined && val !== '' && val !== 'null') {
                    html += `
                        <div style="margin-bottom:6px;padding:7px 9px;background:var(--input-bg);border-left:3px solid var(--primary-green);border-radius:3px;">
                            <div style="color:var(--text-dim);font-size:0.65rem;text-transform:uppercase;margin-bottom:2px;">${kmT(key)}</div>
                            <div style="color:var(--primary-green);font-size:0.85rem;font-weight:bold;word-break:break-all;">${escapeKarabaHtml(String(val))}</div>
                        </div>`;
                }
            }

            if (r.Latitude && r.Longitude) {
                html += `<a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank"
                    style="display:block;text-align:center;padding:8px;background:linear-gradient(135deg,var(--dark-green),#005528);border:1px solid var(--primary-green);color:var(--primary-green);border-radius:5px;text-decoration:none;font-weight:bold;font-size:0.82rem;margin-top:8px;">
                    ${kmT('openGmap')}</a>`;
            }

            content.innerHTML = html;
        } else {
            content.innerHTML = `<div style="color:var(--danger-red);text-align:center;padding:15px;">${kmT('notFound')}</div>`;
        }
    } catch (err) {
        content.innerHTML = `<div style="color:var(--danger-red);text-align:center;padding:15px;">${kmT('loadErr')}</div>`;
    }
}

async function karabaShowDetail(accountNo) {
    const panel = document.getElementById('karabaDetailPanel');
    const content = document.getElementById('karabaDetailContent');
    const titleEl = document.getElementById('karabaDetailTitle');

    if (titleEl) titleEl.textContent = kmT('meterDetails');
    content.innerHTML = `<div style="text-align:center;color:#00ff41;padding:15px;">${kmT('loading')}</div>`;
    panel.style.display = 'block';

    try {
        const res = await fetch(`/api/karaba/map/detail/${encodeURIComponent(accountNo)}`,
            { credentials: 'same-origin' });
        const data = await res.json();

        if (data.success && data.result) {
            const r = data.result;
            const fieldKeys = ['AccountNo', 'SubscriberName', 'MeterSerial', 'Area', 'Area_2',
                'Feeder', 'Zone', 'SubZone', 'BlockNo', 'STSNo', 'Status',
                'Substation', 'TransformerNumber', 'Reading', 'OldMeter',
                'Comment', 'UserName', 'Latitude', 'Longitude'];

            let html = '';
            for (const key of fieldKeys) {
                const val = r[key];
                if (val !== null && val !== undefined && val !== '' && val !== 'null') {
                    html += `
                        <div style="margin-bottom:6px;padding:7px 9px;background:var(--input-bg);border-left:3px solid var(--primary-green);border-radius:3px;">
                            <div style="color:var(--text-dim);font-size:0.65rem;text-transform:uppercase;margin-bottom:2px;">${kmT(key)}</div>
                            <div style="color:var(--primary-green);font-size:0.85rem;font-weight:bold;word-break:break-all;">${escapeKarabaHtml(String(val))}</div>
                        </div>`;
                }
            }

            if (r.Latitude && r.Longitude) {
                html += `<a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank"
                    style="display:block;text-align:center;padding:8px;background:linear-gradient(135deg,var(--dark-green),#005528);border:1px solid var(--primary-green);color:var(--primary-green);border-radius:5px;text-decoration:none;font-weight:bold;font-size:0.82rem;margin-top:8px;">
                    ${kmT('openGmap')}</a>`;
            }

            content.innerHTML = html;
        } else {
            content.innerHTML = `<div style="color:var(--danger-red);text-align:center;padding:15px;">${kmT('notFound')}</div>`;
        }
    } catch (err) {
        content.innerHTML = `<div style="color:var(--danger-red);text-align:center;padding:15px;">${kmT('loadErr')}</div>`;
    }
}

function karabaMapLocateMe() {
    if (!navigator.geolocation) return alert(kmT('locNo'));
    navigator.geolocation.getCurrentPosition(
        pos => {
            if (karabaMapInstance) {
                karabaMapInstance.setView([pos.coords.latitude, pos.coords.longitude], 14);
            }
        },
        () => alert(kmT('locDenied'))
    );
}

function escapeKarabaHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.openKarabaMapModal = openKarabaMapModal;
window.closeKarabaMapModal = closeKarabaMapModal;
window.karabaShowDetail = karabaShowDetail;
window.karabaMapLocateMe = karabaMapLocateMe;
window.karabaShowDetailByRow = karabaShowDetailByRow;