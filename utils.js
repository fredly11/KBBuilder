// Function to validate the category
export function validateCategory() {
    const categoryName = document.getElementById('category-name').value;
    if (!categoryName || categoryName.length < 3 || categoryName.length > 50) {
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
        const label = labelElement ? labelElement.value : '';
        if (!label || label.length < 3 || label.length > 30) {
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
        if (component.type === 'Name') {
            const nameValue = formData.get(component.label);
            if (!nameValue || nameValue.trim() === '') {
                alert('Name field is required.');
                return false;
            }
        } else if (component.type === 'Small Text Box' || component.type === 'Large Text Box') {
            const value = formData.get(component.label);
            if (!value || value.trim() === '') {
                alert(`The "${component.label}" field is required.`);
                return false;
            }
        } else if (component.type === 'Selection') {
            const value = formData.get(component.label);
            if (!value || value === '') {
                alert(`Please make a selection for "${component.label}".`);
                return false;
            }
        } else if (component.type === 'List') {
            const value = formData.get(component.label);
            if (!value || value.trim() === '') {
                alert(`The "${component.label}" field cannot be empty.`);
                return false;
            }
        }
        // Checkboxes and Images don't require validation
    }

    return true;
}