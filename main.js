import { validateCategory } from './utils.js';
import { saveCategory, updateCategoryList, deleteCategory, deleteSelectedItems, addComponent } from './categoryUtils.js';
import { handleNewItemSubmit, displayNewItemForm} from './itemUtils.js';
import { displayCategoryFormat, updateCategory, currentCategory, displayCardView} from './category.js';


// Function to switch views
export function switchView(viewId) {
    const views = document.querySelectorAll('#view-container > div');
    views.forEach(view => view.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
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

// Wait for the DOM to be fully loaded before attaching event listeners
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
        currentCategory = null;
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
    } else {
        alert('No category selected.');
    }
});
document.getElementById('cancel-new-item').addEventListener('click', () => switchView('main-view'));

// Update delete-selected-items listener to pass selectedItems
document.getElementById('delete-selected-items').addEventListener('click', () => {
    if (currentCategory) {
        deleteSelectedItems(currentCategory, selectedItems);
    } else {
        alert('No category selected.');
    }
    displayCategoryFormat(currentCategory);
});

// Update edit-selected-items listener to pass selectedItems
// document.getElementById('edit-selected-items').addEventListener('click', () => {
//     if (!currentCategory) {
//         alert('No category selected.');
//         return;
//     }
    
//     if (selectedItems.size === 0) {
//         alert('No items selected for editing.');
//     } else if (selectedItems.size === 1) {
//         // Edit the single selected item
//         const itemIndex = Array.from(selectedItems)[0];
//         editSingleSelectedItem(currentCategory, itemIndex);
//     } else {
//         // Edit multiple selected items
//         editMultipleSelectedItems(currentCategory, selectedItems);
//     }
// });



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
});