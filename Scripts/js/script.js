(function() {
  'use strict';
  
  // Elements to modify: [selector, newText, newHref]
  const changes = [
    ['nav#topnav span.play', 'Home'],
    ['nav#topnav a[href="/learn"]', 'Study', '/study']
  ];
  
  // Apply changes and return true only if ALL changes were successful
  function applyChanges(observer) {
    let foundCount = 0;
    
    for (const [selector, newText, newHref] of changes) {
      const el = document.querySelector(selector);
      if (el) {
        el.textContent = newText;
        if (newHref) el.href = newHref;
        foundCount++;
      }
    }
    
    // Only consider success if we found all elements
    const allFound = (foundCount === changes.length);
    
    // Disconnect observer if all changes were successful
    if (allFound && observer) {
      observer.disconnect();
    }
    
    return allFound;
  }
  
  function init() {
    // Try to apply changes immediately
    if (applyChanges()) return;
    
    // If not successful, set up observer
    const observer = new MutationObserver(() => {
      applyChanges(observer);
    });
    
    // Start observing - minimal configuration
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();