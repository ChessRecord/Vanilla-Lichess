/**
 * evalToggle.js - Toggles computer evaluation visibility on double-click
 * 
 * This script allows users to double-click on evaluation gauges to toggle 
 * the computer evaluation on/off without having to use the checkbox directly.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to the document to handle dynamically added .eval-gauge elements
    document.addEventListener('dblclick', (event) => {
        // Check if the clicked element has the class 'eval-gauge'
        if (event.target.matches('.eval-gauge')) {
            // Find the label for "analyse-toggle-ceval" and trigger a click
            const targetLabel = document.querySelector('label[for="analyse-toggle-ceval"]');
            if (targetLabel) {
                targetLabel.click();
            } else {
                console.error('Label for "analyse-toggle-ceval" not found.');
            }
        }
    });
});
