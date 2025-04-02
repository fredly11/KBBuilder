// itemUtils.js

import { validateItem } from './utils.js';
import { displayCategoryFormat } from './category.js';
import { switchView } from './main.js';


// Function to save a new item
export function saveNewItem(category, formData) {
    const itemData = {};
    for (const [key, value] of formData.entries()) {
        if (itemData[key]) {
            if (!Array.isArray(itemData[key])) {
                itemData[key] = [itemData[key]];
            }
            itemData[key].push(value);
        } else {
            itemData[key] = value;
        }
    }

    if (!validateItem(category, formData)) {
        return;
    }

    let items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
    items.push(itemData);
    localStorage.setItem(`${category.name}-items`, JSON.stringify(items));

    displayCategoryFormat(category);
}

// Function to save an edited item
// export function saveEditedItem(category, itemIndex, formData) {
//     const itemData = {};
//     for (const [key, value] of formData.entries()) {
//         if (itemData[key]) {
//             if (!Array.isArray(itemData[key])) {
//                 itemData[key] = [itemData[key]];
//             }
//             itemData[key].push(value);
//         } else {
//             itemData[key] = value;
//         }
//     }

//     if (!validateItem(category, formData)) {
//         return;
//     }

//     let items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
//     items[itemIndex] = itemData;
//     localStorage.setItem(`${category.name}-items`, JSON.stringify(items));

//     displayCategoryFormat(category);

//     // Clear form data after saving
//     const form = document.getElementById('new-item-form');
//     form.reset();
//     // Remove any data attributes that might hold onto previous edit information
//     form.removeAttribute('data-action');
//     form.removeAttribute('data-itemindex');
// }

// Function to display the form for editing or adding an item
export function displayEditItemForm(category, item = {}, isNew = false, itemIndex = null) {
    const newItemTitle = document.getElementById('new-item-title');
    newItemTitle.textContent = isNew ? `New Item for ${category.name}` : `Editing Item for ${category.name}`;

    const itemComponents = document.getElementById('item-components');
    itemComponents.innerHTML = '';

    category.components.forEach(component => {
        const componentDiv = document.createElement('div');
        componentDiv.className = 'form-component';

        const label = document.createElement('label');
        label.textContent = component.label;
        label.setAttribute('for', `component-${component.label.toLowerCase().replace(' ', '-')}`);
        componentDiv.appendChild(label);

        let inputElement;

        switch (component.type) {
            case 'Small Text Box':
            case 'Large Text Box':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = item[component.label] || '';
                break;
            case 'Selection':
                inputElement = document.createElement('select');
                component.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    if (item[component.label] === option) {
                        optionElement.selected = true;
                    }
                    inputElement.appendChild(optionElement);
                });
                break;
            case 'Checkbox':
                inputElement = document.createElement('div');
                component.options.forEach(option => {
                    const checkboxDiv = document.createElement('div');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = option;
                    checkbox.checked = Array.isArray(item[component.label]) && item[component.label].includes(option);
                    checkboxDiv.appendChild(checkbox);

                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.textContent = option;
                    checkboxLabel.setAttribute('for', checkbox.id);
                    checkboxDiv.appendChild(checkboxLabel);

                    inputElement.appendChild(checkboxDiv);
                });
                break;
            case 'Image':
                inputElement = document.createElement('input');
                inputElement.type = 'file';
                inputElement.accept = 'image/*';
                if (item[component.label]) {
                    const imgPreview = document.createElement('img');
                    imgPreview.src = URL.createObjectURL(item[component.label]);
                    imgPreview.style.maxWidth = '100px';
                    imgPreview.style.maxHeight = '50px';
                    componentDiv.appendChild(imgPreview);
                }
                break;
            case 'List':
                inputElement = document.createElement('textarea');
                inputElement.value = item[component.label] || '';
                break;
        }

        if (inputElement) {
            inputElement.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            inputElement.name = component.label;
            inputElement.required = true;
            componentDiv.appendChild(inputElement);
        }

        itemComponents.appendChild(componentDiv);
    });

    switchView('new-item-view');
    const form = document.getElementById('new-item-form');
    const submitButton = document.querySelector('#new-item-form button[type="submit"]');
    submitButton.textContent = isNew ? 'Save Item' : 'Save Changes';

    // Set the form's action based on whether it's new or edit
    form.dataset.action = isNew ? 'new' : 'edit';
    if (!isNew && itemIndex !== null) {
        form.dataset.itemIndex = itemIndex;
    }

    // Remove any existing event listeners
    form.removeEventListener('submit', handleNewItemSubmit);
    form.removeEventListener('submit', handleEditItemSubmit);

    if (isNew) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (category) {
                saveNewItem(category, new FormData(this));
            } else {
                alert('Error: No category selected.');
            }
        }, { once: true });
    } else {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (category) {
                const formData = new FormData(this);
                saveEditedItem(category, itemIndex, formData);
                switchView('main-view');
            } else {
                alert('Error: No category selected.');
            }
        }, { once: true });
    }
    
}

// Function to handle the submission of a new item
export function handleNewItemSubmit(event, category) {
    event.preventDefault();
    const form = document.getElementById('new-item-form');
    const formData = new FormData(form);
    
    if (category) {
        saveNewItem(category, formData);
    } else {
        alert('Error: No category selected.');
    }
}

// Function to display the form for a new item
export function displayNewItemForm(category) {
    displayEditItemForm(category, {}, true);
}


// export function editSingleSelectedItem(category, itemIndex) {
//     const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
//     const item = items[itemIndex];
//     displayEditItemForm(category, item, false, itemIndex);

//     const form = document.getElementById('new-item-form');
//     const submitButton = document.querySelector('#new-item-form button[type="submit"]');
//     submitButton.textContent = 'Save Changes';
//     // Ensure we're removing any old listeners before adding new ones
//     submitButton.removeEventListener('click', handleNewItemSubmit);
//     submitButton.addEventListener('click', () => {
//         const formData = new FormData(form);
//         saveEditedItem(category, itemIndex, formData);
//         switchView('main-view');
//     });

//     switchView('new-item-view');
// }

// Function to edit multiple selected items
// export function editMultipleSelectedItems(category, selectedItems) {
//     const itemsBeingEdited = Array.from(selectedItems).sort((a, b) => a - b);
//     let currentEditIndex = 0;

//     function displayCurrentItemForEditing() {
//         const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
//         const itemIndex = itemsBeingEdited[currentEditIndex];
//         const item = items[itemIndex];
        
//         displayEditItemForm(category, item, false, itemIndex);

//         const form = document.getElementById('new-item-form');
//         const submitButton = document.querySelector('#new-item-form button[type="submit"]');
        
//         submitButton.textContent = currentEditIndex < itemsBeingEdited.length - 1 ? 'Save This Item, Edit Next' : 'Save Item';
//         // Remove any existing click event listener
//         submitButton.removeEventListener('click', handleEditItemSubmit);
        
//         // Add new click event listener
//         submitButton.addEventListener('click', () => handleEditItemSubmit(category, itemIndex, itemsBeingEdited, currentEditIndex));
        
//         switchView('new-item-view');
//     }

//     function handleEditItemSubmit(category, itemIndex, itemsBeingEdited, currentEditIndex) {
//         const form = document.getElementById('new-item-form');
//         const formData = new FormData(form);
//         saveEditedItem(category, itemIndex, formData);

//         currentEditIndex++;
//         if (currentEditIndex < itemsBeingEdited.length) {
//             displayCurrentItemForEditing();
//         } else {
//             switchView('main-view');
//         }
//     }

//     // Start editing with the first item
//     displayCurrentItemForEditing();
// }
// Function to display an item for editing
// function displayItemForEditing(category, itemIndex, itemsBeingEdited, currentEditIndex) {
//     const items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
//     const item = items[itemIndex];

//     displayEditItemForm(category, item, false);

//     const form = document.getElementById('new-item-form');
//     const submitButton = document.querySelector('#new-item-form button[type="submit"]');
//     submitButton.textContent = currentEditIndex < itemsBeingEdited.length - 1 ? 'Save This Item, Edit Next' : 'Save Changes';
//     submitButton.removeEventListener('click', handleNewItemSubmit);
//     submitButton.addEventListener('click', () => handleEditItemSubmit(category, itemIndex, itemsBeingEdited, currentEditIndex));

//     switchView('new-item-view');
// }

// Function to handle the submission of an edited item
function handleEditItemSubmit(category, itemIndex, itemsBeingEdited, currentEditIndex) {
    const form = document.getElementById('new-item-form');
    const formData = new FormData(form);
    saveEditedItem(category, itemIndex, formData);

    currentEditIndex++;
    if (currentEditIndex < itemsBeingEdited.length) {
        displayItemForEditing(category, itemsBeingEdited[currentEditIndex], itemsBeingEdited, currentEditIndex);
    } else {
        switchView('main-view');
    }
}