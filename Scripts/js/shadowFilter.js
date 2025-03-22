document.addEventListener('DOMContentLoaded', () => {
    // Shadow filter settings
    const shadowSettings = {
        dx: '3',
        dy: '4',
        stdDeviation: '3',
        'flood-opacity': '0.55'
    };

    // Create and initialize the MutationObserver
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        modifyDropShadowFilter(node);
                    }
                });
            }
        });
    });

    // Function to modify <feDropShadow> values within <filter id="shadow">
    function modifyDropShadowFilter(node) {
        // Check if the node itself is the filter
        if (node.tagName === 'FILTER' && node.id === 'shadow') {
            updateDropShadow(node);
            return;
        }

        // Check child nodes
        node.querySelectorAll('filter#shadow').forEach(updateDropShadow);
    }

    function updateDropShadow(filterNode) {
        const dropShadow = filterNode.querySelector('feDropShadow');
        if (dropShadow) {
            // Apply all settings at once
            Object.entries(shadowSettings).forEach(([attr, value]) => {
                dropShadow.setAttribute(attr, value);
            });
            console.log('Modified feDropShadow attributes within filter#shadow');
        }
    }

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial modification for existing elements
    modifyDropShadowFilter(document.body);
});