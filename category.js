// category.js
import { saveCategory, updateCategoryList, deleteCategory, deleteSelectedItems, truncateText } from './categoryUtils.js';
import { saveNewItem} from './itemUtils.js';
import { switchView, toggleItemSelection } from './main.js';

export let currentCategory = null;
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
        // Updated event listener to use the imported function
        checkbox.addEventListener('change', () => toggleItemSelection(index));
        selectCell.appendChild(checkbox);
        row.appendChild(selectCell);

        category.components.forEach(component => {
            const cell = document.createElement('td');
            let value = item[component.label];

            switch (component.type) {
                case 'Small Text Box':
                case 'Large Text Box':
                    if (component.type === 'Large Text Box' && value.length > 50) {
                        value = value.slice(0, 50) + '...';
                    }
                    cell.textContent = value;
                    break;
                case 'Selection':
                    cell.textContent = value;
                    break;
                case 'Checkbox':
                    cell.textContent = Array.isArray(value) ? value.join(', ') : (value ? 'Yes' : 'No');
                    break;
                case 'Image':
                    if (value) {
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(value);
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '50px';
                        cell.appendChild(img);
                    } else {
                        cell.textContent = 'No image';
                    }
                    break;
                case 'List':
                    const lines = value.split('\n');
                    cell.textContent = lines.length > 3 ? lines.slice(0, 3).join('\n') + '...' : value;
                    break;
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    categoryView.appendChild(table);
}


export function displayFilteredCategoryFormat(category, filterTerm) {
    currentCategory = category;
    const categoryView = document.getElementById('category-view');
    categoryView.innerHTML = '';

    const categoryTitle = document.getElementById('current-category-title');
    categoryTitle.textContent = category.name;

    const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
    // Filter items where the name starts with the filter term
    const filteredItems = items.filter(item => 
        item.Name && item.Name.toLowerCase().startsWith(filterTerm.toLowerCase())
    );

    // If no items match the filter, display a message
    if (filteredItems.length === 0) {
        categoryView.innerHTML = '<p>No items found matching the filter.</p>';
        return;
    }

    // Create table for filtered items
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

    filteredItems.forEach((item, index) => {
        const row = document.createElement('tr');

        const selectCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => toggleItemSelection(index));
        selectCell.appendChild(checkbox);
        row.appendChild(selectCell);

        category.components.forEach(component => {
            const cell = document.createElement('td');
            let value = item[component.label];

            switch (component.type) {
                case 'Small Text Box':
                case 'Large Text Box':
                    cell.textContent = value;
                    break;
                case 'Selection':
                    cell.textContent = value;
                    break;
                case 'Checkbox':
                    cell.textContent = Array.isArray(value) ? value.join(', ') : (value ? 'Yes' : 'No');
                    break;
                case 'Image':
                    if (value) {
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(value);
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '50px';
                        cell.appendChild(img);
                    } else {
                        cell.textContent = 'No image';
                    }
                    break;
                case 'List':
                    const lines = value.split('\n');
                    cell.textContent = lines.length > 3 ? lines.slice(0, 3).join('\n') + '...' : value;
                    break;
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

    // Add fixed 'Name' component
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

    // Add other components
    currentCategory.components.forEach(component => {
        if (component.type === 'Name') return;

        const newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>${component.type}</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30" value="${component.label}">
        `;

        if (['Selection', 'Checkbox'].includes(component.type)) {
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
            addOptionButton.addEventListener('click', () => {
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
        deleteButton.addEventListener('click', () => componentsList.removeChild(newComponent));

        componentsList.appendChild(newComponent);
    });
}

// Function to create a card for an item
function createCard(item, components) {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = item.Name;
    card.appendChild(title);

    const content = document.createElement('div');
    content.className = 'card-content';

    let contentHeight = 0;
    let showEllipsis = false;

    components.forEach(component => {
        if (component.label !== 'Name') {
            const componentDiv = document.createElement('div');
            componentDiv.className = 'card-component';
            componentDiv.innerHTML = `<strong>${component.label}:</strong> ${item[component.label] || 'N/A'}`;
            
            // Check if adding this component would exceed the max height
            const tempHeight = contentHeight + componentDiv.offsetHeight;
            if (tempHeight <= 200) {
                content.appendChild(componentDiv);
                contentHeight = tempHeight;
            } else {
                // If it's a large text box, truncate it
                if (component.type === 'Large Text Box') {
                    const text = item[component.label] || '';
                    const truncatedText = truncateText(text, 200 - contentHeight);
                    componentDiv.innerHTML = `<strong>${component.label}:</strong> ${truncatedText}`;
                    content.appendChild(componentDiv);
                    showEllipsis = true;
                }
                return; // Stop adding components
            }
        }
    });

    if (showEllipsis) {
        content.classList.add('show-ellipsis');
    }

    card.appendChild(content);
    return card;
}

// Function to display items in card view
export function displayCardView(category) {
    const categoryView = document.getElementById('category-view');
    categoryView.innerHTML = ''; // Clear previous content

    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
    items.forEach(item => {
        const card = createCard(item, category.components);
        cardContainer.appendChild(card);
    });

    categoryView.appendChild(cardContainer);
}