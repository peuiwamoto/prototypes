// CSV Customizer Application - Single Configuration Model
class CSVCustomizerV2 {
    constructor() {
        this.configuration = {
            twoRowLogicEnabled: false,
            columns: [],
            lastUpdatedBy: 'John Doe',
            lastUpdatedAt: null
        };
        this.savedConfiguration = null; // Store the last saved state
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
        
        // Set initial visibility of row headers
        const row1Header = document.getElementById('colRow1Header');
        const row2Header = document.getElementById('colRow2Header');
        if (row1Header && row2Header) {
            const shouldShow = this.configuration.twoRowLogicEnabled;
            row1Header.style.display = shouldShow ? 'table-cell' : 'none';
            row2Header.style.display = shouldShow ? 'table-cell' : 'none';
        }
        
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
                this.renderConfigurationTable();
                // Show/hide row column headers
                const row1Header = document.getElementById('colRow1Header');
                const row2Header = document.getElementById('colRow2Header');
                if (row1Header && row2Header) {
                    row1Header.style.display = e.target.checked ? 'table-cell' : 'none';
                    row2Header.style.display = e.target.checked ? 'table-cell' : 'none';
                }
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
        tbody.innerHTML = '';

        // Sort columns by order
        const sortedColumns = [...this.configuration.columns].sort((a, b) => a.order - b.order);

        sortedColumns.forEach((column, index) => {
            // If it's an amount field and two-row logic is enabled, create two rows (Credit and Debit)
            if (column.dataField === 'amount' && this.configuration.twoRowLogicEnabled) {
                const creditRow = this.createConfigRow(column, index, 'credit');
                const debitRow = this.createConfigRow(column, index, 'debit');
                tbody.appendChild(creditRow);
                tbody.appendChild(debitRow);
            } else {
                const row = this.createConfigRow(column, index);
                tbody.appendChild(row);
            }
        });
    }

    createConfigRow(column, index, amountRowType = null) {
        const tr = document.createElement('tr');
        tr.dataset.columnId = column.id;
        tr.className = 'config-row';
        
        // If this is a credit/debit split row, add a data attribute
        if (amountRowType) {
            tr.dataset.amountRowType = amountRowType;
        }

        const splitCellStyle = this.configuration.twoRowLogicEnabled ? '' : 'display: none;';
        
        // Determine the header text
        let headerValue = column.header;
        let headerDisabled = false;
        if (amountRowType === 'credit') {
            headerValue = 'Credit';
            headerDisabled = true;
        } else if (amountRowType === 'debit') {
            headerValue = 'Debit';
            headerDisabled = true;
        }

        tr.innerHTML = `
            <td class="col-order">
                <div class="drag-handle">
                    <i class="ph ph-dots-six-vertical"></i>
                </div>
            </td>
            <td class="col-header">
                <input 
                    type="text" 
                    class="table-input" 
                    value="${headerValue}"
                    data-column-id="${column.id}"
                    data-field="header"
                    ${headerDisabled ? 'disabled' : ''}
                />
            </td>
            <td class="col-field">
                <select class="table-select" data-column-id="${column.id}" data-field="dataField" ${amountRowType ? 'disabled' : ''}>
                    ${this.getDataFieldOptions(column.dataField)}
                </select>
            </td>
            <td class="col-sample">
                <span class="sample-value">${this.getSampleValue(column)}</span>
            </td>
            <td class="col-format">
                <button class="format-btn" data-column-id="${column.id}" title="Configure formatting" ${this.shouldDisableFormatButton(column, amountRowType) ? 'disabled' : ''}>
                    <i class="ph ph-sliders-horizontal"></i>
                </button>
            </td>
            <td class="col-row1" style="${splitCellStyle}">
                <div class="row-config">
                    <select class="table-select row-mode-select" data-column-id="${column.id}" data-row="row1" ${amountRowType ? `data-amount-row-type="${amountRowType}"` : ''}>
                        ${this.getRowModeOptions(column, 'row1', amountRowType)}
                    </select>
                    ${this.shouldShowConstantInput(column, 'row1', amountRowType) ? `
                        <input 
                            type="text" 
                            class="table-input row-value-input" 
                            placeholder="Enter value"
                            value="${this.getRowValue(column, 'row1', amountRowType)}"
                            data-column-id="${column.id}"
                            data-row="row1"
                            ${amountRowType ? `data-amount-row-type="${amountRowType}"` : ''}
                        />
                    ` : ''}
                </div>
            </td>
            <td class="col-row2" style="${splitCellStyle}">
                <div class="row-config">
                    <select class="table-select row-mode-select" data-column-id="${column.id}" data-row="row2" ${amountRowType ? `data-amount-row-type="${amountRowType}"` : ''}>
                        ${this.getRowModeOptions(column, 'row2', amountRowType)}
                    </select>
                    ${this.shouldShowConstantInput(column, 'row2', amountRowType) ? `
                        <input 
                            type="text" 
                            class="table-input row-value-input" 
                            placeholder="Enter value"
                            value="${this.getRowValue(column, 'row2', amountRowType)}"
                            data-column-id="${column.id}"
                            data-row="row2"
                            ${amountRowType ? `data-amount-row-type="${amountRowType}"` : ''}
                        />
                    ` : ''}
                </div>
            </td>
            <td class="col-actions">
                <div class="table-actions">
                    <button class="table-action-btn" title="Remove column" data-action="remove" data-column-id="${column.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Add event listeners
        const headerInput = tr.querySelector('input[data-field="header"]');
        headerInput.addEventListener('change', (e) => {
            column.header = e.target.value;
            this.onConfigurationChange();
            this.updateSampleValue(column.id);
        });

        const dataFieldSelect = tr.querySelector('select[data-field="dataField"]');
        dataFieldSelect.addEventListener('change', (e) => {
            column.dataField = e.target.value;
            // Update isAmountField flag
            column.isAmountField = e.target.value === 'amount';
            this.onConfigurationChange();
            this.updateSampleValue(column.id);
            // Re-render to show/hide behavior button and inputs
            this.renderConfigurationTable();
        });

        const formatBtn = tr.querySelector('.format-btn');
        if (formatBtn && !formatBtn.disabled) {
            formatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openFormattingModal(column);
            });
        }

        // Row mode selectors
        const rowModeSelects = tr.querySelectorAll('.row-mode-select');
        rowModeSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.dataset.row;
                const amountRowType = e.target.dataset.amountRowType;
                
                if (amountRowType) {
                    // Credit or Debit row
                    const propertyName = `${amountRowType}${row.charAt(0).toUpperCase() + row.slice(1)}Mode`;
                    column[propertyName] = e.target.value;
                } else {
                    column[`${row}Mode`] = e.target.value;
                }
                
                this.onConfigurationChange();
                // Re-render to show/hide constant value input
                this.renderConfigurationTable();
            });
        });

        // Row value inputs
        const rowValueInputs = tr.querySelectorAll('.row-value-input');
        rowValueInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const row = e.target.dataset.row;
                const amountRowType = e.target.dataset.amountRowType;
                
                if (amountRowType) {
                    // Credit or Debit row
                    const propertyName = `${amountRowType}${row.charAt(0).toUpperCase() + row.slice(1)}Value`;
                    column[propertyName] = e.target.value;
                } else {
                    column[`${row}Value`] = e.target.value;
                }
                
                this.onConfigurationChange();
            });
        });

        // Remove button
        const removeBtn = tr.querySelector('button[data-action="remove"]');
        removeBtn.addEventListener('click', () => {
            this.removeColumn(column.id);
        });

        // Drag and drop
        this.setupDragAndDrop(tr, column);

        return tr;
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

    updateSampleValue(columnId) {
        const column = this.configuration.columns.find(c => c.id === columnId);
        if (!column) return;

        const row = document.querySelector(`tr[data-column-id="${columnId}"]`);
        if (row) {
            const sampleValue = row.querySelector('.sample-value');
            if (sampleValue) {
                sampleValue.textContent = this.getSampleValue(column);
            }
        }
    }

    getBehaviorText(column) {
        const cols = column.splitIntoColumns;
        const rows = column.splitIntoRows;
        
        if (cols && rows) {
            return '2 columns + 2 rows';
        } else if (cols) {
            return '2 columns';
        } else if (rows) {
            return '2 rows';
        } else {
            return 'Not configured';
        }
    }

    getRowModeOptions(column, rowNumber, amountRowType = null) {
        const isAmountField = column.dataField === 'amount';
        let currentMode;
        
        if (amountRowType) {
            // Credit or Debit row
            currentMode = column[`${amountRowType}${rowNumber.charAt(0).toUpperCase() + rowNumber.slice(1)}Mode`];
        } else {
            currentMode = column[`${rowNumber}Mode`];
        }
        
        if (isAmountField) {
            return `
                <option value="amount" ${currentMode === 'amount' ? 'selected' : ''}>Amount</option>
                <option value="blank" ${currentMode === 'blank' ? 'selected' : ''}>Blank</option>
            `;
        } else {
            return `
                <option value="same" ${currentMode === 'same' ? 'selected' : ''}>Same Value</option>
                <option value="blank" ${currentMode === 'blank' ? 'selected' : ''}>Blank</option>
                <option value="constant" ${currentMode === 'constant' ? 'selected' : ''}>Constant Value</option>
            `;
        }
    }

    shouldShowConstantInput(column, rowNumber, amountRowType = null) {
        if (amountRowType) {
            const mode = column[`${amountRowType}${rowNumber.charAt(0).toUpperCase() + rowNumber.slice(1)}Mode`];
            return mode === 'constant';
        } else {
            return column[`${rowNumber}Mode`] === 'constant';
        }
    }

    getRowValue(column, rowNumber, amountRowType = null) {
        if (amountRowType) {
            return column[`${amountRowType}${rowNumber.charAt(0).toUpperCase() + rowNumber.slice(1)}Value`] || '';
        } else {
            return column[`${rowNumber}Value`] || '';
        }
    }

    shouldDisableFormatButton(column, amountRowType = null) {
        // Enable for Date fields
        if (column.dataField === 'date') {
            return false;
        }
        // Enable for Amount field (including Credit/Debit rows when split)
        if (column.dataField === 'amount') {
            return false;
        }
        // Disable for all other fields
        return true;
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
    }

    openBehaviorPopover(column, button) {
        const popover = document.getElementById('behaviorPopover');
        const splitIntoColumnsCheckbox = document.getElementById('splitIntoColumns');
        const splitIntoRowsCheckbox = document.getElementById('splitIntoRows');
        
        // Set checkbox states
        splitIntoColumnsCheckbox.checked = column.splitIntoColumns || false;
        splitIntoRowsCheckbox.checked = column.splitIntoRows || false;
        
        // Position popover next to button
        const buttonRect = button.getBoundingClientRect();
        popover.style.display = 'block';
        popover.style.top = (buttonRect.bottom + 8) + 'px';
        popover.style.left = (buttonRect.left) + 'px';
        
        // Store current column for reference
        this.currentBehaviorColumn = column;
        
        // Remove existing listeners
        const newSplitIntoColumnsCheckbox = splitIntoColumnsCheckbox.cloneNode(true);
        splitIntoColumnsCheckbox.parentNode.replaceChild(newSplitIntoColumnsCheckbox, splitIntoColumnsCheckbox);
        
        const newSplitIntoRowsCheckbox = splitIntoRowsCheckbox.cloneNode(true);
        splitIntoRowsCheckbox.parentNode.replaceChild(newSplitIntoRowsCheckbox, splitIntoRowsCheckbox);
        
        // Add new listeners
        document.getElementById('splitIntoColumns').addEventListener('change', (e) => {
            column.splitIntoColumns = e.target.checked;
            this.onConfigurationChange();
            // Update button text
            this.renderConfigurationTable();
        });
        
        document.getElementById('splitIntoRows').addEventListener('change', (e) => {
            column.splitIntoRows = e.target.checked;
            this.onConfigurationChange();
            // Update button text
            this.renderConfigurationTable();
        });
        
        // Close popover when clicking outside
        const closePopover = (e) => {
            if (!popover.contains(e.target) && e.target !== button) {
                popover.style.display = 'none';
                document.removeEventListener('click', closePopover);
            }
        };
        
        // Add listener on next tick to avoid immediate closure
        setTimeout(() => {
            document.addEventListener('click', closePopover);
        }, 0);
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
            this.updateSampleValue(column.id);
            closeModal();
        };
        
        // Remove old listeners and add new ones
        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
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
            const splitHeader = document.getElementById('colSplitHeader');
            if (splitHeader) {
                splitHeader.style.display = this.configuration.twoRowLogicEnabled ? 'table-cell' : 'none';
            }
            
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
    new CSVCustomizerV2();
});
