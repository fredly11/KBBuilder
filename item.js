// Function to display the form for adding a new item
function displayNewItemForm(category) {
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

        if (component.type === 'Small Text Box' || component.type === 'Large Text Box') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            input.name = component.label;
            componentDiv.appendChild(input);
        } else if (component.type === 'Selection') {
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
        } else if (component.type === 'Checkbox') {
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
        } else if (component.type === 'Image') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            input.name = component.label;
            componentDiv.appendChild(input);
        } else if (component.type === 'List') {
            const textarea = document.createElement('textarea');
            textarea.id = `component-${component.label.toLowerCase().replace(' ', '-')}`;
            textarea.name = component.label;
            componentDiv.appendChild(textarea);
        }

        itemComponents.appendChild(componentDiv);
    });

    switchView('new-item-view');
}

// Function to save a new item
function saveNewItem(category) {
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