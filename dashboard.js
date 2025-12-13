const incidents = [
    {
        id: 1,
        criticality: 'CRITICAL',
        status: 'RESOLVED',
        type: 'Fire',
        reporter: 'Sarah Mitchell',
        reporterPhone: '+1 (555) 123-4567',
        reporterEmail: 'sarah.mitchell@email.com',
        location: '1234 Main Street, Downtown, CA 94102',
        gps: '37.7749° N, 122.4194° W',
        time: 'Saturday, December 13, 2025 at 08:30:00 AM',
        shortDesc: 'Building fire on 3rd floor, multiple people evacuated',
        fullDesc: 'Building fire on 3rd floor, multiple people evacuated. Fire department notified. 15 people evacuated safely. No injuries reported so far.',
        supplies: ['Fire extinguishers', 'First aid kits', 'Water'],
        agent: 'Not assigned'
    },
    {
        id: 2,
        criticality: 'HIGH',
        status: 'DISPATCHED',
        type: 'Medical Emergency',
        reporter: 'James Rodriguez',
        reporterPhone: '+1 (555) 234-5678',
        reporterEmail: 'j.rodriguez@email.com',
        location: '789 Oak Avenue, Riverside, CA 92501',
        gps: '33.9533° N, 117.3961° W',
        time: 'Saturday, December 13, 2025 at 09:15:00 AM',
        shortDesc: 'Elderly male experiencing chest pains',
        fullDesc: '75-year-old male with history of heart condition experiencing severe chest pains and shortness of breath.',
        supplies: ['Ambulance', 'Defibrillator', 'Oxygen'],
        agent: 'Paramedic Sarah Johnson'
    },
    {
        id: 3,
        criticality: 'MEDIUM',
        status: 'NOT DISPATCHED',
        type: 'Gas Leak',
        reporter: 'Emily Chen',
        reporterPhone: '+1 (555) 345-6789',
        reporterEmail: 'emily.chen@email.com',
        location: '456 Elm Street, Parkside, CA 94110',
        gps: '37.7512° N, 122.4812° W',
        time: 'Saturday, December 13, 2025 at 07:45:00 AM',
        shortDesc: 'Strong smell of gas near residential area',
        fullDesc: 'Residents reporting strong smell of gas. No visible leak source. Area cordoned off by neighbors.',
        supplies: ['Hazmat Team', 'Gas Detectors'],
        agent: 'Not assigned'
    },
    {
        id: 4,
        criticality: 'LOW',
        status: 'RESOLVED',
        type: 'Power Outage',
        reporter: 'Michael Thompson',
        reporterPhone: '+1 (555) 456-7890',
        reporterEmail: 'm.thompson@email.com',
        location: '2345 Pine Road, Hillside, CA 94131',
        gps: '37.7421° N, 122.4356° W',
        time: 'Saturday, December 13, 2025 at 06:20:00 AM',
        shortDesc: 'Street lights out on Pine Road',
        fullDesc: 'Entire block losing power. Street lights and traffic signals affected.',
        supplies: ['Maintenance Crew', 'Traffic Cones'],
        agent: 'Not assigned'
    },
    {
        id: 5,
        criticality: 'HIGH',
        status: 'NOT DISPATCHED',
        type: 'Hazardous Material Spill',
        reporter: 'Lisa Park',
        reporterPhone: '+1 (555) 567-8901',
        reporterEmail: 'lisa.p@email.com',
        location: '890 Market Street, Financial District, CA 94104',
        gps: '37.7856° N, 122.4067° W',
        time: 'Saturday, December 13, 2025 at 10:00:00 AM',
        shortDesc: 'Chemical truck overturned',
        fullDesc: 'Commercial truck carrying unknown chemicals overturned. Liquid leaking onto street. Driver conscious but trapped.',
        supplies: ['Hazmat Team', 'Fire Engine', 'Police Barrier'],
        agent: 'Not assigned'
    },
    {
        id: 6,
        criticality: 'MEDIUM',
        status: 'DISPATCHED',
        type: 'Flooding',
        reporter: 'David Kumar',
        reporterPhone: '+1 (555) 678-9012',
        reporterEmail: 'david.k@email.com',
        location: '567 Beach Boulevard, Coastside, CA 94044',
        gps: '37.6432° N, 122.4981° W',
        time: 'Saturday, December 13, 2025 at 05:30:00 AM',
        shortDesc: 'Water main break flooding intersection',
        fullDesc: 'Major water main break. Water rising rapidly. Threatening nearby basement apartments.',
        supplies: ['Water Pumps', 'Sandbags', 'Utility Crew'],
        agent: 'Officer Mike Davis'
    }
];

// Helper to get severity badge class
function getSeverityClass(severity) {
    switch (severity.toUpperCase()) {
        case 'CRITICAL': return 'badge-critical';
        case 'HIGH': return 'badge-high';
        case 'MEDIUM': return 'badge-medium';
        case 'LOW': return 'badge-low';
        default: return 'badge-low';
    }
}

// Helper to get status badge class
function getStatusClass(status) {
    switch (status.toUpperCase()) {
        case 'RESOLVED': return 'status-resolved';
        case 'DISPATCHED': return 'status-dispatched';
        case 'NOT DISPATCHED': return 'status-not-dispatched';
        default: return 'status-not-dispatched';
    }
}

// Render Table
function renderTable(data = incidents) {
    const tbody = document.getElementById('incident-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No incidents found matching your filters.</td></tr>';
        return;
    }

    data.forEach(incident => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(incident);

        let agentDisplay = incident.agent;
        if (incident.status === 'DISPATCHED') {
            agentDisplay = `<div>${incident.agent}</div><span class="badge" style="background:#dbeafe; color:#1e40af; font-size:10px;">ON THE WAY</span>`;
        } else if (incident.status === 'RESOLVED') {
            // For resolved, maybe just show name or "Resolved"
            agentDisplay = `<div>${incident.agent === 'Not assigned' ? 'Resolved' : incident.agent}</div>`;
        } else {
            agentDisplay = `<span style="color:#9ca3af">Not assigned</span>`;
        }

        tr.innerHTML = `
            <td>${incident.id}</td>
            <td><span class="badge ${getSeverityClass(incident.criticality)}">${incident.criticality}</span></td>
            <td><span class="badge ${getStatusClass(incident.status)}">${incident.status}</span></td>
            <td>${incident.type}</td>
            <td>${incident.reporter}</td>
            <td>${incident.location.substring(0, 30)}...</td>
            <td>${agentDisplay}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtering Logic
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const severityFilter = document.getElementById('severity-filter');
const navTabs = document.querySelectorAll('.nav-tab');

let currentStatusFilter = 'CURRENT';

function filterIncidents() {
    const searchTerm = searchInput.value.toLowerCase();
    const severityValue = severityFilter.value;

    const filtered = incidents.filter(incident => {
        const matchesSearch =
            incident.type.toLowerCase().includes(searchTerm) ||
            incident.location.toLowerCase().includes(searchTerm) ||
            incident.reporter.toLowerCase().includes(searchTerm) ||
            incident.agent.toLowerCase().includes(searchTerm);

        const matchesSeverity = severityValue === '' || incident.criticality === severityValue;

        let matchesStatus = true;
        if (currentStatusFilter === 'CURRENT') {
            // Show everything except RESOLVED
            matchesStatus = incident.status !== 'RESOLVED';
        } else if (currentStatusFilter !== '') {
            matchesStatus = incident.status === currentStatusFilter;
        }

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    // Sort: Dispatched items go down (appear last)
    filtered.sort((a, b) => {
        if (a.status === 'DISPATCHED' && b.status !== 'DISPATCHED') return 1;
        if (a.status !== 'DISPATCHED' && b.status === 'DISPATCHED') return -1;
        return 0;
    });

    renderTable(filtered);
}

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
const dispatchFormView = document.getElementById('dispatch-form-view');
const statusButtons = document.querySelectorAll('.status-btn');
const cancelDispatchBtn = document.getElementById('cancel-dispatch');
const confirmDispatchBtn = document.getElementById('confirm-dispatch');

// Dispatch Inputs
const dispatchNameInput = document.getElementById('dispatch-agent-name');
const dispatchBadgeInput = document.getElementById('dispatch-agent-badge');
const dispatchPhoneInput = document.getElementById('dispatch-agent-phone');
const dispatchEmailInput = document.getElementById('dispatch-agent-email');

let currentIncident = null;

function openModal(incident) {
    currentIncident = incident;

    // Populate Modal
    modalTitle.textContent = `Incident #${incident.id}: ${incident.type}`;
    modalDesc.textContent = incident.shortDesc;

    modalCriticalityBadge.textContent = `${incident.criticality} SEVERITY`;
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
    dispatchFormView.classList.add('hidden');
    buttonsView.classList.remove('hidden');

    // Clear dispatch inputs
    dispatchNameInput.value = '';
    dispatchBadgeInput.value = '';
    dispatchPhoneInput.value = '';
    dispatchEmailInput.value = '';

    statusButtons.forEach(btn => {
        btn.classList.remove('active-not-dispatched', 'active-dispatched', 'active-resolved');
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

        if (newStatus === 'Dispatched') {
            buttonsView.classList.add('hidden');
            dispatchFormView.classList.remove('hidden');
        } else {
            updateStatus(newStatus);
        }
    };
});

cancelDispatchBtn.onclick = () => {
    dispatchFormView.classList.add('hidden');
    buttonsView.classList.remove('hidden');
};

confirmDispatchBtn.onclick = () => {
    // Capture agent details
    const agentName = dispatchNameInput.value;
    if (agentName) {
        currentIncident.agent = agentName;
    } else {
        currentIncident.agent = "Assigned Agent";
    }

    updateStatus('DISPATCHED');
    dispatchFormView.classList.add('hidden');
    buttonsView.classList.remove('hidden');
};

function updateStatus(newStatus) {
    if (!currentIncident) return;

    currentIncident.status = newStatus.toUpperCase();

    if (newStatus.toUpperCase() === 'NOT DISPATCHED') {
        currentIncident.agent = 'Not assigned';
    }

    // Update Modal Badge
    modalStatusBadge.textContent = currentIncident.status;
    modalStatusBadge.className = `badge ${getStatusClass(currentIncident.status)}`;

    // Re-render Table
    filterIncidents(); // Re-render with value incase filters are active

    updateStats();
}

function updateStats() {
    const total = incidents.length;
    const notDispatched = incidents.filter(i => i.status === 'NOT DISPATCHED').length;
    const dispatched = incidents.filter(i => i.status === 'DISPATCHED').length;
    const resolved = incidents.filter(i => i.status === 'RESOLVED').length;

    // Update Text (assuming fixed order in HTML)
    const statValues = document.querySelectorAll('.stat-card .stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = total;
        statValues[1].textContent = notDispatched;
        statValues[2].textContent = dispatched;
        statValues[3].textContent = resolved;
    }
}

// Initial Render
filterIncidents();
updateStats();
