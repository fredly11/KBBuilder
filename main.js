
import { addComponent } from './component.js';
import { validateCategory, validateItem } from './utils.js';
import { saveCategory, updateCategoryList, deleteCategory, deleteSelectedItems } from './categoryUtils.js';
import { saveNewItem } from './itemUtils.js';
import { displayCategoryFormat, updateCategory, startEditingSelectedItems } from './category.js';
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

// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Event listener for the "Add New Category" button
    document.getElementById('add-category').addEventListener('click', function() {
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
    document.getElementById('save-category').addEventListener('click', function() {
        saveCategory();
    });

    // Event listener for the "Add New Component" button
    document.getElementById('add-component').addEventListener('click', function() {
        const componentType = document.getElementById('component-type-select').value;
        addComponent(componentType);
    });

    // Initialize the category list
    updateCategoryList();

    // Add event listener to the category list
    const categoryList = document.getElementById('category-list');
    categoryList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            const clickedCategory = categories.find(category => category.name === event.target.textContent);
            if (clickedCategory) {
                handleCategoryClick(clickedCategory);
            }
        }
    });

    // Event listener for the "Delete Category" button
    document.getElementById('delete-category').addEventListener('click', function() {
        deleteCategory();
    });

    // Event listener for the "Update Category" button
    document.getElementById('update-category').addEventListener('click', function() {
        updateCategory();
    });
        // Event listener for the "Add New Item" button
        document.getElementById('add-item').addEventListener('click', function() {
            if (currentCategory) {
                displayNewItemForm(currentCategory);
            } else {
                alert('No category selected. Please select a category first.');
            }
        });
    
        // Event listener for the new item form submission
        document.getElementById('new-item-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (currentCategory) {
                saveNewItem(currentCategory);
            } else {
                alert('Error: No category selected.');
            }
        });
    
        // Event listener for the cancel button in the new item form
        document.getElementById('cancel-new-item').addEventListener('click', function() {
            switchView('main-view');
        });
        
        document.getElementById('delete-selected-items').addEventListener('click', function() {
            deleteSelectedItems();
        });

            // Event listener for the "Edit Selected Items" button
        document.getElementById('edit-selected-items').addEventListener('click', function() {
        startEditingSelectedItems();
        });

        
});

