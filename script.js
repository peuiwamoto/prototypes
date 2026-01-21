// Dashboard Widget Configuration
const widgetConfig = {
    // Big widgets section (top) - 2 per row, standalone fills full width
    bigTop: [
        { id: 'account-balance', label: 'Account Balance', section: 'bigTop', size: 'big' },
        { id: 'my-tasks', label: 'My Tasks', section: 'bigTop', size: 'big' },
        { id: 'account-development', label: 'Account Development', section: 'bigTop', size: 'big' }
    ],
    
    // Small widgets section - 3 per row, standalone stays 1/3 width
    small: [
        { id: 'cashback', label: 'Cashback', section: 'small', size: 'small' },
        { id: 'members', label: 'Members', section: 'small', size: 'small' },
        { id: 'cards', label: 'Cards', section: 'small', size: 'small' },
        { id: 'transaction-review', label: 'Transaction Review', section: 'small', size: 'small' },
        { id: 'bank-transfers', label: 'Bank Transfers', section: 'small', size: 'small' },
        { id: 'accounting', label: 'Accounting', section: 'small', size: 'small' }
    ],
    
    // Big widgets section (bottom) - 2 per row, standalone fills full width
    bigBottom: [
        { id: 'top-employees', label: 'Top Employees by Spend', section: 'bigBottom', size: 'big' },
        { id: 'top-categories', label: 'Top Categories by Spend', section: 'bigBottom', size: 'big' },
        { id: 'top-merchants', label: 'Top Merchants by Spend', section: 'bigBottom', size: 'big' },
        { id: 'my-spend', label: 'My Spend', section: 'bigBottom', size: 'big' }
    ]
};

// Section configuration
const sectionConfig = {
    bigTop: { id: 'bigTop', defaultName: 'Large Section 1', size: 'large', isCustom: false },
    small: { id: 'small', defaultName: 'Small Section', size: 'small', isCustom: false },
    bigBottom: { id: 'bigBottom', defaultName: 'Large Section 2', size: 'large', isCustom: false }
};

// Counter for custom section IDs
let customSectionCounter = 1;

// State management
let widgetState = {
    visible: {},
    order: {
        bigTop: {},
        small: {},
        bigBottom: {}
    },
    sectionOrder: ['bigTop', 'small', 'bigBottom'],
    sectionNames: {
        bigTop: 'Large Section 1',
        small: 'Small Section',
        bigBottom: 'Large Section 2'
    },
    sectionSizes: {
        bigTop: 'large',
        small: 'small',
        bigBottom: 'large'
    }
};

// Initialize state from localStorage or defaults
function initializeState() {
    const saved = localStorage.getItem('dashboardState');
    if (saved) {
        const parsed = JSON.parse(saved);
        widgetState = { ...widgetState, ...parsed };
        // Ensure order structure exists
        if (!widgetState.order.bigTop) widgetState.order.bigTop = {};
        if (!widgetState.order.small) widgetState.order.small = {};
        if (!widgetState.order.bigBottom) widgetState.order.bigBottom = {};
        // Ensure section order and names exist
        if (!widgetState.sectionOrder) widgetState.sectionOrder = ['bigTop', 'small', 'bigBottom'];
        if (!widgetState.sectionNames) {
            widgetState.sectionNames = {
                bigTop: 'Large Section 1',
                small: 'Small Section',
                bigBottom: 'Large Section 2'
            };
        }
        if (!widgetState.sectionSizes) {
            widgetState.sectionSizes = {
                bigTop: 'large',
                small: 'small',
                bigBottom: 'large'
            };
        }
        
        // Initialize custom sections if they exist
        widgetState.sectionOrder.forEach(sectionId => {
            if (!widgetConfig[sectionId] && sectionId.startsWith('custom')) {
                // Restore custom section config
                const size = widgetState.sectionSizes[sectionId] || 'large';
                sectionConfig[sectionId] = {
                    id: sectionId,
                    defaultName: widgetState.sectionNames[sectionId] || 'New Section',
                    size: size,
                    isCustom: true
                };
                widgetConfig[sectionId] = [];
                widgetState.order[sectionId] = {};
            }
        });
    } else {
        // Initialize all widgets as visible, except Account Development which should be hidden
        [...widgetConfig.bigTop, ...widgetConfig.small, ...widgetConfig.bigBottom].forEach(widget => {
            if (widget.id === 'account-development') {
                widgetState.visible[widget.id] = false; // Initially hidden
            } else {
                widgetState.visible[widget.id] = true;
            }
        });
        // Initialize order for each section
        widgetConfig.bigTop.forEach((widget, index) => {
            widgetState.order.bigTop[widget.id] = index;
        });
        widgetConfig.small.forEach((widget, index) => {
            widgetState.order.small[widget.id] = index;
        });
        widgetConfig.bigBottom.forEach((widget, index) => {
            widgetState.order.bigBottom[widget.id] = index;
        });
        // Initialize all sections as visible
        widgetState.sectionVisible = {
            bigTop: true,
            small: true,
            bigBottom: true
        };
    }
    
    // Ensure sectionVisible exists and default sections are visible
    if (!widgetState.sectionVisible) {
        widgetState.sectionVisible = {};
    }
    // Ensure default sections are visible if not set
    ['bigTop', 'small', 'bigBottom'].forEach(sectionId => {
        if (widgetState.sectionVisible[sectionId] === undefined) {
            widgetState.sectionVisible[sectionId] = true;
        }
    });
    
    // Ensure all widgets are visible by default if not set, except Account Development
    [...widgetConfig.bigTop, ...widgetConfig.small, ...widgetConfig.bigBottom].forEach(widget => {
        if (widgetState.visible[widget.id] === undefined) {
            if (widget.id === 'account-development') {
                widgetState.visible[widget.id] = false; // Account Development is hidden by default
            } else {
                widgetState.visible[widget.id] = true;
            }
        }
    });
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('dashboardState', JSON.stringify(widgetState));
}

// Initialize dashboard
function initializeDashboard() {
    initializeState();
    
    // Debug: Log state to console
    console.log('Widget State:', {
        sectionVisible: widgetState.sectionVisible,
        visible: widgetState.visible,
        sectionOrder: widgetState.sectionOrder
    });
    
    renderDashboardSections();
    renderCustomizeDropdown();
    setupEventListeners();
    updateWidgetVisibility();
}

// Render dashboard sections in order
function renderDashboardSections() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    // Map section IDs to HTML element IDs
    const sectionIdMap = {
        'bigTop': 'bigWidgetsTop',
        'small': 'smallWidgetsSection',
        'bigBottom': 'bigWidgetsBottom'
    };
    
    // First, ensure all section elements exist and have grids
    widgetState.sectionOrder.forEach(sectionId => {
        const htmlId = sectionIdMap[sectionId] || sectionId;
        let sectionElement = document.getElementById(htmlId);
        if (!sectionElement) {
            const size = widgetState.sectionSizes[sectionId] || (sectionId === 'small' ? 'small' : 'large');
            sectionElement = document.createElement('section');
            sectionElement.className = size === 'large' ? 'big-widgets-section' : 'small-widgets-section';
            sectionElement.id = htmlId;
            sectionElement.dataset.sectionId = sectionId; // Store the logical section ID
            
            // Map section IDs to actual grid IDs in HTML
            const gridIdMap = {
                'bigTop': 'bigWidgetsGridTop',
                'small': 'smallWidgetsGrid',
                'bigBottom': 'bigWidgetsGridBottom'
            };
            const gridId = gridIdMap[sectionId] || `${sectionId}Grid`;
            
            const grid = document.createElement('div');
            grid.className = size === 'large' ? 'big-widgets-grid' : 'small-widgets-grid';
            grid.id = gridId;
            grid.dataset.sectionId = sectionId;
            
            // Add drag and drop handlers to grid
            grid.addEventListener('dragover', handleDragOver);
            grid.addEventListener('drop', handleDrop);
            
            sectionElement.appendChild(grid);
            container.appendChild(sectionElement);
        } else {
            // Store the logical section ID
            sectionElement.dataset.sectionId = sectionId;
            
            // Map section IDs to actual grid IDs in HTML
            const gridIdMap = {
                'bigTop': 'bigWidgetsGridTop',
                'small': 'smallWidgetsGrid',
                'bigBottom': 'bigWidgetsGridBottom'
            };
            const gridId = gridIdMap[sectionId] || `${sectionId}Grid`;
            
            // Ensure grid exists - check both the mapped ID and the section ID
            let grid = document.getElementById(gridId);
            if (!grid && sectionElement) {
                // Also check inside the section element
                grid = sectionElement.querySelector(`#${gridId}`);
            }
            
            if (!grid) {
                const size = widgetState.sectionSizes[sectionId] || (sectionId === 'small' ? 'small' : 'large');
                grid = document.createElement('div');
                grid.className = size === 'large' ? 'big-widgets-grid' : 'small-widgets-grid';
                grid.id = gridId;
                grid.dataset.sectionId = sectionId;
                
                // Add drag and drop handlers to grid
                grid.addEventListener('dragover', handleDragOver);
                grid.addEventListener('drop', handleDrop);
                
                sectionElement.appendChild(grid);
            } else {
                // Ensure grid has section ID and event listeners
                grid.dataset.sectionId = sectionId;
                // Remove existing listeners and re-add to ensure they're active
                const newGrid = grid.cloneNode(false);
                newGrid.id = grid.id;
                newGrid.className = grid.className;
                newGrid.dataset.sectionId = sectionId;
                while (grid.firstChild) {
                    newGrid.appendChild(grid.firstChild);
                }
                if (grid.parentNode) {
                    grid.parentNode.replaceChild(newGrid, grid);
                }
                newGrid.addEventListener('dragover', handleDragOver);
                newGrid.addEventListener('drop', handleDrop);
            }
        }
    });
    
    // Remove all dividers first
    const existingDividers = container.querySelectorAll('.section-divider');
    existingDividers.forEach(divider => divider.remove());
    
    // Get all section elements (including ones we just created)
    const sectionElements = {};
    widgetState.sectionOrder.forEach(sectionId => {
        const htmlId = sectionIdMap[sectionId] || sectionId;
        const sectionElement = document.getElementById(htmlId);
        if (sectionElement) {
            sectionElements[sectionId] = sectionElement;
        }
    });
    
    // Remove all sections from DOM temporarily (but keep references)
    Object.values(sectionElements).forEach(section => {
        if (section.parentElement) {
            section.remove();
        }
    });
    
    // Render sections in order - append first, then render widgets
    widgetState.sectionOrder.forEach((sectionId, index) => {
        // Check if section is visible
        if (!isSectionVisible(sectionId)) {
            return;
        }
        
        // Check if section has widgets (if empty, hide it unless it's a custom section)
        const sectionWidgets = widgetConfig[sectionId] || [];
        const visibleWidgets = sectionWidgets.filter(w => widgetState.visible[w.id] !== false);
        const isCustomSection = sectionId.startsWith('custom');
        
        if (visibleWidgets.length === 0 && !isCustomSection) {
            // Skip empty non-custom sections
            return;
        }
        
        const sectionElement = sectionElements[sectionId];
        if (!sectionElement) return;
        
        // Append section to DOM FIRST (so grid exists in DOM)
        container.appendChild(sectionElement);
        
        // NOW render widgets for this section (grid exists in DOM now)
        renderSectionWidgets(sectionId);
        
        // Add divider after section (except for last visible section)
        const hasMoreSections = widgetState.sectionOrder.slice(index + 1).some(id => {
            if (!isSectionVisible(id)) return false;
            const widgets = widgetConfig[id] || [];
            const visible = widgets.filter(w => widgetState.visible[w.id] !== false);
            const isCustom = id.startsWith('custom');
            return visible.length > 0 || isCustom;
        });
        
        if (hasMoreSections) {
            const divider = document.createElement('div');
            divider.className = 'section-divider';
            container.appendChild(divider);
        }
    });
}

// Render widgets for a specific section
function renderSectionWidgets(sectionId) {
    const sectionWidgets = widgetConfig[sectionId] || [];
    
    // Map section IDs to actual grid IDs in HTML
    const gridIdMap = {
        'bigTop': 'bigWidgetsGridTop',
        'small': 'smallWidgetsGrid',
        'bigBottom': 'bigWidgetsGridBottom'
    };
    
    const gridId = gridIdMap[sectionId] || `${sectionId}Grid`;
    let grid = document.getElementById(gridId);
    
    // If grid not found by ID, try to find it by section ID in dataset
    if (!grid) {
        const sectionIdMap = {
            'bigTop': 'bigWidgetsTop',
            'small': 'smallWidgetsSection',
            'bigBottom': 'bigWidgetsBottom'
        };
        const htmlId = sectionIdMap[sectionId] || sectionId;
        const sectionElement = document.getElementById(htmlId);
        if (sectionElement) {
            grid = sectionElement.querySelector(`[data-section-id="${sectionId}"], .big-widgets-grid, .small-widgets-grid`);
        }
    }
    
    if (!grid) {
        console.warn(`Grid not found for section: ${sectionId}, looking for grid ID: ${gridId}`);
        return;
    }
    
    // Store section ID on grid for easy lookup
    grid.dataset.sectionId = sectionId;
    
    // Ensure grid has drag and drop handlers
    // Clear existing listeners by removing and re-adding
    const newGrid = grid.cloneNode(false);
    newGrid.id = grid.id;
    newGrid.className = grid.className;
    newGrid.dataset.sectionId = sectionId;
    
    // Add drag and drop handlers
    newGrid.addEventListener('dragover', handleDragOver);
    newGrid.addEventListener('drop', handleDrop);
    
    // Move existing children
    while (grid.firstChild) {
        newGrid.appendChild(grid.firstChild);
    }
    
    // Replace grid
    if (grid.parentNode) {
        grid.parentNode.replaceChild(newGrid, grid);
    }
    
    // Clear and rebuild widgets
    newGrid.innerHTML = '';
    
    // Sort widgets by order
    const sortedWidgets = [...sectionWidgets]
        .filter(w => widgetState.visible[w.id] !== false)
        .sort((a, b) => {
            const order = widgetState.order[sectionId] || {};
            return (order[a.id] || 0) - (order[b.id] || 0);
        });
    
    sortedWidgets.forEach(widget => {
        const widgetEl = createWidgetElement(widget);
        newGrid.appendChild(widgetEl);
    });
    
    // If grid is empty (custom section), add a min-height so it's droppable
    if (sortedWidgets.length === 0 && sectionId.startsWith('custom')) {
        newGrid.style.minHeight = '200px';
        newGrid.style.border = '2px dashed #e0e0e0';
        newGrid.style.borderRadius = '8px';
        newGrid.style.display = 'flex';
        newGrid.style.alignItems = 'center';
        newGrid.style.justifyContent = 'center';
        newGrid.style.color = '#999';
        newGrid.style.fontSize = '14px';
        newGrid.style.padding = '20px';
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Drop widgets here';
        placeholder.style.pointerEvents = 'none';
        newGrid.appendChild(placeholder);
    } else {
        newGrid.style.minHeight = '';
        newGrid.style.border = '';
        newGrid.style.borderRadius = '';
        newGrid.style.display = '';
        newGrid.style.alignItems = '';
        newGrid.style.justifyContent = '';
        newGrid.style.color = '';
        newGrid.style.fontSize = '';
        newGrid.style.padding = '';
    }
}

// Render big widgets (top) - kept for backward compatibility
function renderBigWidgetsTop() {
    renderSectionWidgets('bigTop');
}

// Render small widgets - kept for backward compatibility
function renderSmallWidgets() {
    renderSectionWidgets('small');
}

// Render big widgets (bottom) - kept for backward compatibility
function renderBigWidgetsBottom() {
    renderSectionWidgets('bigBottom');
}

// Create widget element
function createWidgetElement(widget) {
    const div = document.createElement('div');
    div.className = 'widget';
    div.dataset.widgetId = widget.id;
    div.dataset.widgetSection = widget.section;
    div.dataset.widgetSize = widget.size;
    div.draggable = true;
    
    div.innerHTML = `
        <div class="widget-header">
            <h3>${widget.label}</h3>
            <div class="widget-header-actions">
                <span class="widget-toggle" data-target="${widget.id}"><i class="ph ph-eye"></i></span>
            </div>
        </div>
        <div class="widget-content">
            <div style="color: #999; font-size: 14px;">Widget content placeholder</div>
        </div>
        <div class="widget-footer">
            <button class="view-more-btn" data-widget="${widget.id}">
                <span class="view-more-text">View</span>
                <i class="ph ph-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Add drag and drop handlers
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);
    div.addEventListener('dragend', handleDragEnd);
    
    return div;
}

// Render customize dropdown
function renderCustomizeDropdown() {
    const content = document.getElementById('customizeContent');
    content.innerHTML = '';
    
    // Render sections in the order specified by sectionOrder
    widgetState.sectionOrder.forEach((sectionId, sectionIndex) => {
        // Create section header
        const sectionHeader = createSectionHeader(sectionId);
        content.appendChild(sectionHeader);
        
        // Get widgets for this section
        const sectionWidgets = widgetConfig[sectionId] || [];
        const sortedWidgets = [...sectionWidgets].sort((a, b) => {
            const order = widgetState.order[sectionId] || {};
            return (order[a.id] || 0) - (order[b.id] || 0);
        });
        
        // Add widgets for this section (only if section is visible)
        const sectionVisible = widgetState.sectionVisible !== undefined ? 
            widgetState.sectionVisible[sectionId] !== false : true;
        
        if (sectionVisible) {
            sortedWidgets.forEach(widget => {
                const item = createDropdownItem(widget);
                content.appendChild(item);
            });
        }
        
        // Add divider after section (except for last section)
        if (sectionIndex < widgetState.sectionOrder.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'dropdown-divider';
            content.appendChild(divider);
        }
    });
    
    // Add "Add Section" button at the bottom
    const addSectionContainer = createAddSectionButton();
    content.appendChild(addSectionContainer);
}

// Create "Add Section" button and form
function createAddSectionButton() {
    const container = document.createElement('div');
    container.className = 'add-section-container';
    container.innerHTML = `
        <button class="add-section-btn" id="addSectionBtn">
            <i class="ph ph-plus"></i>
            Add Section
        </button>
        <div class="add-section-form" id="addSectionForm" style="display: none;">
            <div class="form-row">
                <label>Section Name:</label>
                <input type="text" class="section-name-input-form" id="newSectionName" placeholder="Enter section name" value="New Section">
            </div>
            <div class="form-row">
                <label>Size:</label>
                <div class="size-selector">
                    <button class="size-btn size-large active" data-size="large">Large</button>
                    <button class="size-btn size-small" data-size="small">Small</button>
                </div>
            </div>
            <div class="form-actions">
                <button class="create-section-btn">Create</button>
                <button class="cancel-section-btn">Cancel</button>
            </div>
        </div>
    `;
    
    const addBtn = container.querySelector('#addSectionBtn');
    const form = container.querySelector('#addSectionForm');
    const createBtn = container.querySelector('.create-section-btn');
    const cancelBtn = container.querySelector('.cancel-section-btn');
    const nameInput = container.querySelector('#newSectionName');
    const sizeButtons = container.querySelectorAll('.size-btn');
    
    // Toggle form visibility
    addBtn.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        if (form.style.display === 'block') {
            nameInput.focus();
            nameInput.select();
        }
    });
    
    // Size selector
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Create section
    createBtn.addEventListener('click', () => {
        const sectionName = nameInput.value.trim() || 'New Section';
        const selectedSize = container.querySelector('.size-btn.active').dataset.size;
        createNewSection(sectionName, selectedSize);
        
        // Reset form
        nameInput.value = 'New Section';
        sizeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === 'large') btn.classList.add('active');
        });
        form.style.display = 'none';
    });
    
    // Cancel
    cancelBtn.addEventListener('click', () => {
        nameInput.value = 'New Section';
        sizeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === 'large') btn.classList.add('active');
        });
        form.style.display = 'none';
    });
    
    return container;
}

// Create a new custom section
function createNewSection(name, size) {
    const sectionId = `custom${customSectionCounter++}`;
    
    // Add to section config
    sectionConfig[sectionId] = {
        id: sectionId,
        defaultName: name,
        size: size,
        isCustom: true
    };
    
    // Add to widget config (empty array)
    widgetConfig[sectionId] = [];
    
    // Add to state
    widgetState.sectionOrder.push(sectionId);
    widgetState.sectionNames[sectionId] = name;
    widgetState.sectionSizes[sectionId] = size;
    widgetState.order[sectionId] = {};
    widgetState.sectionVisible = widgetState.sectionVisible || {};
    widgetState.sectionVisible[sectionId] = true;
    
    // Create section element in HTML if it doesn't exist
    if (!document.getElementById(sectionId)) {
        const container = document.querySelector('.dashboard-container');
        const section = document.createElement('section');
        section.className = size === 'large' ? 'big-widgets-section' : 'small-widgets-section';
        section.id = sectionId;
        section.dataset.sectionId = sectionId;
        
        // Map section IDs to actual grid IDs in HTML (for custom sections, use sectionIdGrid)
        const gridIdMap = {
            'bigTop': 'bigWidgetsGridTop',
            'small': 'smallWidgetsGrid',
            'bigBottom': 'bigWidgetsGridBottom'
        };
        const gridId = gridIdMap[sectionId] || `${sectionId}Grid`;
        
        const grid = document.createElement('div');
        grid.className = size === 'large' ? 'big-widgets-grid' : 'small-widgets-grid';
        grid.id = gridId;
        grid.dataset.sectionId = sectionId;
        
        // Add drag and drop handlers to grid
        grid.addEventListener('dragover', handleDragOver);
        grid.addEventListener('drop', handleDrop);
        
        section.appendChild(grid);
        container.appendChild(section);
    }
    
    saveState();
    renderCustomizeDropdown();
    renderDashboardSections();
}

// Create section header
function createSectionHeader(sectionId) {
    const section = sectionConfig[sectionId];
    if (!section) {
        // Handle custom sections that might not be in sectionConfig yet
        const size = widgetState.sectionSizes[sectionId] || 'large';
        sectionConfig[sectionId] = {
            id: sectionId,
            defaultName: widgetState.sectionNames[sectionId] || 'New Section',
            size: size,
            isCustom: true
        };
    }
    const sectionName = widgetState.sectionNames[sectionId] || section.defaultName;
    const isLarge = (widgetState.sectionSizes[sectionId] || section.size) === 'large';
    
    const header = document.createElement('div');
    header.className = 'dropdown-section-header';
    header.dataset.sectionId = sectionId;
    header.draggable = true;
    
    header.innerHTML = `
        <div class="section-header-content">
            <span class="section-drag-handle" title="Drag to reorder sections"><i class="ph ph-list"></i></span>
            <div class="section-name-container">
                <span class="section-size-badge ${isLarge ? 'badge-large' : 'badge-small'}">${isLarge ? 'Large' : 'Small'}</span>
                <span class="section-name-text">${sectionName}</span>
                <button class="section-edit-btn" data-section="${sectionId}" title="Edit section name">
                    <i class="ph ph-pencil-simple"></i>
                </button>
            </div>
        </div>
        <div class="section-header-actions">
            <div class="toggle-switch ${isSectionVisible(sectionId) ? 'active' : ''}" data-section-id="${sectionId}"></div>
        </div>
    `;
    
    // Add drag handlers
    header.addEventListener('dragstart', handleSectionHeaderDragStart);
    header.addEventListener('dragover', handleSectionHeaderDragOver);
    header.addEventListener('drop', handleSectionHeaderDrop);
    header.addEventListener('dragend', handleSectionHeaderDragEnd);
    
    // Add toggle handler
    header.querySelector('.toggle-switch').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSectionVisibility(sectionId);
    });
    
    // Add edit button handler
    header.querySelector('.section-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        editSectionName(sectionId, header);
    });
    
    return header;
}

// Check if section is visible
function isSectionVisible(sectionId) {
    if (widgetState.sectionVisible === undefined) {
        widgetState.sectionVisible = {};
        // Default sections should be visible
        ['bigTop', 'small', 'bigBottom'].forEach(id => {
            widgetState.sectionVisible[id] = true;
        });
    }
    // Default to true if not set (sections are visible by default)
    return widgetState.sectionVisible[sectionId] !== false;
}

// Toggle section visibility
function toggleSectionVisibility(sectionId) {
    if (widgetState.sectionVisible === undefined) {
        widgetState.sectionVisible = {};
    }
    widgetState.sectionVisible[sectionId] = !isSectionVisible(sectionId);
    
    // Also toggle visibility of all widgets in the section
    let sectionWidgets = [];
    if (sectionId === 'bigTop') {
        sectionWidgets = widgetConfig.bigTop;
    } else if (sectionId === 'small') {
        sectionWidgets = widgetConfig.small;
    } else if (sectionId === 'bigBottom') {
        sectionWidgets = widgetConfig.bigBottom;
    }
    
    sectionWidgets.forEach(widget => {
        widgetState.visible[widget.id] = widgetState.sectionVisible[sectionId];
    });
    
    saveState();
    renderCustomizeDropdown();
    renderBigWidgetsTop();
    renderSmallWidgets();
    renderBigWidgetsBottom();
    updateWidgetVisibility();
}

// Edit section name
function editSectionName(sectionId, headerElement) {
    const nameContainer = headerElement.querySelector('.section-name-container');
    const nameText = headerElement.querySelector('.section-name-text');
    const editBtn = headerElement.querySelector('.section-edit-btn');
    const currentName = widgetState.sectionNames[sectionId] || sectionConfig[sectionId].defaultName;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'section-name-input';
    input.value = currentName;
    input.style.width = '150px';
    input.style.padding = '2px 6px';
    input.style.border = '1px solid #2563eb';
    input.style.borderRadius = '4px';
    input.style.fontSize = '14px';
    input.style.fontWeight = '600';
    
    // Replace text with input
    nameText.style.display = 'none';
    editBtn.style.display = 'none';
    nameContainer.insertBefore(input, nameText);
    input.focus();
    input.select();
    
    // Save on blur or Enter
    const saveName = () => {
        const newName = input.value.trim() || sectionConfig[sectionId].defaultName;
        widgetState.sectionNames[sectionId] = newName;
        nameText.textContent = newName;
        nameText.style.display = '';
        editBtn.style.display = '';
        input.remove();
        saveState();
        renderCustomizeDropdown();
    };
    
    input.addEventListener('blur', saveName);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveName();
        } else if (e.key === 'Escape') {
            nameText.style.display = '';
            editBtn.style.display = '';
            input.remove();
        }
    });
}

// Create dropdown item
function createDropdownItem(widget) {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.dataset.widgetId = widget.id;
    div.dataset.widgetSection = widget.section;
    // Allow dragging for all widgets
    div.draggable = true;
    
    const isVisible = widgetState.visible[widget.id] !== false;
    const isDraggable = true; // All widgets are draggable now
    
    div.innerHTML = `
        <div class="dropdown-item-content">
            <div class="dropdown-item-icon">${getWidgetIcon(widget.id)}</div>
            <span class="dropdown-item-label">${widget.label}</span>
        </div>
        <div class="dropdown-item-actions">
            ${isDraggable ? `
                <span class="dropdown-drag-handle" title="Drag to reorder"><i class="ph ph-list"></i></span>
            ` : ''}
            <div class="toggle-switch ${isVisible ? 'active' : ''}" data-widget-id="${widget.id}"></div>
        </div>
    `;
    
    // Add toggle switch handler
    div.querySelector('.toggle-switch').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWidgetVisibility(widget.id);
    });
    
    // Add drag handlers for all widgets (all are draggable now)
    div.addEventListener('dragstart', handleDropdownDragStart);
    div.addEventListener('dragover', handleDropdownDragOver);
    div.addEventListener('drop', handleDropdownDrop);
    div.addEventListener('dragend', handleDropdownDragEnd);
    
    return div;
}

// Get icon for widget
function getWidgetIcon(widgetId) {
    const icons = {
        'account-balance': '<i class="ph ph-wallet"></i>',
        'balance-development': '<i class="ph ph-chart-line-up"></i>',
        'cashback': '<i class="ph ph-money"></i>',
        'members': '<i class="ph ph-users"></i>',
        'cards': '<i class="ph ph-credit-card"></i>',
        'transaction-review': '<i class="ph ph-magnifying-glass"></i>',
        'bank-transfers': '<i class="ph ph-bank"></i>',
        'accounting': '<i class="ph ph-chart-bar"></i>',
        'my-tasks': '<i class="ph ph-list-checks"></i>',
        'account-development': '<i class="ph ph-chart-line-up"></i>',
        'top-employees': '<i class="ph ph-user"></i>',
        'top-categories': '<i class="ph ph-folder"></i>',
        'top-merchants': '<i class="ph ph-storefront"></i>',
        'my-spend': '<i class="ph ph-currency-circle-dollar"></i>'
    };
    return icons[widgetId] || '<i class="ph ph-package"></i>';
}

// Dropdown drag and drop handlers
let draggedDropdownItem = null;
let draggedSectionHeader = null;

function handleDropdownDragStart(e) {
    // Don't start drag if we're dragging a section header
    if (draggedSectionHeader) {
        e.preventDefault();
        return;
    }
    
    if (e.target.closest('.dropdown-item').dataset.widgetId) {
        draggedDropdownItem = e.target.closest('.dropdown-item');
        draggedDropdownItem.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    }
}

function handleDropdownDragOver(e) {
    e.preventDefault();
    
    const item = e.target.closest('.dropdown-item');
    if (item && item !== draggedDropdownItem && item.dataset.widgetId) {
        e.dataTransfer.dropEffect = 'move';
        item.style.backgroundColor = '#f0f7ff';
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
}

function handleDropdownDrop(e) {
    e.preventDefault();
    
    const targetItem = e.target.closest('.dropdown-item');
    if (targetItem && draggedDropdownItem && targetItem !== draggedDropdownItem) {
        const draggedId = draggedDropdownItem.dataset.widgetId;
        const targetId = targetItem.dataset.widgetId;
        const draggedSection = draggedDropdownItem.dataset.widgetSection;
        const targetSection = targetItem.dataset.widgetSection;
        
        // Allow reordering within the same section, or moving between any sections
        if (draggedSection === targetSection) {
            // Reorder within same section
            reorderWidgetsInSection(draggedId, targetId, draggedSection);
        } else {
            // Move widget between sections
            moveWidgetBetweenSections(draggedId, draggedSection, targetSection, targetId);
        }
        
        saveState();
        renderDashboardSections();
        renderCustomizeDropdown();
    }
    
    // Reset styles
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.style.backgroundColor = '';
    });
}

function handleDropdownDragEnd(e) {
    if (draggedDropdownItem) {
        draggedDropdownItem.style.opacity = '1';
        draggedDropdownItem = null;
    }
    
    // Reset styles
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.style.backgroundColor = '';
    });
}

// Section header drag and drop handlers
function handleSectionHeaderDragStart(e) {
    // Don't start drag if clicking on edit button or toggle
    if (e.target.closest('.section-edit-btn') || e.target.closest('.toggle-switch')) {
        e.preventDefault();
        return;
    }
    
    if (e.target.closest('.dropdown-section-header').dataset.sectionId) {
        draggedSectionHeader = e.target.closest('.dropdown-section-header');
        draggedSectionHeader.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('section-header', 'true');
    }
}

function handleSectionHeaderDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const header = e.target.closest('.dropdown-section-header');
    if (header && header !== draggedSectionHeader && header.dataset.sectionId) {
        header.style.backgroundColor = '#f0f7ff';
    }
}

function handleSectionHeaderDrop(e) {
    e.preventDefault();
    
    const targetHeader = e.target.closest('.dropdown-section-header');
    if (targetHeader && draggedSectionHeader && targetHeader !== draggedSectionHeader) {
        const draggedSectionId = draggedSectionHeader.dataset.sectionId;
        const targetSectionId = targetHeader.dataset.sectionId;
        
        // Swap section positions
        const draggedIndex = widgetState.sectionOrder.indexOf(draggedSectionId);
        const targetIndex = widgetState.sectionOrder.indexOf(targetSectionId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            widgetState.sectionOrder[draggedIndex] = targetSectionId;
            widgetState.sectionOrder[targetIndex] = draggedSectionId;
            
            saveState();
            renderCustomizeDropdown();
            renderDashboardSections();
        }
    }
    
    // Reset styles
    document.querySelectorAll('.dropdown-section-header').forEach(header => {
        header.style.backgroundColor = '';
    });
}

function handleSectionHeaderDragEnd(e) {
    if (draggedSectionHeader) {
        draggedSectionHeader.style.opacity = '1';
        draggedSectionHeader = null;
    }
    
    // Reset styles
    document.querySelectorAll('.dropdown-section-header').forEach(header => {
        header.style.backgroundColor = '';
    });
}

// Toggle widget visibility
function toggleWidgetVisibility(widgetId) {
    widgetState.visible[widgetId] = !widgetState.visible[widgetId];
    saveState();
    updateWidgetVisibility();
    renderCustomizeDropdown();
    
    // Re-render appropriate section
    const widget = [...widgetConfig.bigTop, ...widgetConfig.small, ...widgetConfig.bigBottom]
        .find(w => w.id === widgetId);
    if (widget) {
        if (widget.section === 'bigTop') {
            renderBigWidgetsTop();
        } else if (widget.section === 'small') {
            renderSmallWidgets();
        } else if (widget.section === 'bigBottom') {
            renderBigWidgetsBottom();
        }
    }
}

// Update widget visibility
function updateWidgetVisibility() {
    [...widgetConfig.bigTop, ...widgetConfig.small, ...widgetConfig.bigBottom].forEach(widget => {
        const element = document.querySelector(`[data-widget-id="${widget.id}"]`);
        if (element) {
            if (widgetState.visible[widget.id] === false) {
                element.classList.add('hidden');
            } else {
                element.classList.remove('hidden');
            }
        }
    });
}

// Drag and Drop handlers
let draggedElement = null;

function handleDragStart(e) {
    if (e.target.closest('.widget').dataset.widgetId) {
        draggedElement = e.target.closest('.widget');
        draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', draggedElement.innerHTML);
        e.dataTransfer.setData('widget-section', draggedElement.dataset.widgetSection);
        e.dataTransfer.setData('widget-size', draggedElement.dataset.widgetSize);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    
    const widget = e.target.closest('.widget');
    const grid = e.target.closest('.big-widgets-grid, .small-widgets-grid');
    
    if (draggedElement) {
        const draggedSection = draggedElement.dataset.widgetSection;
        
        if (widget && widget !== draggedElement && widget.dataset.widgetId) {
            const targetSection = widget.dataset.widgetSection;
            
            // Allow drop if: same section, or moving between any sections
            if (draggedSection === targetSection || 
                (draggedSection && targetSection)) {
                e.dataTransfer.dropEffect = 'move';
                widget.classList.add('drag-over');
            } else {
                e.dataTransfer.dropEffect = 'none';
            }
        } else if (grid) {
            // Extract section ID from grid - prefer dataset, then fall back to ID parsing
            let targetSection = grid.dataset.sectionId;
            if (!targetSection) {
                // Fallback to parsing grid ID
                if (grid.id === 'bigWidgetsGridTop') {
                    targetSection = 'bigTop';
                } else if (grid.id === 'bigWidgetsGridBottom') {
                    targetSection = 'bigBottom';
                } else if (grid.id === 'smallWidgetsGrid') {
                    targetSection = 'small';
                } else if (grid.id.endsWith('Grid')) {
                    targetSection = grid.id.replace('Grid', '');
                }
            }
            
            if (targetSection) {
                if (draggedSection !== targetSection) {
                    // Allow moving between any sections
                    e.dataTransfer.dropEffect = 'move';
                    grid.style.backgroundColor = '#f0f7ff';
                    grid.style.border = '2px dashed #2563eb';
                } else {
                    e.dataTransfer.dropEffect = 'move';
                }
            }
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    const targetWidget = e.target.closest('.widget');
    const targetGrid = e.target.closest('.big-widgets-grid, .small-widgets-grid');
    
    if (draggedElement) {
        const draggedId = draggedElement.dataset.widgetId;
        const draggedSection = draggedElement.dataset.widgetSection;
        
        if (targetWidget && targetWidget !== draggedElement) {
            // Dropping on another widget - reorder or move between sections
            const targetId = targetWidget.dataset.widgetId;
            const targetSection = targetWidget.dataset.widgetSection;
            
            if (draggedSection === targetSection) {
                // Reorder within same section
                reorderWidgetsInSection(draggedId, targetId, draggedSection);
            } else {
                // Allow moving between any sections
                moveWidgetBetweenSections(draggedId, draggedSection, targetSection, targetId);
            }
        } else if (targetGrid && !targetWidget) {
            // Dropping on empty space in a grid - move widget to that section
            // Extract section ID from grid - prefer dataset, then fall back to ID parsing
            let targetSection = targetGrid.dataset.sectionId;
            if (!targetSection) {
                // Fallback to parsing grid ID
                if (targetGrid.id === 'bigWidgetsGridTop') {
                    targetSection = 'bigTop';
                } else if (targetGrid.id === 'bigWidgetsGridBottom') {
                    targetSection = 'bigBottom';
                } else if (targetGrid.id === 'smallWidgetsGrid') {
                    targetSection = 'small';
                } else if (targetGrid.id.endsWith('Grid')) {
                    targetSection = targetGrid.id.replace('Grid', '');
                }
            }
            
            if (targetSection && draggedSection !== targetSection) {
                // Allow moving between any sections
                moveWidgetBetweenSections(draggedId, draggedSection, targetSection);
            } else if (targetSection === draggedSection) {
                // Dropping on empty space in same section - move to end
                moveWidgetToEndOfSection(draggedId, draggedSection);
            }
        }
        
        saveState();
        renderDashboardSections();
        renderCustomizeDropdown();
    }
    
    // Remove drag-over class from all widgets
    document.querySelectorAll('.widget').forEach(w => {
        w.classList.remove('drag-over');
    });
}

// Reorder widgets within the same section
function reorderWidgetsInSection(draggedId, targetId, section) {
    // Get the array for this section
    let sectionArray = null;
    if (section === 'bigTop') {
        sectionArray = widgetConfig.bigTop;
    } else if (section === 'small') {
        sectionArray = widgetConfig.small;
    } else if (section === 'bigBottom') {
        sectionArray = widgetConfig.bigBottom;
    }
    
    if (!sectionArray) return;
    
    // Find indices
    const draggedIndex = sectionArray.findIndex(w => w.id === draggedId);
    const targetIndex = sectionArray.findIndex(w => w.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged widget from its current position
    const [draggedWidget] = sectionArray.splice(draggedIndex, 1);
    
    // Insert at target position
    sectionArray.splice(targetIndex, 0, draggedWidget);
    
    // Recalculate order values based on new positions
    sectionArray.forEach((widget, index) => {
        widgetState.order[section][widget.id] = index;
    });
}

// Move widget to end of section
function moveWidgetToEndOfSection(widgetId, section) {
    // Get the array for this section
    let sectionArray = null;
    if (section === 'bigTop') {
        sectionArray = widgetConfig.bigTop;
    } else if (section === 'small') {
        sectionArray = widgetConfig.small;
    } else if (section === 'bigBottom') {
        sectionArray = widgetConfig.bigBottom;
    }
    
    if (!sectionArray) return;
    
    // Find and move widget
    const widgetIndex = sectionArray.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return;
    
    const [widget] = sectionArray.splice(widgetIndex, 1);
    sectionArray.push(widget);
    
    // Recalculate order values
    sectionArray.forEach((widget, index) => {
        widgetState.order[section][widget.id] = index;
    });
}

// Move widget between sections
function moveWidgetBetweenSections(widgetId, fromSection, toSection, insertAfterId = null) {
    // Find widget in config
    const sourceArray = widgetConfig[fromSection];
    if (!sourceArray) return;
    
    const index = sourceArray.findIndex(w => w.id === widgetId);
    if (index === -1) return;
    
    const widget = sourceArray.splice(index, 1)[0];
    
    // Update widget size and section
    widget.section = toSection;
    const toSectionSize = widgetState.sectionSizes[toSection] || (toSection === 'small' ? 'small' : 'large');
    widget.size = toSectionSize === 'small' ? 'small' : 'big';
    
    // Ensure target array exists
    if (!widgetConfig[toSection]) {
        widgetConfig[toSection] = [];
    }
    
    const targetArray = widgetConfig[toSection];
    
    if (insertAfterId) {
        const insertIndex = targetArray.findIndex(w => w.id === insertAfterId);
        if (insertIndex !== -1) {
            targetArray.splice(insertIndex + 1, 0, widget);
        } else {
            targetArray.push(widget);
        }
    } else {
        targetArray.push(widget);
    }
    
    // Ensure order object exists for target section
    if (!widgetState.order[toSection]) {
        widgetState.order[toSection] = {};
    }
    
    // Update order in new section
    const maxOrder = Math.max(...targetArray.map(w => widgetState.order[toSection][w.id] || 0), -1);
    widgetState.order[toSection][widgetId] = maxOrder + 1;
    
    // Remove order from old section
    if (widgetState.order[fromSection]) {
        delete widgetState.order[fromSection][widgetId];
    }
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    
    // Remove drag-over class from all widgets
    document.querySelectorAll('.widget').forEach(w => {
        w.classList.remove('drag-over');
    });
    
    // Reset grid background
    document.querySelectorAll('.big-widgets-grid, .small-widgets-grid').forEach(grid => {
        grid.style.backgroundColor = '';
    });
}


// Setup event listeners
function setupEventListeners() {
    // Customize button
    const customizeBtn = document.getElementById('customizeBtn');
    const customizeDropdown = document.getElementById('customizeDropdown');
    
    customizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        customizeDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customizeBtn.contains(e.target) && !customizeDropdown.contains(e.target)) {
            customizeDropdown.classList.remove('active');
        }
    });
    
    // Widget toggle buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('widget-toggle')) {
            const widgetId = e.target.dataset.target;
            toggleWidgetVisibility(widgetId);
        }
    });
    
    // View more button
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-more-btn')) {
            const btn = e.target.closest('.view-more-btn');
            const widgetId = btn.dataset.widget;
            handleViewMore(widgetId);
        }
    });
}

// Show widget menu (context menu)
function showWidgetMenu(widgetId, button) {
    // Simple implementation - can be extended with actual menu
    const widget = [...widgetConfig.bigTop, ...widgetConfig.small, ...widgetConfig.bigBottom]
        .find(w => w.id === widgetId);
    if (widget) {
        // For now, just toggle visibility as a quick action
        // In a real implementation, this would show a context menu
        console.log('Widget menu clicked for:', widget.label);
    }
}

// Handle view more button click
function handleViewMore(widgetId) {
    const widget = [...widgetConfig.bigTop, ...widgetConfig.small, ...widgetConfig.bigBottom]
        .find(w => w.id === widgetId);
    if (widget) {
        // In a real implementation, this would navigate to a detailed view
        console.log('View more clicked for:', widget.label);
        // You can add navigation logic here, e.g.:
        // window.location.href = `/widgets/${widgetId}`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
