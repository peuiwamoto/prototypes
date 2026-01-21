// CSV Customizer Application V3 - Guided Editor with Config Drawer
class CSVCustomizerV3 {
    constructor() {
        this.currentStep = 'step0';
        this.selectedColumnId = null;
        this.configuration = {
            id: 'customer_config',
            columns: [],
            twoRowLogicEnabled: false, // Global toggle for 2-row logic
            lastUpdatedBy: null,
            lastUpdatedAt: null,
            createdAt: null
        };
        this.sampleData = this.generateSampleData();
        this.init();
        this.loadConfiguration();
        this.renderLandingPage();
    }

    init() {
        this.setupEventListeners();
        this.loadConfiguration();
    }

    setupEventListeners() {
        // Step 0: Landing page
        document.getElementById('editConfigBtn').addEventListener('click', () => {
            this.showStep('step1');
        });
        document.getElementById('previewConfigBtn').addEventListener('click', () => {
            this.previewConfiguration();
        });

        // Step 1: Configuration
        document.getElementById('backToLandingBtn').addEventListener('click', () => {
            this.showStep('step0');
            this.renderLandingPage();
        });
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreview();
        });
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveConfiguration();
        });
        document.getElementById('addRowBtn').addEventListener('click', () => {
            this.addColumn();
        });

        // Global two-row toggle - make toggle switch clickable
        const globalToggle = document.getElementById('globalTwoRowToggle');
        const globalToggleSwitch = document.getElementById('globalToggleSwitch');
        
        if (globalToggleSwitch) {
            globalToggleSwitch.addEventListener('click', () => {
                globalToggle.checked = !globalToggle.checked;
                globalToggle.dispatchEvent(new Event('change'));
            });
        }
        
        globalToggle.addEventListener('change', (e) => {
            this.configuration.twoRowLogicEnabled = e.target.checked;
            if (globalToggleSwitch) {
                globalToggleSwitch.classList.toggle('active', e.target.checked);
            }
            this.updateTableForTwoRowLogic();
            this.showWarningBanner();
            
            // If drawer is open, refresh it to show/hide split behavior section
            if (this.selectedColumnId) {
                const column = this.configuration.columns.find(c => c.id === this.selectedColumnId);
                if (column) {
                    this.openDrawer(column);
                }
            }
        });

        // Show warning when any configuration changes
        this.setupChangeTracking();

        // Drawer
        document.getElementById('closeDrawerBtn').addEventListener('click', () => {
            this.closeDrawer();
        });

        // Step 3: Preview
        document.getElementById('backToConfigBtn').addEventListener('click', () => {
            this.showStep('step1');
        });
        document.getElementById('copyCsvBtn').addEventListener('click', () => {
            this.copyCSV();
        });
        document.getElementById('downloadCsvBtn').addEventListener('click', () => {
            this.downloadCSV();
        });

        // Preview Modal
        document.getElementById('closePreviewModal').addEventListener('click', () => {
            this.closePreviewModal();
        });
        document.getElementById('closePreviewModalBtn').addEventListener('click', () => {
            this.closePreviewModal();
        });
        document.getElementById('copyCsvModalBtn').addEventListener('click', () => {
            this.copyCSVFromModal();
        });
        document.getElementById('downloadCsvModalBtn').addEventListener('click', () => {
            this.downloadCSVFromModal();
        });
    }

    loadDefaultColumns() {
        // Load default columns if none exist (pre-filled default configuration)
        if (this.configuration.columns.length === 0) {
            this.configuration.columns = [
                {
                    id: 'col1',
                    order: 0,
                    header: 'Transaction ID',
                    dataField: 'transaction_id',
                    formatting: 'text',
                    visible: true,
                    splitBehavior: 'same' // 'same', 'debit', 'credit'
                },
                {
                    id: 'col2',
                    order: 1,
                    header: 'Date',
                    dataField: 'date',
                    formatting: 'date',
                    visible: true,
                    splitBehavior: 'same'
                },
                {
                    id: 'col3',
                    order: 2,
                    header: 'Merchant',
                    dataField: 'merchant',
                    formatting: 'text',
                    visible: true,
                    splitBehavior: 'same'
                },
                {
                    id: 'col4',
                    order: 3,
                    header: 'Amount',
                    dataField: 'amount',
                    formatting: 'number',
                    visible: true,
                    splitBehavior: 'same'
                },
                {
                    id: 'col5',
                    order: 4,
                    header: 'Notes',
                    dataField: 'notes',
                    formatting: 'text',
                    visible: true,
                    splitBehavior: 'same'
                }
            ];
        }
        
        // Ensure all columns have splitBehavior
        this.configuration.columns.forEach(col => {
            if (!col.splitBehavior) {
                col.splitBehavior = 'same';
            }
        });
        
        this.renderConfigurationTable();
    }

    showStep(step) {
        document.querySelectorAll('.step-container').forEach(container => {
            container.style.display = 'none';
        });
        
        const stepElement = document.getElementById(step);
        if (stepElement) {
            stepElement.style.display = 'block';
        }
        this.currentStep = step;
        
        if (step === 'step0') {
            this.renderLandingPage();
        } else if (step === 'step1') {
            // Don't close drawer when showing step1, just ensure it's hidden initially
            const drawer = document.getElementById('configDrawer');
            const configLayout = document.querySelector('.config-layout');
            if (drawer && !drawer.classList.contains('open')) {
                drawer.classList.remove('open');
                if (configLayout) {
                    configLayout.classList.remove('drawer-open');
                }
            }
            // Update global toggle state
            const globalToggle = document.getElementById('globalTwoRowToggle');
            const globalToggleSwitch = document.getElementById('globalToggleSwitch');
            if (globalToggle) {
                globalToggle.checked = this.configuration.twoRowLogicEnabled;
            }
            if (globalToggleSwitch) {
                globalToggleSwitch.classList.toggle('active', this.configuration.twoRowLogicEnabled);
            }
            this.updateTableForTwoRowLogic();
            this.updateConfigMeta();
        }
    }

    renderConfigurationTable() {
        const tbody = document.getElementById('configTableBody');
        tbody.innerHTML = '';

        const sortedColumns = [...this.configuration.columns].sort((a, b) => a.order - b.order);

        sortedColumns.forEach((column, index) => {
            const row = this.createConfigRow(column, index);
            tbody.appendChild(row);
        });
    }

    createConfigRow(column, index) {
        const tr = document.createElement('tr');
        tr.dataset.columnId = column.id;
        tr.className = 'config-row';
        if (this.selectedColumnId === column.id) {
            tr.classList.add('selected');
        }

        // Get status indicator
        let statusIndicator = '<span class="status-indicator default">Default</span>';
        if (column.formatting !== 'text') {
            statusIndicator = `<span class="status-indicator formatted"><i class="ph ph-sliders"></i> ${column.formatting}</span>`;
        }

        // Split behavior selector (only shown when two-row logic is enabled)
        const splitBehaviorCell = this.configuration.twoRowLogicEnabled ? `
            <td class="col-split">
                <select class="table-select" data-column-id="${column.id}" data-field="splitBehavior">
                    <option value="same" ${column.splitBehavior === 'same' ? 'selected' : ''}>Same</option>
                    <option value="debit" ${column.splitBehavior === 'debit' ? 'selected' : ''}>Debit</option>
                    <option value="credit" ${column.splitBehavior === 'credit' ? 'selected' : ''}>Credit</option>
                </select>
            </td>
        ` : '';

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
                    value="${column.header}"
                    data-column-id="${column.id}"
                    data-field="header"
                />
            </td>
            <td class="col-field">
                <select class="table-select" data-column-id="${column.id}" data-field="dataField">
                    ${this.getDataFieldOptions(column.dataField)}
                </select>
            </td>
            <td class="col-sample">
                <span class="sample-value">${this.getSampleValue(column)}</span>
            </td>
            ${splitBehaviorCell}
            <td class="col-status">
                ${statusIndicator}
            </td>
        `;

        // Add event listeners
        const headerInput = tr.querySelector('input[data-field="header"]');
        headerInput.addEventListener('change', (e) => {
            column.header = e.target.value;
            this.updateSampleValue(column.id);
            this.updateStatusIndicator(column.id);
            this.showWarningBanner();
        });
        headerInput.addEventListener('input', () => {
            this.showWarningBanner();
        });

        const dataFieldSelect = tr.querySelector('select[data-field="dataField"]');
        dataFieldSelect.addEventListener('change', (e) => {
            column.dataField = e.target.value;
            this.updateSampleValue(column.id);
            this.updateStatusIndicator(column.id);
            this.showWarningBanner();
            if (this.selectedColumnId === column.id) {
                this.openDrawer(column);
            }
        });

        // Split behavior selector
        const splitBehaviorSelect = tr.querySelector('select[data-field="splitBehavior"]');
        if (splitBehaviorSelect) {
            splitBehaviorSelect.addEventListener('change', (e) => {
                column.splitBehavior = e.target.value;
                this.updateSampleValue(column.id);
                this.showWarningBanner();
            });
        }

        // Row click to open drawer
        tr.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle') || e.target.closest('input') || e.target.closest('select')) {
                return; // Don't open drawer when interacting with inputs
            }
            this.selectRow(column.id);
        });

        // Drag and drop
        this.setupDragAndDrop(tr, column);

        return tr;
    }

    selectRow(columnId) {
        // Remove previous selection
        document.querySelectorAll('.config-row').forEach(row => {
            row.classList.remove('selected');
        });

        // Add selection to clicked row
        const row = document.querySelector(`tr[data-column-id="${columnId}"]`);
        if (row) {
            row.classList.add('selected');
        }

        this.selectedColumnId = columnId;
        const column = this.configuration.columns.find(c => c.id === columnId);
        if (column) {
            this.openDrawer(column);
        }
    }

    openDrawer(column) {
        const drawer = document.getElementById('configDrawer');
        const drawerTitle = document.getElementById('drawerTitle');
        const drawerContent = document.getElementById('drawerContent');
        const configLayout = document.querySelector('.config-layout');

        if (!drawer || !drawerTitle || !drawerContent) return;

        drawerTitle.textContent = `Configure: ${column.header}`;
        drawerContent.innerHTML = this.renderDrawerContent(column);
        
        // Show drawer first (set display: flex)
        drawer.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        void drawer.offsetHeight;
        
        // Then add open class for animation
        drawer.classList.add('open');
        if (configLayout) {
            configLayout.classList.add('drawer-open');
        }
        
        // Setup drawer event listeners
        this.setupDrawerListeners(column);
    }

    renderDrawerContent(column) {
        return this.renderStandardDrawerContent(column);
    }

    renderStandardDrawerContent(column) {
        const splitBehaviorSection = this.configuration.twoRowLogicEnabled ? `
            <div class="drawer-section">
                <h4 class="drawer-section-title">Debit/Credit Behavior</h4>
                <div class="drawer-field">
                    <label class="drawer-field-label">Value for Debit/Credit Rows</label>
                    <select class="drawer-field-select" id="drawerSplitBehaviorSelect">
                        <option value="same" ${column.splitBehavior === 'same' ? 'selected' : ''}>Same value for both rows</option>
                        <option value="debit" ${column.splitBehavior === 'debit' ? 'selected' : ''}>Debit value only</option>
                        <option value="credit" ${column.splitBehavior === 'credit' ? 'selected' : ''}>Credit value only</option>
                    </select>
                    <div class="drawer-field-help">When 2-row logic is enabled, choose how this column behaves for Debit and Credit rows</div>
                </div>
            </div>
        ` : '';

        return `
            <div class="drawer-section">
                <h4 class="drawer-section-title">Column Information</h4>
                <div class="drawer-field">
                    <label class="drawer-field-label">Column Header</label>
                    <input 
                        type="text" 
                        class="drawer-field-input" 
                        id="drawerHeaderInput"
                        value="${column.header}"
                    />
                    <div class="drawer-field-help">This will be the column name in the exported CSV</div>
                </div>
                <div class="drawer-field">
                    <label class="drawer-field-label">Data Field</label>
                    <select class="drawer-field-select" id="drawerDataFieldSelect">
                        ${this.getDataFieldOptions(column.dataField)}
                    </select>
                    <div class="drawer-field-help">Select the data source for this column</div>
                </div>
            </div>
            <div class="drawer-section">
                <h4 class="drawer-section-title">Formatting</h4>
                <div class="drawer-field">
                    <label class="drawer-field-label">Format Type</label>
                    <select class="drawer-field-select" id="drawerFormatSelect">
                        <option value="text" ${column.formatting === 'text' ? 'selected' : ''}>Text</option>
                        <option value="date" ${column.formatting === 'date' ? 'selected' : ''}>Date</option>
                        <option value="number" ${column.formatting === 'number' ? 'selected' : ''}>Number</option>
                    </select>
                    <div class="drawer-field-help">Choose how the data should be formatted in the export</div>
                </div>
            </div>
            ${splitBehaviorSection}
        `;
    }

    setupDrawerListeners(column) {
        // Header input
        const headerInput = document.getElementById('drawerHeaderInput');
        if (headerInput) {
            headerInput.addEventListener('change', (e) => {
                column.header = e.target.value;
                this.updateTableRow(column);
                this.showWarningBanner();
            });
            headerInput.addEventListener('input', () => {
                this.showWarningBanner();
            });
        }

        // Data field select
        const dataFieldSelect = document.getElementById('drawerDataFieldSelect');
        if (dataFieldSelect) {
            dataFieldSelect.addEventListener('change', (e) => {
                column.dataField = e.target.value;
                this.updateTableRow(column);
                this.showWarningBanner();
            });
        }

        // Format select
        const formatSelect = document.getElementById('drawerFormatSelect');
        if (formatSelect) {
            formatSelect.addEventListener('change', (e) => {
                column.formatting = e.target.value;
                this.updateTableRow(column);
                this.showWarningBanner();
            });
        }

        // Split behavior select
        const splitBehaviorSelect = document.getElementById('drawerSplitBehaviorSelect');
        if (splitBehaviorSelect) {
            splitBehaviorSelect.addEventListener('change', (e) => {
                column.splitBehavior = e.target.value;
                this.updateTableRow(column);
                this.showWarningBanner();
                // Update the inline selector in the table
                const tableRow = document.querySelector(`tr[data-column-id="${column.id}"]`);
                if (tableRow) {
                    const tableSplitSelect = tableRow.querySelector('select[data-field="splitBehavior"]');
                    if (tableSplitSelect) {
                        tableSplitSelect.value = e.target.value;
                    }
                }
            });
        }
    }


    updateTableRow(column) {
        // Update the row in the table
        const row = document.querySelector(`tr[data-column-id="${column.id}"]`);
        if (row) {
            // Update header input
            const headerInput = row.querySelector('input[data-field="header"]');
            if (headerInput) {
                headerInput.value = column.header;
            }

            // Update data field select
            const dataFieldSelect = row.querySelector('select[data-field="dataField"]');
            if (dataFieldSelect) {
                dataFieldSelect.innerHTML = this.getDataFieldOptions(column.dataField);
            }

            // Update split behavior select if it exists
            const splitBehaviorSelect = row.querySelector('select[data-field="splitBehavior"]');
            if (splitBehaviorSelect) {
                splitBehaviorSelect.value = column.splitBehavior || 'same';
            }

            // Update sample value
            this.updateSampleValue(column.id);
            
            // Update status indicator
            this.updateStatusIndicator(column.id);
        }
    }

    updateStatusIndicator(columnId) {
        const column = this.configuration.columns.find(c => c.id === columnId);
        if (!column) return;

        const row = document.querySelector(`tr[data-column-id="${columnId}"]`);
        if (!row) return;

        const statusCell = row.querySelector('.col-status');
        if (!statusCell) return;

        let statusIndicator = '<span class="status-indicator default">Default</span>';
        if (column.formatting !== 'text') {
            statusIndicator = `<span class="status-indicator formatted"><i class="ph ph-sliders"></i> ${column.formatting}</span>`;
        }

        statusCell.innerHTML = statusIndicator;
    }

    updateTableForTwoRowLogic() {
        // Show/hide split column header
        const splitHeader = document.getElementById('splitColumnHeader');
        if (splitHeader) {
            splitHeader.style.display = this.configuration.twoRowLogicEnabled ? 'table-cell' : 'none';
        }

        // Re-render table to show/hide split behavior column
        this.renderConfigurationTable();
    }

    closeDrawer() {
        this.selectedColumnId = null;
        document.querySelectorAll('.config-row').forEach(row => {
            row.classList.remove('selected');
        });
        
        const drawer = document.getElementById('configDrawer');
        const drawerContent = document.getElementById('drawerContent');
        const drawerTitle = document.getElementById('drawerTitle');
        const configLayout = document.querySelector('.config-layout');
        
        if (!drawer) return;
        
        // Remove open class for animation
        drawer.classList.remove('open');
        if (configLayout) {
            configLayout.classList.remove('drawer-open');
        }
        
        // Wait for animation to complete, then hide
        setTimeout(() => {
            if (!drawer.classList.contains('open')) {
                drawer.style.display = 'none';
            }
        }, 300);
        
        if (drawerTitle) {
            drawerTitle.textContent = 'Select a column to configure';
        }
        if (drawerContent) {
            drawerContent.innerHTML = `
                <div class="drawer-empty-state">
                    <i class="ph ph-cursor-click"></i>
                    <p>Click on a row in the table to configure its settings</p>
                </div>
            `;
        }
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

    addColumn() {
        const newColumn = {
            id: 'col' + Date.now(),
            order: this.configuration.columns.length,
            header: 'New Column',
            dataField: 'transaction_id',
            formatting: 'text',
            visible: true,
            splitBehavior: 'same'
        };
        this.configuration.columns.push(newColumn);
        this.renderConfigurationTable();
        this.showWarningBanner();
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

        this.renderConfigurationTable();
        this.showWarningBanner();
    }

    showPreview() {
        this.generatePreview();
        this.showStep('step3');
    }

    generatePreview() {
        const visibleColumns = this.configuration.columns
            .filter(c => c.visible)
            .sort((a, b) => a.order - b.order);

        const previewData = [];
        this.sampleData.slice(0, 5).forEach(transaction => {
            if (this.configuration.twoRowLogicEnabled) {
                // Generate two rows per transaction (Debit and Credit)
                ['debit', 'credit'].forEach(rowType => {
                    const row = {};
                    visibleColumns.forEach(column => {
                        if (column.splitBehavior === 'debit' && rowType === 'credit') {
                            row[column.header] = '—';
                        } else if (column.splitBehavior === 'credit' && rowType === 'debit') {
                            row[column.header] = '—';
                        } else {
                            row[column.header] = this.formatValue(transaction[column.dataField], column.formatting);
                        }
                    });
                    previewData.push(row);
                });
            } else {
                // Single row per transaction
                const row = {};
                visibleColumns.forEach(column => {
                    row[column.header] = this.formatValue(transaction[column.dataField], column.formatting);
                });
                previewData.push(row);
            }
        });

        this.renderPreviewTable(visibleColumns, previewData);
        this.renderCSVPreview(visibleColumns, previewData);
    }

    renderPreviewTable(columns, data) {
        const thead = document.getElementById('previewTableHead');
        const tbody = document.getElementById('previewTableBody');
        
        thead.innerHTML = '';
        tbody.innerHTML = '';

        const headerRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

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
        csvContent += columns.map(c => `"${c.header}"`).join(',') + '\n';
        
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

    setupChangeTracking() {
        // Track changes to show warning banner
        const configTable = document.getElementById('configTable');
        if (configTable) {
            configTable.addEventListener('change', () => {
                this.showWarningBanner();
            });
            configTable.addEventListener('input', () => {
                this.showWarningBanner();
            });
        }
    }

    showWarningBanner() {
        const warningBanner = document.getElementById('warningBanner');
        if (warningBanner) {
            warningBanner.style.display = 'flex';
        }
    }

    saveConfiguration() {
        const warningBanner = document.getElementById('warningBanner');
        if (warningBanner) {
            warningBanner.style.display = 'none';
        }

        if (!confirm('Changes will affect future exports. Are you sure you want to save?')) {
            return;
        }

        this.configuration.lastUpdatedBy = 'John Doe'; // In real app, get from auth
        this.configuration.lastUpdatedAt = new Date().toISOString();
        if (!this.configuration.createdAt) {
            this.configuration.createdAt = new Date().toISOString();
        }

        // Save to localStorage
        localStorage.setItem('csvConfiguration', JSON.stringify(this.configuration));
        
        // Update UI
        this.updateConfigMeta();
        this.showStep('step0');
        this.renderLandingPage();
        
        alert('Configuration saved successfully! Changes will affect future exports.');
    }

    loadConfiguration() {
        const stored = localStorage.getItem('csvConfiguration');
        if (stored) {
            const config = JSON.parse(stored);
            this.configuration = {
                ...this.configuration,
                ...config,
                columns: config.columns || []
            };
        }
        
        // Ensure all columns have splitBehavior
        this.configuration.columns.forEach(col => {
            if (!col.splitBehavior) {
                col.splitBehavior = 'same';
            }
        });
        
        // Load default columns if none exist
        if (this.configuration.columns.length === 0) {
            this.loadDefaultColumns();
        } else {
            this.renderConfigurationTable();
        }
    }

    updateConfigMeta() {
        const configMeta = document.getElementById('configMeta');
        if (!configMeta) return;

        if (this.configuration.lastUpdatedAt) {
            const date = new Date(this.configuration.lastUpdatedAt);
            const dateStr = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            configMeta.innerHTML = `
                <div class="config-meta-info">
                    <span class="meta-label">Last updated by:</span>
                    <span class="meta-value">${this.configuration.lastUpdatedBy || '—'}</span>
                </div>
                <div class="config-meta-info">
                    <span class="meta-label">Last updated at:</span>
                    <span class="meta-value">${dateStr}</span>
                </div>
            `;
        } else {
            configMeta.innerHTML = '<div class="config-meta-info"><span class="meta-value">No updates yet</span></div>';
        }
    }

    renderLandingPage() {
        const configInfoCard = document.getElementById('configInfoCard');
        if (!configInfoCard) return;

        const columnCount = this.configuration.columns.filter(c => c.visible).length;
        const hasTwoRowLogic = this.configuration.twoRowLogicEnabled;
        
        let lastUpdatedInfo = '';
        if (this.configuration.lastUpdatedAt) {
            const date = new Date(this.configuration.lastUpdatedAt);
            const dateStr = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            lastUpdatedInfo = `
                <div class="config-info-item">
                    <span class="config-info-label">Last updated by:</span>
                    <span class="config-info-value">${this.configuration.lastUpdatedBy || '—'}</span>
                </div>
                <div class="config-info-item">
                    <span class="config-info-label">Last updated at:</span>
                    <span class="config-info-value">${dateStr}</span>
                </div>
            `;
        } else {
            lastUpdatedInfo = '<div class="config-info-item"><span class="config-info-value">Using default configuration</span></div>';
        }

        configInfoCard.innerHTML = `
            <div class="config-info-card-content">
                <div class="config-info-header">
                    <h3 class="config-info-title">Current Configuration</h3>
                </div>
                <div class="config-info-body">
                    <div class="config-info-item">
                        <span class="config-info-label">Columns:</span>
                        <span class="config-info-value">${columnCount}</span>
                    </div>
                    ${hasTwoRowLogic ? `
                        <div class="config-info-item">
                            <span class="config-info-label">Two-row logic:</span>
                            <span class="config-info-value">Enabled</span>
                        </div>
                    ` : ''}
                    ${lastUpdatedInfo}
                </div>
            </div>
        `;
    }

    previewConfiguration() {
        const originalConfig = { ...this.configuration };
        
        document.getElementById('previewModalTitle').textContent = 'Preview CSV Export Configuration';
        this.renderPreviewConfigInfo();
        this.generatePreviewForModal();
        this.configuration = originalConfig;

        document.getElementById('previewConfigModal').style.display = 'flex';
    }

    renderPreviewConfigInfo() {
        const infoContainer = document.getElementById('previewConfigInfo');
        const date = this.configuration.lastUpdatedAt ? new Date(this.configuration.lastUpdatedAt) : null;
        const dateStr = date ? date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Never';

        const visibleColumns = this.configuration.columns.filter(c => c.visible).length;
        const columnCount = this.configuration.columns.length;

        infoContainer.innerHTML = `
            <div class="preview-info-grid">
                <div class="preview-info-item">
                    <span class="preview-info-label">Columns:</span>
                    <span class="preview-info-value">${visibleColumns} of ${columnCount} visible</span>
                </div>
                <div class="preview-info-item">
                    <span class="preview-info-label">Two-row logic:</span>
                    <span class="preview-info-value">${this.configuration.twoRowLogicEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="preview-info-item">
                    <span class="preview-info-label">Last updated by:</span>
                    <span class="preview-info-value">${this.configuration.lastUpdatedBy || '—'}</span>
                </div>
                <div class="preview-info-item">
                    <span class="preview-info-label">Last updated at:</span>
                    <span class="preview-info-value">${dateStr}</span>
                </div>
            </div>
        `;
    }

    generatePreviewForModal() {
        const visibleColumns = this.configuration.columns
            .filter(c => c.visible)
            .sort((a, b) => a.order - b.order);

        const previewData = [];
        this.sampleData.slice(0, 5).forEach(transaction => {
            if (this.configuration.twoRowLogicEnabled) {
                ['debit', 'credit'].forEach(rowType => {
                    const row = {};
                    visibleColumns.forEach(column => {
                        if (column.splitBehavior === 'debit' && rowType === 'credit') {
                            row[column.header] = '—';
                        } else if (column.splitBehavior === 'credit' && rowType === 'debit') {
                            row[column.header] = '—';
                        } else {
                            row[column.header] = this.formatValue(transaction[column.dataField], column.formatting);
                        }
                    });
                    previewData.push(row);
                });
            } else {
                const row = {};
                visibleColumns.forEach(column => {
                    row[column.header] = this.formatValue(transaction[column.dataField], column.formatting);
                });
                previewData.push(row);
            }
        });

        this.renderPreviewModalTable(visibleColumns, previewData);
        this.renderPreviewModalCSV(visibleColumns, previewData);
    }

    renderPreviewModalTable(columns, data) {
        const thead = document.getElementById('previewModalTableHead');
        const tbody = document.getElementById('previewModalTableBody');
        
        thead.innerHTML = '';
        tbody.innerHTML = '';

        const headerRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

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

    renderPreviewModalCSV(columns, data) {
        let csvContent = '';
        csvContent += columns.map(c => `"${c.header}"`).join(',') + '\n';
        
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

        document.getElementById('previewModalCsv').textContent = csvContent;
    }

    copyCSVFromModal() {
        const csvContent = document.getElementById('previewModalCsv').textContent;
        navigator.clipboard.writeText(csvContent).then(() => {
            alert('CSV copied to clipboard!');
        });
    }

    downloadCSVFromModal() {
        const csvContent = document.getElementById('previewModalCsv').textContent;
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

    closePreviewModal() {
        document.getElementById('previewConfigModal').style.display = 'none';
    }

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
