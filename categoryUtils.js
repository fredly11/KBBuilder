// categoryUtils.js

// Function to save the category to local storage
export function saveCategory(categoryName, components, currentCategory) {
    // Ensure components is an array
    const validComponents = Array.isArray(components) ? components : [];

    const newCategorySchema = {
        name: categoryName,
        components: [
            {
                type: 'Small Text Box',
                label: 'Name',
                options: []
            },
            ...validComponents
        ]
    };

    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    if (currentCategory) {
        categories = categories.map(category => category.name === currentCategory.name ? newCategorySchema : category);
    } else {
        categories.push(newCategorySchema);
    }
    localStorage.setItem('categories', JSON.stringify(categories));

    updateItemsForCategory(newCategorySchema);
    updateCategoryList();
}

// Function to update items when the category schema changes
export function updateItemsForCategory(newCategorySchema) {
    const itemsKey = `${newCategorySchema.name}-items`;
    let items = JSON.parse(localStorage.getItem(itemsKey)) || [];

    items = items.map(item => {
        const updatedItem = {};

        newCategorySchema.components.forEach(component => {
            if (item.hasOwnProperty(component.label)) {
                updatedItem[component.label] = item[component.label];
            } else {
                switch (component.type) {
                    case 'Small Text Box':
                    case 'Large Text Box':
                    case 'List':
                        updatedItem[component.label] = '[empty]';
                        break;
                    case 'Selection':
                        updatedItem[component.label] = component.options.length > 0 ? component.options[0] : '';
                        break;
                    case 'Checkbox':
                        updatedItem[component.label] = [];
                        break;
                    case 'Image':
                        updatedItem[component.label] = null;
                        break;
                }
            }
        });

        // Remove any properties from the item that are not in the new schema
        Object.keys(item).forEach(key => {
            if (!newCategorySchema.components.some(component => component.label === key)) {
                delete updatedItem[key];
            }
        });

        return updatedItem;
    });

    localStorage.setItem(itemsKey, JSON.stringify(items));
}

// Function to update the category list in the sidebar
export function updateCategoryList() {
    const categoryList = document.getElementById('category-list');
    const mobileDropdown = document.getElementById('mobile-category-dropdown');
    
    categoryList.innerHTML = '';
    mobileDropdown.innerHTML = '<option value="">Select a Category</option>';

    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories.forEach(category => {
        // Update sidebar list
        const listItem = document.createElement('li');
        listItem.textContent = category.name;
        categoryList.appendChild(listItem);

        // Update mobile dropdown
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        mobileDropdown.appendChild(option);
    });
}

// Function to delete the current category
export function deleteCategory(currentCategory) {
    if (!currentCategory) {
        alert('No category selected to delete.');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete the category "${currentCategory.name}"? This action cannot be undone.`);
    if (confirmDelete) {
        let categories = JSON.parse(localStorage.getItem('categories')) || [];
        categories = categories.filter(category => category.name !== currentCategory.name);
        localStorage.setItem('categories', JSON.stringify(categories));

        localStorage.removeItem(`${currentCategory.name}-items`);

        const categoryView = document.getElementById('category-view');
        categoryView.innerHTML = '';
        document.getElementById('current-category-title').textContent = '';

        updateCategoryList();
    }
}

// Function to delete selected items
export function deleteSelectedItems(currentCategory, selectedItems) {
    if (!currentCategory) {
        alert('No category selected.');
        return;
    }

    if (selectedItems.size === 0) {
        alert('No items selected for deletion.');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete ${selectedItems.size} item(s)? This action cannot be undone.`);
    if (confirmDelete) {
        let items = JSON.parse(localStorage.getItem(`${currentCategory.name}-items`)) || [];
        const newItems = items.filter((_, index) => !selectedItems.has(index));
        localStorage.setItem(`${currentCategory.name}-items`, JSON.stringify(newItems));

        selectedItems.clear();
    }

}

// Function to truncate text
export function truncateText(text, maxHeight) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-1000px';
    div.style.top = '-1000px';
    div.style.width = '270px'; // Width of card content area
    document.body.appendChild(div);

    let truncated = text;
    while (div.offsetHeight > maxHeight && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        div.textContent = truncated + '...';
    }

    document.body.removeChild(div);
    return truncated + (truncated.length < text.length ? '...' : '');
}

export function addComponent(type) {
    const componentsList = document.getElementById('components-list');
    let newComponent;

    switch (type) {
        case 'text-small':
            newComponent = createComponent('Small Text Box');
            break;
        case 'text-large':
            newComponent = createComponent('Large Text Box');
            break;
        case 'selection':
            newComponent = createComponent('Selection', 'selection-options');
            addOptionListener(newComponent, 'selection-options');
            break;
        case 'checkbox':
            newComponent = createComponent('Checkbox', 'checkbox-options');
            addOptionListener(newComponent, 'checkbox-options');
            break;
        case 'image':
            newComponent = createComponent('Image');
            break;
        case 'list':
            newComponent = createComponent('List');
            break;
        default:
            console.error('Unsupported component type:', type);
            return;
    }

    addDeleteListener(newComponent);
    componentsList.appendChild(newComponent);
}

// Helper function to create a basic component structure
function createComponent(type, optionsId = null) {
    const component = document.createElement('div');
    component.className = 'component';
    component.innerHTML = `
        <hr>
        <p>${type}</p>
        <label for="component-label">Label:</label>
        <input type="text" id="component-label" placeholder="Enter label" maxlength="30">
        ${optionsId ? `<div id="${optionsId}"></div><button class="add-option">Add Option</button>` : ''}
        <button class="delete-component">Delete</button>
    `;
    return component;
}

// Helper function to add option listener for selection and checkbox
function addOptionListener(component, optionsId) {
    const addOptionButton = component.querySelector('.add-option');
    addOptionButton.addEventListener('click', function() {
        const optionsContainer = component.querySelector(`#${optionsId}`);
        const optionCount = optionsContainer.children.length + 1;
        const newOption = document.createElement('div');
        newOption.innerHTML = `
            <label for="option-${optionCount}">Option ${optionCount}:</label>
            <input type="text" id="option-${optionCount}" placeholder="Enter option" maxlength="50">
        `;
        optionsContainer.appendChild(newOption);
    });
}

// Helper function to add delete listener
function addDeleteListener(component) {
    const deleteButton = component.querySelector('.delete-component');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const componentsList = document.getElementById('components-list');
            componentsList.removeChild(component);
        });
    }
}

export function exportCategory(category) {
    const categoryData = {
        schema: category,
        items: JSON.parse(localStorage.getItem(`${category.name}-items`)) || []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categoryData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${category.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Function to import category from JSON file
export function importCategory(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const categoryData = JSON.parse(event.target.result);
            if (!categoryData.schema || !categoryData.items) {
                throw new Error('Invalid category data format');
            }

            let categories = JSON.parse(localStorage.getItem('categories')) || [];
            // Check if category with same name exists
            if (categories.some(cat => cat.name === categoryData.schema.name)) {
                alert(`A category with the name "${categoryData.schema.name}" already exists. Please rename the imported category or delete the existing one.`);
                return;
            }

            // Add new category
            categories.push(categoryData.schema);
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem(`${categoryData.schema.name}-items`, JSON.stringify(categoryData.items));

            // Update the category list
            updateCategoryList();
            callback(categoryData.schema);
        } catch (error) {
            alert('Error importing category: ' + error.message);
        }
    };
    reader.readAsText(file);
}

