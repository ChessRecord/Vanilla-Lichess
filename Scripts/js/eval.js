(function() {
  /**
   * Evaluation Gauge Controller
   * Displays live evaluation values from <pearl> elements in #evaluation elements
   */
  
  // Configuration constants
  const CONFIG = {
    selectors: {
      gauge: '.eval-gauge',
      pearl: 'pearl',
      evaluation: '#evaluation'
    },
    styles: {
      positive: { color: '#3c3c3c' },
      negative: { color: '#c3c3c3' },
      base: {
        width: '100%',
        height: '28px',
        textAlign: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        fontSize: '11px',
        fontWeight: '500',
        paddingTop: '6px',
        paddingBottom: '6px',
        position: 'absolute'
      }
    }
  };
  
  // Cache of pearl and evaluation elements
  let pearlElements = [];
  let evaluationElements = [];
  let initialized = false;
  
  /**
   * Extracts and processes content from pearl elements
   * @returns {Object} Object containing processed content info
   */
  function getPearlContent() {
    // Get first pearl with content (not loading)
    const pearl = pearlElements.find(p => 
      p.innerHTML && p.innerHTML !== '<i class="ddloader"></i>'
    );
    
    if (!pearl) return { raw: '', display: '', isNegative: false };
    
    const rawContent = pearl.innerHTML;
    const displayContent = rawContent.replace(/[+\-]/g, '');
    const isNegative = rawContent.includes('-');
    
    return { raw: rawContent, display: displayContent, isNegative };
  }
  
  /**
   * Updates content of all evaluation elements
   */
  function updateEvaluationContent() {
    const { display } = getPearlContent();
    evaluationElements.forEach(element => {
      element.innerHTML = display;
    });
  }
  
  /**
   * Updates positioning and styling of an evaluation element
   * @param {HTMLElement} evaluationElement - The element to update
   * @param {boolean} isNegative - Whether the value is negative
   */
  function updateEvaluationStyling(evaluationElement, isNegative) {
    if (!evaluationElement || !evaluationElement.parentElement) return;
    
    const isReversed = evaluationElement.parentElement.classList.contains('reverse');
    
    if (isNegative) {
      // Styling for negative values
      evaluationElement.style.top = '0';
      evaluationElement.style.bottom = '100%';
      evaluationElement.style.transform = isReversed ? 'translateY(0) scaleY(-1)' : 'translateY(0)';
      evaluationElement.style.color = CONFIG.styles.negative.color;
    } else {
      // Styling for positive values
      evaluationElement.style.top = '100%';
      evaluationElement.style.bottom = 'auto';
      evaluationElement.style.transform = isReversed ? 'translateY(-100%) scaleY(-1)' : 'translateY(-100%)';
      evaluationElement.style.color = CONFIG.styles.positive.color;
    }
  }
  
  /**
   * Updates styling for all evaluation elements
   */
  function updateAllEvaluationStyling() {
    const { isNegative } = getPearlContent();
    evaluationElements.forEach(el => updateEvaluationStyling(el, isNegative));
  }
  
  /**
   * Creates evaluation elements in all gauge containers
   */
  function createEvaluationElements() {
    const gaugeElements = document.querySelectorAll(CONFIG.selectors.gauge);
    if (gaugeElements.length === 0) return;
    
    const { display, isNegative } = getPearlContent();
    
    gaugeElements.forEach(gauge => {
      // Only create if it doesn't exist
      let evaluationElement = gauge.querySelector(CONFIG.selectors.evaluation);
      
      if (!evaluationElement) {
        evaluationElement = document.createElement('div');
        evaluationElement.id = 'evaluation';
        
        // Apply base styles
        Object.assign(evaluationElement.style, CONFIG.styles.base);
        
        // Set initial content
        evaluationElement.innerHTML = display;
        
        // Append to gauge container
        gauge.appendChild(evaluationElement);
        
        // Add to cache
        evaluationElements.push(evaluationElement);
      }
      
      // Update styling immediately
      updateEvaluationStyling(evaluationElement, isNegative);
    });
  }
  
  /**
   * Updates element caches
   */
  function refreshElementCaches() {
    pearlElements = Array.from(document.querySelectorAll(CONFIG.selectors.pearl));
    evaluationElements = Array.from(document.querySelectorAll(CONFIG.selectors.evaluation));
  }
  
  /**
   * Initializes observers for DOM and content changes
   */
  function setupObservers() {
    // Pearl content observer - directly watches pearl elements for changes
    const pearlObserver = new MutationObserver(() => {
      // Update all evaluation elements immediately when pearl content changes
      updateEvaluationContent();
      updateAllEvaluationStyling();
    });
    
    // DOM structure observer - watches for added/removed elements
    const domObserver = new MutationObserver(mutations => {
      let needsRefresh = false;
      let needsUpdate = false;
      
      for (const mutation of mutations) {
        // Check for gauge class changes
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class' && 
            mutation.target.matches && 
            mutation.target.matches(CONFIG.selectors.gauge)) {
          
          const el = mutation.target.querySelector(CONFIG.selectors.evaluation);
          if (el) {
            // Update styling immediately for this specific element
            const { isNegative } = getPearlContent();
            updateEvaluationStyling(el, isNegative);
          }
        }
        
        // New nodes or removals that might contain our target elements
        if (mutation.type === 'childList') {
          // Quick check if the mutation might be relevant to us
          const containsRelevantNodes = 
            Array.from(mutation.addedNodes).some(node => 
              node.nodeType === 1 && (
                node.matches?.(CONFIG.selectors.pearl) || 
                node.matches?.(CONFIG.selectors.gauge) ||
                node.querySelector?.(CONFIG.selectors.pearl) ||
                node.querySelector?.(CONFIG.selectors.gauge)
              )
            ) ||
            Array.from(mutation.removedNodes).some(node => 
              node.nodeType === 1 && (
                node.matches?.(CONFIG.selectors.pearl) || 
                node.matches?.(CONFIG.selectors.gauge) ||
                node.querySelector?.(CONFIG.selectors.pearl) ||
                node.querySelector?.(CONFIG.selectors.gauge)
              )
            );
          
          if (containsRelevantNodes) {
            needsRefresh = true;
            needsUpdate = true;
          }
        }
      }
      
      // Only refresh and update if needed
      if (needsRefresh) {
        refreshElementCaches();
        createEvaluationElements();
        
        // Observe any new pearl elements
        pearlElements.forEach(pearl => {
          pearlObserver.observe(pearl, {
            childList: true,
            characterData: true,
            subtree: true
          });
        });
      }
      
      if (needsUpdate) {
        updateEvaluationContent();
        updateAllEvaluationStyling();
      }
    });
    
    // Start observing the document for structure changes
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Observe all pearl elements for content changes
    pearlElements.forEach(pearl => {
      pearlObserver.observe(pearl, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  }
  
  /**
   * Main initialization function
   */
  function initialize() {
    if (initialized) return;
    
    refreshElementCaches();
    
    // Only continue if we have gauge elements
    if (document.querySelectorAll(CONFIG.selectors.gauge).length === 0) {
      // Try again later if elements aren't available yet
      setTimeout(initialize, 100);
      return;
    }
    
    createEvaluationElements();
    setupObservers();
    initialized = true;
  }
  
  // Initialize based on document ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Safety net for dynamic page loads
  window.addEventListener('load', () => {
    if (!initialized) initialize();
  });
})();