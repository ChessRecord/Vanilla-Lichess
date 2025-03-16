document.addEventListener('DOMContentLoaded', function() {
  let activeElement = null;

  document.addEventListener('click', function(event) {
    // Check if the clicked element is a <piece> element
    const target = event.target;
    if (target.tagName.toLowerCase() === 'piece') {
      // Remove the class from the previously active element
      if (activeElement) {
        activeElement.classList.remove('piece-outline');
      }

      // Apply the class to the clicked <piece> element
      target.classList.add('piece-outline');
      activeElement = target;
    } else {
      // Remove the class if clicking somewhere else
      if (activeElement) {
        activeElement.classList.remove('piece-outline');
        activeElement = null;
      }
    }
  });
});