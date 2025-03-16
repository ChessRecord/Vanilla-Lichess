document.addEventListener('DOMContentLoaded', () => {
    function applyGradient(element) {
        // Use setProperty to properly apply !important
        element.style.setProperty('background', 'none', 'important')
        element.style.setProperty('border-radius', '50px', 'important')
        element.style.setProperty('border', '5px solid #ffffff88', 'important');
        // Add a class we can use to verify the script ran
        element.classList.add('gradient-applied');
    }

    // Create a MutationObserver instance to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Check added nodes
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added element has both required classes
                    if (node.classList.contains('move-dest') && 
                        node.classList.contains('oc')) {
                        applyGradient(node);
                    }
                    
                    // Also check any matching descendants of the added node
                    node.querySelectorAll('.move-dest.oc').forEach(applyGradient);
                }
            });
        });
    });

    // Configure and start the observer
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Handle any existing elements when the script loads
    document.querySelectorAll('.move-dest.oc').forEach(applyGradient);
});