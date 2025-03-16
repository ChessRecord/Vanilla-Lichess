document.addEventListener('DOMContentLoaded', () => {
    const selector = 'div.follow-up a.fbt'; // Match `<a>` elements with the `fbt` class

    // Function to remove all matching elements
    function removeMatchingElements(nodeList) {
        nodeList.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) { // Ensure it's an element
                if (node.matches(selector) && node.textContent.trim().toUpperCase() === 'NEW OPPONENT') {
                    node.remove();
                } else {
                    // Check child elements if a container is added
                    node.querySelectorAll?.(selector).forEach(child => {
                        if (child.textContent.trim().toUpperCase() === 'NEW OPPONENT') {
                            child.remove();
                        }
                    });
                }
            }
        });
    }

    // MutationObserver callback
    const observerCallback = (mutationsList) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check all newly added nodes
                removeMatchingElements(mutation.addedNodes);
            }
        });
    };

    // Start observing the body
    if (document.body) {
        const observer = new MutationObserver(observerCallback);

        observer.observe(document.body, {
            childList: true,  // Detect new child nodes
            subtree: true     // Include all descendants
        });

        // Initial cleanup of existing elements
        document.querySelectorAll(selector).forEach(el => {
            if (el.textContent.trim().toUpperCase() === 'NEW OPPONENT') {
                el.remove();
            }
        });
        
    } else {
        console.error('document.body is not ready.');
    }
});
