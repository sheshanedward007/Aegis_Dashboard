const incidents = [
    {
        id: 1,
        criticality: 5,
        status: 'ACKNOWLEDGED',
        type: 'Fire',
        reporter: 'Sarah Mitchell',
        reporterPhone: '+1 (555) 123-4567',
        reporterEmail: 'sarah.mitchell@email.com',
        location: '1234 Main Street, Downtown, CA 94102',
        gps: '37.7749° N, 122.4194° W',
        time: 'Saturday, December 13, 2025 at 08:30:00 AM',
        shortDesc: 'Building fire on 3rd floor, multiple people evacuated',
        fullDesc: 'Building fire on 3rd floor, multiple people evacuated. Fire department notified. 15 people evacuated safely. No injuries reported so far.',
        supplies: ['Fire extinguishers', 'First aid kits', 'Water']
    },
    {
        id: 2,
        criticality: 4,
        status: 'TO BE REVIEWED',
        type: 'Medical Emergency',
        reporter: 'James Rodriguez',
        reporterPhone: '+1 (555) 234-5678',
        reporterEmail: 'j.rodriguez@email.com',
        location: '789 Oak Avenue, Riverside, CA 92501',
        gps: '33.9533° N, 117.3961° W',
        time: 'Saturday, December 13, 2025 at 09:15:00 AM',
        shortDesc: 'Elderly male experiencing chest pains',
        fullDesc: '75-year-old male with history of heart condition experiencing severe chest pains and shortness of breath.',
        supplies: ['Ambulance', 'Defibrillator', 'Oxygen']
    },
    {
        id: 3,
        criticality: 3,
        status: 'TO BE REVIEWED',
        type: 'Gas Leak',
        reporter: 'Emily Chen',
        reporterPhone: '+1 (555) 345-6789',
        reporterEmail: 'emily.chen@email.com',
        location: '456 Elm Street, Parkside, CA 94110',
        gps: '37.7512° N, 122.4812° W',
        time: 'Saturday, December 13, 2025 at 07:45:00 AM',
        shortDesc: 'Strong smell of gas near residential area',
        fullDesc: 'Residents reporting strong smell of gas. No visible leak source. Area cordoned off by neighbors.',
        supplies: ['Hazmat Team', 'Gas Detectors']
    },
    {
        id: 4,
        criticality: 1,
        status: 'ACKNOWLEDGED',
        type: 'Power Outage',
        reporter: 'Michael Thompson',
        reporterPhone: '+1 (555) 456-7890',
        reporterEmail: 'm.thompson@email.com',
        location: '2345 Pine Road, Hillside, CA 94131',
        gps: '37.7421° N, 122.4356° W',
        time: 'Saturday, December 13, 2025 at 06:20:00 AM',
        shortDesc: 'Street lights out on Pine Road',
        fullDesc: 'Entire block losing power. Street lights and traffic signals affected.',
        supplies: ['Maintenance Crew', 'Traffic Cones']
    },
    {
        id: 5,
        criticality: 5,
        status: 'TO BE REVIEWED',
        type: 'Hazardous Material Spill',
        reporter: 'Lisa Park',
        reporterPhone: '+1 (555) 567-8901',
        reporterEmail: 'lisa.p@email.com',
        location: '890 Market Street, Financial District, CA 94104',
        gps: '37.7856° N, 122.4067° W',
        time: 'Saturday, December 13, 2025 at 10:00:00 AM',
        shortDesc: 'Chemical truck overturned',
        fullDesc: 'Commercial truck carrying unknown chemicals overturned. Liquid leaking onto street. Driver conscious but trapped.',
        supplies: ['Hazmat Team', 'Fire Engine', 'Police Barrier']
    },
    {
        id: 6,
        criticality: 2,
        status: 'TO BE REVIEWED',
        type: 'Flooding',
        reporter: 'David Kumar',
        reporterPhone: '+1 (555) 678-9012',
        reporterEmail: 'david.k@email.com',
        location: '567 Beach Boulevard, Coastside, CA 94044',
        gps: '37.6432° N, 122.4981° W',
        time: 'Saturday, December 13, 2025 at 05:30:00 AM',
        shortDesc: 'Water main break flooding intersection',
        fullDesc: 'Major water main break. Water rising rapidly. Threatening nearby basement apartments.',
        supplies: ['Water Pumps', 'Sandbags', 'Utility Crew']
    },
    { id: 7, criticality: 5, status: 'ACKNOWLEDGED', type: 'Test Incident 7', reporter: 'Test User', reporterPhone: '000', reporterEmail: 'test', location: 'Loc', gps: '0,0', time: 'Now', shortDesc: 'Test', fullDesc: 'Test', supplies: [] },
    // Fill rest with mock data
    ...Array.from({ length: 15 }, (_, i) => ({
        id: 8 + i,
        criticality: Math.floor(Math.random() * 5) + 1, // Random 1-5
        status: 'ACKNOWLEDGED',
        type: `Mock Incident ${8 + i}`,
        reporter: 'Auto User',
        reporterPhone: '',
        reporterEmail: '',
        location: 'Generated Location',
        gps: '37.7, -122.4',
        time: 'Today',
        shortDesc: 'Generated description',
        fullDesc: 'Generated full description',
        supplies: []
    }))
];

// Helper to get severity badge class
function getSeverityClass(level) {
    if (level >= 4) return 'badge-critical'; // 4, 5 -> Red
    if (level === 3) return 'badge-mid';     // 3 -> Yellow
    return 'badge-low';                      // 1, 2 -> Green
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

        tr.innerHTML = `

            <td>#${incident.id}</td>
            <td><span class="badge ${getSeverityClass(incident.criticality)}">Level ${incident.criticality} (${getSeverityLabel(incident.criticality)})</span></td>
            <td><span class="badge ${getStatusClass(incident.status)}">${incident.status}</span></td>
            <td>${incident.type}</td>
            <td>${incident.reporter}</td>
            <td>${incident.location.substring(0, 30)}...</td>
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
        const matchesSearch =
            incident.type.toLowerCase().includes(searchTerm) ||
            incident.location.toLowerCase().includes(searchTerm) ||
            incident.reporter.toLowerCase().includes(searchTerm);

        const matchesSeverity = severityValue === '' || incident.criticality === parseInt(severityValue);

        let matchesStatus = true;
        if (currentStatusFilter !== 'ALL') {
            matchesStatus = incident.status === currentStatusFilter;
        }

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    // Custom Sorting Logic
    // 1. "TO BE REVIEWED" comes before "ACKNOWLEDGED"
    // 2. Sort by Criticality: 5 (desc) to 1

    filtered.sort((a, b) => {
        // Priority 1: Status (To Be Reviewed first)
        if (a.status !== b.status) {
            if (a.status === 'TO BE REVIEWED') return -1;
            return 1;
        }

        // Priority 2: Criticality (High to Low)
        return b.criticality - a.criticality;
    });

    // Limit to 20 items if filtering ALL to reduce data clutter.
    // Logic: Since the list is sorted with 'TO BE REVIEWED' at the top, limiting to 20 
    // effectively "moves" excess 'ACKNOWLEDGED' items (at the bottom) to the 'ACKNOWLEDGED' tab only.
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
    // Default to San Francisco
    map = L.map('incident-map').setView([37.7749, -122.4194], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function parseGps(gpsString) {
    // Expected format: "37.7749° N, 122.4194° W" or "37.7749, -122.4194"
    try {
        if (!gpsString) return null;

        // Remove ° N W E S and spaces
        const cleanStr = gpsString.replace(/[°NSEW]/g, '');
        const parts = cleanStr.split(',');

        if (parts.length !== 2) return null;

        let lat = parseFloat(parts[0]);
        let lng = parseFloat(parts[1]);

        // Handle Direction if simple parsing didn't account for negatives based on W/S
        if (gpsString.includes('S')) lat = -Math.abs(lat);
        if (gpsString.includes('W')) lng = -Math.abs(lng);

        if (isNaN(lat) || isNaN(lng)) return null;

        return [lat, lng];
    } catch (e) {
        console.error("GPS Parse Error", e);
        return null;
    }
}

function renderMapMarkers(data) {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const bounds = L.latLngBounds();

    data.forEach(incident => {
        const coords = parseGps(incident.gps);
        if (coords) {
            // Determine marker color based on criticality (simple circle marker)
            let color = '#3b82f6'; // Low (Blue -> Green in CSS, but here hardcoded color)
            // Let's match CSS colors closer
            // 1-2: Green, 3: Yellow, 4-5: Red
            if (incident.criticality >= 4) color = '#ef4444'; // Red
            else if (incident.criticality === 3) color = '#eab308'; // Yellow
            else color = '#10b981'; // Green

            const marker = L.circleMarker(coords, {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 8
            }).addTo(map);

            marker.bindPopup(`
                <b>#${incident.id}: ${incident.type}</b><br>
                Status: ${incident.status}<br>
                Level ${incident.criticality} (${getSeverityLabel(incident.criticality)})<br>
                ${incident.location}
            `);

            marker.on('click', () => openModal(incident));

            markers.push(marker);
            bounds.extend(coords);
        }
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// View Toggle Logic
const btnViewList = document.getElementById('btn-view-list');
const btnViewMap = document.getElementById('btn-view-map');
const tableView = document.getElementById('table-view');
const mapView = document.getElementById('incident-map');

function switchView(view) {
    if (view === 'LIST') {
        tableView.classList.remove('hidden');
        mapView.classList.add('hidden');
        btnViewList.classList.add('active');
        btnViewMap.classList.remove('active');
    } else {
        tableView.classList.add('hidden');
        mapView.classList.remove('hidden');
        btnViewList.classList.remove('active');
        btnViewMap.classList.add('active');

        // Invalidate size to ensure map renders correctly after being hidden
        if (map) map.invalidateSize();
    }
}

btnViewList.addEventListener('click', () => switchView('LIST'));
btnViewMap.addEventListener('click', () => switchView('MAP'));

// Event Listeners for Filters
searchBtn.addEventListener('click', filterIncidents);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterIncidents();
});
severityFilter.addEventListener('change', filterIncidents);

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
const modalCriticalityBadge = document.getElementById('modal-criticality-badge');
const modalStatusBadge = document.getElementById('modal-status-badge');
const modalTime = document.getElementById('modal-time');
const modalAddress = document.getElementById('modal-address');
const modalGps = document.getElementById('modal-gps');
const modalReporterName = document.getElementById('modal-reporter-name');
const modalReporterPhone = document.getElementById('modal-reporter-phone');
const modalReporterEmail = document.getElementById('modal-reporter-email');
const modalType = document.getElementById('modal-type');
const modalSupplies = document.getElementById('modal-supplies');
const modalFullDesc = document.getElementById('modal-full-desc');

// Status Management Logic
const buttonsView = document.getElementById('status-buttons-view');
const statusButtons = document.querySelectorAll('.status-btn');

let currentIncident = null;

function openModal(incident) {
    currentIncident = incident;

    // Populate Modal
    modalTitle.textContent = `Incident #${incident.id}: ${incident.type}`;
    modalDesc.textContent = incident.shortDesc;

    modalCriticalityBadge.textContent = `LEVEL ${incident.criticality} (${getSeverityLabel(incident.criticality).toUpperCase()})`;
    modalCriticalityBadge.className = `badge ${getSeverityClass(incident.criticality)}`;

    modalStatusBadge.textContent = incident.status;
    modalStatusBadge.className = `badge ${getStatusClass(incident.status)}`;

    modalTime.textContent = incident.time;
    modalAddress.textContent = incident.location;
    modalGps.textContent = incident.gps;
    modalReporterName.textContent = incident.reporter;
    modalReporterPhone.textContent = incident.reporterPhone;
    modalReporterEmail.textContent = incident.reporterEmail;
    modalType.textContent = incident.type;
    modalFullDesc.textContent = incident.fullDesc;

    // Supplies
    modalSupplies.innerHTML = incident.supplies.map(supply => `
        <div class="supply-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            ${supply}
        </div>
    `).join('');

    // Reset Status Views
    resetStatusView(incident.status);

    modal.classList.remove('hidden');
}

function resetStatusView(status) {
    // Reset buttons
    statusButtons.forEach(btn => {
        btn.classList.remove('active-to-be-reviewed', 'active-acknowledged');
        const btnStatus = btn.getAttribute('data-status');
        if (btnStatus.toUpperCase() === status.toUpperCase()) {
            // Activate the correct button styling
            if (status === 'ACKNOWLEDGED') btn.classList.add('active-acknowledged');
            else if (status === 'TO BE REVIEWED') btn.classList.add('active-to-be-reviewed');
        }
    });
}

// Close Modal
function closeModal() {
    modal.classList.add('hidden');
    currentIncident = null;
}

document.querySelector('.close-modal').onclick = closeModal;
document.querySelector('.btn-close').onclick = closeModal;

// Close on background click
modal.onclick = (e) => {
    if (e.target === modal) closeModal();
};

// Button Handlers
statusButtons.forEach(btn => {
    btn.onclick = () => {
        const newStatus = btn.getAttribute('data-status');
        updateStatus(newStatus);
    };
});

function updateStatus(newStatus) {
    if (!currentIncident) return;

    // Convert button text "Acknowledge" to status "ACKNOWLEDGED" if needed
    let statusToSet = newStatus.toUpperCase();
    if (statusToSet === 'ACKNOWLEDGE') statusToSet = 'ACKNOWLEDGED';

    currentIncident.status = statusToSet;

    // Update Modal Badge
    modalStatusBadge.textContent = currentIncident.status;
    modalStatusBadge.className = `badge ${getStatusClass(currentIncident.status)}`;

    // Update Active Button State
    resetStatusView(currentIncident.status);

    // Re-render Table
    filterIncidents(); // Re-render with sorting and filtering

    updateStats();
}

function updateStats() {
    const total = incidents.length;
    const toBeReviewed = incidents.filter(i => i.status === 'TO BE REVIEWED').length;
    const acknowledged = incidents.filter(i => i.status === 'ACKNOWLEDGED').length;

    // Update Text (assuming fixed order in HTML)
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
