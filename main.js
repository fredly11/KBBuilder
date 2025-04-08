import { validateCategory, initializeMobileMenu, setupMobileMenuListeners } from './utils.js';
import { saveCategory, updateCategoryList, deleteCategory, deleteSelectedItems, addComponent, exportCategory, importCategory } from './categoryUtils.js';
import { handleNewItemSubmit, displayNewItemForm, saveEditedItem } from './itemUtils.js';
import { displayCategoryFormat, updateCategory, displayCardView, displayFilteredCategoryFormat } from './category.js';
import { currentCategory, setCurrentCategory, getCurrentCategory } from './state.js';

export function switchView(viewId) {
    try {
        if (!viewId) throw new Error('View ID is required');
        const views = document.querySelectorAll('#view-container > div');
        if (!views.length) throw new Error('No views found in container');

        views.forEach(view => {
            view.style.display = 'none';
            view.style.opacity = '0';
        });

        const targetView = document.getElementById(viewId);
        if (!targetView) throw new Error(`View with ID "${viewId}" not found`);

        targetView.style.display = 'block';
        void targetView.offsetHeight;
        targetView.classList.add('fade-in');
        
        setTimeout(() => {
            targetView.classList.remove('fade-in');
            targetView.style.opacity = '1';
        }, 300);
    } catch (error) {
        console.error('Error in switchView:', error);
        alert('Failed to switch view. Please try again.');
    }
}

export function handleCategoryClick(category) {
    try {
        if (!category) throw new Error('Category is required');
        switchView('main-view');
        displayCategoryFormat(category);
    } catch (error) {
        console.error('Error in handleCategoryClick:', error);
        alert('Failed to load category. Please try again.');
    }
}

export let selectedItems = new Set();

export function toggleItemSelection(index) {
    try {
        if (typeof index !== 'number') throw new Error('Index must be a number');
        if (selectedItems.has(index)) {
            selectedItems.delete(index);
        } else {
            selectedItems.add(index);
        }
    } catch (error) {
        console.error('Error in toggleItemSelection:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        document.getElementById('add-category').addEventListener('click', () => {
            try {
                console.log('Add category clicked');
                console.log('Current category before:', getCurrentCategory());
                
                switchView('new-category-view');
                const categoryViewTitle = document.getElementById('category-view-title');
                const categoryName = document.getElementById('category-name');
                const componentsList = document.getElementById('components-list');
                
                if (!categoryViewTitle || !categoryName || !componentsList) {
                    throw new Error('Required elements not found');
                }
        
                categoryViewTitle.textContent = 'New Category';
                categoryName.value = '';
                componentsList.innerHTML = '';
                
                const nameComponent = document.createElement('div');
                nameComponent.className = 'component';
                nameComponent.innerHTML = `
                    <hr>
                    <p>Name</p>
                    <span class="note">(Fixed component)</span>
                `;
                componentsList.appendChild(nameComponent);
        
                setCurrentCategory(null);
                console.log('Current category after:', getCurrentCategory());
            } catch (error) {
                console.error('Error in add category handler:', error);
                alert('Failed to create new category. Please try again.');
            }
        });

        document.getElementById('save-category').addEventListener('click', () => {
            try {
                console.log('Save category clicked');
                console.log('Current category before save:', currentCategory);
        
                const categoryName = document.getElementById('category-name').value;
                if (!categoryName) throw new Error('Category name is required');
        
                const components = Array.from(document.querySelectorAll('#components-list .component')).map(component => {
                    try {
                        const type = component.querySelector('p').textContent.trim();
                        if (type === 'Name') return null;
        
                        const labelElement = component.querySelector('#component-label');
                        if (!labelElement) throw new Error(`Label element not found for component type: ${type}`);
                        
                        const label = labelElement.value;
                        console.log('Processing component:', { type, label });
        
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
                            console.log(`Options for ${type}:`, componentData.options);
                        }
        
                        return componentData;
                    } catch (error) {
                        console.error('Error processing component:', error);
                        return null;
                    }
                }).filter(component => component !== null);
        
                console.log('Processed components:', components);
        
                if (validateCategory()) {
                    console.log('Category validation passed');
                    const saved = saveCategory(categoryName, components, currentCategory);
                    console.log('Save result:', saved);
                    
                    if (saved) {
                        console.log('Category saved successfully');
                        switchView('main-view');
                        currentCategory = null;
                        console.log('Current category after save:', currentCategory);
                    } else {
                        console.log('Category save failed');
                        alert('Failed to save category. Please try again.');
                    }
                } else {
                    console.log('Category validation failed');
                }
            } catch (error) {
                console.error('Error in save category handler:', error);
            }
        });
        document.getElementById('add-component').addEventListener('click', () => {
            try {
                const componentType = document.getElementById('component-type-select').value;
                if (!componentType) throw new Error('Component type is required');
                addComponent(componentType);
            } catch (error) {
                console.error('Error adding component:', error);
                alert('Failed to add component. Please try again.');
            }
        });

        try {
            updateCategoryList();
        } catch (error) {
            console.error('Error updating category list:', error);
            alert('Failed to load categories. Please refresh the page.');
        }

        document.getElementById('category-list').addEventListener('click', (event) => {
            try {
                if (event.target.tagName === 'LI') {
                    const categories = JSON.parse(localStorage.getItem('categories')) || [];
                    const clickedCategory = categories.find(category => category.name === event.target.textContent);
                    if (!clickedCategory) throw new Error('Category not found');
                    handleCategoryClick(clickedCategory);
                }
            } catch (error) {
                console.error('Error handling category click:', error);
                alert('Failed to load selected category. Please try again.');
            }
        });

        document.getElementById('delete-category').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                deleteCategory(currentCategory);
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category. Please try again.');
            }
        });

        document.getElementById('update-category').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                updateCategory();
            } catch (error) {
                console.error('Error updating category:', error);
            }
        });

        document.getElementById('add-item').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                displayNewItemForm(currentCategory);
            } catch (error) {
                console.error('Error displaying new item form:', error);
            }
        });

        document.getElementById('new-item-form').addEventListener('submit', function(e) {
            try {
                e.preventDefault();
                if (!currentCategory) throw new Error('No category selected');

                this.removeEventListener('submit', handleNewItemSubmit);

                if (this.dataset.action === 'new') {
                    handleNewItemSubmit(e, currentCategory);
                } else if (this.dataset.action === 'edit') {
                    const itemIndex = parseInt(this.dataset.itemIndex);
                    if (isNaN(itemIndex)) throw new Error('Invalid item index');
                    const formData = new FormData(this);
                    saveEditedItem(currentCategory, itemIndex, formData);
                    switchView('main-view');
                }
                selectedItems.clear();
                clearCheckboxes();
            } catch (error) {
                console.error('Error handling form submission:', error);
            }
        });

        document.getElementById('cancel-new-item').addEventListener('click', () => {
            try {
                switchView('main-view');
                selectedItems.clear();
                clearCheckboxes();
            } catch (error) {
                console.error('Error canceling new item:', error);
            }
        });

        document.getElementById('delete-selected-items').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                if (selectedItems.size === 0) throw new Error('No items selected');

                deleteSelectedItems(currentCategory, selectedItems);
                displayCategoryFormat(currentCategory);
                selectedItems.clear();
                clearCheckboxes();
            } catch (error) {
                console.error('Error deleting selected items:', error);
                if (error.message === 'No category selected') {
                    alert('No category selected.');
                } else if (error.message === 'No items selected') {
                    alert('No items selected for deletion.');
                } else {
                }
            }
        });
        document.getElementById('edit-selected-items').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                if (selectedItems.size !== 1) throw new Error('Must select exactly one item');

                const itemIndex = Array.from(selectedItems)[0];
                const items = JSON.parse(localStorage.getItem(`${currentCategory.name}-items`)) || [];
                const item = items[itemIndex];
                if (!item) throw new Error('Selected item not found');

                displayNewItemForm(currentCategory, item, itemIndex);
                selectedItems.clear();
                clearCheckboxes();
            } catch (error) {
                console.error('Error editing selected item:', error);
                if (error.message === 'No category selected') {
                    alert('No category selected.');
                } else if (error.message === 'Must select exactly one item') {
                    alert('Please select exactly one item to edit.');
                } else {
                }
            }
        });

        document.getElementById('switch-to-cards').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                displayCardView(currentCategory);
            } catch (error) {
                console.error('Error switching to card view:', error);
                alert('No category selected. Please select a category first.');
            }
        });

        document.getElementById('switch-to-list').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                displayCategoryFormat(currentCategory);
            } catch (error) {
                console.error('Error switching to list view:', error);
                alert('No category selected. Please select a category first.');
            }
        });

        document.getElementById('export-category').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                exportCategory(currentCategory);
            } catch (error) {
                console.error('Error exporting category:', error);
                alert('No category selected. Please select a category first.');
            }
        });

        document.getElementById('import-category').addEventListener('click', () => {
            try {
                if (!confirm('Importing a category will add it to your list. Are you sure?')) {
                    return;
                }

                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                
                input.onchange = (e) => {
                    try {
                        const file = e.target.files[0];
                        if (!file) throw new Error('No file selected');
                        
                        importCategory(file, (importedCategory) => {
                            try {
                                if (!importedCategory) throw new Error('Import failed');
                                alert(`Category "${importedCategory.name}" has been imported successfully.`);
                                handleCategoryClick(importedCategory);
                            } catch (error) {
                                console.error('Error handling imported category:', error);
                                alert('Failed to process imported category. Please try again.');
                            }
                        });
                    } catch (error) {
                        console.error('Error importing file:', error);
                        alert('Failed to import file. Please try again.');
                    }
                };
                
                input.click();
            } catch (error) {
                console.error('Error initiating import:', error);
                alert('Failed to start import process. Please try again.');
            }
        });

        document.getElementById('filter-button').addEventListener('click', () => {
            try {
                if (!currentCategory) throw new Error('No category selected');
                
                const filterTerm = document.getElementById('filter-input').value;
                if (filterTerm.trim() !== '') {
                    displayFilteredCategoryFormat(currentCategory, filterTerm);
                } else {
                    displayCategoryFormat(currentCategory);
                }
            } catch (error) {
                console.error('Error filtering items:', error);
                alert('No category selected. Please select a category first.');
            }
        });

        try {
            initializeMobileMenu();
            setupMobileMenuListeners(handleCategoryClick);
        } catch (error) {
            console.error('Error initializing mobile menu:', error);
            alert('Failed to initialize mobile menu. Some features may be limited.');
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
});

function clearCheckboxes() {
    try {
        const checkboxes = document.querySelectorAll('#category-view input[type="checkbox"]');
        if (!checkboxes) throw new Error('No checkboxes found');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    } catch (error) {
        console.error('Error in clearCheckboxes:', error);
    }
}