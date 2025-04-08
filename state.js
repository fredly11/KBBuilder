export let currentCategory = null;

export function setCurrentCategory(category) {
    console.log('Setting currentCategory:', category);
    try {
        currentCategory = category;
        console.log('CurrentCategory after set:', currentCategory);
    } catch (error) {
        console.error('Error setting currentCategory:', error);
    }
}

export function getCurrentCategory() {
    return currentCategory;
}