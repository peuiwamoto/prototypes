// CSV Customizer Application
class CSVCustomizer {
    constructor() {
        this.csvData = [];
        this.headers = [];
        this.columnSettings = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('csvFileInput');
        const uploadCard = document.querySelector('.upload-card');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const exportBtn = document.getElementById('exportBtn');
        const resetBtn = document.getElementById('resetBtn');
        const panelToggle = document.getElementById('panelToggle');

        // File input change
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        uploadCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadCard.classList.add('dragover');
        });

        uploadCard.addEventListener('dragleave', () => {
            uploadCard.classList.remove('dragover');
        });

        uploadCard.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
                this.processFile(files[0]);
            }
        });

        uploadCard.addEventListener('click', () => {
            fileInput.click();
        });

        // Remove file
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.reset();
        });

        // Export
        exportBtn.addEventListener('click', () => this.exportCSV());

        // Reset
        resetBtn.addEventListener('click', () => this.reset());

        // Panel toggle
        panelToggle.addEventListener('click', () => {
            const panelContent = document.getElementById('panelContent');
            const icon = panelToggle.querySelector('i');
            panelContent.classList.toggle('collapsed');
            icon.classList.toggle('ph-caret-up');
            icon.classList.toggle('ph-caret-down');
        });
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.parseCSV(text);
            this.displayFileInfo(file);
            this.showCustomizationSection();
        };
        reader.readAsText(file);
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return;

        // Parse headers
        this.headers = this.parseCSVLine(lines[0]);
        
        // Initialize column settings
        this.columnSettings = this.headers.map((header, index) => ({
            originalName: header,
            displayName: header,
            visible: true,
            order: index
        }));

        // Parse data rows
        this.csvData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === this.headers.length) {
                const row = {};
                this.headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                this.csvData.push(row);
            }
        }

        this.renderColumnSettings();
        this.renderTable();
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        fileInfo.style.display = 'flex';
        fileName.textContent = file.name;
    }

    showCustomizationSection() {
        const uploadSection = document.getElementById('uploadSection');
        const customizationSection = document.getElementById('customizationSection');
        uploadSection.style.display = 'none';
        customizationSection.style.display = 'block';
        
        // Update row count
        const rowCount = document.getElementById('rowCount');
        rowCount.textContent = `${this.csvData.length} rows`;
    }

    renderColumnSettings() {
        const columnsList = document.getElementById('columnsList');
        columnsList.innerHTML = '';

        // Sort by order
        const sortedSettings = [...this.columnSettings].sort((a, b) => a.order - b.order);

        sortedSettings.forEach((setting, index) => {
            const columnItem = document.createElement('div');
            columnItem.className = 'column-item';
            columnItem.draggable = true;
            columnItem.dataset.index = index;

            columnItem.innerHTML = `
                <div class="column-drag-handle">
                    <i class="ph ph-dots-six-vertical"></i>
                </div>
                <input 
                    type="text" 
                    class="column-name-input" 
                    value="${setting.displayName}"
                    data-original="${setting.originalName}"
                />
                <div class="column-visibility-toggle">
                    <span style="font-size: 12px; color: #666;">Visible</span>
                    <div class="toggle-switch ${setting.visible ? 'active' : ''}" data-index="${index}"></div>
                </div>
                <div class="column-actions">
                    <button class="column-action-btn" title="Delete column">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            `;

            // Name input change
            const nameInput = columnItem.querySelector('.column-name-input');
            nameInput.addEventListener('change', (e) => {
                const originalName = e.target.dataset.original;
                const setting = this.columnSettings.find(s => s.originalName === originalName);
                if (setting) {
                    setting.displayName = e.target.value;
                    this.renderTable();
                }
            });

            // Visibility toggle
            const toggle = columnItem.querySelector('.toggle-switch');
            toggle.addEventListener('click', () => {
                const setting = this.columnSettings.find(s => s.originalName === setting.originalName);
                if (setting) {
                    setting.visible = !setting.visible;
                    toggle.classList.toggle('active');
                    this.renderTable();
                }
            });

            // Delete button
            const deleteBtn = columnItem.querySelector('.column-action-btn');
            deleteBtn.addEventListener('click', () => {
                const originalName = nameInput.dataset.original;
                const settingIndex = this.columnSettings.findIndex(s => s.originalName === originalName);
                if (settingIndex !== -1) {
                    this.columnSettings[settingIndex].visible = false;
                    this.renderTable();
                }
            });

            // Drag and drop
            columnItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                columnItem.classList.add('dragging');
            });

            columnItem.addEventListener('dragend', () => {
                columnItem.classList.remove('dragging');
            });

            columnItem.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            columnItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = parseInt(columnItem.dataset.index);
                this.reorderColumns(draggedIndex, targetIndex);
            });

            columnsList.appendChild(columnItem);
        });
    }

    reorderColumns(fromIndex, toIndex) {
        const sortedSettings = [...this.columnSettings].sort((a, b) => a.order - b.order);
        const [moved] = sortedSettings.splice(fromIndex, 1);
        sortedSettings.splice(toIndex, 0, moved);
        
        sortedSettings.forEach((setting, index) => {
            setting.order = index;
        });

        this.renderColumnSettings();
        this.renderTable();
    }

    renderTable() {
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        
        // Clear existing content
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        // Get visible columns in order
        const visibleColumns = [...this.columnSettings]
            .filter(s => s.visible)
            .sort((a, b) => a.order - b.order);

        // Render headers
        const headerRow = document.createElement('tr');
        visibleColumns.forEach(setting => {
            const th = document.createElement('th');
            th.textContent = setting.displayName;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);

        // Render data rows (limit to 100 rows for performance)
        const displayRows = this.csvData.slice(0, 100);
        displayRows.forEach(row => {
            const tr = document.createElement('tr');
            visibleColumns.forEach(setting => {
                const td = document.createElement('td');
                td.textContent = row[setting.originalName] || '';
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });

        // Show message if more rows exist
        if (this.csvData.length > 100) {
            const messageRow = document.createElement('tr');
            const messageCell = document.createElement('td');
            messageCell.colSpan = visibleColumns.length;
            messageCell.style.textAlign = 'center';
            messageCell.style.padding = '16px';
            messageCell.style.color = '#666';
            messageCell.textContent = `Showing first 100 of ${this.csvData.length} rows`;
            messageRow.appendChild(messageCell);
            tableBody.appendChild(messageRow);
        }
    }

    exportCSV() {
        // Get visible columns in order
        const visibleColumns = [...this.columnSettings]
            .filter(s => s.visible)
            .sort((a, b) => a.order - b.order);

        // Build CSV content
        let csvContent = '';
        
        // Headers
        csvContent += visibleColumns.map(s => `"${s.displayName}"`).join(',') + '\n';
        
        // Data rows
        this.csvData.forEach(row => {
            const values = visibleColumns.map(setting => {
                const value = row[setting.originalName] || '';
                // Escape quotes and wrap in quotes if contains comma or quote
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvContent += values.join(',') + '\n';
        });

        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'customized-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    reset() {
        this.csvData = [];
        this.headers = [];
        this.columnSettings = [];
        
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('customizationSection').style.display = 'none';
        document.getElementById('csvFileInput').value = '';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CSVCustomizer();
});
