// Function to add a new component
export function addComponent(type) {
    const componentsList = document.getElementById('components-list');
    let newComponent;

    if (type === 'text-small') {
        newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>Small Text Box</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
            <button class="delete-component">Delete</button>
        `;
    } else if (type === 'text-large') {
        newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>Large Text Box</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
            <button class="delete-component">Delete</button>
        `;
    } else if (type === 'selection') {
        newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>Selection</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
            <div id="selection-options">
                <!-- Selection options will be added here -->
            </div>
            <button class="add-option">Add Option</button>
            <button class="delete-component">Delete</button>
        `;

        // Add event listener to the "Add Option" button
        const addOptionButton = newComponent.querySelector('.add-option');
        addOptionButton.addEventListener('click', function() {
            const selectionOptions = newComponent.querySelector('#selection-options');
            const optionCount = selectionOptions.children.length + 1;
            const newOption = document.createElement('div');
            newOption.innerHTML = `
                <label for="option-${optionCount}">Option ${optionCount}:</label>
                <input type="text" id="option-${optionCount}" placeholder="Enter option" maxlength="50">
            `;
            selectionOptions.appendChild(newOption);
        });
    } else if (type === 'checkbox') {
        newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>Checkbox</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
            <div id="checkbox-options">
                <!-- Checkbox options will be added here -->
            </div>
            <button class="add-option">Add Option</button>
            <button class="delete-component">Delete</button>
        `;

        // Add event listener to the "Add Option" button
        const addOptionButton = newComponent.querySelector('.add-option');
        addOptionButton.addEventListener('click', function() {
            const checkboxOptions = newComponent.querySelector('#checkbox-options');
            const optionCount = checkboxOptions.children.length + 1;
            const newOption = document.createElement('div');
            newOption.innerHTML = `
                <label for="option-${optionCount}">Option ${optionCount}:</label>
                <input type="text" id="option-${optionCount}" placeholder="Enter option" maxlength="50">
            `;
            checkboxOptions.appendChild(newOption);
        });
    } else if (type === 'image') {
        newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>Image</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
            <button class="delete-component">Delete</button>
        `;
    } else if (type === 'list') {
        newComponent = document.createElement('div');
        newComponent.className = 'component';
        newComponent.innerHTML = `
            <hr>
            <p>List</p>
            <label for="component-label">Label:</label>
            <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
            <button class="delete-component">Delete</button>
        `;
    } else {
        console.error('Unsupported component type:', type);
        return;
    }

    // Add event listener to the "Delete" button
    const deleteButton = newComponent.querySelector('.delete-component');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            componentsList.removeChild(newComponent);
        });
    }

    componentsList.appendChild(newComponent);
}