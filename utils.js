// utils.js

// Function to validate the category
export function validateCategory() {
    const categoryName = document.getElementById('category-name').value.trim();
    if (categoryName.length < 3 || categoryName.length > 50) {
        alert('Category name must be between 3 and 50 characters.');
        return false;
    }

    const components = document.querySelectorAll('#components-list .component');
    if (components.length === 1) {
        alert('At least one component must be added to the category in addition to the required name component.');
        return false;
    }

    let isValid = true;

    components.forEach(component => {
        const type = component.querySelector('p').textContent.trim();
        if (type === 'Name') return; // Skip validation for the required name component

        const labelElement = component.querySelector('#component-label');
        const label = labelElement ? labelElement.value.trim() : '';
        if (label.length < 3 || label.length > 30) {
            alert(`Component label for ${type} must be between 3 and 30 characters.`);
            isValid = false;
        }

        if (type === 'Selection') {
            const optionsContainer = component.querySelector('#selection-options');
            if (optionsContainer) {
                const options = optionsContainer.querySelectorAll('input[type="text"]');
                const validOptions = Array.from(options).filter(option => option.value.trim() !== '');
                if (validOptions.length < 2) {
                    alert(`${type} must have at least 2 options.`);
                    isValid = false;
                }
            }
        }
    });

    return isValid;
}

// Function to validate the new item
export function validateItem(category, formData) {
    for (const component of category.components) {
        const value = formData.get(component.label);

        switch (component.type) {
            case 'Name':
            case 'Small Text Box':
            case 'Large Text Box':
                if (!value || value.trim() === '') {
                    alert(`The "${component.label}" field is required.`);
                    return false;
                }
                break;
            case 'Selection':
                if (!value || value === '') {
                    alert(`Please make a selection for "${component.label}".`);
                    return false;
                }
                break;
            case 'List':
                if (!value || value.trim() === '') {
                    alert(`The "${component.label}" field cannot be empty.`);
                    return false;
                }
                break;
            // Checkboxes and Images don't require validation
        }
    }

    return true;
}

export function initializeMobileMenu() {
    const mobileDropdown = document.getElementById('mobile-category-dropdown');
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    mobileDropdown.innerHTML = '<option value="">Select a Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        mobileDropdown.appendChild(option);
    });
}

export function setupMobileMenuListeners(handleCategoryClick) {
    const mobileDropdown = document.getElementById('mobile-category-dropdown');
    const mobileAddCategory = document.getElementById('mobile-add-category');

    mobileDropdown.addEventListener('change', (e) => {
        if (e.target.value) {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            const selectedCategory = categories.find(cat => cat.name === e.target.value);
            if (selectedCategory) {
                handleCategoryClick(selectedCategory);
            }
        }
    });

    mobileAddCategory.addEventListener('click', () => {
        document.getElementById('add-category').click();
    });
}