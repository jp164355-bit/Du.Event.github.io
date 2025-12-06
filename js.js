// API Configuration
const API_BASE = 'http://localhost:8080/api';
let globalEvents = [];
let currentUserRole = null;
let currentRegisterEvent = null;
let currentUserId = null;

// DOM Elements (same as original)
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const organizerSection = document.getElementById('organizer-section');
const registrationSection = document.getElementById('registration-section');
const helpCenterSection = document.getElementById('help-center');
const loginForm = document.getElementById('loginForm');
const userRoleDisp = document.getElementById('userRoleDisp');
const fixedLogoutBtn = document.getElementById('fixedLogout');
const eventsContainer = document.getElementById('eventsContainer');
const eventList = document.getElementById('event-list');
const registrationForm = document.getElementById('registrationForm');

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        };
        if (data) config.data = data;
        if (currentUserId) config.headers['X-User-ID'] = currentUserId;
        
        const response = await axios(`${API_BASE}${endpoint}`, config);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        alert(`❌ Network error: ${error.response?.data?.message || error.message}`);
        throw error;
    }
}

// Load Events from Backend
async function loadEvents() {
    try {
        globalEvents = await apiCall('/events');
        if (currentUserRole === 'Student') renderStudentEvents();
        if (currentUserRole === 'Organizer') renderOrganizerEvents();
    } catch (error) {
        alert('Failed to load events. Using demo data.');
        // Fallback to demo data
        globalEvents = [
            {id: 1, name: '🎉 Annual Cultural Fest', date: '2025-12-15', location: 'North Campus', desc: '...', mapLink: '...'}
        ];
    }
}

// LOGIN (Enhanced with Backend)
function startLogin(role) {
    document.getElementById('roleField').value = role;
    loginForm.style.display = 'block';
    document.getElementById('collegeIdField').focus();
}

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const role = document.getElementById('roleField').value;
    const collegeId = document.getElementById('collegeIdField').value.trim();
    
    if (!/^SOL[0-9]{8}$/.test(collegeId)) {
        alert('❌ Invalid College ID! Format: SOLXXXXXXXX');
        return;
    }
    
    try {
        // Backend login
        const user = await apiCall(`/login`, 'POST', { collegeId, role });
        currentUserId = user.id;
        currentUserRole = role;
        
        loginSection.style.display = 'none';
        fixedLogoutBtn.style.display = 'block';
        userRoleDisp.innerHTML = `Logged in as: <strong>${role}</strong> (ID: ${collegeId})`;
        
        await loadEvents(); // Load real events from DB
        
        if (role === 'Student') showStudentDashboard();
        else showOrganizerDashboard();
    } catch (error) {
        alert('❌ Login failed. Check credentials or contact admin.');
    }
});

// STUDENT DASHBOARD (Same UI, Backend Data)
async function showStudentDashboard() {
    registrationSection.style.display = 'none';
    organizerSection.style.display = 'none';
    helpCenterSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    await renderStudentEvents();
}

function renderStudentEvents() {
    eventList.innerHTML = '';
    if (globalEvents.length === 0) {
        eventList.innerHTML = '<div style="text-align:center; padding:40px; color:#6c757d;"><h3>📭 No Upcoming Events</h3></div>';
        return;
    }
    
    globalEvents.forEach((ev, idx) => {
        const div = document.createElement('div');
        div.className = 'event-card';
        div.innerHTML = `
            <img src="${ev.image_data || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587206?w=300'}" class="event-icon" />
            <div class="event-info">
                <div class="event-title">${ev.name}</div>
                <div class="event-desc">${ev.description}</div>
                <div class="event-meta">
                    <span>📅 ${new Date(ev.date).toLocaleDateString('en-IN')}</span>
                    <span>📍 ${ev.location}</span>
                </div>
                <div>
                    <a href="${ev.map_link}" target="_blank" class="map-link">🗺️ View Map</a>
                    <button class="register-btn" onclick="openRegistrationForm(${ev.id})">📝 Register</button>
                </div>
            </div>
        `;
        eventList.appendChild(div);
    });
}

// REGISTRATION (Backend Storage)
async function openRegistrationForm(eventId) {
    currentRegisterEvent = eventId;
    dashboardSection.style.display = 'none';
    registrationSection.style.display = 'block';
}

registrationForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const idCardFile = document.getElementById('idCard').files[0];
    
    if (!idCardFile) {
        alert('❌ Upload ID card photo');
        return;
    }

    const formData = {
        event_id: currentRegisterEvent,
        student_name: document.getElementById('studentName').value,
        roll_number: document.getElementById('rollNumber').value,
        phone: document.getElementById('phoneNumber').value,
        email: document.getElementById('emailAddress').value,
        student_year: document.getElementById('studentYear').value,
        user_id: currentUserId
    };

    try {
        // Upload ID photo and register
        const result = await apiCall('/register', 'POST', formData);
        alert(`🎉 Registered! Confirmation: ${result.confirmation_id}`);
        showStudentDashboard();
    } catch (error) {
        alert('❌ Registration failed');
    }
});

// ORGANIZER FUNCTIONS (Backend CRUD)
async function showOrganizerDashboard() {
    dashboardSection.style.display = 'none';
    registrationSection.style.display = 'none';
    helpCenterSection.style.display = 'none';
    organizerSection.style.display = 'block';
    await renderOrganizerEvents();
}

async function renderOrganizerEvents() {
    // Show registration counts from backend
    const eventsWithStats = await apiCall('/events/stats');
    // Render similar to student view but with delete buttons and stats
}

document.getElementById('eventForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDesc').value,
        user_id: currentUserId
    };

    try {
        await apiCall('/events', 'POST', formData);
        alert('✅ Event created!');
        this.reset();
        await loadEvents();
    } catch (error) {
        alert('❌ Failed to create event');
    }
});

// Logout (same as original)
fixedLogoutBtn.onclick = () => {
    if (confirm('🚪 Logout?')) logout();
};

function logout() {
    currentUserRole = null;
    currentUserId = null;
    // Reset all sections to login
}

// Help Center & Chatbot (same as original - client-side only)
// ... (copy all help/chatbot functions from original)

fixedLogoutBtn.style.display = 'none';
