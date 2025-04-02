// item.js

import { validateItem } from './utils.js';
import { switchView, displayCategoryFormat } from './main.js';

// Function to display the form for adding a new item
export function displayNewItemForm(category) {
    const newItemTitle = document.getElementById('new-item-title');
    newItemTitle.textContent = `New Item for ${category.name}`;

    const itemComponents = document.getElementById('item-components');
    itemComponents.innerHTML = '';

    category.components.forEach(component => {
        const componentDiv = document.createElement('div');
        componentDiv.className = 'form-component';

        const label = document.createElement('label');
        label.textContent = component.label;
        label.setAttribute('for', `component-${component.label.toLowerCase().replace(' ', '-')}`);
        componentDiv.appendChild(label);

        switch (component.type) {
            case 'Small Text Box':
            case 'Large Text Box':
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
                input.name = component.label;
                componentDiv.appendChild(input);
                break;
            case 'Selection':
                const select = document.createElement('select');
                select.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
                select.name = component.label;
                component.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });
                componentDiv.appendChild(select);
                break;
            case 'Checkbox':
                component.options.forEach(option => {
                    const checkboxDiv = document.createElement('div');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `component-${component.label.toLowerCase().replace(' ', '-')}-${option.toLowerCase().replace(' ', '-')}`;
                    checkbox.name = component.label;
                    checkbox.value = option;
                    checkboxDiv.appendChild(checkbox);

                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.textContent = option;
                    checkboxLabel.setAttribute('for', checkbox.id);
                    checkboxDiv.appendChild(checkboxLabel);

                    componentDiv.appendChild(checkboxDiv);
                });
                break;
            case 'Image':
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
                fileInput.name = component.label;
                componentDiv.appendChild(fileInput);
                break;
            case 'List':
                const textarea = document.createElement('textarea');
                textarea.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
                textarea.name = component.label;
                componentDiv.appendChild(textarea);
                break;
        }

        itemComponents.appendChild(componentDiv);
    });

    switchView('new-item-view');
}

// Function to save a new item
export function saveNewItem(category) {
    const form = document.getElementById('new-item-form');
    const formData = new FormData(form);

    if (!validateItem(category, formData)) {
        return;
    }

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

    // Save the item to local storage
    let items = JSON.parse(localStorage.getItem(`${category.name}-items`)) || [];
    items.push(itemData);
    localStorage.setItem(`${category.name}-items`, JSON.stringify(items));

    // Switch back to the main view
    switchView('main-view');

    // Display a success message
    alert('Item saved successfully!');

    // Refresh the category view
    displayCategoryFormat(category);
}