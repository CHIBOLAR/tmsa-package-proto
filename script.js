// View Management
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show the requested view
    document.getElementById(viewId).classList.add('active');
}

// Navigation Functions
function showDashboard() {
    showView('dashboard');
}

function showCreatePackage() {
    showView('create-package-step1');
}

function showCreatePackageStep1() {
    showView('create-package-step1');
}

function showCreatePackageStep2() {
    showView('create-package-step2');
}

function showCreatePackageStep3() {
    showView('create-package-step3');
}

function showPackageCreated() {
    showView('package-created');
}

function showCalendar() {
    showView('calendar-view');
}

function showSessionsList() {
    showView('sessions-list');
}

// Modal Functions
function showCopyPackage() {
    document.getElementById('copy-package-modal').classList.add('active');
}

function hideCopyPackage() {
    document.getElementById('copy-package-modal').classList.remove('active');
}

function createCopy() {
    // Simulate package copying
    hideCopyPackage();
    showDashboard();
    
    // Show success message (you could add a toast notification here)
    setTimeout(() => {
        alert('Package copied successfully!');
    }, 100);
}

// Form Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Day selector functionality
    const dayButtons = document.querySelectorAll('.day-btn');
    dayButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Auto-calculate per session price
    const packagePriceInput = document.getElementById('packagePrice');
    const totalSessionsInput = document.getElementById('totalSessions');
    
    function updatePerSessionPrice() {
        if (packagePriceInput && totalSessionsInput) {
            const packagePrice = parseFloat(packagePriceInput.value) || 0;
            const totalSessions = parseInt(totalSessionsInput.value) || 1;
            const perSession = packagePrice / totalSessions;
            
            const perSessionDisplay = document.querySelector('.per-session');
            if (perSessionDisplay) {
                perSessionDisplay.textContent = `Per session: ₹${perSession.toFixed(2)} (auto-calculated)`;
            }
        }
    }
    
    if (packagePriceInput) {
        packagePriceInput.addEventListener('input', updatePerSessionPrice);
    }
    
    if (totalSessionsInput) {
        totalSessionsInput.addEventListener('input', updatePerSessionPrice);
    }
    
    // Update buffer time display
    function updateBufferTimeDisplay() {
        const startTime = document.getElementById('startTime');
        const duration = document.getElementById('duration');
        const bufferBefore = document.getElementById('bufferBefore');
        const bufferAfter = document.getElementById('bufferAfter');
        const display = document.querySelector('.buffer-time-display');
        
        if (startTime && duration && bufferBefore && bufferAfter && display) {
            const start = startTime.value;
            const durationMin = parseInt(duration.value);
            const beforeMin = parseInt(bufferBefore.value);
            const afterMin = parseInt(bufferAfter.value);
            
            // Simple time calculation (for demo purposes)
            const startHour = parseInt(start.split(':')[0]);
            const startMin = parseInt(start.split(':')[1]) || 0;
            
            const totalStartMin = (startHour * 60) + startMin - beforeMin;
            const totalEndMin = (startHour * 60) + startMin + durationMin + afterMin;
            
            const formatTime = (minutes) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
            };
            
            display.textContent = `Total blocked time: ${formatTime(totalStartMin)} - ${formatTime(totalEndMin)}`;
        }
    }
    
    // Add event listeners for buffer time calculation
    ['startTime', 'duration', 'bufferBefore', 'bufferAfter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateBufferTimeDisplay);
        }
    });
    
    // Initialize displays
    updatePerSessionPrice();
    updateBufferTimeDisplay();
    
    // Form validation
    function validateStep1() {
        const packageName = document.getElementById('packageName').value.trim();
        const packagePrice = document.getElementById('packagePrice').value;
        
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => error.style.display = 'none');
        
        let isValid = true;
        
        if (!packageName) {
            document.querySelector('.error-message').style.display = 'block';
            isValid = false;
        }
        
        if (!packagePrice || parseFloat(packagePrice) <= 0) {
            document.querySelectorAll('.error-message')[1].style.display = 'block';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Override next button for step 1 validation
    const step1NextButton = document.querySelector('#create-package-step1 .btn-primary');
    if (step1NextButton) {
        step1NextButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateStep1()) {
                showCreatePackageStep2();
            }
        });
    }
    
    // Simulate conflict checking
    function simulateConflictCheck() {
        const statusIndicator = document.querySelector('.status-indicator');
        const conflictStatus = document.querySelector('.conflict-status');
        
        if (statusIndicator && conflictStatus) {
            statusIndicator.textContent = 'Checking conflicts...';
            statusIndicator.style.color = '#f39c12';
            
            setTimeout(() => {
                statusIndicator.textContent = 'Conflicts checked';
                statusIndicator.style.color = '#27ae60';
            }, 1500);
        }
    }
    
    // Trigger conflict check when schedule changes
    const scheduleInputs = document.querySelectorAll('#create-package-step2 input, #create-package-step2 select');
    scheduleInputs.forEach(input => {
        input.addEventListener('change', simulateConflictCheck);
    });
    
    // Close modal when clicking outside
    document.getElementById('copy-package-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideCopyPackage();
        }
    });
});

// Utility Functions
function formatCurrency(amount, currency = 'INR') {
    const symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€'
    };
    
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Demo data and interactions
const demoPackages = [
    {
        id: 'str-2025-001',
        name: 'Strength Training Program',
        icon: '💪',
        type: 'Personal (1-1)',
        ageGroup: 'Adults',
        sessions: 8,
        price: 4800,
        currency: 'INR',
        nextSession: 'Today 9:00 AM - Sarah J.'
    },
    {
        id: 'soc-2025-002',
        name: 'Teen Soccer Skills',
        icon: '⚽',
        type: 'Group (6-16)',
        ageGroup: 'Teens',
        sessions: 12,
        price: 1920,
        currency: 'INR',
        nextSession: 'Sat 10:00 AM - 8 booked'
    },
    {
        id: 'yog-2025-003',
        name: 'Morning Yoga',
        icon: '🧘',
        type: 'Group (4-8)',
        ageGroup: 'All ages',
        sessions: 6,
        price: 960,
        currency: 'INR',
        nextSession: 'Mon 8:00 AM - 5 booked'
    }
];

// Session Management Functions
function showSessionEdit(sessionNumber) {
    const modal = document.getElementById('session-edit-modal');
    const title = document.getElementById('edit-session-title');
    title.textContent = `Edit Session: Session ${sessionNumber}/8`;
    modal.classList.add('active');
}

function hideSessionEdit() {
    document.getElementById('session-edit-modal').classList.remove('active');
}

function saveSessionChanges() {
    // Simulate saving changes
    hideSessionEdit();
    setTimeout(() => {
        alert('Session updated successfully!');
    }, 100);
}

function showSessionCancel(sessionNumber) {
    const modal = document.getElementById('session-cancel-modal');
    const clientName = document.getElementById('cancel-client-name');
    
    // Update client name based on session (demo data)
    if (sessionNumber === 2) {
        clientName.textContent = 'Sarah Johnson';
    } else {
        clientName.textContent = 'No client booked';
    }
    
    modal.classList.add('active');
}

function hideSessionCancel() {
    document.getElementById('session-cancel-modal').classList.remove('active');
}

function confirmCancelSession() {
    // Simulate cancellation
    hideSessionCancel();
    setTimeout(() => {
        alert('Session cancelled and client notified!');
    }, 100);
}

function toggleAllSessions() {
    const expandBtn = document.querySelector('.expand-btn');
    const isExpanded = expandBtn.textContent === 'Show Less Sessions...';
    
    if (isExpanded) {
        expandBtn.textContent = 'Show All 8 Sessions...';
        // Hide additional sessions (demo)
    } else {
        expandBtn.textContent = 'Show Less Sessions...';
        // Show additional sessions (demo)
    }
}

// Enhanced form interactions for session editing
function setupSessionEditModal() {
    const overrideRadios = document.querySelectorAll('input[name="overrideType"]');
    const overrideFields = document.getElementById('override-fields');
    
    overrideRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'override') {
                overrideFields.style.display = 'block';
            } else {
                overrideFields.style.display = 'none';
            }
        });
    });
}

// Update dashboard calendar button
function updateCalendarButton() {
    const calendarButtons = document.querySelectorAll('.package-card .btn:first-of-type');
    calendarButtons.forEach(btn => {
        if (btn.textContent === 'View Calendar') {
            btn.onclick = showCalendar;
        }
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Show dashboard by default
    showDashboard();
    
    // Setup additional event listeners
    setupSessionEditModal();
    updateCalendarButton();
    
    // Close modals when clicking outside
    const modals = ['copy-package-modal', 'session-edit-modal', 'session-cancel-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        }
    });
    
    console.log('TMSA Package Management Prototype Loaded');
    console.log('Demo packages:', demoPackages);
});