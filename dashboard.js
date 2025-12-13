// dashboard.js

let incidents = [];

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmxz5b598PlSbUyKbh4VwHvRpAxltqcFA",
    authDomain: "project-aegis-845e6.firebaseapp.com",
    projectId: "project-aegis-845e6",
    storageBucket: "project-aegis-845e6.firebasestorage.app",
    messagingSenderId: "851940559314",
    appId: "1:851940559314:web:a2d93e9d366577855a200b"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

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
            severity: parseInt(data.severity) || 3,
            status: data.status || "TO BE REVIEWED",
            reporter: data.reporter || "Anonymous",
            location: data.location ? {
                lat: data.location.latitude || data.location.lat,
                lng: data.location.longitude || data.location.lng
            } : null,
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
    if (!status) return 'status-to-be-reviewed';
    switch (status.toUpperCase()) {
        case 'ACKNOWLEDGED': return 'status-acknowledged';
        case 'TO BE REVIEWED':
        case 'PENDING': return 'status-to-be-reviewed';
        default: return 'status-to-be-reviewed';
    }
}

// Helper to format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    // Firestore Timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString();
    }
    // JS Date object
    if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
    }
    // Number (Epoch) or String (ISO)
    if (typeof timestamp === 'number' || typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }
    }
    return 'N/A';
}

// Render Table
function renderTable(data = incidents) {
    const tbody = document.getElementById('incident-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No incidents found matching your filters.</td></tr>';
        return;
    }

    data.forEach(incident => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(incident);

        // Format location for display
        const locationStr = incident.location ? `${incident.location.lat.toFixed(5)}, ${incident.location.lng.toFixed(5)}` : 'N/A';

        // Format timestamp for display
        // Format timestamp for display
        const timeStr = formatTimestamp(incident.timestamp);

        // Normalize Status Display
        let displayStatus = incident.status;
        if (displayStatus && displayStatus.toUpperCase() === 'PENDING') {
            displayStatus = 'TO BE REVIEWED';
        }

        tr.innerHTML = `
            <td>#${incident.id}</td>
            <td><span class="badge ${getSeverityClass(incident.severity)}">Level ${incident.severity} (${getSeverityLabel(incident.severity)})</span></td>
            <td><span class="badge ${getStatusClass(incident.status)}">${displayStatus}</span></td>
            <td>${incident.type}</td>
            <td>${incident.reporter}</td>
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
        const lowerType = (incident.type || "").toLowerCase();
        const lowerReporter = (incident.reporter || "").toLowerCase();

        const matchesSearch =
            lowerType.includes(searchTerm) ||
            locationStr.toLowerCase().includes(searchTerm) ||
            lowerReporter.includes(searchTerm);

        const matchesSeverity = severityValue === '' || incident.severity === parseInt(severityValue);

        let matchesStatus = true;
        if (currentStatusFilter !== 'ALL') {
            if (currentStatusFilter === 'TO BE REVIEWED') {
                // Show both 'TO BE REVIEWED' and 'PENDING' in this tab (case-insensitive)
                const statusUpper = incident.status ? incident.status.toUpperCase() : '';
                matchesStatus = statusUpper === 'TO BE REVIEWED' || statusUpper === 'PENDING';
            } else {
                matchesStatus = incident.status ? incident.status.toUpperCase() === currentStatusFilter : false;
            }
        }

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    filtered.sort((a, b) => {
        const statusA = (a.status || "").toUpperCase();
        const statusB = (b.status || "").toUpperCase();
        const isAckA = statusA === 'ACKNOWLEDGED';
        const isAckB = statusB === 'ACKNOWLEDGED';

        if (isAckA && !isAckB) return 1; // A should be below B
        if (!isAckA && isAckB) return -1; // A should be above B

        // Secondary Sort: Severity (5 to 1)
        return (b.severity || 0) - (a.severity || 0);
    });

    if (currentStatusFilter === 'ALL' && filtered.length > 15) {
        filtered = filtered.slice(0, 15);
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
    // SRI LANKA Coordinates: 7.8731° N, 80.7718° E
    map = L.map('incident-map').setView([7.8731, 80.7718], 8);

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

        const lat = parseFloat(incident.location.lat);
        const lng = parseFloat(incident.location.lng);

        if (isNaN(lat) || isNaN(lng)) return;

        const coords = [lat, lng];

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

        const timeStr = formatTimestamp(incident.timestamp);

        marker.bindPopup(`
            <b>#${incident.id}: ${incident.type}</b><br>
            Status: ${incident.status}<br>
            Level ${incident.severity} (${getSeverityLabel(incident.severity)})<br>
            Reporter: ${incident.reporter}<br>
            Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>
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

// Event Listeners for Filters
if (searchBtn) searchBtn.addEventListener('click', filterIncidents);
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterIncidents();
    });
}
if (severityFilter) severityFilter.addEventListener('change', filterIncidents);

// Tab Navigation Logic
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        navTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        // Update filter
        currentStatusFilter = tab.getAttribute('data-tab');
        filterIncidents();
    });
});

// Modal Logic
const modal = document.getElementById('incident-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalSeverityBadge = document.getElementById('modal-criticality-badge');
const modalStatusBadge = document.getElementById('modal-status-badge');
const modalTime = document.getElementById('modal-time');
const modalReporterName = document.getElementById('modal-reporter-name');
const modalNotes = document.getElementById('modal-full-desc');

let currentIncident = null;

function openModal(incident) {
    currentIncident = incident;

    modalTitle.textContent = `Incident #${incident.id}: ${incident.type}`;
    modalDesc.textContent = incident.type;

    modalSeverityBadge.textContent = `LEVEL ${incident.severity} (${getSeverityLabel(incident.severity).toUpperCase()})`;
    modalSeverityBadge.className = `badge ${getSeverityClass(incident.severity)}`;

    let displayStatus = incident.status;
    if (displayStatus && displayStatus.toUpperCase() === 'PENDING') {
        displayStatus = 'TO BE REVIEWED';
    }
    modalStatusBadge.textContent = displayStatus;
    modalStatusBadge.className = `badge ${getStatusClass(incident.status)}`;

    const timeStr = formatTimestamp(incident.timestamp);
    modalTime.textContent = timeStr;

    modalReporterName.textContent = incident.reporter;
    modalNotes.textContent = incident.notes;

    modal.classList.remove('hidden');

    // Initialize/Update Modal Map (Iframe)
    const mapFrame = document.getElementById('modal-map-frame');
    if (incident.location && mapFrame) {
        // Calculate BBOX for embed
        // roughly 0.01 degrees delta for zoom level ~15
        const lat = parseFloat(incident.location.lat);
        const lng = parseFloat(incident.location.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            const delta = 0.005; // Adjust zoom level
            const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
            const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
            mapFrame.src = src;
        } else {
            mapFrame.src = "about:blank";
        }
    } else if (mapFrame) {
        mapFrame.src = "about:blank";
    }
}

function closeModal() {
    modal.classList.add('hidden');
    // Clear iframe to stop loading
    const mapFrame = document.getElementById('modal-map-frame');
    if (mapFrame) {
        mapFrame.src = "";
    }
    currentIncident = null;
}

document.querySelector('.close-modal').onclick = closeModal;
document.querySelector('.btn-close').onclick = closeModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };

// Status Buttons
const statusButtons = document.querySelectorAll('.status-btn');
statusButtons.forEach(btn => {
    btn.onclick = () => {
        if (!currentIncident) return;
        let statusToSet = btn.getAttribute('data-status').toUpperCase();
        if (statusToSet === 'ACKNOWLEDGE') statusToSet = 'ACKNOWLEDGED';

        // Optimistic UI update
        const oldStatus = currentIncident.status;
        currentIncident.status = statusToSet;

        modalStatusBadge.textContent = currentIncident.status;
        modalStatusBadge.className = `badge ${getStatusClass(currentIncident.status)}`;

        // Firestore Update
        reportsRef.doc(currentIncident.id).update({
            status: statusToSet
        }).then(() => {
            console.log("Status updated successfully!");
            // Re-render handled by onSnapshot listener automatically
        }).catch((error) => {
            console.error("Error updating status: ", error);
            // Revert on error
            currentIncident.status = oldStatus;
            alert("Failed to update status. Please try again.");
            modalStatusBadge.textContent = currentIncident.status;
            modalStatusBadge.className = `badge ${getStatusClass(currentIncident.status)}`;
        });
    };
});

// Stats update
function updateStats() {
    const total = incidents.length;
    const toBeReviewed = incidents.filter(i => {
        const s = i.status ? i.status.toUpperCase() : '';
        return s === 'TO BE REVIEWED' || s === 'PENDING';
    }).length;
    const acknowledged = incidents.filter(i => {
        const s = i.status ? i.status.toUpperCase() : '';
        return s === 'ACKNOWLEDGED';
    }).length;

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
