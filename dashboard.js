// dashboard.js

let incidents = [];

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmxz5b598PlSbUyKbh4VwHvRpAxltqcFA",
    authDomain: "project-aegis-845e6.firebaseapp.com",
    projectId: "project-aegis-845e6",
    storageBucket: "project-aegis-845e6.appspot.com",
    messagingSenderId: "851940559314",
    appId: "1:851940559314:web:a2d93e9d366577855a200b"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const reportsRef = db.collection("reports");

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
            notes: data.notes || "",
            notes: data.notes || "",
            image: data.image || null, // Base64 image
            archived: data.archived || false
        });
    });
    filterIncidents();
    updateStats();
});

// Severity helpers
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

function getStatusClass(status) {
    if (!status) return 'status-to-be-reviewed';
    return status.toUpperCase() === 'ACKNOWLEDGED'
        ? 'status-acknowledged'
        : 'status-to-be-reviewed';
}

// Timestamp formatter
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
}

// Render table
function renderTable(data = incidents) {
    const tbody = document.getElementById('incident-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No incidents found</td></tr>';
        return;
    }

    data.forEach(incident => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(incident);

        let displayStatus = incident.status;
        if (displayStatus.toUpperCase() === 'PENDING') {
            displayStatus = 'TO BE REVIEWED';
        }

        tr.innerHTML = `
            <td>#${incident.id}</td>
            <td><span class="badge ${getSeverityClass(incident.severity)}">
                Level ${incident.severity} (${getSeverityLabel(incident.severity)})
            </span></td>
            <td><span class="badge ${getStatusClass(incident.status)}">${displayStatus}</span></td>
            <td>${incident.type}</td>
            <td>${incident.reporter}</td>
            <td onclick="event.stopPropagation()">
                ${incident.status.toUpperCase() === 'ACKNOWLEDGED' ? `
                <button class="btn-icon-delete" onclick="archiveIncident('${incident.id}')" title="Archive Incident">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtering
const searchInput = document.getElementById('search-input');
const severityFilter = document.getElementById('severity-filter');
const navTabs = document.querySelectorAll('.nav-tab');

let currentStatusFilter = 'ALL';

function filterIncidents() {
    const term = searchInput.value.toLowerCase();
    const sev = severityFilter.value;

    let filtered = incidents.filter(i => {
        const matchesSearch =
            (i.type || '').toLowerCase().includes(term) ||
            (i.reporter || '').toLowerCase().includes(term);

        const matchesSeverity = !sev || i.severity === parseInt(sev);

        let matchesStatus = true;

        // Soft Delete Logic:
        // If viewing ALL, exclude archived items
        if (currentStatusFilter === 'ALL') {
            if (i.archived) return false;
        } else if (currentStatusFilter === 'ACKNOWLEDGED') {
            // Include archived items in ACKNOWLEDGED tab? User said: "it should still be visible in the acknowladged tab"
            // So we don't filter out archived here.

            const s = i.status.toUpperCase();
            matchesStatus = s === currentStatusFilter;
        } else {
            // For other statuses (TO BE REVIEWED), we probably shouldn't show archived ones if they somehow got there,
            // but usually only acknowledged ones are archived. 
            // Let's assume archived items shouldn't show up in pending/review if they were somehow archived.
            if (i.archived) return false;

            const s = i.status.toUpperCase();
            matchesStatus = currentStatusFilter === 'TO BE REVIEWED'
                ? s === 'TO BE REVIEWED' || s === 'PENDING'
                : s === currentStatusFilter;
        }

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    filtered.sort((a, b) => {
        const isAckA = a.status.toUpperCase() === 'ACKNOWLEDGED';
        const isAckB = b.status.toUpperCase() === 'ACKNOWLEDGED';

        if (isAckA !== isAckB) {
            return isAckA ? 1 : -1; // Non-Acknowledged first
        }
        return b.severity - a.severity; // Then by severity
    });

    renderTable(filtered);
    renderMapMarkers(filtered);
}

// Map
let map;
let markers = [];

function initMap() {
    map = L.map('incident-map').setView([7.8731, 80.7718], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

function renderMapMarkers(data) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.forEach(i => {
        if (!i.location) return;

        const marker = L.circleMarker([i.location.lat, i.location.lng], {
            radius: 8,
            fillOpacity: 0.7
        }).addTo(map);

        marker.on('click', () => openModal(i));
        markers.push(marker);
    });
}

// Modal
const modal = document.getElementById('incident-modal');
const modalTitle = document.getElementById('modal-title');
const modalSeverityBadge = document.getElementById('modal-criticality-badge');
const modalStatusBadge = document.getElementById('modal-status-badge');
const modalTime = document.getElementById('modal-time');
const modalReporterName = document.getElementById('modal-reporter-name');
const modalNotes = document.getElementById('modal-full-desc');

function openModal(incident) {
    modalTitle.textContent = `Incident #${incident.id}: ${incident.type}`;
    modalSeverityBadge.textContent = `LEVEL ${incident.severity}`;
    modalSeverityBadge.className = `badge ${getSeverityClass(incident.severity)}`;

    modalStatusBadge.textContent = incident.status;
    modalStatusBadge.className = `badge ${getStatusClass(incident.status)}`;

    modalTime.textContent = formatTimestamp(incident.timestamp);
    modalReporterName.textContent = incident.reporter;
    modalNotes.textContent = incident.notes;

    // IMAGE HANDLING (FIXED)
    const imageContainer = document.getElementById('modal-image-container');
    const img = document.getElementById('modal-incident-image');
    const noImg = document.getElementById('modal-no-image');

    if (incident.image && incident.image.startsWith('data:image')) {
        img.src = incident.image;
        imageContainer.style.display = 'block';
        noImg.style.display = 'none';
    } else {
        imageContainer.style.display = 'none';
        noImg.style.display = 'block';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

document.querySelector('.close-modal').onclick = closeModal;
document.querySelector('.btn-close').onclick = closeModal;

// Stats
function updateStats() {
    const total = incidents.length;
    const pending = incidents.filter(i =>
        i.status.toUpperCase() !== 'ACKNOWLEDGED'
    ).length;
    const ack = incidents.filter(i =>
        i.status.toUpperCase() === 'ACKNOWLEDGED'
    ).length;

    const stats = document.querySelectorAll('.stat-value');
    stats[0].textContent = total;
    stats[1].textContent = pending;
    stats[2].textContent = ack;
}

// Init
initMap();
filterIncidents();

// Archive Incident
function archiveIncident(id) {
    if (!confirm('Are you sure you want to remove this incident from the main view? It will still be visible in the Acknowledged tab.')) return;

    db.collection("reports").doc(id).update({
        archived: true
    }).then(() => {
        console.log("Incident archived successfully");
        // Snapshot listener will update UI
    }).catch((error) => {
        console.error("Error archiving incident: ", error);
        alert("Error archiving incident");
    });
}

