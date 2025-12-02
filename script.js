// Your exact JavaScript + Real Backend Integration
const API_BASE = 'http://localhost:5000/api';

let globalEvents = [];
let currentUserRole = null;
let currentUserId = null;

// Fetch events from real backend
async function fetchEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    globalEvents = await response.json();
    renderStudentEvents();
    renderOrganizerEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

// Real Login with Backend
async function login(collegeId, password, role) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collegeId, password, role })
    });
    
    const data = await response.json();
    if (data.success) {
      currentUserId = data.userId;
      currentUserRole = role;
      showDashboard(role);
      return true;
    } else {
      alert('❌ Invalid credentials');
      return false;
    }
  } catch (error) {
    alert('❌ Server error. Try again.');
  }
}

// Real Event Creation
async function createEvent(eventData) {
  try {
    const formData = new FormData();
    formData.append('name', eventData.name);
    formData.append('date', eventData.date);
    formData.append('location', eventData.location);
    formData.append('description', eventData.desc);
    if (eventData.image) formData.append('image', eventData.image);

    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.ok) {
      fetchEvents(); // Refresh list
      alert('✅ Event created!');
    }
  } catch (error) {
    alert('❌ Failed to create event');
  }
}

// Initialize with real data
fetchEvents();
