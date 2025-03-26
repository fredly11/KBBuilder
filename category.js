// category.js
import { saveCategory, updateItemsForCategory, updateCategoryList, deleteCategory, deleteSelectedItems } from './categoryUtils.js';
import { saveNewItem, saveEditedItem, displayEditItemForm, handleNewItemSubmit} from './itemUtils.js';
import { switchView } from './main.js';

let currentCategory = null;
let selectedItems = new Set();
let itemsBeingEdited = [];
let currentEditIndex = 0;

// Function to display the format for the items in a category (grid view)
export function displayCategoryFormat(category) {
    currentCategory = category;
    const categoryView = document.getElementById('category-view');
    categoryView.innerHTML = '';

    const categoryTitle = document.getElementById('current-category-title');
    categoryTitle.textContent = category.name;

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(createHeaderCell('Select'));

    category.components.forEach(component => {
        headerRow.appendChild(createHeaderCell(component.label));
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];

    items.forEach((item, index) => {
        const row = document.createElement('tr');

        const selectCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedItems.add(index);
            } else {
                selectedItems.delete(index);
            }
        });
        selectCell.appendChild(checkbox);
        row.appendChild(selectCell);

        category.components.forEach(component => {
            const cell = document.createElement('td');
            let value = item[component.label];

            if (component.type === 'Small Text Box' || component.type === 'Large Text Box') {
                if (component.type === 'Large Text Box' && value.length > 50) {
                    value = value.slice(0, 50) + '...';
                }
                cell.textContent = value;
            } else if (component.type === 'Selection') {
                cell.textContent = value;
            } else if (component.type === 'Checkbox') {
                if (Array.isArray(value)) {
                    cell.textContent = value.join(', ');
                } else {
                    cell.textContent = value ? 'Yes' : 'No';
                }
            } else if (component.type === 'Image') {
                if (value) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(value);
                    img.style.maxWidth = '100px';
                    img.style.maxHeight = '50px';
                    cell.appendChild(img);
                } else {
                    cell.textContent = 'No image';
                }
            } else if (component.type === 'List') {
                const lines = value.split('\n');
                cell.textContent = lines.length > 3 ? lines.slice(0, 3).join('\n') + '...' : value;
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    categoryView.appendChild(table);
}

// Helper function to create table header cells
function createHeaderCell(text) {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.border = '1px solid #ddd';
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    return th;
}

// Function to update the category schema
export function updateCategory() {
    if (!currentCategory) {
        alert('No category selected to update.');
        return;
    }

    switchView('new-category-view');
    document.getElementById('category-view-title').textContent = 'Edit Category';
    document.getElementById('category-name').value = currentCategory.name;

    const componentsList = document.getElementById('components-list');
    componentsList.innerHTML = '';

    const nameComponent = document.createElement('div');
    nameComponent.className = 'component';
    nameComponent.innerHTML = `
        <hr>
        <p>Name</p>
        <span class="note">(Fixed component)</span>
        <label for="component-label">Label:</label>
        <input type="text" id="component-label" placeholder="Enter label" maxlength="30" value="Name" readonly>
    `;
    componentsList.appendChild(nameComponent);

    currentCategory.components.forEach(component => {
        if (component.type === 'Name') return;

        let newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>${component.type}</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30" value="${component.label}">
        `;

        if (component.type === 'Selection' || component.type === 'Checkbox') {
            newComponent.innerHTML += `
                <div id="${component.type.toLowerCase()}-options">
                    <!-- Options will be added here -->
                </div>
                <button class="add-option">Add Option</button>
            `;

            const optionsContainer = newComponent.querySelector(`#${component.type.toLowerCase()}-options`);
            component.options.forEach((option, index) => {
                const newOption = document.createElement('div');
                newOption.innerHTML = `
                    <label for="option-${index + 1}">Option ${index + 1}:</label>
                    <input type="text" id="option-${index + 1}" placeholder="Enter option" maxlength="50" value="${option}">
                `;
                optionsContainer.appendChild(newOption);
            });

            const addOptionButton = newComponent.querySelector('.add-option');
            addOptionButton.addEventListener('click', function() {
                const optionCount = optionsContainer.children.length + 1;
                const newOption = document.createElement('div');
                newOption.innerHTML = `
                    <label for="option-${optionCount}">Option ${optionCount}:</label>
                    <input type="text" id="option-${optionCount}" placeholder="Enter option" maxlength="50">
                `;
                optionsContainer.appendChild(newOption);
            });
        }

        newComponent.innerHTML += '<button class="delete-component">Delete</button>';

        const deleteButton = newComponent.querySelector('.delete-component');
        deleteButton.addEventListener('click', function() {
            componentsList.removeChild(newComponent);
        });

        componentsList.appendChild(newComponent);
    });
}

// Function to start editing selected items
export function startEditingSelectedItems() {
    if (!currentCategory) {
        alert('No category selected.');
        return;
    }

    if (selectedItems.size === 0) {
        alert('No items selected for editing.');
        return;
    }

    itemsBeingEdited = Array.from(selectedItems).sort((a, b) => a - b);
    currentEditIndex = 0;

    displayItemForEditing(currentCategory, itemsBeingEdited[currentEditIndex]);
}

// Function to display an item for editing
function displayItemForEditing(category, itemIndex) {
    const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
    const item = items[itemIndex];

    displayEditItemForm(category, item, false);

    const submitButton = document.querySelector('#new-item-form button[type="submit"]');
    submitButton.textContent = 'Save Changes';
    submitButton.removeEventListener('click', handleNewItemSubmit);
    submitButton.addEventListener('click', () => handleEditItemSubmit(category, itemIndex));

    switchView('new-item-view');
}

// Function to handle the submission of an edited item
function handleEditItemSubmit(category, itemIndex) {
    const form = document.getElementById('new-item-form');
    const formData = new FormData(form);
    saveEditedItem(category, itemIndex, formData);

    currentEditIndex++;
    if (currentEditIndex < itemsBeingEdited.length) {
        displayItemForEditing(category, itemsBeingEdited[currentEditIndex]);
    } else {
        switchView('main-view');
        itemsBeingEdited = [];
        currentEditIndex = 0;
    }
}