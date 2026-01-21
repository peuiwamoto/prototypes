// Subscription Plans Management
class SubscriptionPlansManager {
    constructor() {
        this.plans = [];
        this.currentPlanId = null;
        this.editingParam = null;
        this.hasUnsavedChanges = false;
        
        // Initialize with default plan
        this.initializeDefaultPlan();
        this.init();
    }

    initializeDefaultPlan() {
        const defaultPlan = {
            id: 'default',
            name: 'Default Plan',
            isDefault: true,
            parameters: {
                monthlyBaseFee: { value: 0, currency: 'EUR' },
                maxUsers: { value: '∞' },
                freeUsers: { value: '∞' },
                monthlyFeePerUser: { value: 0, currency: 'EUR' },
                maxVirtualCards: { value: '∞' },
                maxSingleUseCards: { value: '∞' },
                physicalCardTier: { value: 0, currency: 'EUR' }
            },
            premiumModulesEnabled: false
        };
        
        this.plans = [defaultPlan];
        this.currentPlanId = 'default';
        this.saveToLocalStorage();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderPlanSelector();
        this.renderCurrentPlan();
    }

    setupEventListeners() {
        // Plan selector
        document.getElementById('planSelector').addEventListener('change', (e) => {
            this.switchPlan(e.target.value);
        });

        // Create plan button
        document.getElementById('createPlanBtn').addEventListener('click', () => {
            this.showCreatePlanModal();
        });

        // Make default button
        document.getElementById('makeDefaultBtn').addEventListener('click', () => {
            this.makeCurrentPlanDefault();
        });

        // Delete plan button
        document.getElementById('deletePlanBtn').addEventListener('click', () => {
            this.deleteCurrentPlan();
        });

        // Create plan modal
        document.getElementById('closeCreateModal').addEventListener('click', () => {
            this.hideCreatePlanModal();
        });
        document.getElementById('cancelCreatePlan').addEventListener('click', () => {
            this.hideCreatePlanModal();
        });
        document.getElementById('confirmCreatePlan').addEventListener('click', () => {
            this.createNewPlan();
        });

        // Copy from radio buttons
        document.querySelectorAll('input[name="createFrom"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const copyGroup = document.getElementById('copyFromGroup');
                if (e.target.value === 'copy') {
                    copyGroup.style.display = 'block';
                    this.populateCopyFromDropdown();
                } else {
                    copyGroup.style.display = 'none';
                }
            });
        });

        // Edit parameter buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const paramName = e.currentTarget.dataset.param;
                this.showEditParamModal(paramName);
            });
        });

        // Edit parameter modal
        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.hideEditParamModal();
        });
        document.getElementById('cancelEditParam').addEventListener('click', () => {
            this.hideEditParamModal();
        });
        document.getElementById('confirmEditParam').addEventListener('click', () => {
            this.saveParameter();
        });

        // Premium modules toggle
        document.getElementById('premiumModulesToggle').addEventListener('click', () => {
            this.togglePremiumModules();
        });

        // Apply to Organizations button
        document.getElementById('applyToOrgsBtn').addEventListener('click', () => {
            this.showApplyToOrgsModal();
        });

        // Apply to Organizations modal
        document.getElementById('closeApplyToOrgsModal').addEventListener('click', () => {
            this.hideApplyToOrgsModal();
        });
        document.getElementById('doNotApplyBtn').addEventListener('click', () => {
            this.hideApplyToOrgsModal();
        });
        document.getElementById('confirmApplyToOrgs').addEventListener('click', () => {
            this.confirmApplyToOrganizations();
        });

        // Radio button changes
        document.getElementById('applyToAllRadio').addEventListener('change', () => {
            this.handleApplyScopeChange('all');
        });
        document.getElementById('applyToSpecificRadio').addEventListener('change', () => {
            this.handleApplyScopeChange('specific');
        });

        // Search for "Apply to all" mode
        document.getElementById('orgSearchInputAll').addEventListener('input', (e) => {
            this.filterAllOrganizations(e.target.value);
        });

        // Organization selection input for "Apply to specific" mode
        const orgSelectInput = document.getElementById('orgSelectInput');
        orgSelectInput.addEventListener('input', (e) => {
            this.handleOrgSelectInput(e.target.value);
        });
        orgSelectInput.addEventListener('focus', () => {
            this.showOrgDropdown();
        });

        // Add to list button
        document.getElementById('addToListBtn').addEventListener('click', () => {
            this.addSelectedOrgFromDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const wrapper = document.querySelector('.org-select-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                this.hideOrgDropdown();
            }
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                }
            });
        });
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('subscriptionPlans');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.plans = data.plans || [];
                this.currentPlanId = data.currentPlanId || 'default';
                
                // Ensure at least one default plan exists
                if (this.plans.length === 0) {
                    this.initializeDefaultPlan();
                } else {
                    // Ensure there's at least one default plan
                    const hasDefault = this.plans.some(p => p.isDefault);
                    if (!hasDefault) {
                        this.plans[0].isDefault = true;
                    }
                }
            } catch (e) {
                console.error('Error loading plans:', e);
                this.initializeDefaultPlan();
            }
        }
    }

    saveToLocalStorage() {
        const data = {
            plans: this.plans,
            currentPlanId: this.currentPlanId
        };
        localStorage.setItem('subscriptionPlans', JSON.stringify(data));
    }

    renderPlanSelector() {
        const selector = document.getElementById('planSelector');
        const defaultBadge = document.getElementById('defaultBadge');
        const deleteBtn = document.getElementById('deletePlanBtn');
        const makeDefaultBtn = document.getElementById('makeDefaultBtn');
        
        selector.innerHTML = '';
        
        this.plans.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            option.textContent = plan.name;
            selector.appendChild(option);
        });
        
        selector.value = this.currentPlanId;
        
        const currentPlan = this.getCurrentPlan();
        if (currentPlan && currentPlan.isDefault) {
            defaultBadge.style.display = 'inline-block';
            deleteBtn.style.display = 'none';
            makeDefaultBtn.style.display = 'none';
        } else {
            defaultBadge.style.display = 'none';
            deleteBtn.style.display = 'inline-flex';
            makeDefaultBtn.style.display = 'inline-flex';
        }
    }

    renderCurrentPlan() {
        const plan = this.getCurrentPlan();
        if (!plan) return;

        // Render parameters
        this.renderParameter('monthlyBaseFee', plan.parameters.monthlyBaseFee);
        this.renderParameter('maxUsers', plan.parameters.maxUsers);
        this.renderParameter('freeUsers', plan.parameters.freeUsers);
        this.renderParameter('monthlyFeePerUser', plan.parameters.monthlyFeePerUser);
        this.renderParameter('maxVirtualCards', plan.parameters.maxVirtualCards);
        this.renderParameter('maxSingleUseCards', plan.parameters.maxSingleUseCards);
        this.renderParameter('physicalCardTier', plan.parameters.physicalCardTier);

        // Render premium modules toggle
        const toggle = document.getElementById('premiumModulesToggle');
        if (plan.premiumModulesEnabled) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }

        // Show/hide warning banner based on changes
        this.updateWarningBanner();
    }

    renderParameter(paramName, paramData) {
        const valueElement = document.getElementById(`${paramName}Value`);
        const amountSpan = valueElement.querySelector('.value-amount');
        
        if (paramData.currency !== undefined) {
            // Currency parameter - show as display text, not editable
            amountSpan.textContent = paramData.value;
            const currencyDisplay = document.getElementById(`${paramName}CurrencyDisplay`);
            if (currencyDisplay) {
                currencyDisplay.textContent = paramData.currency;
            }
        } else {
            // Non-currency parameter
            amountSpan.textContent = paramData.value;
        }
    }

    getCurrentPlan() {
        return this.plans.find(p => p.id === this.currentPlanId);
    }

    switchPlan(planId) {
        if (this.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Do you want to discard them?')) {
                document.getElementById('planSelector').value = this.currentPlanId;
                return;
            }
        }
        
        this.currentPlanId = planId;
        this.hasUnsavedChanges = false;
        this.saveToLocalStorage();
        this.renderPlanSelector();
        this.renderCurrentPlan();
    }

    showCreatePlanModal() {
        document.getElementById('createPlanModal').style.display = 'flex';
        document.getElementById('newPlanName').value = '';
        document.getElementById('setAsDefault').checked = false;
        document.querySelector('input[name="createFrom"][value="blank"]').checked = true;
        document.getElementById('copyFromGroup').style.display = 'none';
    }

    hideCreatePlanModal() {
        document.getElementById('createPlanModal').style.display = 'none';
    }

    populateCopyFromDropdown() {
        const select = document.getElementById('copyFromPlan');
        select.innerHTML = '<option value="">Select a plan...</option>';
        
        this.plans.forEach(plan => {
            if (plan.id !== this.currentPlanId) {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = plan.name;
                select.appendChild(option);
            }
        });
    }

    createNewPlan() {
        const name = document.getElementById('newPlanName').value.trim();
        if (!name) {
            alert('Please enter a plan name');
            return;
        }

        // Check if name already exists
        if (this.plans.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('A plan with this name already exists');
            return;
        }

        const createFrom = document.querySelector('input[name="createFrom"]:checked').value;
        const copyFromId = document.getElementById('copyFromPlan').value;
        const setAsDefault = document.getElementById('setAsDefault').checked;

        let newPlan;
        
        if (createFrom === 'copy' && copyFromId) {
            // Copy from existing plan
            const sourcePlan = this.plans.find(p => p.id === copyFromId);
            if (sourcePlan) {
                newPlan = {
                    id: `plan-${Date.now()}`,
                    name: name,
                    isDefault: setAsDefault,
                    parameters: JSON.parse(JSON.stringify(sourcePlan.parameters)),
                    premiumModulesEnabled: sourcePlan.premiumModulesEnabled
                };
            } else {
                alert('Source plan not found');
                return;
            }
        } else {
            // Create blank plan
            newPlan = {
                id: `plan-${Date.now()}`,
                name: name,
                isDefault: setAsDefault,
                parameters: {
                    monthlyBaseFee: { value: 0, currency: 'EUR' },
                    maxUsers: { value: '∞' },
                    freeUsers: { value: '∞' },
                    monthlyFeePerUser: { value: 0, currency: 'EUR' },
                    maxVirtualCards: { value: '∞' },
                    maxSingleUseCards: { value: '∞' },
                    physicalCardTier: { value: 0, currency: 'EUR' }
                },
                premiumModulesEnabled: false
            };
        }

        // If setting as default, unset other defaults
        if (setAsDefault) {
            this.plans.forEach(p => p.isDefault = false);
        }

        this.plans.push(newPlan);
        this.currentPlanId = newPlan.id;
        this.saveToLocalStorage();
        this.renderPlanSelector();
        this.renderCurrentPlan();
        this.hideCreatePlanModal();
    }

    deleteCurrentPlan() {
        const plan = this.getCurrentPlan();
        if (!plan) return;

        if (plan.isDefault) {
            alert('Cannot delete the default plan');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) {
            return;
        }

        this.plans = this.plans.filter(p => p.id !== plan.id);
        
        // Switch to default plan
        const defaultPlan = this.plans.find(p => p.isDefault);
        this.currentPlanId = defaultPlan ? defaultPlan.id : this.plans[0].id;
        
        this.saveToLocalStorage();
        this.renderPlanSelector();
        this.renderCurrentPlan();
    }

    showEditParamModal(paramName) {
        const plan = this.getCurrentPlan();
        if (!plan) return;

        this.editingParam = paramName;
        const paramData = plan.parameters[paramName];
        
        const modal = document.getElementById('editParamModal');
        const title = document.getElementById('editParamTitle');
        const label = document.getElementById('editParamLabel');
        const input = document.getElementById('editParamValue');
        const currencySelect = document.getElementById('editParamCurrency');
        const currencyGroup = document.getElementById('editParamCurrencyGroup');
        const currencySelectLabeled = document.getElementById('editParamCurrencyLabeled');
        const inputGroup = document.getElementById('editParamInputGroup');
        const hint = document.getElementById('editParamHint');

        // Set title and label
        const paramLabels = {
            monthlyBaseFee: 'Monthly base fee',
            maxUsers: 'Max users',
            freeUsers: 'Free users',
            monthlyFeePerUser: 'Monthly fee per user',
            maxVirtualCards: 'Max virtual cards',
            maxSingleUseCards: 'Max single-use virtual cards/month',
            physicalCardTier: 'Tier'
        };

        title.textContent = `Edit ${paramLabels[paramName]}`;
        label.textContent = paramLabels[paramName] + ':';

        // Configure input based on parameter type
        if (paramData.currency !== undefined) {
            // Currency parameter
            input.type = 'number';
            input.value = paramData.value;
            input.step = '0.01';
            // Set the currency value - if currency exists, select it, otherwise show placeholder
            const selectWrapper = currencyGroup.querySelector('.select-wrapper');
            
            // Remove any existing event listeners by cloning
            const newSelect = currencySelectLabeled.cloneNode(true);
            currencySelectLabeled.parentNode.replaceChild(newSelect, currencySelectLabeled);
            const updatedSelect = document.getElementById('editParamCurrencyLabeled');
            
            if (paramData.currency) {
                updatedSelect.value = paramData.currency;
                // Hide placeholder
                if (selectWrapper) {
                    selectWrapper.classList.remove('show-placeholder');
                }
            } else {
                // Show placeholder
                updatedSelect.value = '';
                if (selectWrapper) {
                    selectWrapper.classList.add('show-placeholder');
                }
            }
            
            // Handle focus/blur to show/hide placeholder
            updatedSelect.addEventListener('focus', () => {
                if (selectWrapper) {
                    selectWrapper.classList.remove('show-placeholder');
                }
            });
            
            updatedSelect.addEventListener('blur', () => {
                if (selectWrapper && !updatedSelect.value) {
                    selectWrapper.classList.add('show-placeholder');
                }
            });
            
            updatedSelect.addEventListener('change', () => {
                if (selectWrapper) {
                    if (updatedSelect.value) {
                        selectWrapper.classList.remove('show-placeholder');
                    } else {
                        selectWrapper.classList.add('show-placeholder');
                    }
                }
            });
            
            currencyGroup.style.display = 'block';
            currencySelect.style.display = 'none'; // Hide the inline one
            hint.textContent = 'Enter amount in selected currency';
        } else {
            // Non-currency parameter (can be number or ∞)
            input.type = 'text';
            input.value = paramData.value;
            currencyGroup.style.display = 'none';
            currencySelect.style.display = 'none';
            hint.textContent = 'Enter a number or ∞ for unlimited';
        }

        modal.style.display = 'flex';
        input.focus();
        input.select();
    }

    hideEditParamModal() {
        document.getElementById('editParamModal').style.display = 'none';
        this.editingParam = null;
    }

    saveParameter() {
        if (!this.editingParam) return;

        const plan = this.getCurrentPlan();
        if (!plan) return;

        const input = document.getElementById('editParamValue');
        const currencySelect = document.getElementById('editParamCurrency');
        // Get the currency select - it might have been replaced, so get fresh reference
        let currencySelectLabeled = document.getElementById('editParamCurrencyLabeled');
        if (!currencySelectLabeled) {
            // If not found, it might be in the currency group
            const currencyGroup = document.getElementById('editParamCurrencyGroup');
            currencySelectLabeled = currencyGroup ? currencyGroup.querySelector('#editParamCurrencyLabeled') : null;
        }
        const value = input.value.trim();

        if (!value) {
            alert('Please enter a value');
            return;
        }

        const paramData = plan.parameters[this.editingParam];

        if (paramData.currency !== undefined) {
            // Currency parameter
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                alert('Please enter a valid number');
                return;
            }
            const selectedCurrency = currencySelectLabeled ? currencySelectLabeled.value : currencySelect.value;
            if (!selectedCurrency) {
                alert('Please select a currency');
                return;
            }
            paramData.value = numValue;
            paramData.currency = selectedCurrency;
        } else {
            // Non-currency parameter
            if (value === '∞' || value.toLowerCase() === 'infinity') {
                paramData.value = '∞';
            } else {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    alert('Please enter a valid number or ∞');
                    return;
                }
                paramData.value = numValue;
            }
        }

        this.hasUnsavedChanges = true;
        this.saveToLocalStorage();
        this.renderCurrentPlan();
        this.hideEditParamModal();
    }

    makeCurrentPlanDefault() {
        const plan = this.getCurrentPlan();
        if (!plan) return;

        if (plan.isDefault) {
            return; // Already default
        }

        if (!confirm(`Set "${plan.name}" as the default plan?`)) {
            return;
        }

        // Unset all other defaults
        this.plans.forEach(p => p.isDefault = false);
        
        // Set current plan as default
        plan.isDefault = true;
        
        this.hasUnsavedChanges = true;
        this.saveToLocalStorage();
        this.renderPlanSelector();
    }

    togglePremiumModules() {
        const plan = this.getCurrentPlan();
        if (!plan) return;

        plan.premiumModulesEnabled = !plan.premiumModulesEnabled;
        this.hasUnsavedChanges = true;
        this.saveToLocalStorage();
        this.renderCurrentPlan();
    }

    updateWarningBanner() {
        const banner = document.getElementById('valueChangeWarning');
        if (this.hasUnsavedChanges) {
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }
    }

    // Apply to Organizations functionality
    showApplyToOrgsModal() {
        const modal = document.getElementById('applyToOrgsModal');
        const plan = this.getCurrentPlan();
        
        if (!plan) return;

        // Load organizations (mock data for now - replace with API call)
        this.loadOrganizations();
        
        // Initialize to "Apply to all" mode
        document.getElementById('applyToAllRadio').checked = true;
        this.handleApplyScopeChange('all');
        
        modal.style.display = 'flex';
    }

    hideApplyToOrgsModal() {
        document.getElementById('applyToOrgsModal').style.display = 'none';
        // Reset
        document.getElementById('orgSearchInputAll').value = '';
        document.getElementById('orgSelectInput').value = '';
        this.hideOrgDropdown();
        this.excludedOrgIds = new Set();
        this.selectedOrgIds = new Set();
    }

    loadOrganizations() {
        // Mock organizations data - replace with actual API call
        // This should fetch organizations linked to the current payment program
        const mockOrganizations = [
            { id: 'org1', name: 'Acme Corporation', paymentProgram: 'C Teleport', country: 'DE', accountGroups: 'PDY, VG (ex TPML)' },
            { id: 'org2', name: 'TechStart Inc', paymentProgram: 'C Teleport', country: 'GB', accountGroups: 'PDY' },
            { id: 'org3', name: 'Global Solutions Ltd', paymentProgram: 'C Teleport', country: 'DE', accountGroups: 'VG' },
            { id: 'org4', name: 'Innovation Hub', paymentProgram: 'C Teleport', country: 'US', accountGroups: 'PDY, VG' },
            { id: 'org5', name: 'Digital Ventures', paymentProgram: 'C Teleport', country: 'GB', accountGroups: 'TPML' },
            { id: 'org6', name: 'Future Systems', paymentProgram: 'C Teleport', country: 'DE', accountGroups: 'PDY, VG (ex TPML)' },
            { id: 'org7', name: 'Cloud Dynamics', paymentProgram: 'C Teleport', country: 'US', accountGroups: 'VG' },
            { id: 'org8', name: 'NextGen Solutions', paymentProgram: 'C Teleport', country: 'GB', accountGroups: 'PDY, TPML' }
        ];

        this.allOrganizations = mockOrganizations;
        this.excludedOrgIds = new Set(); // For "Apply to all" mode
        this.selectedOrgIds = new Set(); // For "Apply to specific" mode
        this.currentApplyScope = 'all';
        this.orgDropdownSearchTerm = '';
    }

    handleApplyScopeChange(scope) {
        this.currentApplyScope = scope;
        
        if (scope === 'all') {
            // Show search field, hide select field
            document.getElementById('searchFieldAll').style.display = 'block';
            document.getElementById('selectFieldSpecific').style.display = 'none';
            // Reset selected orgs, use excluded instead
            this.selectedOrgIds.clear();
            this.renderOrganizationsTable();
        } else {
            // Hide search field, show select field
            document.getElementById('searchFieldAll').style.display = 'none';
            document.getElementById('selectFieldSpecific').style.display = 'block';
            // Reset excluded orgs, use selected instead
            this.excludedOrgIds.clear();
            this.renderOrganizationsTable();
        }
    }

    filterAllOrganizations(searchTerm) {
        this.orgDropdownSearchTerm = searchTerm.toLowerCase().trim();
        this.renderOrganizationsTable();
    }

    renderOrganizationsTable() {
        const tableBody = document.getElementById('orgTableBody');
        const tableEmpty = document.getElementById('orgTableEmpty');
        
        let orgsToShow = [];

        if (this.currentApplyScope === 'all') {
            // Show all orgs except excluded ones, filtered by search
            orgsToShow = this.allOrganizations.filter(org => {
                const matchesSearch = !this.orgDropdownSearchTerm || 
                    org.name.toLowerCase().includes(this.orgDropdownSearchTerm) ||
                    org.paymentProgram.toLowerCase().includes(this.orgDropdownSearchTerm);
                return !this.excludedOrgIds.has(org.id) && matchesSearch;
            });
        } else {
            // Show only selected orgs
            orgsToShow = this.allOrganizations.filter(org => 
                this.selectedOrgIds.has(org.id)
            );
        }

        if (orgsToShow.length === 0) {
            tableBody.innerHTML = '';
            tableEmpty.style.display = 'block';
            return;
        }

        tableEmpty.style.display = 'none';
        tableBody.innerHTML = '';

        orgsToShow.forEach(org => {
            const row = document.createElement('tr');
            
            // Get country flag emoji (simplified - in real app would use proper flag library)
            const countryFlags = { 'DE': '🇩🇪', 'GB': '🇬🇧', 'US': '🇺🇸' };
            const flag = countryFlags[org.country] || '🌍';

            row.innerHTML = `
                <td>${org.name}</td>
                <td>${org.paymentProgram}</td>
                <td>${flag} ${org.country}</td>
                <td>${org.accountGroups}</td>
                <td class="th-actions">
                    <button class="org-remove-btn" data-org-id="${org.id}">
                        <i class="ph ph-x"></i>
                    </button>
                </td>
            `;

            // Add remove handler
            const removeBtn = row.querySelector('.org-remove-btn');
            removeBtn.addEventListener('click', () => {
                this.removeOrganization(org.id);
            });

            tableBody.appendChild(row);
        });
    }

    removeOrganization(orgId) {
        if (this.currentApplyScope === 'all') {
            // Exclude from "all" - if one is excluded, switch to "specific"
            this.excludedOrgIds.add(orgId);
            // Auto-switch to "Apply to specific" if not already
            if (this.excludedOrgIds.size > 0) {
                document.getElementById('applyToSpecificRadio').checked = true;
                this.handleApplyScopeChange('specific');
                // Move excluded orgs to selected (all except excluded)
                this.selectedOrgIds.clear();
                this.allOrganizations.forEach(org => {
                    if (!this.excludedOrgIds.has(org.id)) {
                        this.selectedOrgIds.add(org.id);
                    }
                });
                this.excludedOrgIds.clear();
            }
        } else {
            // Remove from selected
            this.selectedOrgIds.delete(orgId);
        }
        this.renderOrganizationsTable();
        this.updateOrgDropdown();
    }

    handleOrgSelectInput(value) {
        this.orgDropdownSearchTerm = value.toLowerCase().trim();
        this.updateOrgDropdown();
        this.showOrgDropdown();
    }

    showOrgDropdown() {
        const dropdown = document.getElementById('orgDropdown');
        if (this.allOrganizations && this.allOrganizations.length > 0) {
            dropdown.style.display = 'block';
            this.updateOrgDropdown();
        }
    }

    hideOrgDropdown() {
        document.getElementById('orgDropdown').style.display = 'none';
    }

    updateOrgDropdown() {
        const dropdown = document.getElementById('orgDropdown');
        const addBtn = document.getElementById('addToListBtn');
        
        if (!this.allOrganizations) return;

        // Filter organizations based on search term
        let filtered = this.allOrganizations;
        if (this.orgDropdownSearchTerm) {
            filtered = this.allOrganizations.filter(org =>
                org.name.toLowerCase().includes(this.orgDropdownSearchTerm) ||
                org.paymentProgram.toLowerCase().includes(this.orgDropdownSearchTerm)
            );
        }

        // Check if there's a match to add
        const exactMatch = filtered.find(org => 
            org.name.toLowerCase() === this.orgDropdownSearchTerm.toLowerCase()
        );
        const canAdd = exactMatch && !this.selectedOrgIds.has(exactMatch.id);
        addBtn.style.display = canAdd ? 'flex' : 'none';

        dropdown.innerHTML = '';

        if (filtered.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'org-dropdown-item';
            emptyItem.textContent = 'No organizations found';
            emptyItem.style.color = '#999';
            dropdown.appendChild(emptyItem);
            return;
        }

        filtered.forEach(org => {
            const isSelected = this.selectedOrgIds.has(org.id);
            const item = document.createElement('div');
            item.className = `org-dropdown-item ${isSelected ? 'selected' : ''}`;
            
            item.innerHTML = `
                <span>${isSelected ? '<i class="ph ph-x org-dropdown-item-icon remove"></i>' : '<i class="ph ph-plus org-dropdown-item-icon"></i>'} ${org.name}</span>
            `;

            item.addEventListener('click', () => {
                if (isSelected) {
                    this.selectedOrgIds.delete(org.id);
                } else {
                    this.selectedOrgIds.add(org.id);
                }
                this.renderOrganizationsTable();
                this.updateOrgDropdown();
                document.getElementById('orgSelectInput').value = '';
                this.orgDropdownSearchTerm = '';
            });

            dropdown.appendChild(item);
        });
    }

    addSelectedOrgFromDropdown() {
        if (!this.orgDropdownSearchTerm) return;

        const exactMatch = this.allOrganizations.find(org => 
            org.name.toLowerCase() === this.orgDropdownSearchTerm.toLowerCase()
        );

        if (exactMatch && !this.selectedOrgIds.has(exactMatch.id)) {
            this.selectedOrgIds.add(exactMatch.id);
            this.renderOrganizationsTable();
            document.getElementById('orgSelectInput').value = '';
            this.orgDropdownSearchTerm = '';
            this.hideOrgDropdown();
        }
    }

    confirmApplyToOrganizations() {
        const plan = this.getCurrentPlan();
        if (!plan) return;

        let orgsToApply = [];
        if (this.currentApplyScope === 'all') {
            // All orgs except excluded
            orgsToApply = this.allOrganizations.filter(org => 
                !this.excludedOrgIds.has(org.id)
            );
        } else {
            // Only selected orgs
            orgsToApply = this.allOrganizations.filter(org => 
                this.selectedOrgIds.has(org.id)
            );
        }

        if (orgsToApply.length === 0) {
            alert('No organizations selected. Click "Do not apply" to cancel.');
            return;
        }

        const orgNames = orgsToApply.map(org => org.name).join(', ');
        const message = `Apply configuration to ${orgsToApply.length} organization(s)?\n\n${orgNames}\n\nNote: Price changes require customer notification and may need new pricing tiers.`;

        if (!confirm(message)) {
            return;
        }

        // Here you would make the API call to apply the plan
        // For now, we'll just show a success message
        alert(`Successfully applied configuration to ${orgsToApply.length} organization(s).\n\nNote: Customer notifications should be sent for any price changes.`);

        // Close modal and reset
        this.hideApplyToOrgsModal();
        
        // In a real implementation, you might want to:
        // - Show a success notification
        // - Refresh the organization list
        // - Log the action for audit purposes
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionPlansManager = new SubscriptionPlansManager();
});
