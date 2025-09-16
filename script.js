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
    showView('step1');
}

function showCreatePackageStep1() {
    showView('step1');
}

function showCreatePackageStep2() {
    showView('step2');
}

function showCreatePackageStep3() {
    showView('step3');
}

function showPackageCreated() {
    showView('success');
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

// Reorganized Business Logic Functions
function updateSchedulePreview() {
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value;
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    
    let previewText = '';
    
    if (scheduleType === 'days') {
        previewText = '📅 <strong>Ongoing Package</strong> - Continuous sessions that start when participants join';
        const activeDays = document.querySelectorAll('.day-btn.active');
        const dayNames = Array.from(activeDays).map(btn => btn.textContent).join(', ');
        if (dayNames) {
            previewText += `<br>Training days: ${dayNames}`;
        }
    } else {
        const totalSessions = document.getElementById('totalSessions')?.value;
        const sessionsPerWeek = document.getElementById('sessionsPerWeek')?.value;
        const startDate = document.getElementById('packageStartDate')?.value;
        
        previewText = '📅 <strong>Fixed Package</strong> - Set duration with specific start and end dates';
        
        if (totalSessions && sessionsPerWeek) {
            const weeks = Math.ceil(parseInt(totalSessions) / parseInt(sessionsPerWeek));
            previewText += `<br>${totalSessions} sessions over ${weeks} weeks (${sessionsPerWeek} sessions per week)`;
            
            if (startDate) {
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + (weeks * 7));
                previewText += `<br>Runs from ${new Date(startDate).toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
            }
        }
    }
    
    const timeSlots = document.querySelectorAll('.time-select');
    if (timeSlots.length > 0) {
        const times = Array.from(timeSlots).map(select => {
            const value = select.value;
            const hour = parseInt(value.split(':')[0]);
            const suffix = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            return `${displayHour}:${value.split(':')[1]} ${suffix}`;
        }).join(', ');
        previewText += `<br>Available times: ${times}`;
    }
    
    if (participantType === 'group') {
        const minCap = document.getElementById('minCapacity')?.value;
        const maxCap = document.getElementById('maxCapacity')?.value;
        if (minCap && maxCap) {
            previewText += `<br>Group size: ${minCap}-${maxCap} participants`;
        }
    } else {
        previewText += '<br>Individual training (1-on-1)';
    }
    
    const previewElement = document.getElementById('preview-text');
    if (previewElement) {
        previewElement.innerHTML = previewText;
    }
    
    // Update duration display for fixed packages
    updateDurationDisplay();
}

function updatePerSessionPrice() {
    const packagePrice = parseFloat(document.getElementById('packagePrice')?.value) || 0;
    const perSessionDisplay = document.querySelector('.per-session');
    if (perSessionDisplay) {
        perSessionDisplay.textContent = `Package price: ₹${packagePrice.toFixed(2)} (price per session varies by package type)`;
    }
}

// Location Management
function addLocation() {
    const locationList = document.querySelector('.location-list');
    const newLocation = document.createElement('div');
    newLocation.className = 'location-item';
    newLocation.innerHTML = `
        <input type="text" placeholder="Location name" class="form-control">
        <input type="text" placeholder="Full address" class="form-control">
        <button type="button" class="btn btn-small btn-danger" onclick="removeLocation(this)">Remove</button>
    `;
    locationList.appendChild(newLocation);
}

function removeLocation(button) {
    button.parentElement.remove();
}

// Time Slot Management  
function addTimeSlot() {
    const batchesList = document.querySelector('.batches-list');
    if (!batchesList) return;
    
    const batchCount = batchesList.children.length;
    const newBatch = document.createElement('div');
    newBatch.className = 'batch-item';
    
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    let statusText = 'Available for booking';
    
    if (participantType === 'group') {
        const maxCapacity = document.getElementById('maxCapacity')?.value || 8;
        statusText = `0/${maxCapacity} enrolled`;
    }
    
    newBatch.innerHTML = `
        <select class="form-control time-select">
            <option value="6:00">6:00 AM</option>
            <option value="7:00">7:00 AM</option>
            <option value="8:00">8:00 AM</option>
            <option value="9:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
        </select>
        <span class="batch-status" id="batch-status-${batchCount}">${statusText}</span>
        <button type="button" class="btn btn-small btn-danger" onclick="removeTimeSlot(this)">Remove</button>
    `;
    batchesList.appendChild(newBatch);
    updateSchedulePreview();
}

function removeTimeSlot(button) {
    button.parentElement.remove();
    updateSchedulePreview();
}

// Batch/Time Slot Management
function addBatch() {
    const batchesList = document.querySelector('.batches-list');
    const batchCount = batchesList.children.length;
    const newBatch = document.createElement('div');
    newBatch.className = 'batch-item';
    
    const bookingType = document.querySelector('input[name="bookingType"]:checked')?.value;
    let statusText = 'Available for booking';
    
    if (bookingType === 'group') {
        const maxCapacity = document.getElementById('maxCapacity')?.value || 8;
        statusText = `0/${maxCapacity} enrolled`;
    }
    
    newBatch.innerHTML = `
        <select class="form-control time-select">
            <option value="6:00">6:00 AM</option>
            <option value="7:00">7:00 AM</option>
            <option value="8:00">8:00 AM</option>
            <option value="9:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
        </select>
        <span class="batch-status" id="batch-status-${batchCount}">${statusText}</span>
        <button type="button" class="btn btn-small btn-danger" onclick="removeBatch(this)">Remove</button>
    `;
    batchesList.appendChild(newBatch);
    updateSchedulePreview();
}

function removeBatch(button) {
    button.parentElement.remove();
    updateSchedulePreview();
}

// Exception Management
function addException() {
    const date = document.getElementById('exceptionDate').value;
    const reason = document.getElementById('exceptionReason').value;
    
    if (!date) return;
    
    const exceptionsList = document.querySelector('.exceptions-list');
    const newException = document.createElement('div');
    newException.className = 'exception-item';
    newException.innerHTML = `
        <div>
            <div class="exception-date">${new Date(date).toLocaleDateString()}</div>
            <div class="exception-reason">${document.getElementById('exceptionReason').options[document.getElementById('exceptionReason').selectedIndex].text}</div>
        </div>
        <button type="button" class="btn btn-small btn-danger" onclick="removeException(this)">Remove</button>
    `;
    exceptionsList.appendChild(newException);
    
    // Clear inputs
    document.getElementById('exceptionDate').value = '';
    document.getElementById('exceptionReason').selectedIndex = 0;
}

function removeException(button) {
    button.parentElement.remove();
}

// Custom Recurrence
function showCustomRecurrence() {
    document.getElementById('custom-recurrence-modal').classList.add('active');
}

function hideCustomRecurrence() {
    document.getElementById('custom-recurrence-modal').classList.remove('active');
}

// Participant Type Logic
function toggleParticipantType() {
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    const individualOptions = document.getElementById('individual-options');
    const groupOptions = document.getElementById('group-options');
    
    if (participantType === 'group') {
        individualOptions.style.display = 'none';
        groupOptions.style.display = 'block';
    } else {
        individualOptions.style.display = 'block';
        groupOptions.style.display = 'none';
    }
    updateBatchStatuses();
    updateSchedulePreview();
}

// Schedule Type Logic
function toggleScheduleType() {
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value;
    const daysSchedule = document.getElementById('days-schedule');
    const sessionsSchedule = document.getElementById('sessions-schedule');
    
    if (scheduleType === 'days') {
        daysSchedule.style.display = 'block';
        sessionsSchedule.style.display = 'none';
    } else {
        daysSchedule.style.display = 'none';
        sessionsSchedule.style.display = 'block';
    }
    updateSchedulePreview();
}

// Update batch statuses based on participant type
function updateBatchStatuses() {
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    const batchStatuses = document.querySelectorAll('.batch-status');
    
    batchStatuses.forEach(status => {
        if (participantType === 'group') {
            const maxCapacity = document.getElementById('maxCapacity')?.value || 8;
            status.textContent = `0/${maxCapacity} enrolled`;
        } else {
            status.textContent = 'Available for booking';
        }
    });
}

// Update duration display for fixed packages
function updateDurationDisplay() {
    const totalSessions = document.getElementById('totalSessions')?.value;
    const sessionsPerWeek = document.getElementById('sessionsPerWeek')?.value;
    const durationDisplay = document.getElementById('duration-display');
    
    if (totalSessions && sessionsPerWeek && durationDisplay) {
        const weeks = Math.ceil(parseInt(totalSessions) / parseInt(sessionsPerWeek));
        durationDisplay.textContent = `Duration: ${weeks} weeks (${totalSessions} sessions ÷ ${sessionsPerWeek} per week)`;
    }
}

function applyCustomRecurrence() {
    hideCustomRecurrence();
    updateSchedulePreview();
}

// Form Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Day selector functionality
    const dayButtons = document.querySelectorAll('.day-btn');
    dayButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            updateSchedulePreview();
        });
    });
    
    // Participant type change
    const participantTypeRadios = document.querySelectorAll('input[name="participantType"]');
    participantTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleParticipantType);
    });
    
    // Schedule type change
    const scheduleTypeRadios = document.querySelectorAll('input[name="scheduleType"]');
    scheduleTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleScheduleType);
    });
    
    // Package start date change
    const packageStartDate = document.getElementById('packageStartDate');
    if (packageStartDate) {
        packageStartDate.addEventListener('change', updateSchedulePreview);
    }
    
    // Sessions per week change
    const sessionsPerWeek = document.getElementById('sessionsPerWeek');
    if (sessionsPerWeek) {
        sessionsPerWeek.addEventListener('change', function() {
            updateSchedulePreview();
            updateDurationDisplay();
        });
    }
    
    // Total sessions change
    const totalSessions = document.getElementById('totalSessions');
    if (totalSessions) {
        totalSessions.addEventListener('change', function() {
            updateSchedulePreview();
            updateDurationDisplay();
        });
    }
    
    // Auto-calculate per session price
    const packagePriceInput = document.getElementById('packagePrice');
    
    if (packagePriceInput) {
        packagePriceInput.addEventListener('input', updatePerSessionPrice);
    }
    
    // Capacity validation
    const minCapacity = document.getElementById('minCapacity');
    const maxCapacity = document.getElementById('maxCapacity');
    
    if (minCapacity && maxCapacity) {
        minCapacity.addEventListener('input', function() {
            if (parseInt(this.value) > parseInt(maxCapacity.value)) {
                maxCapacity.value = this.value;
            }
        });
        
        maxCapacity.addEventListener('input', function() {
            if (parseInt(this.value) < parseInt(minCapacity.value)) {
                minCapacity.value = this.value;
            }
        });
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
    updateSchedulePreview();
    toggleParticipantType();
    toggleScheduleType();
    updateDurationDisplay();
    
    // Enhanced button event listeners with validation
    const step1NextButton = document.querySelector('#step1 .btn-primary');
    if (step1NextButton) {
        step1NextButton.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep2();
        });
    }
    
    const step2NextButton = document.querySelector('#step2 .btn-primary');
    if (step2NextButton) {
        step2NextButton.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep3();
        });
    }
    
    const step3CreateButton = document.querySelector('#step3 .btn-primary');
    if (step3CreateButton) {
        step3CreateButton.addEventListener('click', function(e) {
            e.preventDefault();
            createPackage();
        });
    }
    
    // Back button handlers
    const step2BackButton = document.querySelector('#step2 .btn-secondary');
    if (step2BackButton) {
        step2BackButton.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep1();
        });
    }
    
    const step3BackButton = document.querySelector('#step3 .btn-secondary');
    if (step3BackButton) {
        step3BackButton.addEventListener('click', function(e) {
            e.preventDefault();
            goBackToStep2();
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
    const scheduleInputs = document.querySelectorAll('#step2 input, #step2 select');
    scheduleInputs.forEach(input => {
        input.addEventListener('change', simulateConflictCheck);
    });
    
    // Initialize the app - Show dashboard by default
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

// Form validation for all steps
function validateStep1() {
    const packageName = document.getElementById('packageName')?.value?.trim();
    const packagePrice = document.getElementById('packagePrice')?.value;
    const participantType = document.querySelector('input[name="participantType"]:checked');
    
    let isValid = true;
    const errors = [];
    
    if (!packageName || packageName.length < 3) {
        errors.push('Package name must be at least 3 characters');
        isValid = false;
    }
    
    if (!packagePrice || parseFloat(packagePrice) <= 0) {
        errors.push('Package price must be greater than 0');
        isValid = false;
    }
    
    if (!participantType) {
        errors.push('Please select participant type');
        isValid = false;
    }
    
    // Display errors
    displayErrors('step1', errors);
    return isValid;
}

function validateStep2() {
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked');
    let isValid = true;
    const errors = [];
    
    if (!scheduleType) {
        errors.push('Please select schedule type');
        isValid = false;
    }
    
    if (scheduleType?.value === 'days') {
        const selectedDays = document.querySelectorAll('.day-btn.active');
        if (selectedDays.length === 0) {
            errors.push('Please select at least one day');
            isValid = false;
        }
    } else if (scheduleType?.value === 'sessions') {
        const totalSessions = document.getElementById('totalSessions')?.value;
        const sessionsPerWeek = document.getElementById('sessionsPerWeek')?.value;
        const startDate = document.getElementById('packageStartDate')?.value;
        
        if (!totalSessions || parseInt(totalSessions) < 1) {
            errors.push('Total sessions must be at least 1');
            isValid = false;
        }
        
        if (!sessionsPerWeek || parseInt(sessionsPerWeek) < 1) {
            errors.push('Sessions per week must be at least 1');
            isValid = false;
        }
        
        if (!startDate) {
            errors.push('Package start date is required for fixed packages');
            isValid = false;
        }
    }
    
    // Check if at least one batch/time slot is added
    const batches = document.querySelectorAll('.batch-item');
    if (batches.length === 0) {
        errors.push('Please add at least one time slot');
        isValid = false;
    }
    
    displayErrors('step2', errors);
    return isValid;
}

function validateStep3() {
    const description = document.getElementById('packageDescription')?.value?.trim();
    const locations = document.querySelectorAll('.location-item input[type="text"]');
    let isValid = true;
    const errors = [];
    
    if (!description || description.length < 10) {
        errors.push('Package description must be at least 10 characters');
        isValid = false;
    }
    
    // Check if at least one location is properly filled
    let hasValidLocation = false;
    for (let i = 0; i < locations.length; i += 2) {
        const locationName = locations[i]?.value?.trim();
        const locationAddress = locations[i + 1]?.value?.trim();
        if (locationName && locationAddress) {
            hasValidLocation = true;
            break;
        }
    }
    
    if (!hasValidLocation) {
        errors.push('Please add at least one complete location (name and address)');
        isValid = false;
    }
    
    displayErrors('step3', errors);
    return isValid;
}

function displayErrors(step, errors) {
    // Clear existing errors
    const existingErrors = document.querySelectorAll(`#${step} .validation-errors`);
    existingErrors.forEach(error => error.remove());
    
    if (errors.length > 0) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'validation-errors';
        errorContainer.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 6px; margin: 16px 0;';
        
        const errorList = document.createElement('ul');
        errorList.style.margin = '0';
        errorList.style.paddingLeft = '20px';
        
        errors.forEach(error => {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });
        
        errorContainer.appendChild(errorList);
        
        const stepContainer = document.querySelector(`#${step} .form-container`);
        if (stepContainer) {
            stepContainer.insertBefore(errorContainer, stepContainer.firstChild);
        }
    }
}

// Enhanced navigation with validation
function goToStep2() {
    if (validateStep1()) {
        showCreatePackageStep2();
        updateProgressBar(2);
    }
}

function goToStep3() {
    if (validateStep2()) {
        showCreatePackageStep3();
        updateProgressBar(3);
        generatePackageSummary();
    }
}

function goToStep1() {
    showCreatePackageStep1();
    updateProgressBar(1);
}

function goBackToStep2() {
    showCreatePackageStep2();
    updateProgressBar(2);
}

function createPackage() {
    if (validateStep3()) {
        const packageData = collectPackageData();
        console.log('Creating package:', packageData);
        
        // Simulate package creation
        setTimeout(() => {
            showPackageCreated();
            generateBookingLink(packageData);
        }, 500);
    }
}

// Package data collection
function collectPackageData() {
    const packageName = document.getElementById('packageName')?.value?.trim();
    const packagePrice = parseFloat(document.getElementById('packagePrice')?.value) || 0;
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value;
    const description = document.getElementById('packageDescription')?.value?.trim();
    
    const data = {
        name: packageName,
        price: packagePrice,
        participantType: participantType,
        scheduleType: scheduleType,
        description: description,
        created: new Date().toISOString(),
        id: generatePackageId(packageName)
    };
    
    if (participantType === 'group') {
        data.minCapacity = parseInt(document.getElementById('minCapacity')?.value) || 2;
        data.maxCapacity = parseInt(document.getElementById('maxCapacity')?.value) || 8;
    }
    
    if (scheduleType === 'days') {
        const selectedDays = Array.from(document.querySelectorAll('.day-btn.active')).map(btn => btn.textContent);
        data.days = selectedDays;
        data.packageType = 'ongoing';
    } else {
        data.totalSessions = parseInt(document.getElementById('totalSessions')?.value) || 0;
        data.sessionsPerWeek = parseInt(document.getElementById('sessionsPerWeek')?.value) || 0;
        data.startDate = document.getElementById('packageStartDate')?.value;
        data.packageType = 'fixed';
        
        const weeks = Math.ceil(data.totalSessions / data.sessionsPerWeek);
        if (data.startDate) {
            const endDate = new Date(data.startDate);
            endDate.setDate(endDate.getDate() + (weeks * 7));
            data.endDate = endDate.toISOString().split('T')[0];
        }
    }
    
    // Collect time slots
    const timeSlots = Array.from(document.querySelectorAll('.time-select')).map(select => select.value);
    data.timeSlots = timeSlots;
    
    // Collect locations
    const locationElements = document.querySelectorAll('.location-item');
    data.locations = Array.from(locationElements).map(item => {
        const inputs = item.querySelectorAll('input[type="text"]');
        return {
            name: inputs[0]?.value?.trim() || '',
            address: inputs[1]?.value?.trim() || ''
        };
    }).filter(loc => loc.name && loc.address);
    
    // Collect exceptions
    const exceptionElements = document.querySelectorAll('.exception-item');
    data.exceptions = Array.from(exceptionElements).map(item => {
        const date = item.querySelector('.exception-date')?.textContent;
        const reason = item.querySelector('.exception-reason')?.textContent;
        return { date, reason };
    });
    
    return data;
}

function generatePackageId(name) {
    const prefix = name.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
}

function generatePackageSummary() {
    const data = collectPackageData();
    const summaryContainer = document.querySelector('#step3 .form-section:last-child');
    
    if (summaryContainer) {
        let summaryHTML = `
            <div class="package-summary" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>📋 Package Summary</h4>
                <div class="summary-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                    <div><strong>Package:</strong> ${data.name}</div>
                    <div><strong>Price:</strong> ₹${data.price}</div>
                    <div><strong>Type:</strong> ${data.participantType === 'group' ? 'Group Training' : 'Individual Training'}</div>
                    <div><strong>Schedule:</strong> ${data.packageType === 'ongoing' ? 'Ongoing' : 'Fixed Duration'}</div>
                </div>
        `;
        
        if (data.packageType === 'ongoing') {
            summaryHTML += `<div style="margin-top: 12px;"><strong>Training Days:</strong> ${data.days?.join(', ')}</div>`;
        } else {
            summaryHTML += `<div style="margin-top: 12px;"><strong>Duration:</strong> ${data.totalSessions} sessions over ${Math.ceil(data.totalSessions / data.sessionsPerWeek)} weeks</div>`;
        }
        
        if (data.timeSlots?.length > 0) {
            const timeDisplay = data.timeSlots.map(time => {
                const hour = parseInt(time.split(':')[0]);
                const suffix = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${displayHour}:${time.split(':')[1]} ${suffix}`;
            }).join(', ');
            summaryHTML += `<div style="margin-top: 8px;"><strong>Time Slots:</strong> ${timeDisplay}</div>`;
        }
        
        summaryHTML += '</div>';
        
        // Remove existing summary
        const existingSummary = summaryContainer.querySelector('.package-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        summaryContainer.insertAdjacentHTML('afterbegin', summaryHTML);
    }
}

function generateBookingLink(packageData) {
    const baseUrl = window.location.origin + window.location.pathname;
    const bookingUrl = `${baseUrl}#book/${packageData.id}`;
    
    const bookingLinkElement = document.getElementById('booking-link');
    if (bookingLinkElement) {
        bookingLinkElement.value = bookingUrl;
    }
    
    const packageIdElement = document.getElementById('created-package-id');
    if (packageIdElement) {
        packageIdElement.textContent = packageData.id;
    }
    
    const packageDetailsElement = document.getElementById('created-package-details');
    if (packageDetailsElement) {
        packageDetailsElement.innerHTML = `
            <div class="created-package-info">
                <h4>${packageData.name}</h4>
                <p><strong>Type:</strong> ${packageData.packageType === 'ongoing' ? 'Ongoing Package' : 'Fixed Duration Package'}</p>
                <p><strong>Price:</strong> ₹${packageData.price}</p>
                ${packageData.packageType === 'ongoing' 
                    ? `<p><strong>Days:</strong> ${packageData.days?.join(', ')}</p>`
                    : `<p><strong>Duration:</strong> ${packageData.totalSessions} sessions (${Math.ceil(packageData.totalSessions / packageData.sessionsPerWeek)} weeks)</p>`
                }
                <p><strong>Locations:</strong> ${packageData.locations?.length || 0} location(s) configured</p>
            </div>
        `;
    }
}

function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((stepEl, index) => {
        if (index < step) {
            stepEl.classList.add('completed');
            stepEl.classList.remove('active');
        } else if (index === step - 1) {
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
        } else {
            stepEl.classList.remove('active', 'completed');
        }
    });
}

function copyBookingLink() {
    const bookingLinkInput = document.getElementById('booking-link');
    if (bookingLinkInput) {
        bookingLinkInput.select();
        document.execCommand('copy');
        
        // Show feedback
        const copyBtn = document.querySelector('.copy-link-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }
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

