// Data storage
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        updateDashboard();
        renderPatients();
        renderAppointments();
        renderReminders();
        updatePatientDropdown();
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').min = today;

        // Form event listeners
        document.getElementById('patientForm').addEventListener('submit', addPatient);
        document.getElementById('appointmentForm').addEventListener('submit', addAppointment);

        // Auto-check for reminders every minute
        setInterval(checkAndCreateReminders, 60000);
        checkAndCreateReminders();

        // Load demo data if empty
        if (patients.length === 0 && appointments.length === 0) {
            setTimeout(() => {
                if (confirm('🚀 Would you like to load some demo data to explore the features?')) {
                    loadDemoData();
                }
            }, 2000);
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Add auto-save indication
        setInterval(updateLastSaved, 30000);
    }, 300);
});

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                switchTabByName('dashboard');
                break;
            case '2':
                e.preventDefault();
                switchTabByName('patients');
                break;
            case '3':
                e.preventDefault();
                switchTabByName('appointments');
                break;
            case '4':
                e.preventDefault();
                switchTabByName('reminders');
                break;
        }
    }
}

// Enhanced tab switching with animations
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
    });
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    const targetContent = document.getElementById(tabName);
    
    setTimeout(() => {
        targetContent.classList.add('active');
        targetContent.style.opacity = '1';
        targetContent.style.transform = 'translateY(0)';
    }, 150);

    // Add ripple effect
    createRippleEffect(event.target, event);
}

function switchTabByName(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Find and activate the correct tab
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach((button, index) => {
        const tabNames = ['dashboard', 'patients', 'appointments', 'reminders'];
        if (tabNames[index] === tabName) {
            button.classList.add('active');
        }
    });
    
    document.getElementById(tabName).classList.add('active');
}

// Ripple effect for buttons
function createRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add CSS animation for ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced patient management with animations
function addPatient(e) {
    e.preventDefault();
    
    // Add loading state to button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Saving...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const patient = {
            id: Date.now(),
            name: document.getElementById('patientName').value,
            phone: document.getElementById('patientPhone').value,
            email: document.getElementById('patientEmail').value,
            age: document.getElementById('patientAge').value,
            condition: document.getElementById('patientCondition').value,
            createdAt: new Date().toISOString()
        };

        patients.push(patient);
        saveData();
        renderPatients();
        updatePatientDropdown();
        updateDashboard();
        cancelAddPatient();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        showNotification(`✅ Patient "${patient.name}" added successfully!`, 'success');
    }, 800);
}

function renderPatients() {
    const container = document.getElementById('patientsList');
    
    if (patients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4em; margin-bottom: 20px; animation: bounce 2s infinite;">👥</div>
                <h3>No patients found</h3>
                <p>Add your first patient to get started with the system</p>
            </div>
        `;
        return;
    }

    container.innerHTML = patients.map((patient, index) => `
        <div class="patient-card" style="animation: slideInUp 0.5s ease-out ${index * 0.1}s both;">
            <div class="patient-info">
                <div>
                    <div class="patient-name">👤 ${patient.name}</div>
                    <div class="patient-details">
                        📞 ${patient.phone} ${patient.email ? `| 📧 ${patient.email}` : ''}
                        ${patient.age ? `| 🎂 Age: ${patient.age}` : ''}
                    </div>
                    ${patient.condition ? `<div class="patient-details">🏥 Condition: ${patient.condition}</div>` : ''}
                    <div class="patient-details" style="font-size: 0.85em; opacity: 0.7;">
                        ➕ Added: ${formatDateTime(patient.createdAt)}
                    </div>
                </div>
                <div class="patient-actions">
                    <button class="btn btn-secondary" onclick="editPatient(${patient.id})" title="Edit Patient">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deletePatient(${patient.id})" title="Delete Patient">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add CSS animation
    addSlideInAnimation();
}

function addSlideInAnimation() {
    if (!document.getElementById('slideInAnimation')) {
        const animationStyle = document.createElement('style');
        animationStyle.id = 'slideInAnimation';
        animationStyle.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0,0,0);
                }
                40%, 43% {
                    transform: translate3d(0, -15px, 0);
                }
                70% {
                    transform: translate3d(0, -7px, 0);
                }
                90% {
                    transform: translate3d(0, -2px, 0);
                }
            }
        `;
        document.head.appendChild(animationStyle);
    }
}

function deletePatient(id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;
    
    // Enhanced confirmation dialog
    if (confirm(`🚨 Are you sure you want to delete "${patient.name}"?\n\nThis will also delete all their appointments and reminders.\n\nThis action cannot be undone.`)) {
        // Add deletion animation
        const patientCard = event.target.closest('.patient-card');
        patientCard.style.transform = 'scale(0.8)';
        patientCard.style.opacity = '0.5';
        patientCard.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            patients = patients.filter(p => p.id !== id);
            appointments = appointments.filter(a => a.patientId !== id);
            reminders = reminders.filter(r => r.patientId !== id);
            saveData();
            renderPatients();
            renderAppointments();
            renderReminders();
            updatePatientDropdown();
            updateDashboard();
            showNotification(`🗑️ Patient "${patient.name}" deleted successfully!`, 'success');
        }, 300);
    }
}

function editPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    // Populate form with patient data
    document.getElementById('patientName').value = patient.name;
    document.getElementById('patientPhone').value = patient.phone;
    document.getElementById('patientEmail').value = patient.email || '';
    document.getElementById('patientAge').value = patient.age || '';
    document.getElementById('patientCondition').value = patient.condition || '';

    // Show form
    showAddPatientForm();

    // Update form submission to edit instead of add
    const form = document.getElementById('patientForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Update patient data
        patient.name = document.getElementById('patientName').value;
        patient.phone = document.getElementById('patientPhone').value;
        patient.email = document.getElementById('patientEmail').value;
        patient.age = document.getElementById('patientAge').value;
        patient.condition = document.getElementById('patientCondition').value;

        saveData();
        renderPatients();
        updatePatientDropdown();
        updateDashboard();
        cancelAddPatient();
        showNotification('Patient updated successfully!');

        // Restore original form submission
        form.onsubmit = addPatient;
    };
}

function searchPatients() {
    const query = document.getElementById('patientSearch').value.toLowerCase();
    const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(query) ||
        patient.phone.includes(query) ||
        (patient.email && patient.email.toLowerCase().includes(query))
    );
    
    renderFilteredPatients(filtered);
}

function renderFilteredPatients(filtered) {
    const container = document.getElementById('patientsList');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No patients found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(patient => `
        <div class="patient-card">
            <div class="patient-info">
                <div>
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-details">
                        📞 ${patient.phone} ${patient.email ? `| 📧 ${patient.email}` : ''}
                        ${patient.age ? `| Age: ${patient.age}` : ''}
                    </div>
                    ${patient.condition ? `<div class="patient-details">Condition: ${patient.condition}</div>` : ''}
                </div>
                <div class="patient-actions">
                    <button class="btn btn-secondary" onclick="editPatient(${patient.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Appointment management
function addAppointment(e) {
    e.preventDefault();
    
    const appointment = {
        id: Date.now(),
        patientId: parseInt(document.getElementById('appointmentPatient').value),
        type: document.getElementById('appointmentType').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        notes: document.getElementById('appointmentNotes').value,
        reminderChannels: {
            sms: document.getElementById('reminderSMS').checked,
            whatsapp: document.getElementById('reminderWhatsApp').checked,
            email: document.getElementById('reminderEmail').checked
        },
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };

    appointments.push(appointment);
    createRemindersForAppointment(appointment);
    saveData();
    renderAppointments();
    renderReminders();
    updateDashboard();
    cancelAddAppointment();
    showNotification('Appointment scheduled successfully!');
}

function renderAppointments() {
    const container = document.getElementById('appointmentsList');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No appointments scheduled</h3>
                <p>Schedule your first appointment to get started</p>
            </div>
        `;
        return;
    }

    // Sort appointments by date and time
    const sortedAppointments = [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
    });

    container.innerHTML = sortedAppointments.map(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
        const isUpcoming = appointmentDate > new Date();
        
        return `
            <div class="appointment-card ${!isUpcoming ? 'past-appointment' : ''}">
                <div class="patient-info">
                    <div>
                        <div class="patient-name">${patient ? patient.name : 'Unknown Patient'}</div>
                        <div class="patient-details">
                            📅 ${formatDate(appointment.date)} at ${formatTime(appointment.time)}
                            | Type: ${appointment.type}
                            ${appointment.notes ? `| Notes: ${appointment.notes}` : ''}
                        </div>
                        <div class="patient-details">
                            Reminders: ${Object.entries(appointment.reminderChannels)
                                .filter(([key, value]) => value)
                                .map(([key]) => key.toUpperCase())
                                .join(', ') || 'None'}
                        </div>
                    </div>
                    <div class="patient-actions">
                        <button class="btn btn-secondary" onclick="editAppointment(${appointment.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments = appointments.filter(a => a.id !== id);
        reminders = reminders.filter(r => r.appointmentId !== id);
        saveData();
        renderAppointments();
        renderReminders();
        updateDashboard();
        showNotification('Appointment deleted successfully!');
    }
}

function editAppointment(id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    // Populate form with appointment data
    document.getElementById('appointmentPatient').value = appointment.patientId;
    document.getElementById('appointmentType').value = appointment.type;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentNotes').value = appointment.notes || '';
    document.getElementById('reminderSMS').checked = appointment.reminderChannels.sms;
    document.getElementById('reminderWhatsApp').checked = appointment.reminderChannels.whatsapp;
    document.getElementById('reminderEmail').checked = appointment.reminderChannels.email;

    // Show form
    showAddAppointmentForm();

    // Update form submission to edit instead of add
    const form = document.getElementById('appointmentForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Update appointment data
        appointment.patientId = parseInt(document.getElementById('appointmentPatient').value);
        appointment.type = document.getElementById('appointmentType').value;
        appointment.date = document.getElementById('appointmentDate').value;
        appointment.time = document.getElementById('appointmentTime').value;
        appointment.notes = document.getElementById('appointmentNotes').value;
        appointment.reminderChannels = {
            sms: document.getElementById('reminderSMS').checked,
            whatsapp: document.getElementById('reminderWhatsApp').checked,
            email: document.getElementById('reminderEmail').checked
        };

        // Remove old reminders and create new ones
        reminders = reminders.filter(r => r.appointmentId !== appointment.id);
        createRemindersForAppointment(appointment);

        saveData();
        renderAppointments();
        renderReminders();
        updateDashboard();
        cancelAddAppointment();
        showNotification('Appointment updated successfully!');

        // Restore original form submission
        form.onsubmit = addAppointment;
    };
}

function searchAppointments() {
    const query = document.getElementById('appointmentSearch').value.toLowerCase();
    const filtered = appointments.filter(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        return (patient && patient.name.toLowerCase().includes(query)) ||
               appointment.type.toLowerCase().includes(query) ||
               appointment.date.includes(query);
    });
    
    renderFilteredAppointments(filtered);
}

function renderFilteredAppointments(filtered) {
    const container = document.getElementById('appointmentsList');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No appointments found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }

    // Sort filtered appointments by date and time
    const sortedAppointments = [...filtered].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
    });

    container.innerHTML = sortedAppointments.map(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
        const isUpcoming = appointmentDate > new Date();
        
        return `
            <div class="appointment-card ${!isUpcoming ? 'past-appointment' : ''}">
                <div class="patient-info">
                    <div>
                        <div class="patient-name">${patient ? patient.name : 'Unknown Patient'}</div>
                        <div class="patient-details">
                            📅 ${formatDate(appointment.date)} at ${formatTime(appointment.time)}
                            | Type: ${appointment.type}
                            ${appointment.notes ? `| Notes: ${appointment.notes}` : ''}
                        </div>
                        <div class="patient-details">
                            Reminders: ${Object.entries(appointment.reminderChannels)
                                .filter(([key, value]) => value)
                                .map(([key]) => key.toUpperCase())
                                .join(', ') || 'None'}
                        </div>
                    </div>
                    <div class="patient-actions">
                        <button class="btn btn-secondary" onclick="editAppointment(${appointment.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Reminder management
function createRemindersForAppointment(appointment) {
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
    const patient = patients.find(p => p.id === appointment.patientId);
    
    // Create reminders for 24 hours and 2 hours before
    const reminderTimes = [
        { hours: 24, label: '1 day before' },
        { hours: 2, label: '2 hours before' }
    ];

    reminderTimes.forEach(reminderTime => {
        const reminderDateTime = new Date(appointmentDateTime.getTime() - (reminderTime.hours * 60 * 60 * 1000));
        
        if (reminderDateTime > new Date()) {
            const reminder = {
                id: Date.now() + Math.random(),
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                patientName: patient ? patient.name : 'Unknown',
                patientPhone: patient ? patient.phone : '',
                patientEmail: patient ? patient.email : '',
                appointmentDate: appointment.date,
                appointmentTime: appointment.time,
                appointmentType: appointment.type,
                reminderDateTime: reminderDateTime.toISOString(),
                reminderLabel: reminderTime.label,
                channels: appointment.reminderChannels,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            reminders.push(reminder);
        }
    });
}

function renderReminders() {
    const container = document.getElementById('remindersList');
    let filteredReminders = reminders;

    // Apply filter
    if (currentFilter !== 'all') {
        filteredReminders = reminders.filter(reminder => {
            if (currentFilter === 'pending') return reminder.status === 'pending';
            if (currentFilter === 'sent') return reminder.status === 'sent';
            if (currentFilter === 'urgent') {
                const reminderTime = new Date(reminder.reminderDateTime);
                const now = new Date();
                return reminder.status === 'pending' && reminderTime <= now;
            }
            return true;
        });
    }
    
    if (filteredReminders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No reminders found</h3>
                <p>Reminders will appear here when appointments are scheduled</p>
            </div>
        `;
        return;
    }

    // Sort reminders by reminder date
    const sortedReminders = [...filteredReminders].sort((a, b) => {
        return new Date(a.reminderDateTime) - new Date(b.reminderDateTime);
    });

    container.innerHTML = sortedReminders.map(reminder => {
        const reminderTime = new Date(reminder.reminderDateTime);
        const now = new Date();
        const isUrgent = reminder.status === 'pending' && reminderTime <= now;
        const channels = Object.entries(reminder.channels)
            .filter(([key, value]) => value)
            .map(([key]) => key.toUpperCase())
            .join(', ');

        return `
            <div class="reminder-card ${isUrgent ? 'urgent' : ''}">
                <div class="reminder-header">
                    <div class="reminder-title">
                        ${reminder.patientName} - ${reminder.appointmentType}
                        ${isUrgent ? '🚨 URGENT' : ''}
                    </div>
                    <div class="reminder-date">
                        ${reminder.status === 'sent' ? '✅ Sent' : '⏰ Pending'}
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Appointment:</strong> ${formatDate(reminder.appointmentDate)} at ${formatTime(reminder.appointmentTime)}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Reminder:</strong> ${reminder.reminderLabel} (${formatDateTime(reminder.reminderDateTime)})
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Channels:</strong> ${channels || 'None selected'}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Contact:</strong> 📞 ${reminder.patientPhone} ${reminder.patientEmail ? `| 📧 ${reminder.patientEmail}` : ''}
                </div>
                ${reminder.status === 'pending' ? `
                    <button class="btn btn-success" onclick="sendReminder(${reminder.id})">Send Now</button>
                    <button class="btn btn-danger" onclick="deleteReminder(${reminder.id})">Delete</button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function filterReminders(filter) {
    currentFilter = filter;
    // Update button styles
    document.querySelectorAll('#reminders .btn-secondary').forEach(btn => {
        btn.style.background = '#718096';
    });
    event.target.style.background = '#667eea';
    renderReminders();
}

function sendReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    // Simulate sending reminder
    reminder.status = 'sent';
    reminder.sentAt = new Date().toISOString();
    
    // Create message content
    const message = `Reminder: You have a ${reminder.appointmentType} appointment on ${formatDate(reminder.appointmentDate)} at ${formatTime(reminder.appointmentTime)}. Please confirm your attendance.`;
    
    // Simulate sending via different channels
    const sentChannels = [];
    if (reminder.channels.sms) sentChannels.push('SMS');
    if (reminder.channels.whatsapp) sentChannels.push('WhatsApp');
    if (reminder.channels.email) sentChannels.push('Email');
    
    saveData();
    renderReminders();
    updateDashboard();
    showNotification(`Reminder sent to ${reminder.patientName} via ${sentChannels.join(', ')}!`);
}

function sendPendingReminders() {
    const pendingReminders = reminders.filter(r => r.status === 'pending');
    
    if (pendingReminders.length === 0) {
        showNotification('No pending reminders to send!', 'warning');
        return;
    }

    let sentCount = 0;
    pendingReminders.forEach(reminder => {
        const reminderTime = new Date(reminder.reminderDateTime);
        const now = new Date();
        
        // Only send if reminder time has passed
        if (reminderTime <= now) {
            reminder.status = 'sent';
            reminder.sentAt = new Date().toISOString();
            sentCount++;
        }
    });

    if (sentCount > 0) {
        saveData();
        renderReminders();
        updateDashboard();
        showNotification(`${sentCount} reminder(s) sent successfully!`);
    } else {
        showNotification('No reminders are ready to be sent yet!', 'warning');
    }
}

function deleteReminder(id) {
    if (confirm('Are you sure you want to delete this reminder?')) {
        reminders = reminders.filter(r => r.id !== id);
        saveData();
        renderReminders();
        updateDashboard();
        showNotification('Reminder deleted successfully!');
    }
}

function checkAndCreateReminders() {
    // Auto-send reminders that are due
    const now = new Date();
    let autoSentCount = 0;

    reminders.forEach(reminder => {
        if (reminder.status === 'pending') {
            const reminderTime = new Date(reminder.reminderDateTime);
            // Auto-send if reminder time has passed by more than 5 minutes
            if (reminderTime <= new Date(now.getTime() - 5 * 60 * 1000)) {
                reminder.status = 'sent';
                reminder.sentAt = new Date().toISOString();
                autoSentCount++;
            }
        }
    });

    if (autoSentCount > 0) {
        saveData();
        renderReminders();
        updateDashboard();
    }
}

// UI helper functions
function showAddPatientForm() {
    document.getElementById('addPatientForm').style.display = 'block';
    document.getElementById('patientName').focus();
}

function cancelAddPatient() {
    document.getElementById('addPatientForm').style.display = 'none';
    document.getElementById('patientForm').reset();
    // Restore original form submission in case it was changed for editing
    document.getElementById('patientForm').onsubmit = addPatient;
}

function showAddAppointmentForm() {
    if (patients.length === 0) {
        showNotification('Please add at least one patient first!', 'warning');
        switchTab('patients');
        return;
    }
    document.getElementById('addAppointmentForm').style.display = 'block';
    document.getElementById('appointmentPatient').focus();
}

function cancelAddAppointment() {
    document.getElementById('addAppointmentForm').style.display = 'none';
    document.getElementById('appointmentForm').reset();
    // Restore original form submission in case it was changed for editing
    document.getElementById('appointmentForm').onsubmit = addAppointment;
}

function updatePatientDropdown() {
    const select = document.getElementById('appointmentPatient');
    select.innerHTML = '<option value="">Choose a patient...</option>';
    
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} - ${patient.phone}`;
        select.appendChild(option);
    });
}

function updateDashboard() {
    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('totalAppointments').textContent = appointments.length;
    document.getElementById('pendingReminders').textContent = reminders.filter(r => r.status === 'pending').length;
    document.getElementById('sentReminders').textContent = reminders.filter(r => r.status === 'sent').length;

    // Update recent activity
    const recentActivity = document.getElementById('recentActivity');
    const activities = [];

    // Add recent appointments
    const recentAppointments = appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    recentAppointments.forEach(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        activities.push({
            text: `📅 Appointment scheduled for ${patient ? patient.name : 'Unknown'} on ${formatDate(appointment.date)}`,
            time: appointment.createdAt
        });
    });

    // Add recent patients
    const recentPatients = patients
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2);

    recentPatients.forEach(patient => {
        activities.push({
            text: `👤 New patient added: ${patient.name}`,
            time: patient.createdAt
        });
    });

    // Sort activities by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    if (activities.length === 0) {
        recentActivity.innerHTML = `
            <div class="empty-state">
                <h3>No recent activity</h3>
                <p>Start by adding patients and scheduling appointments</p>
            </div>
        `;
    } else {
        recentActivity.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="appointment-card">
                <div class="patient-details">
                    ${activity.text}
                    <div style="font-size: 0.9em; color: #718096; margin-top: 5px;">
                        ${formatDateTime(activity.time)}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function saveData() {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Demo data function (for testing)
function loadDemoData() {
    const demoPatients = [
        {
            id: 1,
            name: 'John Smith',
            phone: '(555) 123-4567',
            email: 'john.smith@email.com',
            age: '45',
            condition: 'Hypertension follow-up',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            phone: '(555) 234-5678',
            email: 'sarah.j@email.com',
            age: '32',
            condition: 'Diabetes management',
            createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 3,
            name: 'Michael Brown',
            phone: '(555) 345-6789',
            email: 'mbrown@email.com',
            age: '28',
            condition: 'Physical therapy follow-up',
            createdAt: new Date(Date.now() - 259200000).toISOString()
        }
    ];

    const demoAppointments = [
        {
            id: 1,
            patientId: 1,
            type: 'follow-up',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            time: '14:30',
            notes: 'Blood pressure check',
            reminderChannels: { sms: true, whatsapp: false, email: true },
            status: 'scheduled',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 2,
            patientId: 2,
            type: 'consultation',
            date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            time: '10:00',
            notes: 'Diabetes review and medication adjustment',
            reminderChannels: { sms: true, whatsapp: true, email: false },
            status: 'scheduled',
            createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: 3,
            patientId: 3,
            type: 'treatment',
            date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
            time: '16:15',
            notes: 'Physical therapy session',
            reminderChannels: { sms: false, whatsapp: true, email: true },
            status: 'scheduled',
            createdAt: new Date(Date.now() - 10800000).toISOString()
        }
    ];

    patients = demoPatients;
    appointments = demoAppointments;
    
    // Create reminders for demo appointments
    demoAppointments.forEach(appointment => {
        createRemindersForAppointment(appointment);
    });

    saveData();
    updateDashboard();
    renderPatients();
    renderAppointments();
    renderReminders();
    updatePatientDropdown();
    showNotification('Demo data loaded successfully!');
}