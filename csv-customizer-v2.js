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
        this.updateRowsColumnVisibility();
        
        // Check if configuration exists to show landing or config screen
        const hasConfig = localStorage.getItem('csvConfiguration') !== null;
        if (hasConfig) {
            this.showLandingWithConfig();
        } else {
            this.showLandingEmpty();
        }
    }

    setupEventListeners() {
        // Landing page buttons
        const createConfigBtn = document.getElementById('createConfigBtn');
        if (createConfigBtn) {
            createConfigBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showStep(1);
            });
        }

        const uploadSampleCsvBtn = document.getElementById('uploadSampleCsvBtn');
        if (uploadSampleCsvBtn) {
            uploadSampleCsvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openUploadSampleCsvModal();
            });
        }
        this.setupUploadSampleCsvModalListeners();

        const editConfigBtn = document.getElementById('editConfigBtn');
        if (editConfigBtn) {
            editConfigBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showStep(1);
            });
        }

        // Config screen back button
        const configBackBtn = document.getElementById('configBackBtn');
        if (configBackBtn) {
            configBackBtn.addEventListener('click', () => {
                const hasConfig = localStorage.getItem('csvConfiguration') !== null;
                if (hasConfig) {
                    this.showLandingWithConfig();
                } else {
                    this.showLandingEmpty();
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
                this.updateRowsColumnVisibility();
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
            // Migrate old _constant data fields and isConstant to dataField 'constant'
            this.configuration.columns.forEach(col => {
                if (col.dataField === 'code_journal_constant') {
                    col.dataField = 'constant';
                    col.constantValue = col.constantValue || 'BQ_PLIANT';
                } else if (col.dataField === 'account_number_constant') {
                    col.dataField = 'constant';
                    col.constantValue = col.constantValue || '';
                } else if (col.dataField === 'cost_center_constant') {
                    col.dataField = 'constant';
                    col.constantValue = col.constantValue || '';
                } else if (col.isConstant) {
                    col.dataField = 'constant';
                }
            });
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
                header: 'Date',
                dataField: 'transaction_date',
                formatting: 'date',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: '',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col2',
                order: 1,
                header: 'Code Journal',
                dataField: 'constant',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: 'BQ_PLIANT',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col3',
                order: 2,
                header: 'Piece',
                dataField: 'piece',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: '',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col4',
                order: 3,
                header: 'REF',
                dataField: 'ref',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: '',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col5',
                order: 4,
                header: 'Numero de Compte',
                dataField: 'account_number',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: '',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col6',
                order: 5,
                header: 'Libelle',
                dataField: 'comment',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: '',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col7',
                order: 6,
                header: 'Debit',
                dataField: 'debit',
                formatting: 'number',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: true,
                isConstant: false,
                constantValue: '',
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
                debitRow1Mode: 'amount',
                debitRow1Value: '',
                debitRow2Mode: 'blank',
                debitRow2Value: '',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col8',
                order: 7,
                header: 'Credit',
                dataField: 'credit',
                formatting: 'number',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: true,
                isConstant: false,
                constantValue: '',
                splitIntoColumns: false,
                splitIntoRows: false,
                row1Mode: 'blank',
                row1Value: '',
                row2Mode: 'amount',
                row2Value: '',
                creditRow1Mode: 'blank',
                creditRow1Value: '',
                creditRow2Mode: 'amount',
                creditRow2Value: '',
                debitRow1Mode: 'blank',
                debitRow1Value: '',
                debitRow2Mode: 'amount',
                debitRow2Value: '',
                amountSign: 'as-is',
                decimalSeparator: 'dot',
                thousandSeparator: 'comma',
                showCurrency: false,
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
            {
                id: 'col9',
                order: 8,
                header: 'Code Section',
                dataField: 'cost_center',
                formatting: 'text',
                visible: true,
                splitEnabled: false,
                debitValue: '',
                creditValue: '',
                isAmountField: false,
                isConstant: false,
                constantValue: '',
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
                currencySymbol: 'EUR',
                caseFormat: 'original',
                maxLength: null
            },
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
                tbody.appendChild(this.createRowConfigDetailRow(column, 'credit'));
                tbody.appendChild(debitRow);
                tbody.appendChild(this.createRowConfigDetailRow(column, 'debit'));
            } else {
                const row = this.createConfigRow(column, index);
                tbody.appendChild(row);
                if (this.configuration.twoRowLogicEnabled) {
                    tbody.appendChild(this.createRowConfigDetailRow(column, null));
                }
            }
        });
    }

    createRowConfigDetailRow(column, amountRowType = null) {
        const tr = document.createElement('tr');
        tr.className = 'row-config-detail-row';
        tr.dataset.columnId = column.id;
        if (amountRowType) tr.dataset.amountRowType = amountRowType;

        const row1Options = this.getRowModeOptions(column, 'row1', amountRowType);
        const row2Options = this.getRowModeOptions(column, 'row2', amountRowType);
        const showRow1Constant = this.shouldShowConstantInput(column, 'row1', amountRowType);
        const showRow2Constant = this.shouldShowConstantInput(column, 'row2', amountRowType);
        const row1Value = this.getRowValue(column, 'row1', amountRowType);
        const row2Value = this.getRowValue(column, 'row2', amountRowType);
        const row1DataAttrs = amountRowType ? `data-amount-row-type="${amountRowType}"` : '';
        const row2DataAttrs = amountRowType ? `data-amount-row-type="${amountRowType}"` : '';
        const row1Mode = amountRowType ? (column[`${amountRowType}Row1Mode`] || 'same') : (column.row1Mode || 'same');
        const row2Mode = amountRowType ? (column[`${amountRowType}Row2Mode`] || 'same') : (column.row2Mode || 'same');
        const sampleValue = String(this.getSampleValue(column)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        tr.innerHTML = `
            <td colspan="7" class="row-config-detail-cell">
                <div class="row-config-content" hidden>
                    <div class="row-config-inner">
                        <div class="row-config-group">
                            <label class="row-config-label">Row 1</label>
                            <select class="table-select row-mode-select" data-column-id="${column.id}" data-row="row1" ${row1DataAttrs}>
                                ${row1Options}
                            </select>
                            ${showRow1Constant ? `
                                <input type="text" class="table-input row-value-input" placeholder="Enter value" value="${row1Value}" data-column-id="${column.id}" data-row="row1" ${row1DataAttrs} />
                            ` : ''}
                            ${row1Mode === 'same' ? `<span class="row-config-sample-preview">${sampleValue}</span>` : ''}
                            <button type="button" class="row-config-format-btn format-btn" data-column-id="${column.id}" title="Configure formatting" ${this.shouldDisableFormatButton(column, amountRowType) ? 'disabled' : ''}>
                                <i class="ph ph-sliders-horizontal"></i>
                            </button>
                        </div>
                        <div class="row-config-group">
                            <label class="row-config-label">Row 2</label>
                            <select class="table-select row-mode-select" data-column-id="${column.id}" data-row="row2" ${row2DataAttrs}>
                                ${row2Options}
                            </select>
                            ${showRow2Constant ? `
                                <input type="text" class="table-input row-value-input" placeholder="Enter value" value="${row2Value}" data-column-id="${column.id}" data-row="row2" ${row2DataAttrs} />
                            ` : ''}
                            ${row2Mode === 'same' ? `<span class="row-config-sample-preview">${sampleValue}</span>` : ''}
                            <button type="button" class="row-config-format-btn format-btn" data-column-id="${column.id}" title="Configure formatting" ${this.shouldDisableFormatButton(column, amountRowType) ? 'disabled' : ''}>
                                <i class="ph ph-sliders-horizontal"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        `;

        const content = tr.querySelector('.row-config-content');

        const rowModeSelects = tr.querySelectorAll('.row-mode-select');
        rowModeSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.dataset.row;
                const amtRowType = e.target.dataset.amountRowType;
                if (amtRowType) {
                    const propertyName = `${amtRowType}${row.charAt(0).toUpperCase() + row.slice(1)}Mode`;
                    column[propertyName] = e.target.value;
                } else {
                    column[`${row}Mode`] = e.target.value;
                }
                this.onConfigurationChange();
                this.updateRowConfigDetailContent(column, amountRowType);
            });
        });

        const rowValueInputs = tr.querySelectorAll('.row-value-input');
        rowValueInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const row = e.target.dataset.row;
                const amtRowType = e.target.dataset.amountRowType;
                if (amtRowType) {
                    const propertyName = `${amtRowType}${row.charAt(0).toUpperCase() + row.slice(1)}Value`;
                    column[propertyName] = e.target.value;
                } else {
                    column[`${row}Value`] = e.target.value;
                }
                this.onConfigurationChange();
            });
        });

        // Row Config format buttons (Row 1 and Row 2) - same formatting as main column
        tr.querySelectorAll('.row-config-format-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openFormattingModal(column);
                });
            }
        });

        return tr;
    }

    updateRowsColumnVisibility() {
        const colRowsHeader = document.getElementById('colRowsHeader');
        if (colRowsHeader) {
            colRowsHeader.style.display = this.configuration.twoRowLogicEnabled ? 'table-cell' : 'none';
        }
    }

    updateRowConfigDetailContent(column, amountRowType = null) {
        const selector = amountRowType
            ? `tr.row-config-detail-row[data-column-id="${column.id}"][data-amount-row-type="${amountRowType}"]`
            : `tr.row-config-detail-row[data-column-id="${column.id}"]:not([data-amount-row-type])`;
        const detailTr = document.querySelector(selector);
        if (!detailTr) return;
        const content = detailTr.querySelector('.row-config-content');
        if (!content) return;

        const row1Options = this.getRowModeOptions(column, 'row1', amountRowType);
        const row2Options = this.getRowModeOptions(column, 'row2', amountRowType);
        const showRow1Constant = this.shouldShowConstantInput(column, 'row1', amountRowType);
        const showRow2Constant = this.shouldShowConstantInput(column, 'row2', amountRowType);
        const row1Value = this.getRowValue(column, 'row1', amountRowType);
        const row2Value = this.getRowValue(column, 'row2', amountRowType);
        const row1DataAttrs = amountRowType ? `data-amount-row-type="${amountRowType}"` : '';
        const row2DataAttrs = amountRowType ? `data-amount-row-type="${amountRowType}"` : '';
        const row1Mode = amountRowType ? (column[`${amountRowType}Row1Mode`] || 'same') : (column.row1Mode || 'same');
        const row2Mode = amountRowType ? (column[`${amountRowType}Row2Mode`] || 'same') : (column.row2Mode || 'same');
        const sampleValue = String(this.getSampleValue(column)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const formatBtnDisabled = this.shouldDisableFormatButton(column, amountRowType);
        content.innerHTML = `
            <div class="row-config-inner">
                <div class="row-config-group">
                    <label class="row-config-label">Row 1</label>
                    <select class="table-select row-mode-select" data-column-id="${column.id}" data-row="row1" ${row1DataAttrs}>
                        ${row1Options}
                    </select>
                    ${showRow1Constant ? `
                        <input type="text" class="table-input row-value-input" placeholder="Enter value" value="${row1Value}" data-column-id="${column.id}" data-row="row1" ${row1DataAttrs} />
                    ` : ''}
                    ${row1Mode === 'same' ? `<span class="row-config-sample-preview">${sampleValue}</span>` : ''}
                    <button type="button" class="row-config-format-btn format-btn" data-column-id="${column.id}" title="Configure formatting" ${formatBtnDisabled ? 'disabled' : ''}>
                        <i class="ph ph-sliders-horizontal"></i>
                    </button>
                </div>
                <div class="row-config-group">
                    <label class="row-config-label">Row 2</label>
                    <select class="table-select row-mode-select" data-column-id="${column.id}" data-row="row2" ${row2DataAttrs}>
                        ${row2Options}
                    </select>
                    ${showRow2Constant ? `
                        <input type="text" class="table-input row-value-input" placeholder="Enter value" value="${row2Value}" data-column-id="${column.id}" data-row="row2" ${row2DataAttrs} />
                    ` : ''}
                    ${row2Mode === 'same' ? `<span class="row-config-sample-preview">${sampleValue}</span>` : ''}
                    <button type="button" class="row-config-format-btn format-btn" data-column-id="${column.id}" title="Configure formatting" ${formatBtnDisabled ? 'disabled' : ''}>
                        <i class="ph ph-sliders-horizontal"></i>
                    </button>
                </div>
            </div>
        `;

        content.querySelectorAll('.row-config-format-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openFormattingModal(column);
                });
            }
        });

        const rowModeSelects = content.querySelectorAll('.row-mode-select');
        rowModeSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.dataset.row;
                const amtRowType = e.target.dataset.amountRowType;
                if (amtRowType) {
                    const propertyName = `${amtRowType}${row.charAt(0).toUpperCase() + row.slice(1)}Mode`;
                    column[propertyName] = e.target.value;
                } else {
                    column[`${row}Mode`] = e.target.value;
                }
                this.onConfigurationChange();
                this.updateRowConfigDetailContent(column, amountRowType);
            });
        });
        const rowValueInputs = content.querySelectorAll('.row-value-input');
        rowValueInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const row = e.target.dataset.row;
                const amtRowType = e.target.dataset.amountRowType;
                if (amtRowType) {
                    const propertyName = `${amtRowType}${row.charAt(0).toUpperCase() + row.slice(1)}Value`;
                    column[propertyName] = e.target.value;
                } else {
                    column[`${row}Value`] = e.target.value;
                }
                this.onConfigurationChange();
            });
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
                <div class="sample-value-cell">
                    ${column.dataField === 'constant' ? `
                        <input 
                            type="text" 
                            class="table-input constant-value-input" 
                            placeholder="Enter constant value"
                            value="${column.constantValue || ''}"
                            data-column-id="${column.id}"
                        />
                    ` : `
                        <span class="sample-value">${this.getSampleValue(column)}</span>
                    `}
                </div>
            </td>
            <td class="col-format">
                <button class="format-btn" data-column-id="${column.id}" title="Configure formatting" ${this.shouldDisableFormatButton(column, amountRowType) ? 'disabled' : ''}>
                    <i class="ph ph-sliders-horizontal"></i>
                </button>
            </td>
            ${this.configuration.twoRowLogicEnabled ? `
            <td class="col-rows">
                <button type="button" class="rows-accordion-btn" title="Expand row configuration" aria-expanded="false">
                    <i class="ph ph-caret-down rows-accordion-chevron"></i>
                </button>
            </td>
            ` : ''}
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
            column.isAmountField = e.target.value === 'amount' || e.target.value === 'debit' || e.target.value === 'credit';
            this.onConfigurationChange();
            this.updateSampleValue(column.id);
            this.renderConfigurationTable();
        });

        // Constant value input
        const constantInput = tr.querySelector('.constant-value-input');
        if (constantInput) {
            constantInput.addEventListener('change', (e) => {
                column.constantValue = e.target.value;
                this.onConfigurationChange();
            });
        }

        const formatBtn = tr.querySelector('.format-btn');
        if (formatBtn && !formatBtn.disabled) {
            formatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openFormattingModal(column);
            });
        }

        // ROWS accordion button (toggle detail row)
        const rowsAccordionBtn = tr.querySelector('.rows-accordion-btn');
        if (rowsAccordionBtn) {
            rowsAccordionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const detailTr = tr.nextElementSibling;
                if (!detailTr || !detailTr.classList.contains('row-config-detail-row')) return;
                const content = detailTr.querySelector('.row-config-content');
                const expanded = content.hidden;
                content.hidden = !expanded;
                rowsAccordionBtn.setAttribute('aria-expanded', expanded);
                const mainChevron = rowsAccordionBtn.querySelector('.rows-accordion-chevron');
                if (mainChevron) {
                    mainChevron.classList.toggle('rows-accordion-chevron-expanded', expanded);
                    mainChevron.className = expanded ? 'ph ph-caret-up rows-accordion-chevron rows-accordion-chevron-expanded' : 'ph ph-caret-down rows-accordion-chevron';
                }
            });
        }

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
        const categories = [
            {
                label: 'Date',
                fields: [
                    { value: 'transaction_date', label: 'Transaction Date' },
                    { value: 'booking_date', label: 'Booking Date' },
                    { value: 'receipt_date', label: 'Receipt Date' }
                ]
            },
            {
                label: 'Transaction',
                fields: [
                    { value: 'comment', label: 'LIBELLE (Comment)' },
                    { value: 'amount', label: 'Amount' },
                    { value: 'debit', label: 'Debit' },
                    { value: 'credit', label: 'Credit' }
                ]
            },
            {
                label: 'Metadata',
                fields: [
                    { value: 'code_journal', label: 'Code Journal' }
                ]
            },
            {
                label: 'Accounting',
                fields: [
                    { value: 'account_number', label: 'Account Number' },
                    { value: 'cost_center', label: 'Code Section (Cost Center)' }
                ]
            },
            {
                label: 'Receipt',
                fields: [
                    { value: 'piece', label: 'Piece (Receipt Number)' },
                    { value: 'ref', label: 'REF (Receipt Number)' }
                ]
            },
            {
                label: 'FX & Currency',
                fields: []
            },
            {
                label: 'Other',
                fields: [
                    { value: 'constant', label: 'Constant' }
                ]
            }
        ];

        return categories.map(cat => {
            const options = cat.fields.map(field =>
                `<option value="${field.value}" ${field.value === selectedValue ? 'selected' : ''}>${field.label}</option>`
            ).join('');
            const placeholder = cat.fields.length === 0 ? '<option disabled>—</option>' : '';
            return `<optgroup label="${cat.label}">${options}${placeholder}</optgroup>`;
        }).join('');
    }

    getSampleValue(column) {
        // If constant field, show constant value
        if (column.dataField === 'constant') {
            return column.constantValue || '—';
        }
        // Account Number: show supplier_account_number as default sample
        if (column.dataField === 'account_number') {
            const sample = this.sampleData[0];
            return sample.supplier_account_number || sample.card_account_number || '—';
        }

        const sample = this.sampleData[0];
        let value = sample[column.dataField] || '';

        // Handle date fields
        if ((column.dataField === 'transaction_date' || column.dataField === 'booking_date' || column.dataField === 'receipt_date') && value) {
            if (column.dateFormat) {
                value = this.formatDateValue(value, column.dateFormat);
            } else {
                value = new Date(value).toLocaleDateString('en-US');
            }
        } 
        // Handle amount fields (debit/credit)
        else if ((column.dataField === 'amount' || column.dataField === 'debit' || column.dataField === 'credit') && value) {
            value = this.formatAmountValue(value, column);
        }
        // Handle comment field with case formatting
        else if (column.dataField === 'comment' && value) {
            value = this.formatTextValue(value, column);
        }

        return value || '—';
    }

    formatDateValue(dateValue, format) {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return dateValue;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    formatAmountValue(amount, column) {
        let value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        
        // Apply sign
        if (column.amountSign === 'plus' && value < 0) value = Math.abs(value);
        if (column.amountSign === 'minus' && value > 0) value = -Math.abs(value);
        if (column.amountSign === 'absolute') value = Math.abs(value);

        // Format number
        const parts = value.toFixed(2).split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1];

        // Apply thousand separator
        if (column.thousandSeparator === 'comma') {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else if (column.thousandSeparator === 'period') {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        } else if (column.thousandSeparator === 'space') {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        // Apply decimal separator
        const decimalSep = column.decimalSeparator === 'comma' ? ',' : '.';
        let formatted = integerPart + decimalSep + decimalPart;

        // Apply currency
        if (column.showCurrency) {
            formatted = column.currencySymbol + ' ' + formatted;
        }

        return formatted;
    }

    formatTextValue(text, column) {
        let value = String(text);
        
        // Apply case formatting
        if (column.caseFormat === 'upper') {
            value = value.toUpperCase();
        } else if (column.caseFormat === 'lower') {
            value = value.toLowerCase();
        }

        // Apply max length
        if (column.maxLength && value.length > column.maxLength) {
            value = value.substring(0, column.maxLength);
        }

        return value;
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
        const isAccountNumberField = column.dataField === 'account_number';
        let currentMode;
        
        if (amountRowType) {
            currentMode = column[`${amountRowType}${rowNumber.charAt(0).toUpperCase() + rowNumber.slice(1)}Mode`];
        } else {
            currentMode = column[`${rowNumber}Mode`];
        }
        
        if (isAmountField) {
            return `
                <option value="amount" ${currentMode === 'amount' ? 'selected' : ''}>Amount</option>
                <option value="blank" ${currentMode === 'blank' ? 'selected' : ''}>Blank</option>
            `;
        } else if (isAccountNumberField) {
            return `
                <option value="same" ${currentMode === 'same' ? 'selected' : ''}>Same Value</option>
                <option value="blank" ${currentMode === 'blank' ? 'selected' : ''}>Blank</option>
                <option value="constant" ${currentMode === 'constant' ? 'selected' : ''}>Constant Value</option>
                <option value="card_account_number" ${currentMode === 'card_account_number' ? 'selected' : ''}>Card Account Number</option>
                <option value="supplier_account_number" ${currentMode === 'supplier_account_number' ? 'selected' : ''}>Supplier Account</option>
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
        if (column.dataField === 'transaction_date' || column.dataField === 'booking_date' || column.dataField === 'receipt_date') {
            return false;
        }
        // Enable for Amount fields (Amount, Debit, Credit)
        if (column.dataField === 'amount' || column.dataField === 'debit' || column.dataField === 'credit') {
            return false;
        }
        // Enable for LIBELLE (Comment) - has case and max length options
        if (column.dataField === 'comment') {
            return false;
        }
        // Enable for receipt/optional fields - missing value behaviour (Code Journal, Piece, Ref, Account Number, Code Section)
        const receiptOptionalFields = ['code_journal', 'piece', 'ref', 'account_number', 'cost_center'];
        if (receiptOptionalFields.includes(column.dataField)) {
            return false;
        }
        // Disable for constant (no formatting)
        if (column.dataField === 'constant') {
            return true;
        }
        return true;
    }

    addColumn() {
        const newColumn = {
            id: 'col' + Date.now(),
            order: this.configuration.columns.length,
            header: 'New Column',
            dataField: 'transaction_date',
            formatting: 'text',
            visible: true,
            splitEnabled: false,
            debitValue: '',
            creditValue: '',
            isAmountField: false,
            isConstant: false,
            constantValue: '',
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
            currencySymbol: 'EUR',
            caseFormat: 'original',
            maxLength: null
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
        const libelleOptions = document.getElementById('libelleFormattingOptions');
        const missingValueOptions = document.getElementById('missingValueFormattingOptions');
        
        // Store current column
        this.currentFormattingColumn = column;
        
        // Hide all options first
        dateOptions.style.display = 'none';
        amountOptions.style.display = 'none';
        libelleOptions.style.display = 'none';
        if (missingValueOptions) missingValueOptions.style.display = 'none';
        
        // Show appropriate options based on field type
        const isDateField = column.dataField === 'transaction_date' || column.dataField === 'booking_date' || column.dataField === 'receipt_date';
        const isAmountField = column.dataField === 'amount' || column.dataField === 'debit' || column.dataField === 'credit';
        const isLibelleField = column.dataField === 'comment';
        const receiptOptionalFields = ['code_journal', 'piece', 'ref', 'account_number', 'cost_center'];
        const isMissingValueField = receiptOptionalFields.includes(column.dataField);
        
        if (isDateField) {
            modalTitle.textContent = 'Configure Date Formatting';
            dateOptions.style.display = 'block';
            
            // Set current date format
            const dateFormatRadios = modalOverlay.querySelectorAll('input[name="dateFormat"]');
            dateFormatRadios.forEach(radio => {
                radio.checked = radio.value === (column.dateFormat || 'YYYY-MM-DD');
            });
        } else if (isAmountField) {
            modalTitle.textContent = 'Configure Amount Formatting';
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
        } else if (isLibelleField) {
            modalTitle.textContent = 'Configure LIBELLE Formatting';
            libelleOptions.style.display = 'block';
            
            // Set current case format
            const caseRadios = modalOverlay.querySelectorAll('input[name="caseFormat"]');
            caseRadios.forEach(radio => {
                radio.checked = radio.value === (column.caseFormat || 'original');
            });
            
            // Set max length
            const enableMaxLength = document.getElementById('enableMaxLength');
            const maxLengthField = document.getElementById('maxLengthField');
            const maxLengthInput = document.getElementById('maxLengthInput');
            
            enableMaxLength.checked = column.maxLength !== null && column.maxLength !== undefined;
            maxLengthField.style.display = enableMaxLength.checked ? 'block' : 'none';
            maxLengthInput.value = column.maxLength || '';
            
            // Toggle max length field visibility
            enableMaxLength.onchange = (e) => {
                maxLengthField.style.display = e.target.checked ? 'block' : 'none';
                if (!e.target.checked) {
                    maxLengthInput.value = '';
                }
            };
        } else if (isMissingValueField && missingValueOptions) {
            modalTitle.textContent = 'Configure Formatting';
            missingValueOptions.style.display = 'block';
            const leaveBlankCheckbox = document.getElementById('missingValueLeaveBlank');
            if (leaveBlankCheckbox) {
                leaveBlankCheckbox.checked = (column.missingValueBehaviour || 'leave-blank') === 'leave-blank';
            }
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
            const isDateField = column.dataField === 'transaction_date' || column.dataField === 'booking_date' || column.dataField === 'receipt_date';
            const isAmountField = column.dataField === 'amount' || column.dataField === 'debit' || column.dataField === 'credit';
            const isLibelleField = column.dataField === 'comment';
            const receiptOptionalFields = ['code_journal', 'piece', 'ref', 'account_number', 'cost_center'];
            const isMissingValueField = receiptOptionalFields.includes(column.dataField);
            
            if (isDateField) {
                const selectedDateFormat = modalOverlay.querySelector('input[name="dateFormat"]:checked');
                if (selectedDateFormat) {
                    column.dateFormat = selectedDateFormat.value;
                }
            } else if (isAmountField) {
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
            } else if (isLibelleField) {
                const selectedCase = modalOverlay.querySelector('input[name="caseFormat"]:checked');
                const enableMaxLength = document.getElementById('enableMaxLength');
                const maxLengthInput = document.getElementById('maxLengthInput');
                
                if (selectedCase) column.caseFormat = selectedCase.value;
                if (enableMaxLength.checked && maxLengthInput.value) {
                    column.maxLength = parseInt(maxLengthInput.value);
                } else {
                    column.maxLength = null;
                }
            } else if (isMissingValueField) {
                const leaveBlankCheckbox = document.getElementById('missingValueLeaveBlank');
                column.missingValueBehaviour = leaveBlankCheckbox && leaveBlankCheckbox.checked ? 'leave-blank' : null;
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
        const steps = document.querySelectorAll('.step-container');
        steps.forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });
        const targetStep = document.getElementById(`step${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
            targetStep.style.display = 'block';
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
        const dateColumns = this.configuration.columns.filter(c => 
            c.dataField === 'transaction_date' || c.dataField === 'booking_date' || c.dataField === 'receipt_date'
        ).length;
        const amountColumns = this.configuration.columns.filter(c => 
            c.dataField === 'amount' || c.dataField === 'debit' || c.dataField === 'credit'
        ).length;
        
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

    /** Mock: build column config from extracted CSV headers (headers only, no real file). */
    createColumnsFromHeaders(headers) {
        const baseColumn = (order) => ({
            id: 'col' + Date.now() + '_' + order + '_' + Math.random().toString(36).slice(2, 9),
            order: 0,
            header: 'New Column',
            dataField: 'transaction_date',
            formatting: 'text',
            visible: true,
            splitEnabled: false,
            debitValue: '',
            creditValue: '',
            isAmountField: false,
            isConstant: false,
            constantValue: '',
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
            currencySymbol: 'EUR',
            caseFormat: 'original',
            maxLength: null
        });
        return headers.map((header, index) => {
            const col = baseColumn(index);
            col.order = index;
            col.header = header;
            return col;
        });
    }

    openUploadSampleCsvModal() {
        const modal = document.getElementById('uploadSampleCsvModal');
        if (!modal) return;
        this.resetUploadSampleCsvModal();
        modal.style.display = 'flex';
    }

    closeUploadSampleCsvModal() {
        const modal = document.getElementById('uploadSampleCsvModal');
        if (modal) modal.style.display = 'none';
    }

    resetUploadSampleCsvModal() {
        document.getElementById('uploadCsvDropZone').style.display = 'block';
        const fileArea = document.getElementById('uploadCsvFileArea');
        fileArea.style.display = 'none';
        document.getElementById('uploadCsvProgressWrap').style.display = 'none';
        document.getElementById('uploadCsvFileSize').style.display = 'none';
        document.getElementById('uploadCsvProgressFill').style.width = '0%';
        document.getElementById('uploadCsvProgressPct').textContent = '0%';
        document.getElementById('uploadCsvExtractBtn').disabled = true;
    }

    setupUploadSampleCsvModalListeners() {
        const modal = document.getElementById('uploadSampleCsvModal');
        const closeBtn = document.getElementById('closeUploadSampleCsvModal');
        const cancelBtn = document.getElementById('uploadCsvCancelBtn');
        const dropZone = document.getElementById('uploadCsvDropZone');
        const selectFileBtn = document.getElementById('uploadCsvSelectFile');
        const extractBtn = document.getElementById('uploadCsvExtractBtn');

        const closeModal = () => this.closeUploadSampleCsvModal();

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        }

        const startMockUpload = () => {
            dropZone.style.display = 'none';
            const fileArea = document.getElementById('uploadCsvFileArea');
            const progressWrap = document.getElementById('uploadCsvProgressWrap');
            const progressFill = document.getElementById('uploadCsvProgressFill');
            const progressPct = document.getElementById('uploadCsvProgressPct');
            const fileName = document.getElementById('uploadCsvFileName');
            const fileSize = document.getElementById('uploadCsvFileSize');
            const extractBtnEl = document.getElementById('uploadCsvExtractBtn');

            fileName.textContent = 'sample.csv';
            fileArea.style.display = 'block';
            progressWrap.style.display = 'block';
            fileSize.style.display = 'none';
            extractBtnEl.disabled = true;

            let pct = 0;
            const interval = setInterval(() => {
                pct += 4;
                if (pct >= 100) {
                    pct = 100;
                    clearInterval(interval);
                    progressWrap.style.display = 'none';
                    fileSize.style.display = 'block';
                    fileSize.textContent = '1.14 MB';
                    extractBtnEl.disabled = false;
                    return;
                }
                progressFill.style.width = pct + '%';
                progressPct.textContent = pct + '%';
            }, 60);
        };

        if (dropZone) dropZone.addEventListener('click', (e) => { e.preventDefault(); startMockUpload(); });
        if (selectFileBtn) selectFileBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); startMockUpload(); });
        if (extractBtn) {
            extractBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const mockHeaders = ['Date', 'Account', 'Description', 'Debit', 'Credit'];
                this.configuration.columns = this.createColumnsFromHeaders(mockHeaders);
                this.savedConfiguration = JSON.parse(JSON.stringify(this.configuration));
                this.renderConfigurationTable();
                this.updateLastUpdatedDisplay();
                this.updateSaveButtonState();
                this.updateRowsColumnVisibility();
                this.closeUploadSampleCsvModal();
                this.showStep(1);
            });
        }
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
                // Generate two rows per transaction (Row 1 and Row 2)
                const row1 = {};
                const row2 = {};
                
                visibleColumns.forEach(column => {
                    // Get value based on Row 1 configuration
                    const row1Value = this.getValueForRow(transaction, column, 'row1');
                    row1[column.header] = row1Value;
                    
                    // Get value based on Row 2 configuration
                    const row2Value = this.getValueForRow(transaction, column, 'row2');
                    row2[column.header] = row2Value;
                });
                
                previewData.push(row1);
                previewData.push(row2);
            } else {
                // Single row per transaction
                const row = {};
                visibleColumns.forEach(column => {
                    row[column.header] = this.getFormattedValue(transaction, column);
                });
                previewData.push(row);
            }
        });

        // Render table
        this.renderPreviewTable(visibleColumns, previewData);
        
        // Render CSV
        this.renderCSVPreview(visibleColumns, previewData);
    }

    getValueForRow(transaction, column, rowNumber) {
        const mode = column[`${rowNumber}Mode`];
        
        // Handle constant fields (main column dataField is constant)
        if (column.dataField === 'constant') {
            return column.constantValue || '';
        }
        
        // Handle Row 1/Row 2 modes
        if (mode === 'blank') {
            return '';
        } else if (mode === 'same') {
            return this.getFormattedValue(transaction, column);
        } else if (mode === 'constant') {
            return column[`${rowNumber}Value`] || '';
        } else if (mode === 'amount') {
            const amount = transaction[column.dataField] || 0;
            return this.formatAmountValue(amount, column);
        } else if (mode === 'card_account_number') {
            return String(transaction.card_account_number || '');
        } else if (mode === 'supplier_account_number') {
            return String(transaction.supplier_account_number || '');
        }
        
        return this.getFormattedValue(transaction, column);
    }

    getFormattedValue(transaction, column) {
        // Handle constant fields
        if (column.dataField === 'constant') {
            return column.constantValue || '';
        }
        // Account Number: use supplier_account_number as default
        if (column.dataField === 'account_number') {
            const value = transaction.supplier_account_number || transaction.card_account_number || '';
            return String(value);
        }
        
        // Get raw value from transaction
        let value = transaction[column.dataField];
        
        // Handle missing values
        if (value === undefined || value === null || value === '') {
            return '';
        }
        
        // Apply formatting based on field type
        const isDateField = column.dataField === 'transaction_date' || column.dataField === 'booking_date' || column.dataField === 'receipt_date';
        const isAmountField = column.dataField === 'amount' || column.dataField === 'debit' || column.dataField === 'credit';
        const isLibelleField = column.dataField === 'comment';
        
        if (isDateField) {
            return this.formatDateValue(value, column.dateFormat || 'YYYY-MM-DD');
        } else if (isAmountField) {
            return this.formatAmountValue(value, column);
        } else if (isLibelleField) {
            return this.formatTextValue(value, column);
        }
        
        return String(value);
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
                transaction_date: '2025-07-01',
                booking_date: '2025-07-01',
                receipt_date: '2025-07-01',
                piece: '56001',
                ref: '56001',
                supplier_account_number: '401AMAZON',
                card_account_number: '512',
                comment: 'AMAZON Invoice 56001',
                amount: 100.00,
                debit: 100.00,
                credit: 0.00,
                cost_center: '2506-MUSIDANUBE'
            },
            {
                transaction_date: '2025-07-02',
                booking_date: '2025-07-02',
                receipt_date: '2025-07-02',
                piece: '56002',
                ref: '56002',
                supplier_account_number: '401OFFICE',
                card_account_number: '512',
                comment: 'Office Supplies Order 56002',
                amount: 45.00,
                debit: 45.00,
                credit: 0.00,
                cost_center: '2506-MUSIDANUBE'
            },
            {
                transaction_date: '2025-07-03',
                booking_date: '2025-07-03',
                receipt_date: '2025-07-03',
                piece: '56003',
                ref: '56003',
                supplier_account_number: '401CLOUD',
                card_account_number: '512',
                comment: 'Cloud Services Subscription 56003',
                amount: 299.99,
                debit: 299.99,
                credit: 0.00,
                cost_center: '2506-MUSIDANUBE'
            },
            {
                transaction_date: '2025-07-04',
                booking_date: '2025-07-04',
                receipt_date: '2025-07-04',
                piece: '56004',
                ref: '56004',
                supplier_account_number: '401TRAVEL',
                card_account_number: '512',
                comment: 'Business Trip Booking 56004',
                amount: 850.00,
                debit: 850.00,
                credit: 0.00,
                cost_center: '2506-MUSIDANUBE'
            },
            {
                transaction_date: '2025-07-05',
                booking_date: '2025-07-05',
                receipt_date: '2025-07-05',
                piece: '56005',
                ref: '56005',
                supplier_account_number: '401RESTAURANT',
                card_account_number: '512',
                comment: 'Team Lunch 56005',
                amount: 67.50,
                debit: 67.50,
                credit: 0.00,
                cost_center: '2506-MUSIDANUBE'
            }
        ];
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CSVCustomizerV2();
});
