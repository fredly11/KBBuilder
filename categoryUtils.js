// categoryUtils.js

// Function to save the category to local storage
function saveCategory(categoryName, components) {
    const newCategorySchema = {
        name: categoryName,
        components: [
            {
                type: 'Small Text Box',
                label: 'Name',
                options: []
            },
            ...components
        ]
    };

    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    if (currentCategory) {
        categories = categories.map(category => {
            if (category.name === currentCategory.name) {
                return newCategorySchema;
            }
            return category;
        });
    } else {
        categories.push(newCategorySchema);
    }
    localStorage.setItem('categories', JSON.stringify(categories));

    updateItemsForCategory(newCategorySchema);
    updateCategoryList();
    currentCategory = null;
}

// Function to update items when the category schema changes
function updateItemsForCategory(newCategorySchema) {
    const itemsKey = `${newCategorySchema.name}-items`;
    let items = JSON.parse(localStorage.getItem(itemsKey)) || [];

    items = items.map(item => {
        const updatedItem = {};

        newCategorySchema.components.forEach(component => {
            if (item.hasOwnProperty(component.label)) {
                updatedItem[component.label] = item[component.label];
            } else {
                if (component.type === 'Small Text Box' || component.type === 'Large Text Box' || component.type === 'List') {
                    updatedItem[component.label] = '[empty]';
                } else if (component.type === 'Selection') {
                    updatedItem[component.label] = component.options.length > 0 ? component.options[0] : '';
                } else if (component.type === 'Checkbox') {
                    updatedItem[component.label] = [];
                } else if (component.type === 'Image') {
                    updatedItem[component.label] = null;
                }
            }
        });

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
function updateCategoryList() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.textContent = category.name;
        categoryList.appendChild(listItem);
    });
}

// Function to delete the current category
function deleteCategory() {
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
        const categoryTitle = document.getElementById('current-category-title');
        categoryTitle.textContent = '';

        updateCategoryList();
        currentCategory = null;
    }
}

// Function to delete selected items
function deleteSelectedItems() {
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
        displayCategoryFormat(currentCategory);
    }
}

export { saveCategory, updateItemsForCategory, updateCategoryList, deleteCategory, deleteSelectedItems };