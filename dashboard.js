// dashboard.js

let incidents = [];

// Firebase Firestore reference
const db = firebase.firestore();
const reportsRef = db.collection("reports"); // Make sure this matches your Firestore collection

// Real-time listener
reportsRef.onSnapshot((snapshot) => {
    incidents = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        incidents.push({
            id: doc.id,
            type: data.type || "",
            severity: data.severity || 3,
            status: data.status || "TO BE REVIEWED",
            reporter: data.reporter || "Anonymous",
            location: data.location || null, // {lat: .., lng: ..}
            timestamp: data.timestamp || null,
            notes: data.notes || ""
        });
    });
    filterIncidents(); // Re-render table and map
    updateStats();
});

// Helper to get severity badge class
function getSeverityClass(level) {
    if (level >= 4) return 'badge-critical';
    if (level === 3) return 'badge-mid';
    return 'badge-low';
}

function getSeverityLabel(level) {
    if (level >= 4) return 'Critical';
    if (level === 3) return 'Mid';
    return 'Low';
}

// Helper to get status badge class
function getStatusClass(status) {
    switch (status.toUpperCase()) {
        case 'ACKNOWLEDGED': return 'status-acknowledged';
        case 'TO BE REVIEWED': return 'status-to-be-reviewed';
        default: return 'status-to-be-reviewed';
    }
}

// Render Table
function renderTable(data = incidents) {
    const tbody = document.getElementById('incident-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No incidents found matching your filters.</td></tr>';
        return;
    }

    data.forEach(incident => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(incident);

        // Format location for display
        const locationStr = incident.location ? `${incident.location.lat.toFixed(5)}, ${incident.location.lng.toFixed(5)}` : 'N/A';

        // Format timestamp for display
        let timeStr = 'N/A';
        if (incident.timestamp && incident.timestamp.toDate) {
            timeStr = incident.timestamp.toDate().toLocaleString();
        }

        tr.innerHTML = `
            <td>#${incident.id}</td>
            <td><span class="badge ${getSeverityClass(incident.severity)}">Level ${incident.severity} (${getSeverityLabel(incident.severity)})</span></td>
            <td><span class="badge ${getStatusClass(incident.status)}">${incident.status}</span></td>
            <td>${incident.type}</td>
            <td>${incident.reporter}</td>
            <td>${locationStr}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtering Logic
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const severityFilter = document.getElementById('severity-filter');
const navTabs = document.querySelectorAll('.nav-tab');

let currentStatusFilter = 'ALL';

function filterIncidents() {
    const searchTerm = searchInput.value.toLowerCase();
    const severityValue = severityFilter.value;

    let filtered = incidents.filter(incident => {
        const locationStr = incident.location ? `${incident.location.lat},${incident.location.lng}` : '';
        const matchesSearch =
            incident.type.toLowerCase().includes(searchTerm) ||
            locationStr.toLowerCase().includes(searchTerm) ||
            incident.reporter.toLowerCase().includes(searchTerm);

        const matchesSeverity = severityValue === '' || incident.severity === parseInt(severityValue);

        let matchesStatus = true;
        if (currentStatusFilter !== 'ALL') {
            matchesStatus = incident.status === currentStatusFilter;
        }

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    filtered.sort((a, b) => {
        if (a.status !== b.status) {
            if (a.status === 'TO BE REVIEWED') return -1;
            return 1;
        }
        return b.severity - a.severity;
    });

    if (currentStatusFilter === 'ALL' && filtered.length > 20) {
        filtered = filtered.slice(0, 20);
    }

    renderTable(filtered);
    renderMapMarkers(filtered);
}

// Map Initialization
let map;
let markers = [];

function initMap() {
    if (typeof L === 'undefined') {
        console.warn('Leaflet not loaded. Map will not be available.');
        return;
    }
    map = L.map('incident-map').setView([37.7749, -122.4194], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function renderMapMarkers(data) {
    if (!map) return;

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const bounds = L.latLngBounds();

    data.forEach(incident => {
        if (!incident.location) return;
        const coords = [incident.location.lat, incident.location.lng];

        let color = '#3b82f6';
        if (incident.severity >= 4) color = '#ef4444';
        else if (incident.severity === 3) color = '#eab308';
        else color = '#10b981';

        const marker = L.circleMarker(coords, {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 8
        }).addTo(map);

        const timeStr = incident.timestamp && incident.timestamp.toDate ? incident.timestamp.toDate().toLocaleString() : 'N/A';

        marker.bindPopup(`
            <b>#${incident.id}: ${incident.type}</b><br>
            Status: ${incident.status}<br>
            Level ${incident.severity} (${getSeverityLabel(incident.severity)})<br>
            Reporter: ${incident.reporter}<br>
            Location: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}<br>
            Time: ${timeStr}
        `);

        marker.on('click', () => openModal(incident));

        markers.push(marker);
        bounds.extend(coords);
    });

    if (markers.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Modal Logic
const modal = document.getElementById('incident-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalSeverityBadge = document.getElementById('modal-criticality-badge');
const modalStatusBadge = document.getElementById('modal-status-badge');
const modalTime = document.getElementById('modal-time');
const modalAddress = document.getElementById('modal-address');
const modalReporterName = document.getElementById('modal-reporter-name');
const modalNotes = document.getElementById('modal-full-desc');

let currentIncident = null;

function openModal(incident) {
    currentIncident = incident;

    modalTitle.textContent = `Incident #${incident.id}: ${incident.type}`;
    modalDesc.textContent = incident.type;

    modalSeverityBadge.textContent = `LEVEL ${incident.severity} (${getSeverityLabel(incident.severity).toUpperCase()})`;
    modalSeverityBadge.className = `badge ${getSeverityClass(incident.severity)}`;

    modalStatusBadge.textContent = incident.status;
    modalStatusBadge.className = `badge ${getStatusClass(incident.status)}`;

    const locationStr = incident.location ? `${incident.location.lat.toFixed(5)}, ${incident.location.lng.toFixed(5)}` : 'N/A';
    modalAddress.textContent = locationStr;

    const timeStr = incident.timestamp && incident.timestamp.toDate ? incident.timestamp.toDate().toLocaleString() : 'N/A';
    modalTime.textContent = timeStr;

    modalReporterName.textContent = incident.reporter;
    modalNotes.textContent = incident.notes;

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    currentIncident = null;
}

document.querySelector('.close-modal').onclick = closeModal;
document.querySelector('.btn-close').onclick = closeModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };

// Status Buttons (optional, keep if you have them)
const statusButtons = document.querySelectorAll('.status-btn');
statusButtons.forEach(btn => {
    btn.onclick = () => {
        if (!currentIncident) return;
        let statusToSet = btn.getAttribute('data-status').toUpperCase();
        if (statusToSet === 'ACKNOWLEDGE') statusToSet = 'ACKNOWLEDGED';
        currentIncident.status = statusToSet;

        modalStatusBadge.textContent = currentIncident.status;
        modalStatusBadge.className = `badge ${getStatusClass(currentIncident.status)}`;

        filterIncidents();
        updateStats();
    };
});

// Stats update
function updateStats() {
    const total = incidents.length;
    const toBeReviewed = incidents.filter(i => i.status === 'TO BE REVIEWED').length;
    const acknowledged = incidents.filter(i => i.status === 'ACKNOWLEDGED').length;

    const statValues = document.querySelectorAll('.stat-card .stat-value');
    if (statValues.length >= 3) {
        statValues[0].textContent = total;
        statValues[1].textContent = toBeReviewed;
        statValues[2].textContent = acknowledged;
    }
}

// Initial Render
initMap();
filterIncidents();
updateStats();
