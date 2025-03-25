// Function to switch views
function switchView(viewId) {
    const views = document.querySelectorAll('#view-container > div');
    views.forEach(view => view.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
}

// Event listener for the "Add New Category" button
document.getElementById('add-category').addEventListener('click', function() {
    switchView('new-category-view');
});

// Event listener for the "Save Category" button (placeholder)
document.getElementById('save-category').addEventListener('click', function() {
    // TODO: Implement saving the new category
    switchView('main-view');
});

// Event listener for the "Add New Component" button
document.getElementById('add-component').addEventListener('click', function() {
    const componentType = document.getElementById('component-type-select').value;
    console.log('Adding new component of type:', componentType);
    // TODO: Implement adding a new component based on the selected type
});