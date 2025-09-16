// View Management
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show the requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    } else {
        console.error(`View with ID '${viewId}' not found`);
    }
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
    updateProgressBar(1);
}

function showCreatePackageStep2() {
    showView('step2');
    updateProgressBar(2);
}

function showCreatePackageStep3() {
    showView('step3');
    updateProgressBar(3);
}

function showPackageCreated() {
    showView('success');
}

function showCalendar() {
    showView('calendar');
}

function showSessionsList() {
    showView('sessions-list');
}

// Calendar functionality
let currentCalendarDate = new Date();
let currentPackageData = null;

function openPackageCalendar(packageId = 'strength-training') {
    try {
        // Get package data based on ID - define packages inside function
        const packages = {
            'strength-training': {
                name: 'Strength Training',
                type: 'Individual • Ongoing',
                days: ['Mon', 'Wed', 'Fri'],
                timeSlots: ['9:00 AM', '6:00 PM'],
                capacity: { individual: true },
                sessions: generatePackageSessions('strength-training', 'ongoing')
            },
            'morning-yoga': {
                name: 'Morning Yoga',
                type: 'Group • Fixed 8 weeks',
                days: ['Tue', 'Thu'],
                timeSlots: ['8:00 AM'],
                capacity: { min: 4, max: 8, current: 5 },
                sessions: generatePackageSessions('morning-yoga', 'fixed')
            },
            'youth-soccer': {
                name: 'Youth Soccer',
                type: 'Group • Fixed 12 weeks',
                days: ['Sat', 'Sun'],
                timeSlots: ['10:00 AM'],
                capacity: { min: 6, max: 12, current: 2 },
                sessions: generatePackageSessions('youth-soccer', 'fixed')
            }
        };

        currentPackageData = packages[packageId] || packages['strength-training'];

        // Update calendar header elements if they exist
        const packageNameEl = document.getElementById('calendar-package-name');
        if (packageNameEl && currentPackageData) {
            packageNameEl.textContent = currentPackageData.name;
        }

        const packageDetailsEl = document.getElementById('calendar-package-details');
        if (packageDetailsEl && currentPackageData) {
            packageDetailsEl.textContent = currentPackageData.type;
        }

        // Only proceed with view changes if calendar view exists
        if (document.getElementById('calendar')) {
            showCalendar();
            if (typeof renderCalendar === 'function') {
                renderCalendar();
            }
        } else {
            console.log('Calendar view not found, but package data loaded successfully');
        }

        // Function executed successfully even if DOM elements don't exist
        return true;

    } catch (error) {
        console.error('Error in openPackageCalendar:', error);
        return false;
    }
}

function generatePackageSessions(packageId, type) {
    const sessions = [];
    const today = new Date();

    // Use currentPackageData if available, otherwise create default data
    let packageData = currentPackageData;
    if (!packageData) {
        // Default package data for testing
        packageData = {
            name: 'Sample Package',
            days: ['Mon', 'Wed', 'Fri'],
            timeSlots: ['9:00 AM'],
            capacity: { individual: true }
        };
    }

    if (type === 'ongoing') {
        // Generate sessions for next 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Check if this day matches package schedule
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
            if (packageData && packageData.days && packageData.days.includes(dayName)) {
                sessions.push({
                    date: date.toISOString().split('T')[0],
                    day: dayName,
                    status: Math.random() > 0.7 ? 'booked' : 'available',
                    timeSlots: packageData.timeSlots || ['9:00 AM']
                });
            }
        }
    } else {
        // Generate fixed number of sessions
        const sessionCount = packageId === 'morning-yoga' ? 16 : 24;
        let sessionDate = new Date(today);
        let added = 0;

        while (added < sessionCount && sessionDate < new Date(Date.now() + 365*24*60*60*1000)) {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][sessionDate.getDay()];
            if (packageData && packageData.days && packageData.days.includes(dayName)) {
                sessions.push({
                    date: sessionDate.toISOString().split('T')[0],
                    day: dayName,
                    status: Math.random() > 0.6 ? 'booked' : 'available',
                    timeSlots: packageData.timeSlots || ['9:00 AM'],
                    sessionNumber: added + 1
                });
                added++;
            }
            sessionDate.setDate(sessionDate.getDate() + 1);
        }
    }

    return sessions;
}

function renderCalendar() {
    const monthYear = document.getElementById('calendar-month-year');
    const calendarDays = document.getElementById('calendar-days');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthYear.textContent = `${currentCalendarDate.toLocaleString('default', { month: 'long' })} ${year}`;
    
    // Clear previous calendar
    calendarDays.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(year, month, day).getDay()];
        
        // Check if this day has sessions
        const daySession = currentPackageData?.sessions?.find(s => s.date === currentDate);
        
        let sessionInfo = '';
        if (daySession) {
            dayElement.classList.add('has-session');
            if (currentPackageData.capacity.individual) {
                sessionInfo = `<div class="day-sessions">${daySession.timeSlots.length} slot(s)</div>`;
            } else {
                const capacity = currentPackageData.capacity;
                sessionInfo = `<div class="day-sessions">${capacity.current}/${capacity.max} enrolled</div>`;
            }
        } else if (currentPackageData?.days?.includes(dayName)) {
            sessionInfo = '<div class="day-sessions">Available</div>';
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${sessionInfo}
        `;
        
        dayElement.addEventListener('click', () => selectCalendarDay(currentDate, daySession));
        
        calendarDays.appendChild(dayElement);
    }
}

function selectCalendarDay(date, session) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked day
    event.target.closest('.calendar-day').classList.add('selected');
    
    // Show session details
    const sessionInfo = document.getElementById('selected-session-info');
    
    if (session) {
        let capacityInfo = '';
        if (currentPackageData.capacity.individual) {
            capacityInfo = '<p><strong>Type:</strong> Individual Training (1-on-1)</p>';
        } else {
            const cap = currentPackageData.capacity;
            capacityInfo = `
                <p><strong>Capacity:</strong> ${cap.current}/${cap.max} participants</p>
                <p><strong>Status:</strong> ${cap.current >= cap.min ? 'Active' : `Need ${cap.min - cap.current} more to start`}</p>
            `;
        }
        
        sessionInfo.innerHTML = `
            <h4>Session Details - ${new Date(date).toLocaleDateString()}</h4>
            <p><strong>Time Slots:</strong> ${session.timeSlots.join(', ')}</p>
            ${capacityInfo}
            <p><strong>Status:</strong> ${session.status === 'booked' ? '🔵 Booked' : '🟢 Available'}</p>
            ${session.sessionNumber ? `<p><strong>Session:</strong> ${session.sessionNumber} of total</p>` : ''}
            <div class="session-actions">
                <button class="btn btn-small btn-danger" onclick="cancelSession('${date}')">Cancel Session</button>
                <button class="btn btn-small" onclick="editSession('${date}')">Edit Details</button>
            </div>
        `;
    } else {
        sessionInfo.innerHTML = `
            <h4>No Session - ${new Date(date).toLocaleDateString()}</h4>
            <p>No training session scheduled for this day.</p>
        `;
    }
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function cancelSession(date) {
    const session = currentPackageData.sessions.find(s => s.date === date);
    if (!session) return;
    
    const isFixedPackage = currentPackageData.type.includes('Fixed');
    const confirmMessage = isFixedPackage 
        ? 'Cancel this session? A replacement session will be added at the end of the package.'
        : 'Cancel this session? This will only cancel the session for this specific day.';
    
    if (confirm(confirmMessage)) {
        // Update session status
        session.status = 'cancelled';
        
        if (isFixedPackage) {
            // For fixed packages, add a replacement session
            const lastSessionDate = new Date(Math.max(...currentPackageData.sessions
                .filter(s => s.sessionNumber)
                .map(s => new Date(s.date).getTime())));
            
            // Add replacement session after the last session
            const replacementDate = new Date(lastSessionDate);
            replacementDate.setDate(replacementDate.getDate() + 7); // Add a week later
            
            const replacementSession = {
                date: replacementDate.toISOString().split('T')[0],
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][replacementDate.getDay()],
                status: 'replacement',
                timeSlots: session.timeSlots,
                sessionNumber: session.sessionNumber, // Keep the same session number
                isReplacement: true
            };
            
            currentPackageData.sessions.push(replacementSession);
            
            alert(`Session cancelled. Replacement session ${session.sessionNumber} scheduled for ${replacementDate.toLocaleDateString()}.`);
        } else {
            alert('Session cancelled for this day. Future sessions on this day remain scheduled.');
        }
        
        renderCalendar();
        
        // Refresh the session details if this session was selected
        const selectedDay = document.querySelector('.calendar-day.selected');
        if (selectedDay) {
            const selectedDate = selectedDay.dataset?.date || date;
            const selectedSession = currentPackageData.sessions.find(s => s.date === selectedDate);
            selectCalendarDay(selectedDate, selectedSession);
        }
    }
}

function editSession(date) {
    alert('Session editing functionality would open here.');
}

// Missing button functions
function toggleDay(button) {
    button.classList.toggle('active');
    updateSchedulePreview();
}

function emailBookingLink() {
    const bookingLinkElement = document.getElementById('booking-link');
    const bookingLink = bookingLinkElement?.value;
    if (bookingLink) {
        const subject = encodeURIComponent('Training Package Booking Link');
        const body = encodeURIComponent(`Hi,\n\nHere's the booking link for your training package:\n\n${bookingLink}\n\nBest regards`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
        alert('No booking link available to email.');
    }
}

function viewAnalytics() {
    alert('Analytics dashboard would open here with package performance metrics, booking rates, and revenue data.');
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
    // Try multiple possible container selectors
    let locationList = document.getElementById('locationsList') ||
                      document.querySelector('.locations-list') ||
                      document.querySelector('.location-list') ||
                      document.querySelector('#locationDetails .locations-list');

    if (!locationList) {
        // Create a temporary container for testing
        const tempContainer = document.createElement('div');
        tempContainer.id = 'temp-locations-list';
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);
        locationList = tempContainer;
        console.log('Created temporary location container for testing');
    }

    const newLocation = document.createElement('div');
    newLocation.className = 'location-item';
    newLocation.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <input type="text" placeholder="Location name (e.g., Central Park, Gold's Gym)" class="form-control">
            </div>
            <div class="form-group">
                <input type="text" placeholder="Full address with landmarks" class="form-control">
            </div>
            <button type="button" class="btn btn-small btn-danger" onclick="removeLocation(this)">Remove</button>
        </div>
    `;
    locationList.appendChild(newLocation);
    console.log('Location added successfully');
}

function removeLocation(button) {
    button.parentElement.remove();
}

// Time Slot Management  
function addTimeSlot() {
    const timeSlotsList = document.getElementById('timeSlotsList');
    if (!timeSlotsList) {
        console.error('Time slots list not found');
        return;
    }

    const slotCount = timeSlotsList.children.length;
    const newTimeSlot = document.createElement('div');
    newTimeSlot.className = 'time-slot-item';
    
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    let statusText = 'Available for booking';
    
    if (participantType === 'group') {
        const maxCapacity = document.getElementById('maxCapacity')?.value || 8;
        statusText = `0/${maxCapacity} enrolled`;
    }
    
    newTimeSlot.innerHTML = `
        <select class="form-control time-select">
            <option value="06:00">6:00 AM</option>
            <option value="07:00">7:00 AM</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
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
        <span class="slot-status">Available for booking</span>
        <button type="button" class="btn btn-small btn-danger" onclick="removeTimeSlot(this)">Remove</button>
    `;
    timeSlotsList.appendChild(newTimeSlot);
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
    const dateInput = document.getElementById('exceptionDate');
    const reasonSelect = document.getElementById('exceptionReason');
    
    if (!dateInput || !reasonSelect) {
        console.error('Exception form elements not found');
        return;
    }
    
    const date = dateInput.value;
    const reasonValue = reasonSelect.value;
    const reasonText = reasonSelect.options[reasonSelect.selectedIndex].text;
    
    if (!date) {
        alert('Please select a date for the exception');
        return;
    }
    
    const exceptionsList = document.getElementById('exceptionsList');
    if (!exceptionsList) {
        console.error('Exceptions list container not found');
        return;
    }
    
    // Check if exception already exists for this date
    const existingExceptions = exceptionsList.querySelectorAll('.exception-item');
    for (let exception of existingExceptions) {
        const existingDate = exception.dataset.date;
        if (existingDate === date) {
            alert('Exception already exists for this date');
            return;
        }
    }
    
    const newException = document.createElement('div');
    newException.className = 'exception-item';
    newException.dataset.date = date;
    newException.dataset.reason = reasonValue;
    newException.innerHTML = `
        <div class="exception-details">
            <div class="exception-date">📅 ${new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
            <div class="exception-reason">🚫 ${reasonText}</div>
        </div>
        <button type="button" class="btn btn-small btn-danger" onclick="removeException(this)">Remove</button>
    `;
    
    exceptionsList.appendChild(newException);
    
    // Clear inputs
    dateInput.value = '';
    reasonSelect.selectedIndex = 0;
    
    // Update schedule preview if needed
    if (typeof updateSchedulePreview === 'function') {
        updateSchedulePreview();
    }
    
    console.log('Exception added for date:', date, 'reason:', reasonText);
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
    const groupOptions = document.getElementById('groupOptions');
    
    console.log('toggleParticipantType called with:', participantType);
    
    // Remove any existing flow indicators first
    const existingIndicators = document.querySelectorAll('.flow-indicator');
    existingIndicators.forEach(indicator => indicator.remove());
    
    if (participantType === 'group') {
        if (groupOptions) {
            groupOptions.style.display = 'block';
            groupOptions.style.background = '#f0f9ff';
            groupOptions.style.padding = '20px';
            groupOptions.style.borderRadius = '8px';
            groupOptions.style.border = '2px solid #3b82f6';
            groupOptions.style.marginTop = '16px';
        }
        
        // Show group-specific fields throughout the form
        showGroupSpecificFields();
        
        // Add visual indicator for group
        const participantSection = document.querySelector('.participant-choice');
        if (participantSection) {
            participantSection.insertAdjacentHTML('afterend', 
                '<div class="flow-indicator" style="background: #dcfdf4; border: 1px solid #10b981; padding: 12px; border-radius: 6px; margin: 16px 0; color: #047857;"><strong>🎯 Group Training Flow Active:</strong> Configure capacity and group settings below. Price is per participant.</div>'
            );
        }
    } else {
        if (groupOptions) {
            groupOptions.style.display = 'none';
        }
        
        // Show individual-specific fields throughout the form
        showIndividualSpecificFields();
        
        // Add visual indicator for individual
        const participantSection = document.querySelector('.participant-choice');
        if (participantSection) {
            participantSection.insertAdjacentHTML('afterend', 
                '<div class="flow-indicator" style="background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0; color: #92400e;"><strong>👤 Individual Training Flow Active:</strong> Optimized for 1-on-1 personalized sessions.</div>'
            );
        }
    }
    
    updateBatchStatuses();
    updateSchedulePreview();
}

function showGroupSpecificFields() {
    // Update form labels and help text for group training
    const packagePriceLabel = document.querySelector('label[for="packagePrice"]');
    if (packagePriceLabel) {
        packagePriceLabel.innerHTML = 'Package Price (per participant) *';
    }
    
    const priceHelp = document.querySelector('.package-price-help');
    if (priceHelp) {
        priceHelp.textContent = 'Price each participant will pay for the complete package';
    }
    
    // Show capacity-related elements
    document.querySelectorAll('.group-only').forEach(el => {
        el.style.display = 'block';
    });
    
    document.querySelectorAll('.individual-only').forEach(el => {
        el.style.display = 'none';
    });
}

function showIndividualSpecificFields() {
    // Update form labels for individual training  
    const packagePriceLabel = document.querySelector('label[for="packagePrice"]');
    if (packagePriceLabel) {
        packagePriceLabel.innerHTML = 'Package Price *';
    }
    
    const priceHelp = document.querySelector('.package-price-help');
    if (priceHelp) {
        priceHelp.textContent = 'Total price for the training package';
    }
    
    // Hide capacity-related elements
    document.querySelectorAll('.group-only').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.individual-only').forEach(el => {
        el.style.display = 'block';
    });
}

// Schedule Type Logic
function toggleScheduleType() {
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value;
    const daysSchedule = document.getElementById('daysSchedule');
    const sessionsSchedule = document.getElementById('sessionsSchedule');
    
    if (scheduleType === 'days') {
        if (daysSchedule) daysSchedule.style.display = 'block';
        if (sessionsSchedule) sessionsSchedule.style.display = 'none';
    } else {
        if (daysSchedule) daysSchedule.style.display = 'none';
        if (sessionsSchedule) sessionsSchedule.style.display = 'block';
    }
    updateSchedulePreview();
}

// Update batch statuses based on participant type
function updateBatchStatuses() {
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value;
    const batchStatuses = document.querySelectorAll('.batch-status');
    
    batchStatuses.forEach(status => {
        if (participantType === 'group') {
            const maxCapacity = document.getElementById('maxParticipants')?.value || 8;
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
    
    // Initialize participant type - call this after DOM is ready
    setTimeout(() => {
        toggleParticipantType();
    }, 100);
    
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
    
    // Check if at least one time slot is added
    const timeSlots = document.querySelectorAll('.time-slot-item');
    if (timeSlots.length === 0) {
        errors.push('Please add at least one time slot');
        isValid = false;
    }
    
    displayErrors('step2', errors);
    return isValid;
}

function validateStep3() {
    const description = document.getElementById('description')?.value?.trim();
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
    const packageName = document.getElementById('packageName')?.value?.trim() || 'Sample Package';
    const packagePrice = parseFloat(document.getElementById('packagePrice')?.value) || 0;
    const participantType = document.querySelector('input[name="participantType"]:checked')?.value || 'individual';
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value || 'days';
    const description = document.getElementById('description')?.value?.trim() || 'Sample description';

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
        data.minCapacity = parseInt(document.getElementById('minParticipants')?.value) || 3;
        data.maxCapacity = parseInt(document.getElementById('maxParticipants')?.value) || 8;
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

function generatePackageId(name = 'PKG') {
    if (!name || typeof name !== 'string') {
        name = 'PKG';
    }
    const prefix = name.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
}

function generateComprehensivePreview() {
    const data = collectPackageData();
    
    // Generate package overview
    const overviewContainer = document.getElementById('packageOverview');
    if (overviewContainer) {
        let overviewHTML = `
            <div class="overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div><strong>📦 Package:</strong> ${data.name || 'Untitled Package'}</div>
                <div><strong>💰 Price:</strong> ₹${data.price || 0}${data.participantType === 'group' ? '/participant' : ''}</div>
                <div><strong>👤 Type:</strong> ${data.participantType === 'group' ? 'Group Training' : 'Individual Training'}</div>
                <div><strong>📅 Schedule:</strong> ${data.packageType === 'ongoing' ? 'Ongoing' : 'Fixed Duration'}</div>
            </div>
        `;
        
        if (data.participantType === 'group') {
            overviewHTML += `<div style="margin-top: 12px;"><strong>👥 Capacity:</strong> ${data.minCapacity || 2}-${data.maxCapacity || 8} participants</div>`;
        }
        
        overviewContainer.innerHTML = overviewHTML;
    }
    
    // Generate sessions list
    const sessionsList = document.getElementById('sessionsList');
    if (sessionsList) {
        const sessions = generatePreviewSessions(data);
        let sessionsHTML = '';
        
        if (sessions.length === 0) {
            sessionsHTML = '<p style="color: #666; text-align: center; padding: 20px;">Complete the schedule configuration to see sessions</p>';
        } else {
            sessionsHTML = sessions.map((session, index) => `
                <div class="session-item" data-session-id="${index}">
                    <div class="session-info">
                        <div class="session-date">${session.date}</div>
                        <div class="session-details">
                            ${session.time} • ${session.type} 
                            ${session.capacity ? `• ${session.capacity}` : ''}
                        </div>
                    </div>
                    <div class="session-actions">
                        <button class="btn btn-small btn-danger" onclick="cancelPreviewSession(${index})" 
                                title="${data.packageType === 'ongoing' ? 'Cancel session for this day' : 'Cancel and add replacement session'}">
                            Cancel
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        sessionsList.innerHTML = sessionsHTML;
    }
}

function generatePreviewSessions(data) {
    const sessions = [];
    const today = new Date();
    
    if (!data.scheduleType) return sessions;
    
    if (data.scheduleType === 'days' && data.days) {
        // Generate next 30 days for ongoing package
        const endDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        let currentDate = new Date(today);
        
        while (currentDate <= endDate) {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()];
            if (data.days.includes(dayName)) {
                // Add session for each time slot
                (data.timeSlots || ['9:00']).forEach(time => {
                    sessions.push({
                        date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        time: formatTime(time),
                        type: data.participantType === 'group' ? 'Group Session' : 'Individual Session',
                        capacity: data.participantType === 'group' ? `${data.minCapacity || 2}-${data.maxCapacity || 8} participants` : '1-on-1',
                        originalDate: new Date(currentDate)
                    });
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else if (data.scheduleType === 'sessions' && data.totalSessions) {
        // Generate fixed number of sessions
        const totalSessions = parseInt(data.totalSessions) || 8;
        const sessionsPerWeek = parseInt(data.sessionsPerWeek) || 2;
        const startDate = data.startDate ? new Date(data.startDate) : new Date(today.getTime() + (24 * 60 * 60 * 1000));
        
        let currentDate = new Date(startDate);
        let sessionsAdded = 0;
        
        while (sessionsAdded < totalSessions) {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()];
            
            // For fixed sessions, assume training happens on weekdays or selected days
            const trainingDays = ['Mon', 'Wed', 'Fri']; // Default, could be customized
            
            if (trainingDays.includes(dayName)) {
                (data.timeSlots || ['9:00']).forEach(time => {
                    if (sessionsAdded < totalSessions) {
                        sessions.push({
                            date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                            time: formatTime(time),
                            type: `Session ${sessionsAdded + 1}/${totalSessions}`,
                            capacity: data.participantType === 'group' ? `${data.minCapacity || 2}-${data.maxCapacity || 8} participants` : '1-on-1',
                            sessionNumber: sessionsAdded + 1,
                            originalDate: new Date(currentDate)
                        });
                        sessionsAdded++;
                    }
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
            
            // Safety check to prevent infinite loop
            if (currentDate.getTime() > today.getTime() + (365 * 24 * 60 * 60 * 1000)) {
                break;
            }
        }
    }
    
    return sessions.slice(0, 50); // Limit to first 50 sessions for performance
}

function formatTime(time) {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minute || '00'} ${suffix}`;
}

function cancelPreviewSession(sessionIndex) {
    const data = collectPackageData();
    const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionIndex}"]`);
    
    if (!sessionItem) return;
    
    if (data.packageType === 'ongoing') {
        // For ongoing packages, just mark as cancelled
        if (confirm('Cancel this session? This will only cancel the session for this specific day.')) {
            sessionItem.classList.add('cancelled');
            sessionItem.querySelector('.session-details').innerHTML += ' • <span style="color: #dc3545;">CANCELLED</span>';
            sessionItem.querySelector('.btn-danger').textContent = 'Cancelled';
            sessionItem.querySelector('.btn-danger').disabled = true;
        }
    } else {
        // For fixed packages, cancel and add replacement
        if (confirm('Cancel this session? A replacement session will be added at the end of the package.')) {
            sessionItem.classList.add('cancelled');
            sessionItem.querySelector('.session-details').innerHTML += ' • <span style="color: #dc3545;">CANCELLED - Replacement Added</span>';
            sessionItem.querySelector('.btn-danger').textContent = 'Cancelled';
            sessionItem.querySelector('.btn-danger').disabled = true;
            
            // Add replacement session (simplified - would need more logic in real implementation)
            const sessionsList = document.getElementById('sessionsList');
            const replacementHTML = `
                <div class="session-item" style="border-left-color: #fbbf24;">
                    <div class="session-info">
                        <div class="session-date">Replacement Session</div>
                        <div class="session-details">
                            To be scheduled • ${data.participantType === 'group' ? 'Group Session' : 'Individual Session'}
                        </div>
                    </div>
                    <div class="session-actions">
                        <button class="btn btn-small" disabled>Replacement</button>
                    </div>
                </div>
            `;
            sessionsList.insertAdjacentHTML('beforeend', replacementHTML);
        }
    }
}

function refreshPreview() {
    generateComprehensivePreview();
}

// Update the existing function to use the new comprehensive preview
function generatePackageSummary() {
    generateComprehensivePreview();
}

function generateBookingLink(packageData) {
    const baseUrl = window.location.origin + window.location.pathname;
    const bookingUrl = `${baseUrl}#book/${packageData.id}`;

    const bookingLinkElement = document.getElementById('booking-link');
    if (bookingLinkElement) {
        bookingLinkElement.value = bookingUrl;
    }

    // Update package name in success page
    const packageNameElement = document.getElementById('createdPackageName');
    if (packageNameElement) {
        packageNameElement.textContent = packageData.name || 'Training Package';
    }

    // Update package ID
    const packageIdElement = document.getElementById('packageId');
    if (packageIdElement) {
        packageIdElement.textContent = packageData.id;
    }

    console.log('Package created successfully:', packageData);
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
    if (bookingLinkInput && bookingLinkInput.value) {
        try {
            bookingLinkInput.select();
            document.execCommand('copy');
            alert('Booking link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy booking link:', err);
            alert('Failed to copy booking link. Please copy manually.');
        }
    } else {
        alert('No booking link available to copy.');
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

