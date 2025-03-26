// itemUtils.js
import { switchView} from './main.js';
// Function to save a new item
function saveNewItem(category, formData) {
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

    alert('Item saved successfully!');
    displayCategoryFormat(category);
}

// Function to save an edited item
function saveEditedItem(category, itemIndex, formData) {
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
    items[itemIndex] = itemData;
    localStorage.setItem(`${category.name}-items`, JSON.stringify(items));

    alert('Item updated successfully!');
    displayCategoryFormat(category);
}

export function displayEditItemForm(category, item = null, isNew = false) {
    const newItemTitle = document.getElementById('new-item-title');
    newItemTitle.textContent = item ? `Editing Item for ${category.name}` : `New Item for ${category.name}`;

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

        if (component.type === 'Small Text Box' || component.type === 'Large Text Box') {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            inputElement.name = component.label;
            inputElement.required = true;
            if (item) {
                inputElement.value = item[component.label] || '';
            }
        } else if (component.type === 'Selection') {
            inputElement = document.createElement('select');
            inputElement.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            inputElement.name = component.label;
            inputElement.required = true;
            component.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (item && item[component.label] === option) {
                    optionElement.selected = true;
                }
                inputElement.appendChild(optionElement);
            });
        } else if (component.type === 'Checkbox') {
            inputElement = document.createElement('div');
            component.options.forEach(option => {
                const checkboxDiv = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `component-${component.label.toLowerCase().replace(' ', '-')}-${option.toLowerCase().replace(' ', '-')}`;
                checkbox.name = component.label;
                checkbox.value = option;
                if (item && Array.isArray(item[component.label]) && item[component.label].includes(option)) {
                    checkbox.checked = true;
                }
                checkboxDiv.appendChild(checkbox);

                const checkboxLabel = document.createElement('label');
                checkboxLabel.textContent = option;
                checkboxLabel.setAttribute('for', checkbox.id);
                checkboxDiv.appendChild(checkboxLabel);

                inputElement.appendChild(checkboxDiv);
            });
        } else if (component.type === 'Image') {
            inputElement = document.createElement('input');
            inputElement.type = 'file';
            inputElement.accept = 'image/*';
            inputElement.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            inputElement.name = component.label;
            if (item && item[component.label]) {
                const imgPreview = document.createElement('img');
                imgPreview.src = URL.createObjectURL(item[component.label]);
                imgPreview.style.maxWidth = '100px';
                imgPreview.style.maxHeight = '50px';
                componentDiv.appendChild(imgPreview);
            }
        } else if (component.type === 'List') {
            inputElement = document.createElement('textarea');
            inputElement.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            inputElement.name = component.label;
            inputElement.required = true;
            if (item) {
                inputElement.value = item[component.label] || '';
            }
        }

        if (inputElement) {
            componentDiv.appendChild(inputElement);
        }

        itemComponents.appendChild(componentDiv);
    });

    switchView('new-item-view');

    // Update the form's submit button text based on whether we're creating or editing
    const submitButton = document.querySelector('#new-item-form button[type="submit"]');
    submitButton.textContent = item ? 'Save Changes' : 'Save Item';

    // If it's a new item, add the submit event listener
    if (isNew) {
        document.getElementById('new-item-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (currentCategory) {
                saveNewItem(currentCategory);
            } else {
                alert('Error: No category selected.');
            }
        });
    }
}


export function handleNewItemSubmit(event) {
    event.preventDefault();
    if (currentCategory) {
        saveNewItem(currentCategory);
    } else {
        alert('Error: No category selected.');
    }
}
export { saveNewItem, saveEditedItem };