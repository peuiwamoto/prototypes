// CSV Customizer Application - Single Configuration Model
class CSVCustomizerV3 {
    constructor() {
        this.configuration = {
            twoRowLogicEnabled: false,
            columns: [],
            lastUpdatedBy: 'John Doe',
            lastUpdatedAt: null
        };
        this.savedConfiguration = null; // Store the last saved state
        this.currentEditingColumn = null; // Track which column is being edited in drawer
        this.sampleData = this.generateSampleData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConfiguration();
        // Store the initial state as saved state
        this.savedConfiguration = JSON.parse(JSON.stringify(this.configuration));
        
        this.renderConfigurationTable();
        this.updateLastUpdatedDisplay();
        this.updateSaveButtonState();
        
        // Check if configuration exists to show landing or config screen
        const hasConfig = localStorage.getItem('csvConfiguration') !== null;
        if (hasConfig) {
            this.showLandingWithConfig();
        } else {
            this.showLandingEmpty();
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Landing page buttons
        const createConfigBtn = document.getElementById('createConfigBtn');
        console.log('createConfigBtn found:', !!createConfigBtn);
        if (createConfigBtn) {
            createConfigBtn.addEventListener('click', (e) => {
                console.log('Create button clicked - event:', e);
                e.preventDefault();
                console.log('About to call showStep(1)');
                try {
                    this.showStep(1);
                    console.log('showStep(1) completed');
                } catch (error) {
                    console.error('Error in showStep:', error);
                }
            });
        }

        const editConfigBtn = document.getElementById('editConfigBtn');
        console.log('editConfigBtn found:', !!editConfigBtn);
        if (editConfigBtn) {
            editConfigBtn.addEventListener('click', (e) => {
                console.log('Edit button clicked');
                e.preventDefault();
                try {
                    this.showStep(1);
                } catch (error) {
                    console.error('Error in showStep:', error);
                }
            });
        }

        // Global 2-row toggle
        const twoRowToggle = document.getElementById('enableTwoRowLogic');
        if (twoRowToggle) {
            twoRowToggle.addEventListener('change', (e) => {
                this.configuration.twoRowLogicEnabled = e.target.checked;
                this.onConfigurationChange();
                
                // Close drawer if open and re-render table (structure changes significantly)
                if (this.currentEditingColumn) {
                    this.closeDrawer();
                }
                
                this.renderConfigurationTable();
            });
        }

        // Preview
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showPreview();
            });
        }

        // Save
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                this.saveConfiguration();
            });
        }

        // Cancel
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelChanges();
            });
        }

        // Preview back button
        const backToConfigBtn = document.getElementById('backToConfigBtn');
        if (backToConfigBtn) {
            backToConfigBtn.addEventListener('click', () => {
                this.showStep(1);
            });
        }

        // Preview actions
        const copyCsvBtn = document.getElementById('copyCsvBtn');
        if (copyCsvBtn) {
            copyCsvBtn.addEventListener('click', () => {
                this.copyCSV();
            });
        }

        const downloadCsvBtn = document.getElementById('downloadCsvBtn');
        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', () => {
                this.downloadCSV();
            });
        }

        // Add row button
        const addRowBtn = document.getElementById('addRowBtn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => {
                this.addColumn();
            });
        }

        // Drawer close button
        const closeDrawerBtn = document.getElementById('closeDrawerBtn');
        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener('click', () => {
                this.closeDrawer();
            });
        }

        // Clear storage button (for testing)
        const clearStorageBtn = document.getElementById('clearStorageBtn');
        if (clearStorageBtn) {
            clearStorageBtn.addEventListener('click', () => {
                if (confirm('Clear all saved configuration data and start fresh?')) {
                    localStorage.removeItem('csvConfiguration');
                    location.reload();
                }
            });
        }
    }

    loadConfiguration() {
        // Try to load from localStorage, otherwise use default
        const stored = localStorage.getItem('csvConfiguration');
        if (stored) {
            const saved = JSON.parse(stored);
            this.configuration = {
                ...this.configuration,
                ...saved
            };
            // Set the toggle state
            const toggle = document.getElementById('enableTwoRowLogic');
            if (toggle) {
                toggle.checked = this.configuration.twoRowLogicEnabled;
            }
        } else {
            // Load default configuration (standard CSV)
            this.loadDefaultColumns();
        }
    }

    loadDefaultColumns() {
        // Default columns for standard CSV
        this.configuration.columns = [
            {
                id: 'col1',
                order: 0,
                header: 'Transaction ID',
                dataField: 'transaction_id',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'same',
                row1Value: '',
                row2Mode: 'same',
                row2Value: '',
                dateFormat: 'YYYY-MM-DD',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR'
            },
            {
                id: 'col2',
                order: 1,
                header: 'Date',
                dataField: 'date',
                formatting: 'date',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'same',
                row1Value: '',
                row2Mode: 'same',
                row2Value: '',
                dateFormat: 'YYYY-MM-DD'
            },
            {
                id: 'col3',
                order: 2,
                header: 'Merchant',
                dataField: 'merchant',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'same',
                row1Value: '',
                row2Mode: 'same',
                row2Value: '',
                dateFormat: 'YYYY-MM-DD',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR'
            },
            {
                id: 'col4',
                order: 3,
                header: 'Amount',
                dataField: 'amount',
                formatting: 'number',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: true,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'amount',
                row1Value: '',
                row2Mode: 'blank',
                row2Value: '',
                creditRow1Mode: 'amount',
                creditRow1Value: '',
                creditRow2Mode: 'blank',
                creditRow2Value: '',
                debitRow1Mode: 'blank',
                debitRow1Value: '',
                debitRow2Mode: 'amount',
                debitRow2Value: '',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR'
            },
            {
                id: 'col5',
                order: 4,
                header: 'Currency',
                dataField: 'currency',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'same',
                row1Value: '',
                row2Mode: 'same',
                row2Value: '',
                dateFormat: 'YYYY-MM-DD',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR'
            },
            {
                id: 'col6',
                order: 5,
                header: 'Category',
                dataField: 'category',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'same',
                row1Value: '',
                row2Mode: 'same',
                row2Value: '',
                dateFormat: 'YYYY-MM-DD',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR'
            },
            {
                id: 'col7',
                order: 6,
                header: 'Notes',
                dataField: 'notes',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'same',
                row1Value: '',
                row2Mode: 'same',
                row2Value: '',
                dateFormat: 'YYYY-MM-DD',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR'
            }
        ];
    }

    renderConfigurationTable() {
        const tbody = document.getElementById('configTableBody');
        if (!tbody) {
            console.error('configTableBody not found');
            return;
        }
        
        tbody.innerHTML = '';

        // Sort columns by order
        const sortedColumns = [...this.configuration.columns].sort((a, b) => a.order - b.order);
        
        console.log('Rendering table with', sortedColumns.length, 'columns');

        sortedColumns.forEach((column, index) => {
            // If two-row logic is enabled and this is an amount field, create two rows
            if (this.configuration.twoRowLogicEnabled && column.dataField === 'amount') {
                const creditRow = this.createConfigRow(column, index, 'credit');
                const debitRow = this.createConfigRow(column, index, 'debit');
                if (creditRow) tbody.appendChild(creditRow);
                if (debitRow) tbody.appendChild(debitRow);
            } else {
                const row = this.createConfigRow(column, index);
                if (row) {
                    tbody.appendChild(row);
                }
            }
        });
        
        console.log('Table rendered with', tbody.children.length, 'rows');
    }

    createConfigRow(column, index, amountRowType = null) {
        const tr = document.createElement('tr');
        tr.dataset.columnId = column.id;
        tr.className = 'config-row';
        
        // Store amount row type if it's a split amount row
        if (amountRowType) {
            tr.dataset.amountRowType = amountRowType;
            tr.classList.add('amount-split-row');
        }

        // Determine the header text
        let headerText = column.header;
        if (amountRowType === 'credit') {
            headerText = 'Credit';
        } else if (amountRowType === 'debit') {
            headerText = 'Debit';
        }

        // Get formatting display text
        const formatText = this.getFormattingDisplayText(column);
        
        console.log('Creating row for', headerText, 'formatText:', formatText);

        tr.innerHTML = `
            <td class="col-order">
                ${!amountRowType ? `
                    <div class="drag-handle">
                        <i class="ph ph-dots-six-vertical"></i>
                    </div>
                ` : '<span style="color: #ccc;">—</span>'}
            </td>
            <td class="col-header">${headerText || ''}</td>
            <td class="col-field">${this.getDataFieldLabel(column.dataField) || ''}</td>
            <td class="col-sample">${this.getSampleValue(column) || '—'}</td>
            <td class="col-format">${formatText ? `<span class="format-indicator">${formatText}</span>` : '—'}</td>
            <td class="col-actions">
                <div class="table-actions">
                    ${!amountRowType ? `
                        <button class="table-action-btn" title="Remove column" data-action="remove" data-column-id="${column.id}">
                            <i class="ph ph-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        // Click row to open drawer
        tr.addEventListener('click', (e) => {
            // Don't open drawer if clicking remove button
            if (e.target.closest('.table-action-btn')) {
                return;
            }
            this.openDrawer(column, amountRowType);
        });

        // Remove button (only for non-split rows)
        if (!amountRowType) {
            const removeBtn = tr.querySelector('button[data-action="remove"]');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeColumn(column.id);
                });
            }
        }

        // Drag and drop (only for regular columns, not split rows)
        if (!amountRowType) {
            this.setupDragAndDrop(tr, column);
        }

        return tr;
    }

    getDataFieldLabel(dataField) {
        const fields = {
            'transaction_id': 'Transaction ID',
            'date': 'Date',
            'merchant': 'Merchant',
            'amount': 'Amount',
            'currency': 'Currency',
            'category': 'Category',
            'notes': 'Notes',
            'account': 'Account',
            'card_number': 'Card Number',
            'reference': 'Reference'
        };
        return fields[dataField] || dataField;
    }

    getFormattingDisplayText(column) {
        if (column.dataField === 'date') {
            return column.dateFormat || 'YYYY-MM-DD';
        } else if (column.dataField === 'amount') {
            const parts = [];
            
            // Sign
            const signLabels = {
                'as-is': 'As is',
                'plus': 'Plus (+)',
                'minus': 'Minus (-)',
                'absolute': 'Absolute'
            };
            parts.push(signLabels[column.amountSign || 'as-is']);
            
            // Decimal separator
            const decimalLabels = {
                'dot': 'Dot (.)',
                'comma': 'Comma (,)'
            };
            parts.push(decimalLabels[column.decimalSeparator || 'dot']);
            
            // Thousand separator
            const thousandLabels = {
                'comma': 'Comma (,)',
                'period': 'Period (.)',
                'space': 'Space',
                'none': 'None'
            };
            parts.push(thousandLabels[column.thousandSeparator || 'comma']);
            
            // Currency
            if (column.showCurrency) {
                parts.push(column.currencySymbol || 'EUR');
            }
            
            return parts.join(' · ');
        }
        return null; // Return null for non-date/amount fields
    }

    getDataFieldOptions(selectedValue) {
        const fields = [
            { value: 'transaction_id', label: 'Transaction ID' },
            { value: 'date', label: 'Date' },
            { value: 'merchant', label: 'Merchant' },
            { value: 'amount', label: 'Amount' },
            { value: 'currency', label: 'Currency' },
            { value: 'category', label: 'Category' },
            { value: 'notes', label: 'Notes' },
            { value: 'account', label: 'Account' },
            { value: 'card_number', label: 'Card Number' },
            { value: 'reference', label: 'Reference' }
        ];

        return fields.map(field => 
            `<option value="${field.value}" ${field.value === selectedValue ? 'selected' : ''}>${field.label}</option>`
        ).join('');
    }

    getSampleValue(column) {
        const sample = this.sampleData[0];
        let value = sample[column.dataField] || '';

        if (column.formatting === 'date' && value) {
            value = new Date(value).toLocaleDateString('en-US');
        } else if (column.formatting === 'number' && value) {
            value = typeof value === 'number' ? value.toFixed(2) : value;
        }

        return value || '—';
    }



    addColumn() {
        const newColumn = {
            id: 'col' + Date.now(),
            order: this.configuration.columns.length,
            header: 'New Column',
            dataField: 'transaction_id',
            formatting: 'text',
            visible: true,
            splitEnabled: false,
            debitValue: '',
            creditValue: '',
            isAmountField: false,
            splitIntoColumns: false,
            splitIntoRows: false,
            row1Mode: 'same',
            row1Value: '',
            row2Mode: 'same',
            row2Value: '',
            creditRow1Mode: 'amount',
            creditRow1Value: '',
            creditRow2Mode: 'blank',
            creditRow2Value: '',
            debitRow1Mode: 'blank',
            debitRow1Value: '',
            debitRow2Mode: 'amount',
            debitRow2Value: '',
            dateFormat: 'YYYY-MM-DD',
            amountSign: 'as-is',
            decimalSeparator: 'dot',
            thousandSeparator: 'comma',
            showCurrency: false,
            currencySymbol: 'EUR'
        };
        this.configuration.columns.push(newColumn);
        this.onConfigurationChange();
        this.renderConfigurationTable();
        // Auto-open drawer for new column
        this.openDrawer(newColumn);
    }

    openDrawer(column, amountRowType = null) {
        this.currentEditingColumn = column;
        this.currentAmountRowType = amountRowType;
        const drawer = document.getElementById('configDrawer');
        const drawerTitle = document.getElementById('drawerTitle');
        
        // Mark row as selected
        document.querySelectorAll('.config-row').forEach(row => {
            row.classList.remove('selected');
        });
        
        // Select the appropriate row
        if (amountRowType) {
            const selectedRow = document.querySelector(`tr[data-column-id="${column.id}"][data-amount-row-type="${amountRowType}"]`);
            if (selectedRow) {
                selectedRow.classList.add('selected');
            }
        } else {
            const selectedRow = document.querySelector(`tr[data-column-id="${column.id}"]:not([data-amount-row-type])`);
            if (selectedRow) {
                selectedRow.classList.add('selected');
            }
        }
        
        // Update title
        let title = column.header;
        if (amountRowType === 'credit') {
            title = 'Credit';
        } else if (amountRowType === 'debit') {
            title = 'Debit';
        }
        drawerTitle.textContent = `Configure: ${title}`;
        
        // Render drawer content
        this.renderDrawerContent(column, amountRowType);
        
        // Open drawer
        drawer.classList.add('open');
    }

    closeDrawer() {
        const drawer = document.getElementById('configDrawer');
        drawer.classList.remove('open');
        
        // Remove selected state
        document.querySelectorAll('.config-row').forEach(row => {
            row.classList.remove('selected');
        });
        
        this.currentEditingColumn = null;
        this.currentAmountRowType = null;
        
        // Re-render table to reflect any changes
        this.renderConfigurationTable();
    }

    renderDrawerContent(column, amountRowType = null) {
        const drawerContent = document.getElementById('drawerContent');
        const isAmountSplitRow = amountRowType !== null;
        
        let html = '';
        
        if (isAmountSplitRow) {
            // For Credit/Debit split rows, show simplified view
            const rowTitle = amountRowType === 'credit' ? 'Credit' : 'Debit';
            html += `
                <!-- Split Row Information -->
                <div class="drawer-section">
                    <h4 class="drawer-section-title">Row Information</h4>
                    <div class="drawer-field">
                        <label class="drawer-field-label">Row Type</label>
                        <input 
                            type="text" 
                            class="drawer-input" 
                            value="${rowTitle}"
                            disabled
                        />
                        <p class="drawer-help-text">This row represents the ${rowTitle.toLowerCase()} entry for amount transactions</p>
                    </div>
                    
                    <div class="drawer-field">
                        <label class="drawer-field-label">Data Field</label>
                        <input 
                            type="text" 
                            class="drawer-input" 
                            value="${this.getDataFieldLabel(column.dataField)}"
                            disabled
                        />
                    </div>
                    
                    <div class="drawer-field">
                        <label class="drawer-field-label">Sample Value</label>
                        <input 
                            type="text" 
                            class="drawer-input" 
                            value="${this.getSampleValue(column)}"
                            disabled
                        />
                    </div>
                </div>
                
                <!-- Formatting Section -->
                <div class="drawer-section">
                    <h4 class="drawer-section-title">Formatting</h4>
                    <button class="drawer-format-btn" id="drawerFormatBtn">
                        <span>Configure formatting options</span>
                        <i class="ph ph-caret-right"></i>
                    </button>
                    <p class="drawer-help-text">Formatting settings are shared between Credit and Debit rows</p>
                </div>
                
                <!-- Row Configuration -->
                <div class="drawer-section">
                    <h4 class="drawer-section-title">${rowTitle} Row Configuration</h4>
                    <p class="drawer-help-text">Configure how this row appears in the export</p>
                    
                    <div class="drawer-row-config">
                        <div class="drawer-row-item">
                            <label class="drawer-row-label">Row 1</label>
                            <select class="drawer-select" id="drawer${rowTitle}Row1Mode">
                                ${this.getRowModeOptionsForDrawer(column, `${amountRowType}Row1Mode`)}
                            </select>
                            ${column[`${amountRowType}Row1Mode`] === 'constant' ? `
                                <input 
                                    type="text" 
                                    class="drawer-input" 
                                    id="drawer${rowTitle}Row1Value"
                                    value="${column[`${amountRowType}Row1Value`] || ''}"
                                    placeholder="Enter constant value"
                                />
                            ` : ''}
                        </div>
                        
                        <div class="drawer-row-item">
                            <label class="drawer-row-label">Row 2</label>
                            <select class="drawer-select" id="drawer${rowTitle}Row2Mode">
                                ${this.getRowModeOptionsForDrawer(column, `${amountRowType}Row2Mode`)}
                            </select>
                            ${column[`${amountRowType}Row2Mode`] === 'constant' ? `
                                <input 
                                    type="text" 
                                    class="drawer-input" 
                                    id="drawer${rowTitle}Row2Value"
                                    value="${column[`${amountRowType}Row2Value`] || ''}"
                                    placeholder="Enter constant value"
                                />
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Regular column configuration
            html += `
                <!-- Basic Information -->
                <div class="drawer-section">
                    <h4 class="drawer-section-title">Column Information</h4>
                    
                    <div class="drawer-field">
                        <label class="drawer-field-label">Column Header</label>
                        <input 
                            type="text" 
                            class="drawer-input" 
                            id="drawerHeaderInput"
                            value="${column.header}"
                            placeholder="Enter column header"
                        />
                        <p class="drawer-help-text">This will be the column name in the exported CSV</p>
                    </div>
                    
                    <div class="drawer-field">
                        <label class="drawer-field-label">Data Field</label>
                        <select class="drawer-select" id="drawerDataFieldSelect">
                            ${this.getDataFieldOptions(column.dataField)}
                        </select>
                        <p class="drawer-help-text">Select the data source for this column</p>
                    </div>
                    
                    <div class="drawer-field">
                        <label class="drawer-field-label">Sample Value</label>
                        <input 
                            type="text" 
                            class="drawer-input" 
                            value="${this.getSampleValue(column)}"
                            disabled
                        />
                    </div>
                </div>
            `;

            // Only show formatting section for Date and Amount fields
            if (column.dataField === 'date' || column.dataField === 'amount') {
                html += `
                    <!-- Formatting Section -->
                    <div class="drawer-section">
                        <h4 class="drawer-section-title">Formatting</h4>
                        <button class="drawer-format-btn" id="drawerFormatBtn">
                            <span>Configure formatting options</span>
                            <i class="ph ph-caret-right"></i>
                        </button>
                    </div>
                `;
            }
        }

        // Two-row logic section (only for regular columns when enabled and not amount field)
        if (this.configuration.twoRowLogicEnabled && !isAmountSplitRow && column.dataField !== 'amount') {
            html += `
                <div class="drawer-section">
                    <h4 class="drawer-section-title">Debit/Credit Behavior</h4>
                    <p class="drawer-help-text">Configure how this column appears in each row when creditor based logic is enabled</p>
                    
                    <div class="drawer-row-config">
                        <div class="drawer-row-item">
                            <label class="drawer-row-label">Row 1 (Credit)</label>
                            <select class="drawer-select" id="drawerCreditRow1Mode">
                                ${this.getRowModeOptionsForDrawer(column, 'creditRow1Mode')}
                            </select>
                            ${column.creditRow1Mode === 'constant' ? `
                                <input 
                                    type="text" 
                                    class="drawer-input" 
                                    id="drawerCreditRow1Value"
                                    value="${column.creditRow1Value || ''}"
                                    placeholder="Enter constant value"
                                />
                            ` : ''}
                        </div>
                        
                        <div class="drawer-row-item">
                            <label class="drawer-row-label">Row 2 (Credit)</label>
                            <select class="drawer-select" id="drawerCreditRow2Mode">
                                ${this.getRowModeOptionsForDrawer(column, 'creditRow2Mode')}
                            </select>
                            ${column.creditRow2Mode === 'constant' ? `
                                <input 
                                    type="text" 
                                    class="drawer-input" 
                                    id="drawerCreditRow2Value"
                                    value="${column.creditRow2Value || ''}"
                                    placeholder="Enter constant value"
                                />
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="drawer-row-config" style="margin-top: 16px;">
                        <div class="drawer-row-item">
                            <label class="drawer-row-label">Row 1 (Debit)</label>
                            <select class="drawer-select" id="drawerDebitRow1Mode">
                                ${this.getRowModeOptionsForDrawer(column, 'debitRow1Mode')}
                            </select>
                            ${column.debitRow1Mode === 'constant' ? `
                                <input 
                                    type="text" 
                                    class="drawer-input" 
                                    id="drawerDebitRow1Value"
                                    value="${column.debitRow1Value || ''}"
                                    placeholder="Enter constant value"
                                />
                            ` : ''}
                        </div>
                        
                        <div class="drawer-row-item">
                            <label class="drawer-row-label">Row 2 (Debit)</label>
                            <select class="drawer-select" id="drawerDebitRow2Mode">
                                ${this.getRowModeOptionsForDrawer(column, 'debitRow2Mode')}
                            </select>
                            ${column.debitRow2Mode === 'constant' ? `
                                <input 
                                    type="text" 
                                    class="drawer-input" 
                                    id="drawerDebitRow2Value"
                                    value="${column.debitRow2Value || ''}"
                                    placeholder="Enter constant value"
                                />
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        drawerContent.innerHTML = html;
        
        // Setup event listeners
        this.setupDrawerListeners(column, amountRowType);
    }

    getRowModeOptionsForDrawer(column, modeProperty) {
        const currentMode = column[modeProperty] || 'same';
        const isAmountField = column.dataField === 'amount';
        
        if (isAmountField) {
            return `
                <option value="amount" ${currentMode === 'amount' ? 'selected' : ''}>Amount</option>
                <option value="blank" ${currentMode === 'blank' ? 'selected' : ''}>Blank</option>
                <option value="constant" ${currentMode === 'constant' ? 'selected' : ''}>Constant Value</option>
            `;
        } else {
            return `
                <option value="same" ${currentMode === 'same' ? 'selected' : ''}>Same Value</option>
                <option value="blank" ${currentMode === 'blank' ? 'selected' : ''}>Blank</option>
                <option value="constant" ${currentMode === 'constant' ? 'selected' : ''}>Constant Value</option>
            `;
        }
    }

    setupDrawerListeners(column, amountRowType = null) {
        const isAmountSplitRow = amountRowType !== null;
        
        if (isAmountSplitRow) {
            // For split amount rows, only set up formatting button and row mode listeners
            const formatBtn = document.getElementById('drawerFormatBtn');
            if (formatBtn) {
                formatBtn.addEventListener('click', () => {
                    this.openFormattingModal(column);
                });
            }
            
            // Set up listeners for the specific row type (credit or debit)
            const rowType = amountRowType.charAt(0).toUpperCase() + amountRowType.slice(1); // 'Credit' or 'Debit'
            
            ['Row1Mode', 'Row2Mode'].forEach(modeSuffix => {
                const modeProp = `${amountRowType}${modeSuffix}`;
                const selectId = `drawer${rowType}${modeSuffix}`;
                const select = document.getElementById(selectId);
                
                if (select) {
                    select.addEventListener('change', (e) => {
                        column[modeProp] = e.target.value;
                        this.onConfigurationChange();
                        // Re-render drawer to show/hide constant value input
                        this.renderDrawerContent(column, amountRowType);
                    });
                }

                const valueProp = modeProp.replace('Mode', 'Value');
                const valueId = `drawer${rowType}${modeSuffix.replace('Mode', 'Value')}`;
                const valueInput = document.getElementById(valueId);
                
                if (valueInput) {
                    valueInput.addEventListener('input', (e) => {
                        column[valueProp] = e.target.value;
                        this.onConfigurationChange();
                    });
                }
            });
        } else {
            // Regular column listeners
            // Header input
            const headerInput = document.getElementById('drawerHeaderInput');
            if (headerInput) {
                headerInput.addEventListener('input', (e) => {
                    column.header = e.target.value;
                    document.getElementById('drawerTitle').textContent = `Configure: ${column.header}`;
                    this.onConfigurationChange();
                    this.updateTableRow(column.id);
                });
            }

            // Data field select
            const dataFieldSelect = document.getElementById('drawerDataFieldSelect');
            if (dataFieldSelect) {
                dataFieldSelect.addEventListener('change', (e) => {
                    column.dataField = e.target.value;
                    column.isAmountField = e.target.value === 'amount';
                    this.onConfigurationChange();
                    this.renderConfigurationTable();
                    // Close and reopen drawer to reflect changes
                    this.closeDrawer();
                });
            }

            // Format button (only for date and amount fields)
            if (column.dataField === 'date' || column.dataField === 'amount') {
                const formatBtn = document.getElementById('drawerFormatBtn');
                if (formatBtn) {
                    formatBtn.addEventListener('click', () => {
                        this.openFormattingModal(column);
                    });
                }
            }

            // Two-row mode listeners (for non-amount fields when two-row logic is enabled)
            if (this.configuration.twoRowLogicEnabled && column.dataField !== 'amount') {
                ['creditRow1Mode', 'creditRow2Mode', 'debitRow1Mode', 'debitRow2Mode'].forEach(modeProp => {
                    const select = document.getElementById(`drawer${modeProp.charAt(0).toUpperCase() + modeProp.slice(1)}`);
                    if (select) {
                        select.addEventListener('change', (e) => {
                            column[modeProp] = e.target.value;
                            this.onConfigurationChange();
                            // Re-render drawer to show/hide constant value input
                            this.renderDrawerContent(column);
                        });
                    }

                    const valueProp = modeProp.replace('Mode', 'Value');
                    const valueInput = document.getElementById(`drawer${valueProp.charAt(0).toUpperCase() + valueProp.slice(1)}`);
                    if (valueInput) {
                        valueInput.addEventListener('input', (e) => {
                            column[valueProp] = e.target.value;
                            this.onConfigurationChange();
                        });
                    }
                });
            }
        }
    }

    updateTableRow(columnId) {
        const column = this.configuration.columns.find(c => c.id === columnId);
        if (!column) return;

        const row = document.querySelector(`tr[data-column-id="${columnId}"]`);
        if (!row) return;

        // Update header
        const headerCell = row.querySelector('.col-header');
        if (headerCell) {
            headerCell.textContent = column.header;
        }

        // Update field
        const fieldCell = row.querySelector('.col-field');
        if (fieldCell) {
            fieldCell.textContent = this.getDataFieldLabel(column.dataField);
        }

        // Update sample
        const sampleCell = row.querySelector('.col-sample');
        if (sampleCell) {
            sampleCell.textContent = this.getSampleValue(column);
        }

        // Update format
        const formatCell = row.querySelector('.col-format');
        if (formatCell) {
            const formatText = this.getFormattingDisplayText(column);
            formatCell.innerHTML = formatText ? `<span class="format-indicator">${formatText}</span>` : '—';
        }
    }


    openFormattingModal(column) {
        const modalOverlay = document.getElementById('formattingModal');
        const modalTitle = document.getElementById('formattingModalTitle');
        const dateOptions = document.getElementById('dateFormattingOptions');
        const amountOptions = document.getElementById('amountFormattingOptions');
        
        // Store current column
        this.currentFormattingColumn = column;
        
        // Show appropriate options based on field type
        if (column.dataField === 'date') {
            modalTitle.textContent = 'Configure Date Formatting';
            dateOptions.style.display = 'block';
            amountOptions.style.display = 'none';
            
            // Set current date format
            const dateFormatRadios = modalOverlay.querySelectorAll('input[name="dateFormat"]');
            dateFormatRadios.forEach(radio => {
                radio.checked = radio.value === (column.dateFormat || 'YYYY-MM-DD');
            });
        } else if (column.dataField === 'amount') {
            modalTitle.textContent = 'Configure Amount Formatting';
            dateOptions.style.display = 'none';
            amountOptions.style.display = 'block';
            
            // Set current amount formatting options
            const signRadios = modalOverlay.querySelectorAll('input[name="amountSign"]');
            signRadios.forEach(radio => {
                radio.checked = radio.value === (column.amountSign || 'as-is');
            });
            
            const decimalRadios = modalOverlay.querySelectorAll('input[name="decimalSeparator"]');
            decimalRadios.forEach(radio => {
                radio.checked = radio.value === (column.decimalSeparator || 'dot');
            });
            
            const thousandRadios = modalOverlay.querySelectorAll('input[name="thousandSeparator"]');
            thousandRadios.forEach(radio => {
                radio.checked = radio.value === (column.thousandSeparator || 'comma');
            });
            
            const showCurrencyToggle = document.getElementById('showCurrencyToggle');
            const currencySymbolField = document.getElementById('currencySymbolField');
            const currencySymbolInput = document.getElementById('currencySymbolInput');
            
            showCurrencyToggle.checked = column.showCurrency || false;
            currencySymbolField.style.display = showCurrencyToggle.checked ? 'block' : 'none';
            currencySymbolInput.value = column.currencySymbol || 'EUR';
            
            // Toggle currency field visibility
            showCurrencyToggle.onchange = (e) => {
                currencySymbolField.style.display = e.target.checked ? 'block' : 'none';
            };
        }
        
        // Show modal
        modalOverlay.style.display = 'flex';
        
        // Setup event listeners
        const closeBtn = document.getElementById('closeFormattingModal');
        const cancelBtn = document.getElementById('cancelFormattingBtn');
        const saveBtn = document.getElementById('saveFormattingBtn');
        
        const closeModal = () => {
            modalOverlay.style.display = 'none';
        };
        
        const saveFormatting = () => {
            if (column.dataField === 'date') {
                const selectedDateFormat = modalOverlay.querySelector('input[name="dateFormat"]:checked');
                if (selectedDateFormat) {
                    column.dateFormat = selectedDateFormat.value;
                }
            } else if (column.dataField === 'amount') {
                const selectedSign = modalOverlay.querySelector('input[name="amountSign"]:checked');
                const selectedDecimal = modalOverlay.querySelector('input[name="decimalSeparator"]:checked');
                const selectedThousand = modalOverlay.querySelector('input[name="thousandSeparator"]:checked');
                const showCurrencyToggle = document.getElementById('showCurrencyToggle');
                const currencySymbolInput = document.getElementById('currencySymbolInput');
                
                if (selectedSign) column.amountSign = selectedSign.value;
                if (selectedDecimal) column.decimalSeparator = selectedDecimal.value;
                if (selectedThousand) column.thousandSeparator = selectedThousand.value;
                column.showCurrency = showCurrencyToggle.checked;
                column.currencySymbol = currencySymbolInput.value || 'EUR';
            }
            
            this.onConfigurationChange();
            this.updateTableRow(column.id);
            closeModal();
        };
        
        // Remove old listeners and add new ones
        closeBtn.onclick = closeModal;
        cancelBtn.onclick = saveFormatting;
        saveBtn.onclick = saveFormatting;
        
        // Close on overlay click
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        };
    }

    removeColumn(columnId) {
        this.configuration.columns = this.configuration.columns.filter(c => c.id !== columnId);
        // Reorder remaining columns
        this.configuration.columns.forEach((col, index) => {
            col.order = index;
        });
        this.onConfigurationChange();
        this.renderConfigurationTable();
    }

    setupDragAndDrop(row, column) {
        row.draggable = true;
        
        row.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', column.id);
            row.classList.add('dragging');
        });

        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = row.dataset.columnId;
            this.reorderColumns(draggedId, targetId);
        });
    }

    reorderColumns(fromId, toId) {
        const fromIndex = this.configuration.columns.findIndex(c => c.id === fromId);
        const toIndex = this.configuration.columns.findIndex(c => c.id === toId);
        
        if (fromIndex === -1 || toIndex === -1) return;

        const [moved] = this.configuration.columns.splice(fromIndex, 1);
        this.configuration.columns.splice(toIndex, 0, moved);
        
        this.configuration.columns.forEach((col, index) => {
            col.order = index;
        });

        this.onConfigurationChange();
        this.renderConfigurationTable();
    }

    onConfigurationChange() {
        this.showWarning();
        this.updateSaveButtonState();
    }

    showWarning() {
        const warningMessage = document.getElementById('warningMessage');
        if (warningMessage) {
            warningMessage.style.display = 'flex';
        }
    }

    hasChanges() {
        if (!this.savedConfiguration) return true;
        
        // Deep comparison of configurations
        const current = JSON.stringify(this.configuration);
        const saved = JSON.stringify(this.savedConfiguration);
        return current !== saved;
    }

    updateSaveButtonState() {
        const saveBtn = document.getElementById('saveConfigBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const hasChanges = this.hasChanges();
        
        if (saveBtn) {
            saveBtn.disabled = !hasChanges;
        }
        
        if (cancelBtn) {
            cancelBtn.style.display = hasChanges ? 'inline-flex' : 'none';
        }
    }

    cancelChanges() {
        if (confirm('Are you sure you want to discard all unsaved changes?')) {
            // Close drawer if open
            this.closeDrawer();
            
            // Revert to saved configuration
            if (this.savedConfiguration) {
                this.configuration = JSON.parse(JSON.stringify(this.savedConfiguration));
            } else {
                // If no saved config, reload defaults
                this.loadConfiguration();
                this.savedConfiguration = JSON.parse(JSON.stringify(this.configuration));
            }
            
            // Update UI
            document.getElementById('enableTwoRowLogic').checked = this.configuration.twoRowLogicEnabled;
            
            this.renderConfigurationTable();
            this.updateSaveButtonState();
            
            // Hide warning
            const warningMessage = document.getElementById('warningMessage');
            if (warningMessage) {
                warningMessage.style.display = 'none';
            }
        }
    }

    showStep(stepNumber) {
        console.log('Showing step:', stepNumber);
        const steps = document.querySelectorAll('.step-container');
        console.log('Found step containers:', steps.length);
        steps.forEach(step => {
            console.log('Hiding step:', step.id);
            step.classList.remove('active');
            step.style.display = 'none';
        });
        const targetStep = document.getElementById(`step${stepNumber}`);
        console.log('Target step element:', targetStep);
        if (targetStep) {
            targetStep.classList.add('active');
            targetStep.style.display = 'block';
            console.log('Step displayed:', stepNumber, 'Display:', targetStep.style.display);
        } else {
            console.error('Step not found:', stepNumber);
        }
    }

    showLandingEmpty() {
        document.getElementById('configCard').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        this.showStep(0);
    }

    showLandingWithConfig() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('configCard').style.display = 'block';
        
        // Populate config card
        const configMeta = document.getElementById('configCardMeta');
        const configSummary = document.getElementById('configCardSummary');
        
        // Update meta information
        const lastUpdated = this.configuration.lastUpdatedAt 
            ? new Date(this.configuration.lastUpdatedAt).toLocaleString() 
            : '—';
        configMeta.textContent = `Last updated: ${lastUpdated}`;
        
        // Build summary
        const columnCount = this.configuration.columns.length;
        const twoRowEnabled = this.configuration.twoRowLogicEnabled ? 'Enabled' : 'Disabled';
        const dateColumns = this.configuration.columns.filter(c => c.dataField === 'date').length;
        const amountColumns = this.configuration.columns.filter(c => c.dataField === 'amount').length;
        
        configSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Total Columns:</span>
                <span class="summary-value">${columnCount}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Creditor Based Logic:</span>
                <span class="summary-value">${twoRowEnabled}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Date Fields:</span>
                <span class="summary-value">${dateColumns}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Amount Fields:</span>
                <span class="summary-value">${amountColumns}</span>
            </div>
        `;
        
        this.showStep(0);
    }

    saveConfiguration() {
        if (confirm('Changes will affect future exports. Are you sure you want to save?')) {
            this.configuration.lastUpdatedAt = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('csvConfiguration', JSON.stringify(this.configuration));
            
            // Update saved state
            this.savedConfiguration = JSON.parse(JSON.stringify(this.configuration));
            
            // Update display
            this.updateLastUpdatedDisplay();
            
            // Update button states
            this.updateSaveButtonState();
            
            // Go back to landing page with config card
            this.showLandingWithConfig();
            
            // Hide warning
            const warningMessage = document.getElementById('warningMessage');
            if (warningMessage) {
                warningMessage.style.display = 'none';
            }
            
            alert('Configuration saved successfully!');
        }
    }

    updateLastUpdatedDisplay() {
        const lastUpdatedAt = document.getElementById('lastUpdatedAt');
        if (lastUpdatedAt && this.configuration.lastUpdatedAt) {
            const date = new Date(this.configuration.lastUpdatedAt);
            const dateStr = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            lastUpdatedAt.textContent = dateStr;
        } else if (lastUpdatedAt) {
            lastUpdatedAt.textContent = 'Never';
        }
    }

    showPreview() {
        this.generatePreview();
        this.showStep(3);
    }

    generatePreview() {
        const visibleColumns = this.configuration.columns
            .filter(c => c.visible)
            .sort((a, b) => a.order - b.order);

        // Generate preview data
        const previewData = [];
        this.sampleData.slice(0, 5).forEach(transaction => {
            if (this.configuration.twoRowLogicEnabled) {
                // Generate two rows per transaction (Debit and Credit)
                const debitRow = {};
                const creditRow = {};
                
                visibleColumns.forEach(column => {
                    const baseValue = this.formatValue(transaction[column.dataField], column.formatting);
                    
                    if (column.splitEnabled) {
                        // Use custom split values if provided, otherwise use base value
                        // If debitValue/creditValue is empty, use baseValue
                        debitRow[column.header] = column.debitValue.trim() || baseValue;
                        creditRow[column.header] = column.creditValue.trim() || baseValue;
                    } else {
                        // Same value for both rows
                        debitRow[column.header] = baseValue;
                        creditRow[column.header] = baseValue;
                    }
                });
                
                previewData.push(debitRow);
                previewData.push(creditRow);
            } else {
                // Single row per transaction
                const row = {};
                visibleColumns.forEach(column => {
                    row[column.header] = this.formatValue(transaction[column.dataField], column.formatting);
                });
                previewData.push(row);
            }
        });

        // Render table
        this.renderPreviewTable(visibleColumns, previewData);
        
        // Render CSV
        this.renderCSVPreview(visibleColumns, previewData);
    }

    renderPreviewTable(columns, data) {
        const thead = document.getElementById('previewTableHead');
        const tbody = document.getElementById('previewTableBody');
        
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Headers
        const headerRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Rows
        data.forEach(rowData => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                td.textContent = rowData[column.header] || '—';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    renderCSVPreview(columns, data) {
        let csvContent = '';
        
        // Headers
        csvContent += columns.map(c => `"${c.header}"`).join(',') + '\n';
        
        // Data rows
        data.forEach(rowData => {
            const values = columns.map(column => {
                const value = rowData[column.header] || '';
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvContent += values.join(',') + '\n';
        });

        document.getElementById('csvPreview').textContent = csvContent;
    }

    formatValue(value, formatting) {
        if (!value && value !== 0) return '—';
        
        if (formatting === 'date') {
            return new Date(value).toLocaleDateString('en-US');
        } else if (formatting === 'number') {
            return typeof value === 'number' ? value.toFixed(2) : value;
        }
        return value;
    }

    copyCSV() {
        const csvContent = document.getElementById('csvPreview').textContent;
        navigator.clipboard.writeText(csvContent).then(() => {
            alert('CSV copied to clipboard!');
        });
    }

    downloadCSV() {
        const csvContent = document.getElementById('csvPreview').textContent;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'sample-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Duplicate showStep removed - using the one defined earlier in the class

    generateSampleData() {
        return [
            {
                transaction_id: 'TXN-001',
                date: '2025-01-15',
                merchant: 'Office Supplies Co.',
                amount: 1250.50,
                currency: 'EUR',
                category: 'Office Expenses',
                notes: 'Monthly office supplies',
                account: 'ACC-001',
                card_number: '****1234',
                reference: 'REF-001'
            },
            {
                transaction_id: 'TXN-002',
                date: '2025-01-16',
                merchant: 'Cloud Services Inc.',
                amount: 299.99,
                currency: 'EUR',
                category: 'Software',
                notes: 'Monthly subscription',
                account: 'ACC-002',
                card_number: '****5678',
                reference: 'REF-002'
            },
            {
                transaction_id: 'TXN-003',
                date: '2025-01-17',
                merchant: 'Travel Agency',
                amount: 850.00,
                currency: 'EUR',
                category: 'Travel',
                notes: 'Business trip expenses',
                account: 'ACC-001',
                card_number: '****1234',
                reference: 'REF-003'
            },
            {
                transaction_id: 'TXN-004',
                date: '2025-01-18',
                merchant: 'Restaurant',
                amount: 45.50,
                currency: 'EUR',
                category: 'Meals',
                notes: 'Team lunch',
                account: 'ACC-003',
                card_number: '****9012',
                reference: 'REF-004'
            },
            {
                transaction_id: 'TXN-005',
                date: '2025-01-19',
                merchant: 'Hardware Store',
                amount: 320.75,
                currency: 'EUR',
                category: 'Equipment',
                notes: 'New equipment purchase',
                account: 'ACC-001',
                card_number: '****1234',
                reference: 'REF-005'
            }
        ];
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CSVCustomizerV3();
});
