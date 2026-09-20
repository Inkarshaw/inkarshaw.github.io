document.addEventListener('DOMContentLoaded', function() {
            const jsPDF = window.jspdf?.jsPDF || null;
            const html2canvasLib = window.html2canvas || null;
            const generateBtn = document.getElementById('generate-pdf');
            const printBtn = document.getElementById('print-document');
            const fillFormBtn = document.getElementById('fill-form');
            const newPassportBtn = document.getElementById('new-passport');
            const saveDefaultsBtn = document.getElementById('save-defaults');
            const clearDefaultsBtn = document.getElementById('clear-defaults');
            const clearDraftBtn = document.getElementById('clear-draft');
            const mobilePreviewBtn = document.getElementById('mobile-preview');
            const mobilePdfBtn = document.getElementById('mobile-pdf');
            const passportTypeSelect = document.getElementById('passportType');
            const languageSelect = document.getElementById('language');
            const notification = document.getElementById('notification');
            const officerCountInput = document.getElementById('officer-count');
            const addOfficerBtn = document.getElementById('add-officer');
            const accusedCountInput = document.getElementById('accused-count');
            const addAccusedBtn = document.getElementById('add-accused');
            const policeOfficersContainer = document.getElementById('police-officers-container');
            const accusedPersonsContainer = document.getElementById('accused-persons-container');
            const policeOfficersList = document.getElementById('police-officers-list');
            const languageContents = document.querySelectorAll('.language-content');
            const contentPlaceholder = document.getElementById('content-placeholder');
            const autoSaveIndicator = document.getElementById('auto-save-indicator');
            const contentStatus = document.getElementById('content-status');
            const contentStatusText = document.getElementById('content-status-text');
            const documentOverflowWarning = document.getElementById('document-overflow-warning');
            const accusedSection = document.getElementById('accused-section');
            const courtSection = document.getElementById('court-section');
            const transferFields = document.getElementById('transfer-fields');
            const firFields = document.getElementById('fir-fields');
            const viseraFields = document.getElementById('visera-fields');
            const labReportFields = document.getElementById('lab-report-fields');
            const ptWarrantFields = document.getElementById('pt-warrant-fields');
            const formalArrestFields = document.getElementById('formal-arrest-fields');
            const sickPassportFields = document.getElementById('sick-passport-fields');
            const propertyLabFields = document.getElementById('property-lab-fields');
            const mlPassportFields = document.getElementById('ml-passport-fields');
            const escortFields = document.getElementById('escort-fields');
            const timeContainer = document.getElementById('time-container');
            const timeSuffix = document.getElementById('time-suffix');
            const courtSelect = document.getElementById('court');
            const courtNumberInput = document.getElementById('courtNumber');
            
            // Date and time sections for conditional display
            const dateTimeSection = document.getElementById('date-time-section');
            const timeSection = document.getElementById('time-section');
            
            // ML Passport specific fields
            const leaveDaysInput = document.getElementById('leaveDays');
            const leaveStartDateInput = document.getElementById('leaveStartDate');
            const leaveEndDateInput = document.getElementById('leaveEndDate');
            const reportBackDateInput = document.getElementById('reportBackDate');
            
            let officerCounter = 1;
            let accusedCounter = 1;
            let currentLanguage = 'tamil';
            let autoSaveTimeout;
            let previewRefreshTimeout;
            
            const passportConfig = {
                'Lab Report': {
                    available: true, fieldSectionId: 'lab-report-fields', templateKey: 'lab-report',
                    requiresCourt: false, requiresAccused: false, showMainDateTime: true
                },
                'PT warrant': {
                    available: true, fieldSectionId: 'pt-warrant-fields', templateKey: 'pt-warrant',
                    requiresCourt: true, requiresAccused: true, showMainDateTime: true
                },
                'Escort': {
                    available: true, fieldSectionId: 'escort-fields', templateKey: 'escort',
                    requiresCourt: true, requiresAccused: true, showMainDateTime: true, escortSection: true
                },
                'Visera Report': {
                    available: true, fieldSectionId: 'visera-fields', templateKey: 'visera-report',
                    requiresCourt: true, requiresAccused: false, showMainDateTime: true
                },
                'Relieving Passport': {
                    available: false, fieldSectionId: null, templateKey: null,
                    requiresCourt: false, requiresAccused: false, showMainDateTime: false
                },
                'Property to lab': {
                    available: true, fieldSectionId: 'property-lab-fields', templateKey: 'property-lab',
                    requiresCourt: false, requiresAccused: false, showMainDateTime: true
                },
                'Sick Passport': {
                    available: true, fieldSectionId: 'sick-passport-fields', templateKey: 'sick-passport',
                    requiresCourt: false, requiresAccused: false, showMainDateTime: false
                },
                'ML Passport': {
                    available: true, fieldSectionId: 'ml-passport-fields', templateKey: 'ml-passport',
                    requiresCourt: false, requiresAccused: false, showMainDateTime: false
                },
                'Formal Arrest': {
                    available: true, fieldSectionId: 'formal-arrest-fields', templateKey: 'formal-arrest',
                    requiresCourt: true, requiresAccused: true, showMainDateTime: true
                },
                'Transfer Passport': {
                    available: true, fieldSectionId: 'transfer-fields', templateKey: 'transfer-passport',
                    requiresCourt: true, requiresAccused: true, showMainDateTime: true
                },
                'FIR Filing Passport': {
                    available: true, fieldSectionId: 'fir-fields', templateKey: 'fir-filing',
                    requiresCourt: true, requiresAccused: false, showMainDateTime: true
                }
            };

            const conditionalFieldSections = [
                transferFields, firFields, viseraFields, labReportFields, ptWarrantFields,
                formalArrestFields, sickPassportFields, propertyLabFields, mlPassportFields
            ];
            
            function showNotification(message, type) {
                notification.textContent = message;
                notification.className = 'notification ' + type;
                notification.style.display = 'block';
                
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 5000);
            }
            
            // Function to parse date in DD/MM/YYYY format
            function parseDate(dateString) {
                if (!dateString || !isValidDate(dateString)) return null;
                
                const parts = dateString.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS Date
                const year = parseInt(parts[2], 10);
                
                return new Date(year, month, day);
            }
            
            // Function to format date as DD/MM/YYYY
            function formatDate(date) {
                if (!date) return '';
                
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                
                return `${day}/${month}/${year}`;
            }
            
            // Function to calculate leave end date and report back date
            function calculateLeaveDates() {
                const leaveDays = parseInt(leaveDaysInput.value) || 0;
                const startDate = parseDate(leaveStartDateInput.value);
                
                if (!startDate || leaveDays <= 0) {
                    leaveEndDateInput.value = '';
                    reportBackDateInput.value = '';
                    return;
                }
                
                // Calculate leave end date (start date + leave days - 1)
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + leaveDays - 1);
                leaveEndDateInput.value = formatDate(endDate);
                
                // Calculate report back date (next working day after leave ends)
                const reportBackDate = new Date(endDate);
                reportBackDate.setDate(reportBackDate.getDate() + 1);
                
                // Skip weekends (Saturday = 6, Sunday = 0)
                if (reportBackDate.getDay() === 6) { // Saturday
                    reportBackDate.setDate(reportBackDate.getDate() + 2); // Skip to Monday
                } else if (reportBackDate.getDay() === 0) { // Sunday
                    reportBackDate.setDate(reportBackDate.getDate() + 1); // Skip to Monday
                }
                
                reportBackDateInput.value = formatDate(reportBackDate);
            }
            
            function isValidCrimeNumber(crimeNumber) {
                const regex = /^\d+\/\d{4}$/;
                return regex.test(crimeNumber);
            }
            
            function formatCrimeNumber(input) {
                let value = input.value.replace(/[^\d\/]/g, '');
                
                const parts = value.split('/');
                if (parts.length > 2) {
                    value = parts[0] + '/' + parts.slice(1).join('');
                }
                
                if (value.length >= 4 && !value.includes('/')) {
                    value = value.substring(0, value.length - 4) + '/' + value.substring(value.length - 4);
                }
                
                input.value = value;
            }
            
            function getOrdinalSuffix(num) {
                if (!num || isNaN(num)) return '';
                
                const j = num % 10;
                const k = num % 100;
                
                if (j === 1 && k !== 11) {
                    return num + "st";
                }
                if (j === 2 && k !== 12) {
                    return num + "nd";
                }
                if (j === 3 && k !== 13) {
                    return num + "rd";
                }
                return num + "th";
            }
            
            function isValidDate(dateString) {
                const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                if (!regex.test(dateString)) return false;
                
                const parts = dateString.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                
                if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;
                
                const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                
                if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
                    monthLength[1] = 29;
                }
                
                return day > 0 && day <= monthLength[month - 1];
            }
            
            function isValidTime(timeString) {
                if (!timeString || timeString.trim() === '') return true;
                const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                return regex.test(timeString);
            }
            
            function showError(inputId, message) {
                const input = document.getElementById(inputId);
                const errorElement = document.getElementById(`${inputId}-error`);

                if (input) {
                    input.classList.add('input-error');
                    input.classList.remove('input-success');
                    input.setAttribute('aria-invalid', 'true');
                }

                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                }
            }
            
            function hideError(inputId) {
                const input = document.getElementById(inputId);
                const errorElement = document.getElementById(`${inputId}-error`);

                if (input) {
                    input.classList.remove('input-error');
                    input.removeAttribute('aria-invalid');
                    if (String(input.value ?? '').trim()) {
                        input.classList.add('input-success');
                    } else {
                        input.classList.remove('input-success');
                    }
                }

                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
            
            function validateField() {
                const fieldId = this.id;
                const value = this.value.trim();
                
                if (fieldId === 'time' || fieldId === 'mlTime' || fieldId === 'sickTime') {
                    if (value && !isValidTime(value)) {
                        showError(fieldId, 'Please enter a valid time in HH:MM format or leave blank');
                        return false;
                    } else {
                        hideError(fieldId);
                        return true;
                    }
                }
                
                if (!value) {
                    if (this.hasAttribute('required')) {
                        showError(fieldId, 'This field is required');
                        return false;
                    } else {
                        hideError(fieldId);
                        return true;
                    }
                }
                
                if (fieldId.includes('CrimeNumber')) {
                    if (!isValidCrimeNumber(value)) {
                        showError(fieldId, 'Please enter a valid crime number in format: number/year (e.g., 123/2024)');
                        return false;
                    }
                }
                
                if (fieldId === 'date' || fieldId === 'sickDate' || fieldId === 'mlDate' || fieldId === 'pmDate' || fieldId === 'narDate' || fieldId === 'transferOrderDate' || fieldId === 'propertySeizedDate' || fieldId === 'leaveStartDate' || fieldId === 'leaveEndDate' || fieldId === 'reportBackDate') {
                    if (!isValidDate(value)) {
                        showError(fieldId, 'Please enter a valid date in DD/MM/YYYY format');
                        return false;
                    }
                }
                
                if (fieldId === 'court') {
                    if (!value) {
                        showError(fieldId, 'Please select a court');
                        return false;
                    }
                }
                
                if (fieldId === 'courtNumber') {
                    if (courtSelect.value && (!value || isNaN(value) || value < 1)) {
                        showError(fieldId, 'Please enter a valid court number');
                        return false;
                    }
                }
                
                if (fieldId.includes('age') || fieldId === 'deceasedAge') {
                    if (isNaN(value) || value < 1 || value > 120) {
                        showError(fieldId, 'Please enter a valid age');
                        return false;
                    }
                }
                
                if (fieldId === 'leaveDays') {
                    if (isNaN(value) || value < 1 || value > 365) {
                        showError(fieldId, 'Please enter a valid number of days (1-365)');
                        return false;
                    }
                }
                
                hideError(fieldId);
                return true;
            }
            
            function getSelectedPassportConfig() {
                return passportConfig[passportTypeSelect.value] || null;
            }

            function getSelectedPassportSection() {
                const config = getSelectedPassportConfig();
                return config?.fieldSectionId
                    ? document.getElementById(config.fieldSectionId)
                    : null;
            }

            function updateContentVisibility() {
                const config = getSelectedPassportConfig();

                conditionalFieldSections.forEach(section => section.classList.remove('active'));
                escortFields.classList.add('hidden');
                dateTimeSection.classList.add('hidden');
                timeSection.classList.add('hidden');

                if (config?.fieldSectionId) {
                    const section = document.getElementById(config.fieldSectionId);
                    if (config.escortSection) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('active');
                    }
                }

                if (config?.showMainDateTime) {
                    dateTimeSection.classList.remove('hidden');
                    timeSection.classList.remove('hidden');
                }

                updateContentTemplates();
                toggleAccusedSection();
                toggleCourtSection();
                updateContentStatus();
            }
            
            function updateContentTemplates() {
                document.querySelectorAll('.content-text').forEach(el => {
                    el.style.display = 'none';
                });
                
                const config = getSelectedPassportConfig();
                contentPlaceholder.style.display = 'block';

                if (!config?.templateKey || !config.available) return;

                const content = document.getElementById(`${config.templateKey}-${currentLanguage}-content`);
                if (content) {
                    content.style.display = 'block';
                    contentPlaceholder.style.display = 'none';
                }
            }
            
            function toggleCourtSection() {
                const config = getSelectedPassportConfig();
                const requiresCourt = Boolean(config?.requiresCourt);
                
                courtSection.classList.toggle('hidden', !requiresCourt);
                courtSelect.toggleAttribute('required', requiresCourt);
                courtNumberInput.toggleAttribute('required', requiresCourt);
            }
            
            function toggleAccusedSection() {
                const config = getSelectedPassportConfig();
                accusedSection.classList.toggle('hidden', !config?.requiresAccused);
            }
            
            function updateContentStatus() {
                const selectedType = passportTypeSelect.value;
                const config = getSelectedPassportConfig();
                
                if (!selectedType) {
                    contentStatus.classList.add('hidden');
                    return;
                }
                
                if (config?.available) {
                    contentStatus.className = 'content-status available';
                    contentStatusText.textContent = `✓ Content template available for ${selectedType}`;
                } else {
                    contentStatus.className = 'content-status unavailable';
                    contentStatusText.textContent = `⚠ No content template available for ${selectedType}`;
                }
                
                contentStatus.classList.remove('hidden');
            }
            
            function createPoliceOfficerForm(index) {
                const officerDiv = document.createElement('div');
                officerDiv.className = 'officer-container';
                officerDiv.id = `officer-${index}`;
                
                officerDiv.innerHTML = `
                    <h4>Police Officer ${index}</h4>
                    <div class="officer-details">
                        <div class="form-group">
                            <label for="designation${index}" class="required">Designation with Number</label>
                            <input type="text" id="designation${index}" placeholder="Enter designation with number (e.g., SI 1234, HC 5678)">
                            <div class="error-message" id="designation${index}-error">Please enter designation with number</div>
                            <div class="help-text">Enter designation followed by number (e.g., SI 1234, HC 5678, PC 8901)</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="fullName${index}" class="required">Full Name</label>
                        <input type="text" id="fullName${index}" placeholder="Enter full name">
                        <div class="error-message" id="fullName${index}-error">Please enter a full name</div>
                    </div>
                    ${index > 1 ? `<button type="button" class="remove-officer" data-index="${index}">Remove Officer</button>` : ''}
                `;
                
                return officerDiv;
            }
            
            function createAccusedForm(index) {
                const accusedDiv = document.createElement('div');
                accusedDiv.className = 'accused-container';
                accusedDiv.id = `accused-${index}`;
                
                accusedDiv.innerHTML = `
                    <h4>Accused Person ${index}</h4>
                    <div class="accused-details">
                        <div class="form-group">
                            <label for="accusedName${index}" class="required">Name</label>
                            <input type="text" id="accusedName${index}" placeholder="Enter accused name">
                            <div class="error-message" id="accusedName${index}-error">Please enter an accused name</div>
                        </div>
                        <div class="form-group">
                            <label for="age${index}" class="required">Age</label>
                            <input type="text" id="age${index}" placeholder="Enter age">
                            <div class="error-message" id="age${index}-error">Please enter a valid age</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="fatherName${index}" class="required">Father Name</label>
                        <input type="text" id="fatherName${index}" placeholder="Enter father's name">
                            <div class="error-message" id="fatherName${index}-error">Please enter a father name</div>
                    </div>
                    ${index > 1 ? `<button type="button" class="remove-accused" data-index="${index}">Remove Accused</button>` : ''}
                `;
                
                return accusedDiv;
            }
            
            function createPoliceOfficerDocumentField(index) {
                const officerContainer = document.createElement('div');
                officerContainer.className = 'officer-container-preview';
                officerContainer.id = `police-officer-${index}`;
                
                officerContainer.innerHTML = `
                    <div class="officer-details-preview">
                        <div class="preview-field compact-field officer-designation empty" id="designation-field-${index}" placeholder="Designation with Number"></div>
                        <div class="preview-field compact-field officer-name empty" id="full-name-field-${index}" placeholder="Full Name"></div>
                    </div>
                `;
                
                return officerContainer;
            }
            
            function getOfficerData() {
                const data = [];
                for (let i = 1; i <= officerCounter; i++) {
                    data.push({
                        designation: document.getElementById(`designation${i}`)?.value || '',
                        fullName: document.getElementById(`fullName${i}`)?.value || ''
                    });
                }
                return data;
            }

            function getAccusedData() {
                const data = [];
                for (let i = 1; i <= accusedCounter; i++) {
                    data.push({
                        name: document.getElementById(`accusedName${i}`)?.value || '',
                        age: document.getElementById(`age${i}`)?.value || '',
                        fatherName: document.getElementById(`fatherName${i}`)?.value || ''
                    });
                }
                return data;
            }

            function updatePoliceOfficers(preservedData = getOfficerData()) {
                let count = parseInt(officerCountInput.value) || 1;
                
                if (count < 1) count = 1;
                if (count > 10) {
                    count = 10;
                    showNotification('Maximum 10 police officers allowed', 'error');
                }
                officerCountInput.value = count;
                
                policeOfficersContainer.innerHTML = '';
                for (let i = 1; i <= count; i++) {
                    policeOfficersContainer.appendChild(createPoliceOfficerForm(i));
                    const saved = preservedData[i - 1];
                    if (saved) {
                        document.getElementById(`designation${i}`).value = saved.designation || '';
                        document.getElementById(`fullName${i}`).value = saved.fullName || '';
                    }
                }
                officerCounter = count;
                
                policeOfficersList.innerHTML = '';
                for (let i = 1; i <= count; i++) {
                    policeOfficersList.appendChild(createPoliceOfficerDocumentField(i));
                }

                bindFieldEvents(policeOfficersContainer);
                
                policeOfficersContainer.querySelectorAll('.remove-officer').forEach(button => {
                    button.addEventListener('click', function() {
                        removePoliceOfficer(parseInt(this.getAttribute('data-index')));
                    });
                });
            }
            
            function updateAccusedPersons(preservedData = getAccusedData()) {
                let count = parseInt(accusedCountInput.value) || 1;
                
                if (count < 1) count = 1;
                if (count > 10) {
                    count = 10;
                    showNotification('Maximum 10 accused persons allowed', 'error');
                }
                accusedCountInput.value = count;
                
                accusedPersonsContainer.innerHTML = '';
                for (let i = 1; i <= count; i++) {
                    accusedPersonsContainer.appendChild(createAccusedForm(i));
                    const saved = preservedData[i - 1];
                    if (saved) {
                        document.getElementById(`accusedName${i}`).value = saved.name || '';
                        document.getElementById(`age${i}`).value = saved.age || '';
                        document.getElementById(`fatherName${i}`).value = saved.fatherName || '';
                    }
                }
                accusedCounter = count;

                bindFieldEvents(accusedPersonsContainer);
                
                accusedPersonsContainer.querySelectorAll('.remove-accused').forEach(button => {
                    button.addEventListener('click', function() {
                        removeAccusedPerson(parseInt(this.getAttribute('data-index')));
                    });
                });
            }
            
            function addPoliceOfficer() {
                const preservedData = getOfficerData();
                if (officerCounter >= 10) {
                    showNotification('Maximum 10 police officers allowed', 'error');
                    return;
                }
                officerCounter++;
                officerCountInput.value = officerCounter;
                updatePoliceOfficers(preservedData);
                autoSave();
            }
            
            function addAccusedPerson() {
                const preservedData = getAccusedData();
                if (accusedCounter >= 10) {
                    showNotification('Maximum 10 accused persons allowed', 'error');
                    return;
                }
                accusedCounter++;
                accusedCountInput.value = accusedCounter;
                updateAccusedPersons(preservedData);
                autoSave();
            }
            
            function removePoliceOfficer(index) {
                if (officerCounter <= 1) {
                    showNotification('At least one police officer is required', 'error');
                    return;
                }
                
                const preservedData = getOfficerData();
                preservedData.splice(index - 1, 1);
                officerCounter--;
                officerCountInput.value = officerCounter;
                updatePoliceOfficers(preservedData);
                autoSave();
            }
            
            function removeAccusedPerson(index) {
                if (accusedCounter <= 1) {
                    showNotification('At least one accused person is required', 'error');
                    return;
                }
                
                const preservedData = getAccusedData();
                preservedData.splice(index - 1, 1);
                accusedCounter--;
                accusedCountInput.value = accusedCounter;
                updateAccusedPersons(preservedData);
                autoSave();
            }
            
            function validateRequiredField(field, message = 'This field is required') {
                if (!field) return false;

                const value = String(field.value ?? '').trim();
                if (!value) {
                    showError(field.id, message);
                    return false;
                }

                return validateField.call(field);
            }

            function validateRequiredLabels(container) {
                if (!container) return true;

                let isValid = true;
                container.querySelectorAll('label.required[for]').forEach(label => {
                    const field = document.getElementById(label.htmlFor);
                    if (!validateRequiredField(field)) {
                        isValid = false;
                    }
                });
                return isValid;
            }

            function validateForm() {
                let isValid = true;
                const config = getSelectedPassportConfig();

                if (!validateRequiredField(passportTypeSelect, 'Please select a passport type')) {
                    isValid = false;
                }

                if (!config || !config.available) {
                    return false;
                }

                const typeSection = config.fieldSectionId
                    ? document.getElementById(config.fieldSectionId)
                    : null;

                if (!validateRequiredLabels(typeSection)) {
                    isValid = false;
                }

                if (config.showMainDateTime && !validateRequiredLabels(dateTimeSection)) {
                    isValid = false;
                }

                // Time is optional, but if entered it must be valid.
                const timeFieldId = passportTypeSelect.value === 'ML Passport'
                    ? 'mlTime'
                    : passportTypeSelect.value === 'Sick Passport'
                        ? 'sickTime'
                        : 'time';
                const timeField = document.getElementById(timeFieldId);
                if (timeField && !validateField.call(timeField)) {
                    isValid = false;
                }

                if (config.requiresCourt) {
                    if (!validateRequiredField(courtSelect, 'Please select a court')) {
                        isValid = false;
                    }
                    if (!validateRequiredField(courtNumberInput, 'Please enter a court number')) {
                        isValid = false;
                    }
                }

                if (!validateRequiredLabels(policeOfficersContainer)) {
                    isValid = false;
                }

                if (config.requiresAccused && !validateRequiredLabels(accusedPersonsContainer)) {
                    isValid = false;
                }

                if (!isValid) {
                    const invalidFields = Array.from(document.querySelectorAll('[aria-invalid="true"]'))
                        .filter(field => field.offsetParent !== null);
                    const count = invalidFields.length;
                    if (count) {
                        showNotification(`${count} field${count === 1 ? '' : 's'} need attention. Please complete the highlighted field${count === 1 ? '' : 's'}.`, 'error');
                        const firstInvalid = invalidFields[0];
                        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 350);
                    }
                }

                return isValid;
            }
            
            function getCurrentStationValue() {
                if (passportTypeSelect.value === 'Escort') {
                    return document.getElementById('escortPoliceStation')?.value?.trim() || '';
                }

                const section = getSelectedPassportSection();
                return section?.querySelector('input[id$="PoliceStation"]')?.value?.trim() || '';
            }

            function saveCommonDefaults() {
                const station = getCurrentStationValue();
                const officers = getOfficerData().filter(item => item.designation || item.fullName);

                const defaults = {
                    version: 1,
                    savedAt: new Date().toISOString(),
                    station,
                    language: currentLanguage,
                    officers,
                    court: courtSelect.value || '',
                    courtNumber: courtNumberInput.value || '',
                    centralPrison: document.getElementById('centralPrison')?.value || '',
                    arrestPrison: document.getElementById('arrestPrison')?.value || ''
                };

                try {
                    localStorage.setItem('policePassportCommonDefaults', JSON.stringify(defaults));
                    showNotification('Common defaults saved in this browser', 'success');
                } catch (error) {
                    console.error('Unable to save common passport defaults:', error);
                    showNotification('Common defaults could not be saved', 'error');
                }
            }

            function applyCommonDefaults({ notify = false, onlyIfBlank = true } = {}) {
                const saved = localStorage.getItem('policePassportCommonDefaults');
                if (!saved) return false;

                try {
                    const defaults = JSON.parse(saved);

                    if (defaults.language && (!onlyIfBlank || !languageSelect.value)) {
                        currentLanguage = defaults.language;
                        languageSelect.value = defaults.language;
                        updateLanguageContent();
                    }

                    if (defaults.station) {
                        document.querySelectorAll('input[id$="PoliceStation"]').forEach(input => {
                            if (!onlyIfBlank || !input.value.trim()) {
                                input.value = defaults.station;
                            }
                        });
                    }

                    if (Array.isArray(defaults.officers) && defaults.officers.length) {
                        const currentOfficers = getOfficerData();
                        const hasOfficerData = currentOfficers.some(item => item.designation || item.fullName);
                        if (!onlyIfBlank || !hasOfficerData) {
                            officerCountInput.value = Math.min(defaults.officers.length, 10);
                            updatePoliceOfficers(defaults.officers.slice(0, 10));
                        }
                    }

                    if (defaults.court && (!onlyIfBlank || !courtSelect.value)) {
                        courtSelect.value = defaults.court;
                    }
                    if (defaults.courtNumber && (!onlyIfBlank || !courtNumberInput.value.trim())) {
                        courtNumberInput.value = defaults.courtNumber;
                    }

                    const centralPrison = document.getElementById('centralPrison');
                    if (centralPrison && defaults.centralPrison && (!onlyIfBlank || !centralPrison.value.trim())) {
                        centralPrison.value = defaults.centralPrison;
                    }

                    const arrestPrison = document.getElementById('arrestPrison');
                    if (arrestPrison && defaults.arrestPrison && (!onlyIfBlank || !arrestPrison.value.trim())) {
                        arrestPrison.value = defaults.arrestPrison;
                    }

                    scheduleLivePreview();
                    if (notify) {
                        showNotification('Common defaults applied', 'success');
                    }
                    return true;
                } catch (error) {
                    console.error('Unable to load common passport defaults:', error);
                    localStorage.removeItem('policePassportCommonDefaults');
                    return false;
                }
            }

            function clearCommonDefaults() {
                localStorage.removeItem('policePassportCommonDefaults');
                showNotification('Common defaults cleared from this browser', 'success');
            }

            function autoSave() {
                clearTimeout(autoSaveTimeout);
                
                autoSaveTimeout = setTimeout(() => {
                    const fields = {};
                    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(field => {
                        fields[field.id] = field.type === 'checkbox' ? field.checked : field.value;
                    });

                    const formData = {
                        version: 3,
                        savedAt: new Date().toISOString(),
                        passportType: passportTypeSelect.value,
                        officerCount: officerCounter,
                        accusedCount: accusedCounter,
                        language: currentLanguage,
                        officers: getOfficerData(),
                        accused: getAccusedData(),
                        fields: fields
                    };
                    
                    try {
                        localStorage.setItem('policePassportFormData', JSON.stringify(formData));
                        autoSaveIndicator.style.display = 'block';
                        setTimeout(() => {
                            autoSaveIndicator.style.display = 'none';
                        }, 2000);
                    } catch (error) {
                        console.error('Unable to save passport draft:', error);
                        showNotification('Draft could not be saved in this browser', 'error');
                    }
                }, 700);
            }
            
            function loadSavedData() {
                const savedData = localStorage.getItem('policePassportFormData');
                if (!savedData) return;

                try {
                    const formData = JSON.parse(savedData);

                    passportTypeSelect.value = formData.passportType || '';
                    currentLanguage = formData.language || 'tamil';
                    languageSelect.value = currentLanguage;

                    officerCountInput.value = formData.officerCount || 1;
                    updatePoliceOfficers(Array.isArray(formData.officers) ? formData.officers : []);

                    accusedCountInput.value = formData.accusedCount || 1;
                    updateAccusedPersons(Array.isArray(formData.accused) ? formData.accused : []);

                    updateContentVisibility();
                    updateLanguageContent();

                    if (formData.fields && typeof formData.fields === 'object') {
                        const savedFields = { ...formData.fields };

                        // v3 migration: remove legacy 2023 transfer-order defaults that
                        // were previously prefilled by the page rather than entered by the user.
                        if ((formData.version || 1) < 3) {
                            if (savedFields.transferOrderNumber === 'RC.No.Estt/EZ/2389/82/2023 EZO.No.485/2023') {
                                savedFields.transferOrderNumber = '';
                            }
                            if (savedFields.transferOrderDate === '13/06/2023') {
                                savedFields.transferOrderDate = '';
                            }
                        }

                        Object.entries(savedFields).forEach(([id, value]) => {
                            const field = document.getElementById(id);
                            if (!field) return;
                            if (field.type === 'checkbox') {
                                field.checked = Boolean(value);
                            } else {
                                field.value = value ?? '';
                            }
                        });
                    } else {
                        // Backward compatibility with drafts saved by the earlier version.
                        if (formData.passportType === 'ML Passport') {
                            document.getElementById('mlDate').value = formData.date || '';
                            document.getElementById('mlTime').value = formData.time || '';
                        } else {
                            document.getElementById('date').value = formData.date || '';
                            document.getElementById('time').value = formData.time || '';
                        }
                        if (formData.escortPoliceStation) {
                            document.getElementById('escortPoliceStation').value = formData.escortPoliceStation || '';
                            document.getElementById('escortCrimeNumber').value = formData.escortCrimeNumber || '';
                            document.getElementById('escortSection').value = formData.escortSection || '';
                        }
                    }

                    if (passportTypeSelect.value) {
                        fillDocumentPreview(true);
                    }
                    showNotification('Previous form data loaded successfully', 'success');
                } catch (error) {
                    console.error('Unable to load saved passport draft:', error);
                    localStorage.removeItem('policePassportFormData');
                    showNotification('Saved draft was invalid and has been cleared', 'error');
                }
            }
            
            function updateLanguageContent() {
                languageContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                document.getElementById(`${currentLanguage}-content`).classList.add('active');
                
                updateContentTemplates();
            }
            
            function fillDocumentPreview(skipValidation = false) {
                if (!skipValidation && !validateForm()) {
                    showNotification('Please fix the errors in the form before generating the document', 'error');
                    return false;
                }
                
                const passportType = passportTypeSelect.value;
                
                // Update police officers in preview
                for (let i = 1; i <= officerCounter; i++) {
                    const designation = document.getElementById(`designation${i}`).value;
                    const fullName = document.getElementById(`fullName${i}`).value;
                    
                    const designationField = document.getElementById(`designation-field-${i}`);
                    const fullNameField = document.getElementById(`full-name-field-${i}`);
                    
                    if (designation) {
                        designationField.textContent = designation;
                        designationField.classList.remove('empty');
                    } else {
                        designationField.textContent = '';
                        designationField.classList.add('empty');
                    }
                    
                    if (fullName) {
                        fullNameField.textContent = fullName;
                        fullNameField.classList.remove('empty');
                    } else {
                        fullNameField.textContent = '';
                        fullNameField.classList.add('empty');
                    }
                }
                
                // Update police station field
                let policeStationValue = '';
                if (passportType === 'Escort') {
                    policeStationValue = document.getElementById('escortPoliceStation').value;
                } else {
                    const typeSection = getSelectedPassportSection();
                    if (typeSection) {
                        const policeStation = typeSection.querySelector('input[id$="PoliceStation"]');
                        if (policeStation) policeStationValue = policeStation.value;
                    }
                }
                
                const policeStationField = document.getElementById('police-station-field');
                if (policeStationValue) {
                    policeStationField.textContent = policeStationValue;
                    policeStationField.classList.remove('empty');
                } else {
                    policeStationField.textContent = '';
                    policeStationField.classList.add('empty');
                }
                
                // Update date and time - handle ML Passport separately
                let dateValue, timeValue;
                
                if (passportType === 'ML Passport') {
                    dateValue = document.getElementById('mlDate').value;
                    timeValue = document.getElementById('mlTime').value;
                } else if (passportType === 'Sick Passport') {
                    dateValue = document.getElementById('sickDate').value;
                    timeValue = document.getElementById('sickTime').value;
                } else {
                    dateValue = document.getElementById('date').value;
                    timeValue = document.getElementById('time').value;
                }
                
                const dateField = document.getElementById('date-field');
                if (dateValue) {
                    dateField.textContent = dateValue;
                    dateField.classList.remove('empty');
                } else {
                    dateField.textContent = '';
                    dateField.classList.add('empty');
                }
                
                const timeField = document.getElementById('time-field');
                if (timeValue) {
                    timeField.textContent = timeValue;
                    timeField.classList.remove('empty');
                    timeSuffix.style.display = 'inline';
                } else {
                    timeField.textContent = '';
                    timeField.classList.add('empty');
                    timeSuffix.style.display = 'none';
                }
                
                // Update accused list for relevant passport types
                if (passportType !== 'FIR Filing Passport' && passportType !== 'Visera Report' && passportType !== 'Lab Report' && passportType !== 'Sick Passport' && passportType !== 'Property to lab' && passportType !== 'ML Passport') {
                    let accusedListTamil = '';
                    let accusedListEnglish = '';
                    let accusedListPtTamil = '';
                    let accusedListPtEnglish = '';
                    let accusedListFormalArrestTamil = '';
                    let accusedListFormalArrestEnglish = '';
                    
                    for (let i = 1; i <= accusedCounter; i++) {
                        const accusedName = document.getElementById(`accusedName${i}`).value;
                        const age = document.getElementById(`age${i}`).value;
                        const fatherName = document.getElementById(`fatherName${i}`).value;
                        
                        if (accusedName && age && fatherName) {
                            if (i > 1) {
                                accusedListTamil += ', ';
                                accusedListEnglish += ', ';
                                accusedListPtTamil += ', ';
                                accusedListPtEnglish += ', ';
                                accusedListFormalArrestTamil += ', ';
                                accusedListFormalArrestEnglish += ', ';
                            }
                            
                            accusedListTamil += `${accusedName} ஆ/வ ${age} த/பெ ${fatherName}`;
                            accusedListEnglish += `${accusedName} S/o ${fatherName} aged ${age}`;
                            accusedListPtTamil += `${accusedName} ஆ/வ ${age} த/பெ ${fatherName}`;
                            accusedListPtEnglish += `${accusedName} S/o ${fatherName} aged ${age}`;
                            accusedListFormalArrestTamil += `${accusedName} ஆ/வ ${age} த/பெ ${fatherName}`;
                            accusedListFormalArrestEnglish += `${accusedName} S/o ${fatherName} aged ${age}`;
                        }
                    }
                    
                    document.getElementById('accused-list-tamil').innerHTML = accusedListTamil || '<span class="embedded-field empty" placeholder="Accused Details">Accused Details</span>';
                    document.getElementById('accused-list-english').innerHTML = accusedListEnglish || '<span class="embedded-field empty" placeholder="Accused Details">Accused Details</span>';
                    document.getElementById('accused-list-pt-tamil').innerHTML = accusedListPtTamil || '<span class="embedded-field empty" placeholder="Accused Details">Accused Details</span>';
                    document.getElementById('accused-list-pt-english').innerHTML = accusedListPtEnglish || '<span class="embedded-field empty" placeholder="Accused Details">Accused Details</span>';
                    document.getElementById('accused-list-formal-arrest-tamil').innerHTML = accusedListFormalArrestTamil || '<span class="embedded-field empty" placeholder="Accused Details">Accused Details</span>';
                    document.getElementById('accused-list-formal-arrest-english').innerHTML = accusedListFormalArrestEnglish || '<span class="embedded-field empty" placeholder="Accused Details">Accused Details</span>';
                }
                
                // Update court information
                const courtValue = document.getElementById('court').value;
                const courtNumberValue = document.getElementById('courtNumber').value;
                
                let courtDisplayValue = '';
                if (courtValue && courtNumberValue) {
                    courtDisplayValue = `${courtValue} ${getOrdinalSuffix(parseInt(courtNumberValue))}`;
                } else if (courtValue) {
                    courtDisplayValue = courtValue;
                }
                
                // Update embedded fields based on passport type
                if (passportType === 'Escort') {
                    updateEscortFields(courtDisplayValue);
                } else if (passportType === 'PT warrant') {
                    updatePtWarrantFields(courtDisplayValue);
                } else if (passportType === 'Transfer Passport') {
                    updateTransferFields();
                } else if (passportType === 'FIR Filing Passport') {
                    updateFirFields(courtDisplayValue);
                } else if (passportType === 'Visera Report') {
                    updateViseraFields();
                } else if (passportType === 'Lab Report') {
                    updateLabReportFields();
                } else if (passportType === 'Formal Arrest') {
                    updateFormalArrestFields(courtDisplayValue);
                } else if (passportType === 'Property to lab') {
                    updatePropertyLabFields();
                } else if (passportType === 'ML Passport') {
                    updateMLPassportFields();
                }
                
                updateDocumentOverflowWarning();

                if (!skipValidation) {
                    showNotification('Document preview updated successfully', 'success');
                }
                return true;
            }
            
            function updateEscortFields(courtDisplayValue) {
                const policeStation = document.getElementById('escortPoliceStation').value;
                const crimeNumber = document.getElementById('escortCrimeNumber').value;
                const section = document.getElementById('escortSection').value;
                
                updateField('police-station-content-tamil', policeStation);
                updateField('crime-no-field-tamil', crimeNumber);
                updateField('section-field-tamil', section);
                updateField('court-field-tamil', courtDisplayValue);
                
                updateField('police-station-content-english', policeStation);
                updateField('crime-no-field-english', crimeNumber);
                updateField('section-field-english', section);
                updateField('court-field-english', courtDisplayValue);
            }
            
            function updatePtWarrantFields(courtDisplayValue) {
                const policeStation = document.getElementById('ptPoliceStation').value;
                const crimeNumber = document.getElementById('ptCrimeNumber').value;
                const section = document.getElementById('ptSection').value;
                const scNumber = document.getElementById('scNumber').value;
                const prcNumber = document.getElementById('prcNumber').value;
                const centralPrison = document.getElementById('centralPrison').value;
                
                updateField('police-station-content-pt-tamil', policeStation);
                updateField('crime-no-field-pt-tamil', crimeNumber);
                updateField('section-field-pt-tamil', section);
                updateField('sc-no-field-tamil', scNumber);
                updateField('prc-no-field-tamil', prcNumber);
                updateField('central-prison-field-tamil', centralPrison);
                updateField('court-field-pt-tamil', courtDisplayValue);
                
                updateField('police-station-content-pt-english', policeStation);
                updateField('crime-no-field-pt-english', crimeNumber);
                updateField('section-field-pt-english', section);
                updateField('sc-no-field-english', scNumber);
                updateField('prc-no-field-english', prcNumber);
                updateField('central-prison-field-english', centralPrison);
                updateField('court-field-pt-english', courtDisplayValue);
            }
            
            function updateTransferFields() {
                const fromStation = document.getElementById('fromStation').value;
                const toStation = document.getElementById('toStation').value;
                const transferReason = document.getElementById('transferReason').value;
                const transferOrderNumber = document.getElementById('transferOrderNumber').value;
                const transferOrderDate = document.getElementById('transferOrderDate').value;
                
                updateField('from-station-field-tamil', fromStation);
                updateField('to-station-field-tamil', toStation);
                updateField('transfer-reason-field-tamil', transferReason);
                updateField('transfer-order-number-field-tamil', transferOrderNumber);
                updateField('transfer-order-date-field-tamil', transferOrderDate);
                
                updateField('from-station-field-english', fromStation);
                updateField('to-station-field-english', toStation);
                updateField('transfer-reason-field-english', transferReason);
                updateField('transfer-order-number-field-english', transferOrderNumber);
                updateField('transfer-order-date-field-english', transferOrderDate);
            }
            
            function updateFirFields(courtDisplayValue) {
                const policeStation = document.getElementById('firPoliceStation').value;
                const crimeNumber = document.getElementById('firCrimeNumber').value;
                const section = document.getElementById('firSection').value;
                
                updateField('police-station-content-fir-tamil', policeStation);
                updateField('crime-no-field-fir-tamil', crimeNumber);
                updateField('section-field-fir-tamil', section);
                updateField('court-field-fir-tamil', courtDisplayValue);
                
                updateField('police-station-content-fir-english', policeStation);
                updateField('crime-no-field-fir-english', crimeNumber);
                updateField('section-field-fir-english', section);
                updateField('court-field-fir-english', courtDisplayValue);
            }
            
            function updateViseraFields() {
                const policeStation = document.getElementById('viseraPoliceStation').value;
                const crimeNumber = document.getElementById('viseraCrimeNumber').value;
                const section = document.getElementById('viseraSection').value;
                const deceasedName = document.getElementById('deceasedName').value;
                const deceasedAge = document.getElementById('deceasedAge').value;
                const deceasedFatherName = document.getElementById('deceasedFatherName').value;
                const pmNumber = document.getElementById('pmNumber').value;
                const pmDate = document.getElementById('pmDate').value;
                
                updateField('police-station-content-visera-tamil', policeStation);
                updateField('crime-no-field-visera-tamil', crimeNumber);
                updateField('section-field-visera-tamil', section);
                updateField('deceased-name-field-tamil', deceasedName);
                updateField('deceased-age-field-tamil', deceasedAge);
                updateField('deceased-father-name-field-tamil', deceasedFatherName);
                updateField('pm-number-field-tamil', pmNumber);
                updateField('pm-date-field-tamil', pmDate);
                
                updateField('police-station-content-visera-english', policeStation);
                updateField('crime-no-field-visera-english', crimeNumber);
                updateField('section-field-visera-english', section);
                updateField('deceased-name-field-english', deceasedName);
                updateField('deceased-age-field-english', deceasedAge);
                updateField('deceased-father-name-field-english', deceasedFatherName);
                updateField('pm-number-field-english', pmNumber);
                updateField('pm-date-field-english', pmDate);
            }
            
            function updateLabReportFields() {
                const policeStation = document.getElementById('labPoliceStation').value;
                const crimeNumber = document.getElementById('labCrimeNumber').value;
                const section = document.getElementById('labSection').value;
                const dateValue = document.getElementById('date').value;
                const narNumber = document.getElementById('narNumber').value;
                const narDate = document.getElementById('narDate').value;
                
                updateField('police-station-content-lab-tamil', policeStation);
                updateField('crime-no-field-lab-tamil', crimeNumber);
                updateField('section-field-lab-tamil', section);
                updateField('date-field-lab-tamil', dateValue);
                updateField('nar-no-field-tamil', narNumber);
                updateField('nar-date-field-tamil', narDate);
                
                updateField('police-station-content-lab-english', policeStation);
                updateField('crime-no-field-lab-english', crimeNumber);
                updateField('section-field-lab-english', section);
                updateField('date-field-lab-english', dateValue);
                updateField('nar-no-field-english', narNumber);
                updateField('nar-date-field-english', narDate);
            }
            
            function updateFormalArrestFields(courtDisplayValue) {
                const policeStation = document.getElementById('arrestPoliceStation').value;
                const crimeNumber = document.getElementById('arrestCrimeNumber').value;
                const section = document.getElementById('arrestSection').value;
                const prison = document.getElementById('arrestPrison').value;
                const arrestType = document.getElementById('arrestType').value;
                
                updateField('police-station-content-formal-arrest-tamil', policeStation);
                updateField('crime-no-field-formal-arrest-tamil', crimeNumber);
                updateField('section-field-formal-arrest-tamil', section);
                updateField('arrest-prison-field-tamil', prison);
                updateField('arrest-type-field-tamil', arrestType);
                
                updateField('police-station-content-formal-arrest-english', policeStation);
                updateField('crime-no-field-formal-arrest-english', crimeNumber);
                updateField('section-field-formal-arrest-english', section);
                updateField('arrest-prison-field-english', prison);
                updateField('arrest-type-field-english', arrestType);
            }
            
            function updatePropertyLabFields() {
                const policeStation = document.getElementById('propertyPoliceStation').value;
                const crimeNumber = document.getElementById('propertyCrimeNumber').value;
                const section = document.getElementById('propertySection').value;
                const propertyDescription = document.getElementById('propertyDescription').value;
                const propertySeizedDate = document.getElementById('propertySeizedDate').value;
                
                updateField('police-station-content-property-tamil', policeStation);
                updateField('crime-no-field-property-tamil', crimeNumber);
                updateField('section-field-property-tamil', section);
                updateField('property-description-field-tamil', propertyDescription);
                updateField('property-seized-date-field-tamil', propertySeizedDate);
                
                updateField('police-station-content-property-english', policeStation);
                updateField('crime-no-field-property-english', crimeNumber);
                updateField('section-field-property-english', section);
                updateField('property-description-field-english', propertyDescription);
                updateField('property-seized-date-field-english', propertySeizedDate);
            }
            
            function updateMLPassportFields() {
                const policeStation = document.getElementById('mlPoliceStation').value;
                const leaveDays = document.getElementById('leaveDays').value;
                const leaveStartDate = document.getElementById('leaveStartDate').value;
                const leaveEndDate = document.getElementById('leaveEndDate').value;
                const reportBackDate = document.getElementById('reportBackDate').value;
                const session = document.getElementById('session').value;
                
                updateField('leave-days-field-tamil', leaveDays);
                updateField('leave-start-date-field-tamil', leaveStartDate);
                updateField('leave-end-date-field-tamil', leaveEndDate);
                updateField('report-back-date-field-tamil', reportBackDate);
                updateField('session-field-tamil', session);
                
                updateField('leave-days-field-english', leaveDays);
                updateField('leave-start-date-field-english', leaveStartDate);
                updateField('leave-end-date-field-english', leaveEndDate);
                updateField('report-back-date-field-english', reportBackDate);
                updateField('session-field-english', session);
            }
            
            function updateField(fieldId, value) {
                const field = document.getElementById(fieldId);
                if (field) {
                    if (value) {
                        field.textContent = value;
                        field.classList.remove('empty');
                    } else {
                        field.textContent = '';
                        field.classList.add('empty');
                    }
                }
            }
            
            function updateDocumentOverflowWarning() {
                const element = document.getElementById('document-to-print');
                if (!element) return false;

                const overflowed =
                    element.scrollHeight > element.clientHeight + 2 ||
                    element.scrollWidth > element.clientWidth + 2;

                documentOverflowWarning.classList.toggle('hidden', !overflowed);
                return overflowed;
            }

            function ensureDocumentFitsA4() {
                if (!updateDocumentOverflowWarning()) return true;

                showNotification(
                    'Document exceeds one A4 page. Reduce entries or shorten details before export.',
                    'error'
                );
                documentOverflowWarning.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                return false;
            }

            function printDocument() {
                if (!validateForm()) {
                    showNotification('Please fix the errors in the form before printing', 'error');
                    return;
                }

                fillDocumentPreview(true);
                if (!ensureDocumentFitsA4()) return;
                window.print();
                showNotification('Document sent to printer', 'success');
            }
            
            function safeFilePart(value) {
                return String(value || '')
                    .trim()
                    .replace(/[\\/:*?"<>|]+/g, '-')
                    .replace(/\s+/g, '_')
                    .replace(/_+/g, '_')
                    .slice(0, 60);
            }

            function getLocalDateStamp() {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                return `${day}-${month}-${year}`;
            }

            function updatePdfAvailability() {
                const available = Boolean(jsPDF && html2canvasLib);
                generateBtn.disabled = !available;
                mobilePdfBtn.disabled = !available;

                if (!available) {
                    const message = 'PDF export is temporarily unavailable because a required library did not load. Print remains available.';
                    generateBtn.title = message;
                    mobilePdfBtn.title = message;
                }

                return available;
            }

            async function generatePDF() {
                if (!updatePdfAvailability()) {
                    showNotification('PDF export library did not load. Use Print or refresh the page.', 'error');
                    return;
                }

                if (!validateForm()) {
                    showNotification('Please fix the errors in the form before generating PDF', 'error');
                    return;
                }

                // Always refresh the preview so the PDF contains the latest form values.
                fillDocumentPreview(true);
                if (!ensureDocumentFitsA4()) return;
                
                generateBtn.innerHTML = '<span class="spinner"></span> Generating PDF...';
                generateBtn.disabled = true;
                
                try {
                    const element = document.getElementById('document-to-print');
                    
                    // Add PDF mode class for styling
                    element.classList.add('pdf-mode', 'pdf-optimized');
                    
                    const canvas = await html2canvasLib(element, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        onclone: function(clonedDoc) {
                            const clonedElement = clonedDoc.getElementById('document-to-print');
                            if (clonedElement) {
                                clonedElement.classList.add('pdf-mode', 'pdf-optimized');
                            }
                        }
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210;
                    const pageHeight = 297;
                    const imgHeight = Math.min(canvas.height * imgWidth / canvas.width, pageHeight);
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft > 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    
                    let station = '';
                    let crimeNumber = '';
                    if (passportTypeSelect.value === 'Escort') {
                        station = document.getElementById('escortPoliceStation')?.value || '';
                        crimeNumber = document.getElementById('escortCrimeNumber')?.value || '';
                    } else {
                        const typeSection = getSelectedPassportSection();
                        station = typeSection?.querySelector('input[id$="PoliceStation"]')?.value || '';
                        crimeNumber = typeSection?.querySelector('input[id$="CrimeNumber"]')?.value || '';
                    }

                    const typeLabel = passportTypeSelect.options[passportTypeSelect.selectedIndex]?.textContent?.trim()
                        || passportTypeSelect.value;
                    const fileParts = [
                        typeLabel,
                        station,
                        crimeNumber,
                        getLocalDateStamp()
                    ].map(safeFilePart).filter(Boolean);

                    pdf.save(`${fileParts.join('_')}.pdf`);
                    
                    // Remove PDF mode class
                    element.classList.remove('pdf-mode', 'pdf-optimized');
                    
                    showNotification('PDF generated successfully', 'success');
                } catch (error) {
                    console.error('Error generating PDF:', error);
                    showNotification('Error generating PDF. Please try again.', 'error');
                    
                    // Remove PDF mode class in case of error
                    const element = document.getElementById('document-to-print');
                    element.classList.remove('pdf-mode', 'pdf-optimized');
                } finally {
                    generateBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate PDF';
                    generateBtn.disabled = false;
                }
            }
            
            function formatDateInput(input) {
                const digits = input.value.replace(/\D/g, '').slice(0, 8);
                let formatted = digits;
                if (digits.length > 4) {
                    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                } else if (digits.length > 2) {
                    formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                }
                if (input.value !== formatted) input.value = formatted;
            }

            function setupDateInputs() {
                const dateIds = [
                    'date', 'sickDate', 'mlDate', 'pmDate', 'narDate', 'transferOrderDate',
                    'propertySeizedDate', 'leaveStartDate', 'leaveEndDate', 'reportBackDate'
                ];

                dateIds.forEach(id => {
                    const input = document.getElementById(id);
                    if (!input || input.dataset.dateFormattingBound === 'true') return;
                    input.setAttribute('inputmode', 'numeric');
                    input.setAttribute('maxlength', '10');
                    input.setAttribute('placeholder', input.getAttribute('placeholder') || 'DD/MM/YYYY');
                    input.addEventListener('input', function() {
                        formatDateInput(this);
                    });
                    input.dataset.dateFormattingBound = 'true';
                });
            }

            function ensureDatalist(id, values) {
                let list = document.getElementById(id);
                if (!list) {
                    list = document.createElement('datalist');
                    list.id = id;
                    document.body.appendChild(list);
                }

                list.innerHTML = '';
                values.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    list.appendChild(option);
                });
            }

            function setupInputPresets(root = document) {
                ensureDatalist('police-station-suggestions', [
                    'G7 Chetpet PS',
                    'G3 Kilpauk PS',
                    'G5 Secretariat Colony PS',
                    'F3 Nungambakkam PS',
                    'D1 Triplicane PS',
                    'E1 Mylapore PS'
                ]);
                ensureDatalist('prison-suggestions', [
                    'Puzhal Central Prison, Chennai'
                ]);
                ensureDatalist('designation-suggestions', [
                    'SI',
                    'HC',
                    'PC'
                ]);
                ensureDatalist('section-suggestions', [
                    'BNS',
                    'BNSS',
                    'NDPS Act',
                    'POCSO Act',
                    'Arms Act',
                    'Information Technology Act',
                    'Tamil Nadu Prohibition Act'
                ]);

                root.querySelectorAll('input[id$="PoliceStation"], #fromStation, #toStation').forEach(input => {
                    input.setAttribute('list', 'police-station-suggestions');
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('autocapitalize', 'words');
                    input.setAttribute('spellcheck', 'false');
                });

                root.querySelectorAll('#centralPrison, #arrestPrison').forEach(input => {
                    input.setAttribute('list', 'prison-suggestions');
                    input.setAttribute('autocomplete', 'off');
                });

                root.querySelectorAll('input[id$="Section"]').forEach(input => {
                    input.setAttribute('list', 'section-suggestions');
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('autocapitalize', 'words');
                    input.setAttribute('spellcheck', 'false');
                });

                root.querySelectorAll('input[id^="designation"]').forEach(input => {
                    input.setAttribute('list', 'designation-suggestions');
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('autocapitalize', 'characters');
                    input.setAttribute('spellcheck', 'false');
                });

                root.querySelectorAll('input[id^="fullName"], input[id^="accusedName"], input[id^="fatherName"]').forEach(input => {
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('autocapitalize', 'words');
                });

                root.querySelectorAll('input[id^="age"]').forEach(input => {
                    input.setAttribute('inputmode', 'numeric');
                    input.setAttribute('pattern', '[0-9]*');
                    input.setAttribute('maxlength', '3');
                });
            }

            function dispatchFieldUpdate(input) {
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }

            function getTodayValue() {
                return formatDate(new Date());
            }

            function getCurrentTimeValue() {
                const now = new Date();
                return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            }

            function addQuickFillButton(input, label, valueGetter) {
                if (!input || input.dataset.quickFillBound === 'true') return;

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'quick-fill-btn';
                button.textContent = label;
                button.setAttribute('aria-label', `${label} for ${input.id}`);
                button.addEventListener('click', function() {
                    input.value = valueGetter();
                    dispatchFieldUpdate(input);
                    validateField.call(input);
                    input.focus();
                });

                input.insertAdjacentElement('afterend', button);
                input.dataset.quickFillBound = 'true';
            }

            function setupQuickDateTimeActions() {
                [
                    'date', 'sickDate', 'mlDate', 'pmDate', 'narDate', 'transferOrderDate',
                    'propertySeizedDate', 'leaveStartDate'
                ].forEach(id => addQuickFillButton(document.getElementById(id), 'Today', getTodayValue));

                ['time', 'sickTime', 'mlTime'].forEach(id => {
                    addQuickFillButton(document.getElementById(id), 'Now', getCurrentTimeValue);
                });
            }

            function scheduleLivePreview() {
                clearTimeout(previewRefreshTimeout);
                previewRefreshTimeout = setTimeout(() => {
                    if (passportTypeSelect.value) {
                        fillDocumentPreview(true);
                    }
                }, 180);
            }

            function bindFieldEvents(root) {
                root.querySelectorAll('input, select, textarea').forEach(input => {
                    if (input.dataset.passportEventsBound === 'true') return;

                    input.addEventListener('input', autoSave);
                    input.addEventListener('change', autoSave);
                    input.addEventListener('input', scheduleLivePreview);
                    input.addEventListener('change', scheduleLivePreview);

                    // Only fields with an inline error target need blur validation.
                    if (document.getElementById(`${input.id}-error`)) {
                        input.addEventListener('blur', validateField);
                        input.setAttribute('aria-describedby', `${input.id}-error`);
                    }

                    input.dataset.passportEventsBound = 'true';
                });

                setupInputPresets(root);
            }
            
            function initializeEventListeners() {
                // Event listeners for form fields
                passportTypeSelect.addEventListener('change', function() {
                    if (this.value) {
                        try {
                            localStorage.setItem('policePassportLastType', this.value);
                        } catch (error) {
                            console.warn('Unable to remember passport type:', error);
                        }
                    }
                    updateContentVisibility();

                    // Reuse saved common details when switching between passport types.
                    // Only blank fields are populated, so case-specific values already
                    // entered by the user are never overwritten.
                    applyCommonDefaults({ notify: false, onlyIfBlank: true });

                    // Make a newly selected passport immediately ready for routine use.
                    // Date/time values are filled only when the selected type displays
                    // the shared date/time section and those fields are still blank.
                    const config = getSelectedPassportConfig();
                    if (config?.showMainDateTime) {
                        const dateField = document.getElementById('date');
                        const timeField = document.getElementById('time');
                        if (dateField && !dateField.value.trim()) {
                            dateField.value = getTodayValue();
                            dispatchFieldUpdate(dateField);
                        }
                        if (timeField && !timeField.value.trim()) {
                            timeField.value = getCurrentTimeValue();
                            dispatchFieldUpdate(timeField);
                        }
                    }

                    scheduleLivePreview();
                    autoSave();
                });
                
                languageSelect.addEventListener('change', function() {
                    currentLanguage = this.value;
                    updateLanguageContent();
                    autoSave();
                });
                
                officerCountInput.addEventListener('change', () => updatePoliceOfficers());
                addOfficerBtn.addEventListener('click', addPoliceOfficer);
                
                accusedCountInput.addEventListener('change', () => updateAccusedPersons());
                addAccusedBtn.addEventListener('click', addAccusedPerson);
                
                fillFormBtn.addEventListener('click', fillDocumentPreview);
                newPassportBtn.addEventListener('click', function() {
                    if (confirm('Start a new passport? Case-specific form data will be cleared. Saved common defaults will be kept.')) {
                        clearTimeout(autoSaveTimeout);
                        localStorage.removeItem('policePassportFormData');

                        // Reset the current case without a page reload, then restore only
                        // explicitly saved common defaults (station, officers, language,
                        // court/prison preferences). This makes back-to-back passport
                        // generation faster and avoids carrying case-specific details.
                        document.querySelectorAll('input[id], select[id], textarea[id]').forEach(field => {
                            if (field.type === 'checkbox' || field.type === 'radio') {
                                field.checked = false;
                            } else if (field.tagName === 'SELECT') {
                                field.selectedIndex = 0;
                            } else if (!field.readOnly) {
                                field.value = '';
                            }
                        });

                        currentLanguage = 'tamil';
                        languageSelect.value = currentLanguage;
                        officerCountInput.value = 1;
                        accusedCountInput.value = 1;
                        updatePoliceOfficers();
                        updateAccusedPersons();
                        updateContentVisibility();
                        updateLanguageContent();

                        const defaultsApplied = applyCommonDefaults({ notify: false, onlyIfBlank: false });
                        updateContentVisibility();
                        updateLanguageContent();
                        scheduleLivePreview();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        showNotification(defaultsApplied
                            ? 'New passport ready. Saved common defaults restored.'
                            : 'New passport ready.', 'success');
                    }
                });
                saveDefaultsBtn.addEventListener('click', saveCommonDefaults);
                clearDefaultsBtn.addEventListener('click', clearCommonDefaults);
                clearDraftBtn.addEventListener('click', function() {
                    clearTimeout(autoSaveTimeout);
                    localStorage.removeItem('policePassportFormData');
                    showNotification('Saved browser draft cleared. Current form has not been changed.', 'success');
                });
                // Protect an in-progress passport from accidental browser/tab navigation.
                window.addEventListener('beforeunload', function(event) {
                    const savedDraft = localStorage.getItem('policePassportFormData');
                    if (!savedDraft) return;

                    try {
                        const draft = JSON.parse(savedDraft);
                        const hasCaseData = Boolean(
                            draft.passportType ||
                            draft.date ||
                            draft.time ||
                            draft.escortCrimeNumber ||
                            (draft.fields && Object.values(draft.fields).some(value =>
                                String(value ?? '').trim() !== ''
                            ))
                        );
                        if (!hasCaseData) return;
                    } catch (error) {
                        return;
                    }

                    event.preventDefault();
                    event.returnValue = '';
                });

                printBtn.addEventListener('click', printDocument);
                generateBtn.addEventListener('click', generatePDF);

                mobilePreviewBtn.addEventListener('click', function() {
                    if (fillDocumentPreview() !== false) {
                        document.querySelector('.preview-section')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
                mobilePdfBtn.addEventListener('click', generatePDF);
                
                // Bind validation and autosave to the current form fields.
                // Dynamic officer/accused fields use the same helper when they are rebuilt.
                bindFieldEvents(document);
                setupDateInputs();
                setupInputPresets(document);
                setupQuickDateTimeActions();
                
                // Optimize crime-number entry for phones and normalize number/year automatically.
                const crimeNumberInputs = document.querySelectorAll('input[id$="CrimeNumber"]');
                crimeNumberInputs.forEach(input => {
                    input.setAttribute('inputmode', 'numeric');
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('spellcheck', 'false');
                    input.setAttribute('maxlength', '12');
                    input.addEventListener('input', function() {
                        formatCrimeNumber(this);
                    });
                    input.addEventListener('blur', function() {
                        const value = this.value.trim();
                        if (/^\d+$/.test(value) && value.length <= 6) {
                            this.value = value + '/' + new Date().getFullYear();
                            dispatchFieldUpdate(this);
                        }
                        validateField.call(this);
                    });
                });
                
                // Add event listener for court number validation when court is selected
                courtSelect.addEventListener('change', function() {
                    if (this.value) {
                        document.getElementById('courtNumber').setAttribute('required', 'required');
                    } else {
                        document.getElementById('courtNumber').removeAttribute('required');
                    }
                    validateField.call(this);
                });
                
                courtNumberInput.addEventListener('input', function() {
                    if (courtSelect.value) {
                        this.setAttribute('required', 'required');
                    } else {
                        this.removeAttribute('required');
                    }
                    validateField.call(this);
                });
                
                // Add event listeners for ML Passport date calculation
                leaveDaysInput.addEventListener('input', calculateLeaveDates);
                leaveStartDateInput.addEventListener('input', calculateLeaveDates);
            }
            
            function applyPassportTypeFromUrl() {
                const params = new URLSearchParams(window.location.search);
                const requestedType = params.get('type');
                if (!requestedType || !passportConfig[requestedType]) return false;

                passportTypeSelect.value = requestedType;
                updateContentVisibility();
                updateLanguageContent();
                scheduleLivePreview();
                autoSave();

                // Keep the URL clean after applying the requested passport type.
                params.delete('type');
                const remaining = params.toString();
                const cleanUrl = window.location.pathname + (remaining ? `?${remaining}` : '') + window.location.hash;
                window.history.replaceState({}, document.title, cleanUrl);

                showNotification(`${requestedType} selected`, 'success');
                return true;
            }

            // Initialize the application
            function init() {
                updatePoliceOfficers();
                updateAccusedPersons();
                updateContentVisibility();
                initializeEventListeners();
                updatePdfAvailability();

                const hadSavedDraft = Boolean(localStorage.getItem('policePassportFormData'));
                if (!hadSavedDraft && !new URLSearchParams(window.location.search).get('type')) {
                    try {
                        const lastType = localStorage.getItem('policePassportLastType');
                        if (lastType && passportConfig[lastType]?.available) {
                            passportTypeSelect.value = lastType;
                            updateContentVisibility();
                        }
                    } catch (error) {
                        console.warn('Unable to restore passport type:', error);
                    }
                }
                if (hadSavedDraft) {
                    loadSavedData();
                } else {
                    applyCommonDefaults({ notify: false, onlyIfBlank: false });
                }

                const selectedFromUrl = applyPassportTypeFromUrl();
                if (!selectedFromUrl) {
                    showNotification('Police Passport Document Generator is ready!', 'success');
                }
            }
            
            // Start the application
            init();
        });
