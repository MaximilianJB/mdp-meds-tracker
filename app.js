// ===========================
// App Initialization
// ===========================

// Register Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered:', registration))
            .catch(error => console.log('Service Worker registration failed:', error));
    });
}

// ===========================
// Data Management
// ===========================

const STORAGE_KEY = 'pharmacyInventory';

// Load inventory from localStorage
function loadInventory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save inventory to localStorage
function saveInventory(inventory) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate current quantity for medicine items
function calculateCurrentQuantity(item) {
    if (item.category === 'Medicine') {
        return (item.bottleCount * item.unitsPerBottle) + (item.baggieCount * item.unitsPerBaggie);
    }
    return item.currentQuantity;
}

// Calculate percentage remaining
function calculatePercentageRemaining(item) {
    const current = item.category === 'Medicine' ? calculateCurrentQuantity(item) : item.currentQuantity;
    if (item.startingQuantity === 0) return 0;
    return Math.round((current / item.startingQuantity) * 100);
}

// ===========================
// UI State Management
// ===========================

let currentScreen = 'main-screen';
let currentItemId = null;
let isEditMode = false;

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

// ===========================
// Main Screen: Inventory List
// ===========================

function renderInventoryList() {
    const inventory = loadInventory();
    const listContainer = document.getElementById('inventory-list');
    const emptyState = document.getElementById('empty-state');

    if (inventory.length === 0) {
        listContainer.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    listContainer.innerHTML = '';

    inventory.forEach(item => {
        const itemElement = createInventoryItemElement(item);
        listContainer.appendChild(itemElement);
    });
}

function createInventoryItemElement(item) {
    const div = document.createElement('div');
    div.className = `inventory-item ${item.category.toLowerCase()}`;
    div.onclick = () => showItemDetail(item.id);

    const currentQty = item.category === 'Medicine' ? calculateCurrentQuantity(item) : item.currentQuantity;
    const percentage = calculatePercentageRemaining(item);
    
    let percentageClass = 'percentage-high';
    if (percentage < 20) {
        percentageClass = 'percentage-low';
    } else if (percentage <= 50) {
        percentageClass = 'percentage-medium';
    }

    div.innerHTML = `
        <div class="item-header">
            <span class="item-name">${escapeHtml(item.name)}</span>
            <span class="item-category ${item.category.toLowerCase()}">${item.category}</span>
        </div>
        <div class="item-info">
            <span class="item-quantity">Current: ${currentQty} units</span>
            <span class="item-percentage ${percentageClass}">${percentage}%</span>
        </div>
    `;

    return div;
}

// ===========================
// Detail Screen
// ===========================

function showItemDetail(itemId) {
    const inventory = loadInventory();
    const item = inventory.find(i => i.id === itemId);
    
    if (!item) return;

    currentItemId = itemId;
    const detailContent = document.getElementById('detail-content');
    
    const currentQty = item.category === 'Medicine' ? calculateCurrentQuantity(item) : item.currentQuantity;
    const percentage = calculatePercentageRemaining(item);

    let percentageClass = 'percentage-high';
    if (percentage < 20) {
        percentageClass = 'percentage-low';
    } else if (percentage <= 50) {
        percentageClass = 'percentage-medium';
    }

    let detailHTML = `
        <div class="detail-section">
            <h3>General Information</h3>
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${escapeHtml(item.category)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${escapeHtml(item.name)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">${escapeHtml(item.description || 'N/A')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Starting Quantity:</span>
                <span class="detail-value">${item.startingQuantity} units</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Current Quantity:</span>
                <span class="detail-value">${currentQty} units</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Remaining:</span>
                <span class="detail-value item-percentage ${percentageClass}">${percentage}%</span>
            </div>
        </div>
    `;

    if (item.category === 'Medicine') {
        detailHTML += `
            <div class="detail-section">
                <h3>Medicine Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Drug Name:</span>
                    <span class="detail-value">${escapeHtml(item.drugName)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Dosage:</span>
                    <span class="detail-value">${escapeHtml(item.dosage)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Form:</span>
                    <span class="detail-value">${escapeHtml(item.form)}</span>
                </div>
            </div>

            <div class="breakdown-section">
                <h4>Container Breakdown</h4>
                <div class="detail-row">
                    <span class="detail-label">Bottles:</span>
                    <span class="detail-value">${item.bottleCount} × ${item.unitsPerBottle} units = ${item.bottleCount * item.unitsPerBottle} units</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Baggies:</span>
                    <span class="detail-value">${item.baggieCount} × ${item.unitsPerBaggie} units = ${item.baggieCount * item.unitsPerBaggie} units</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value">${currentQty} units</span>
                </div>
            </div>
        `;
    }

    detailHTML += `
        <button class="btn btn-danger" onclick="showSubtractModal()">− Subtract Units</button>
    `;

    detailContent.innerHTML = detailHTML;
    showScreen('detail-screen');
}

// ===========================
// Subtract Modal
// ===========================

function showSubtractModal() {
    const modal = document.getElementById('subtract-modal');
    const amountInput = document.getElementById('subtract-amount');
    
    const inventory = loadInventory();
    const item = inventory.find(i => i.id === currentItemId);
    
    if (!item) return;
    
    const currentQty = item.category === 'Medicine' ? calculateCurrentQuantity(item) : item.currentQuantity;
    
    document.getElementById('subtract-message').textContent = 
        `Current quantity: ${currentQty} units. How many would you like to subtract?`;
    
    amountInput.value = '';
    amountInput.max = currentQty;
    modal.classList.add('active');
}

function hideSubtractModal() {
    document.getElementById('subtract-modal').classList.remove('active');
}

function confirmSubtraction() {
    const amount = parseInt(document.getElementById('subtract-amount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount to subtract.');
        return;
    }

    const inventory = loadInventory();
    const itemIndex = inventory.findIndex(i => i.id === currentItemId);
    
    if (itemIndex === -1) return;

    const item = inventory[itemIndex];
    
    if (item.category === 'Medicine') {
        // Subtract from baggies first, then bottles
        let remaining = amount;
        
        // Get current total
        const currentTotal = (item.bottleCount * item.unitsPerBottle) + (item.baggieCount * item.unitsPerBaggie);
        
        if (currentTotal < remaining) {
            alert('Not enough units in stock!');
            return;
        }
        
        // Calculate units in baggies
        let baggieUnits = item.baggieCount * item.unitsPerBaggie;
        
        if (baggieUnits >= remaining) {
            // Can subtract entirely from baggies
            baggieUnits -= remaining;
            item.baggieCount = Math.floor(baggieUnits / item.unitsPerBaggie);
            remaining = 0;
        } else {
            // Subtract all baggies, continue with bottles
            remaining -= baggieUnits;
            item.baggieCount = 0;
            
            // Subtract from bottles
            let bottleUnits = item.bottleCount * item.unitsPerBottle;
            bottleUnits -= remaining;
            item.bottleCount = Math.floor(bottleUnits / item.unitsPerBottle);
            remaining = 0;
        }
    } else {
        // Supply item
        if (item.currentQuantity >= amount) {
            item.currentQuantity -= amount;
        } else {
            alert('Not enough units in stock!');
            return;
        }
    }

    inventory[itemIndex] = item;
    saveInventory(inventory);
    
    hideSubtractModal();
    showItemDetail(currentItemId); // Refresh detail view
    renderInventoryList(); // Refresh list view in background
}

// ===========================
// Form Screen: Add/Edit Item
// ===========================

function showAddItemForm() {
    isEditMode = false;
    currentItemId = null;
    
    document.getElementById('form-title').textContent = 'Add Item';
    document.getElementById('item-form').reset();
    
    // Show medicine fields by default
    toggleFormFields('Medicine');
    
    showScreen('form-screen');
}

function showEditItemForm() {
    isEditMode = true;
    
    const inventory = loadInventory();
    const item = inventory.find(i => i.id === currentItemId);
    
    if (!item) return;

    document.getElementById('form-title').textContent = 'Edit Item';
    
    // Populate form fields
    document.getElementById('category').value = item.category;
    document.getElementById('name').value = item.name;
    document.getElementById('description').value = item.description || '';
    document.getElementById('startingQuantity').value = item.startingQuantity;
    
    if (item.category === 'Medicine') {
        document.getElementById('drugName').value = item.drugName;
        document.getElementById('dosage').value = item.dosage;
        document.getElementById('form').value = item.form;
        document.getElementById('bottleCount').value = item.bottleCount;
        document.getElementById('unitsPerBottle').value = item.unitsPerBottle;
        document.getElementById('baggieCount').value = item.baggieCount;
        document.getElementById('unitsPerBaggie').value = item.unitsPerBaggie;
    } else {
        document.getElementById('currentQuantity').value = item.currentQuantity;
    }
    
    toggleFormFields(item.category);
    showScreen('form-screen');
}

function toggleFormFields(category) {
    const medicineFields = document.getElementById('medicine-fields');
    const supplyFields = document.getElementById('supply-fields');
    
    if (category === 'Medicine') {
        medicineFields.style.display = 'block';
        supplyFields.style.display = 'none';
        
        // Make medicine fields required
        document.getElementById('drugName').required = true;
        document.getElementById('dosage').required = true;
        document.getElementById('form').required = true;
        document.getElementById('currentQuantity').required = false;
    } else {
        medicineFields.style.display = 'none';
        supplyFields.style.display = 'block';
        
        // Make supply fields required
        document.getElementById('drugName').required = false;
        document.getElementById('dosage').required = false;
        document.getElementById('form').required = false;
        document.getElementById('currentQuantity').required = true;
    }
}

function saveItemForm() {
    const form = document.getElementById('item-form');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const startingQuantity = parseInt(document.getElementById('startingQuantity').value);

    let item = {
        id: isEditMode ? currentItemId : generateId(),
        category,
        name,
        description,
        startingQuantity
    };

    if (category === 'Medicine') {
        item.drugName = document.getElementById('drugName').value;
        item.dosage = document.getElementById('dosage').value;
        item.form = document.getElementById('form').value;
        item.bottleCount = parseInt(document.getElementById('bottleCount').value);
        item.unitsPerBottle = parseInt(document.getElementById('unitsPerBottle').value);
        item.baggieCount = parseInt(document.getElementById('baggieCount').value);
        item.unitsPerBaggie = parseInt(document.getElementById('unitsPerBaggie').value);
    } else {
        item.currentQuantity = parseInt(document.getElementById('currentQuantity').value);
    }

    const inventory = loadInventory();
    
    if (isEditMode) {
        const index = inventory.findIndex(i => i.id === currentItemId);
        if (index !== -1) {
            inventory[index] = item;
        }
    } else {
        inventory.push(item);
    }

    saveInventory(inventory);
    renderInventoryList();
    showScreen('main-screen');
}

function cancelForm() {
    if (currentScreen === 'form-screen') {
        if (currentItemId) {
            showItemDetail(currentItemId);
        } else {
            showScreen('main-screen');
        }
    }
}

// ===========================
// Utility Functions
// ===========================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// Event Listeners
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Main screen
    document.getElementById('add-item-btn').addEventListener('click', showAddItemForm);
    
    // Detail screen
    document.getElementById('back-btn').addEventListener('click', () => showScreen('main-screen'));
    document.getElementById('edit-item-btn').addEventListener('click', showEditItemForm);
    
    // Form screen
    document.getElementById('cancel-form-btn').addEventListener('click', cancelForm);
    document.getElementById('save-form-btn').addEventListener('click', saveItemForm);
    document.getElementById('category').addEventListener('change', (e) => {
        toggleFormFields(e.target.value);
    });
    
    // Subtract modal
    document.getElementById('cancel-subtract-btn').addEventListener('click', hideSubtractModal);
    document.getElementById('confirm-subtract-btn').addEventListener('click', confirmSubtraction);
    
    // Close modal on background click
    document.getElementById('subtract-modal').addEventListener('click', (e) => {
        if (e.target.id === 'subtract-modal') {
            hideSubtractModal();
        }
    });
    
    // Initial render
    renderInventoryList();
});
