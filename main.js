import { validateCategory, initializeMobileMenu, setupMobileMenuListeners } from './utils.js';
import { saveCategory, updateCategoryList, deleteCategory, deleteSelectedItems, addComponent, exportCategory, importCategory } from './categoryUtils.js';
import { handleNewItemSubmit, displayNewItemForm, saveEditedItem } from './itemUtils.js';
import { displayCategoryFormat, updateCategory, currentCategory, displayCardView, displayFilteredCategoryFormat } from './category.js';
// Function to switch views
export function switchView(viewId) {
    const views = document.querySelectorAll('#view-container > div');
    views.forEach(view => {
        view.style.display = 'none';
        view.style.opacity = '0';
    });

    const targetView = document.getElementById(viewId);
    targetView.style.display = 'block';
    void targetView.offsetHeight;
    targetView.classList.add('fade-in');
    
    setTimeout(() => {
        targetView.classList.remove('fade-in');
        targetView.style.opacity = '1';
    }, 300);
}

// Function to handle category list item clicks
export function handleCategoryClick(category) {
    switchView('main-view');
    displayCategoryFormat(category);
}

export let selectedItems = new Set();

// When an item is selected or deselected
export function toggleItemSelection(index) {
    if (selectedItems.has(index)) {
        selectedItems.delete(index);
    } else {
        selectedItems.add(index);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Event listener for the "Add New Category" button
    document.getElementById('add-category').addEventListener('click', () => {
        switchView('new-category-view');
        document.getElementById('category-view-title').textContent = 'New Category';
        document.getElementById('category-name').value = '';
        const componentsList = document.getElementById('components-list');
        componentsList.innerHTML = '';
        const nameComponent = document.createElement('div');
        nameComponent.className = 'component';
        nameComponent.innerHTML = `
            <hr>
            <p>Name</p>
            <span class="note">(Fixed component)</span>
        `;
        componentsList.appendChild(nameComponent);

        try {
            currentCategory = null;
            console.log('Variable is not const');
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('Assignment to constant variable')) {
                console.log('Variable is likely const');
            } else {
                console.error('Unexpected error:', error);
            }
        }
    });

    // Event listener for the "Save Category" button
    document.getElementById('save-category').addEventListener('click', () => {
        const categoryName = document.getElementById('category-name').value;
        const components = Array.from(document.querySelectorAll('#components-list .component')).map(component => {
            const type = component.querySelector('p').textContent.trim();
            if (type === 'Name') return null;

            const labelElement = component.querySelector('#component-label');
            const label = labelElement ? labelElement.value : '';
            const componentData = {
                type: type,
                label: label,
                options: []
            };

            if (['Selection', 'Checkbox'].includes(type)) {
                const optionsContainer = component.querySelector('#selection-options, #checkbox-options');
                if (optionsContainer) {
                    const options = optionsContainer.querySelectorAll('input[type="text"]');
                    options.forEach(option => {
                        if (option.value) {
                            componentData.options.push(option.value);
                        }
                    });
                }
            }

            return componentData;
        }).filter(component => component !== null);

        if (validateCategory()) {
            saveCategory(categoryName, components, currentCategory);
            switchView('main-view');
            currentCategory = null;
        }
    });

    // Event listener for the "Add New Component" button
    document.getElementById('add-component').addEventListener('click', () => {
        const componentType = document.getElementById('component-type-select').value;
        addComponent(componentType);
    });

    // Initialize the category list
    updateCategoryList();

    // Add event listener to the category list
    document.getElementById('category-list').addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            const clickedCategory = categories.find(category => category.name === event.target.textContent);
            if (clickedCategory) {
                handleCategoryClick(clickedCategory);
            }
        }
    });

    // Event listeners for category operations
    document.getElementById('delete-category').addEventListener('click', () => deleteCategory(currentCategory));
    document.getElementById('update-category').addEventListener('click', updateCategory);
    document.getElementById('add-item').addEventListener('click', () => {
        if (currentCategory) {
            displayNewItemForm(currentCategory);
        } else {
            alert('No category selected. Please select a category first.');
        }
    });

    document.getElementById('new-item-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (currentCategory) {
            // Remove all existing event listeners for submit
            this.removeEventListener('submit', handleNewItemSubmit);

            // Check if we are adding a new item or editing an existing one
            if (this.dataset.action === 'new') {
                handleNewItemSubmit(e, currentCategory);
            } else if (this.dataset.action === 'edit') {
                const itemIndex = parseInt(this.dataset.itemIndex);
                const formData = new FormData(this);
                saveEditedItem(currentCategory, itemIndex, formData);
                switchView('main-view');
            }
            selectedItems.clear();
            clearCheckboxes();
        } else {
            alert('No category selected.');
        }
    });

    document.getElementById('cancel-new-item').addEventListener('click', () => {
        switchView('main-view');
        selectedItems.clear();
        clearCheckboxes();
    });

    // Update delete-selected-items listener to pass selectedItems
    document.getElementById('delete-selected-items').addEventListener('click', () => {
        if (currentCategory) {
            if (selectedItems.size > 0) {
                    deleteSelectedItems(currentCategory, selectedItems);
                    displayCategoryFormat(currentCategory);
                    selectedItems.clear();
                    clearCheckboxes();
            } else {
                alert('No items selected for deletion.');
            }
        } else {
            alert('No category selected.');
        }
    });

    // Update edit-selected-item listener
    document.getElementById('edit-selected-items').textContent = 'Edit Selected Item';
    document.getElementById('edit-selected-items').addEventListener('click', () => {
        if (!currentCategory) {
            alert('No category selected.');
            return;
        }
        
        if (selectedItems.size === 1) {
            const itemIndex = Array.from(selectedItems)[0];
            const items = JSON.parse(localStorage.getItem(`${currentCategory.name}-items`)) || [];
            const item = items[itemIndex];
            displayNewItemForm(currentCategory, item, itemIndex);
            selectedItems.clear();
            clearCheckboxes();
        } else {
            alert('Please select exactly one item to edit.');
        }
    });

    // Event listeners for view switching
    document.getElementById('switch-to-cards').addEventListener('click', () => {
        if (currentCategory) {
            displayCardView(currentCategory);
        } else {
            alert('No category selected. Please select a category first.');
        }
    });
    document.getElementById('switch-to-list').addEventListener('click', () => {
        if (currentCategory) {
            displayCategoryFormat(currentCategory);
        } else {
            alert('No category selected. Please select a category first.');
        }
    });

       // Event listener for exporting a category
    document.getElementById('export-category').addEventListener('click', () => {
        if (currentCategory) {
            exportCategory(currentCategory);
        } else {
            alert('No category selected. Please select a category first.');
        }
    });

    // Event listener for importing a category
    document.getElementById('import-category').addEventListener('click', () => {
        if (confirm('Importing a category will add it to your list. Are you sure?')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    importCategory(file, (importedCategory) => {
                        alert(`Category "${importedCategory.name}" has been imported successfully.`);
                        handleCategoryClick(importedCategory);
                    });
                }
            };
            input.click();
        }
    });
        // Event listener for the filter button
        document.getElementById('filter-button').addEventListener('click', () => {
            const filterTerm = document.getElementById('filter-input').value;
            if (currentCategory) {
                if (filterTerm.trim() !== '') {
                    displayFilteredCategoryFormat(currentCategory, filterTerm);
                } else {
                    // If the filter term is empty, show all items
                    displayCategoryFormat(currentCategory);
                }
            } else {
                alert('No category selected. Please select a category first.');
            }
        });
        initializeMobileMenu();
        setupMobileMenuListeners(handleCategoryClick);
});

function clearCheckboxes() {
    const checkboxes = document.querySelectorAll('#category-view input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}