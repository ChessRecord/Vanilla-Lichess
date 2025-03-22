// Execute code with DOM ready check
(function() {
  // Pre-compile all regex patterns
  const PATTERNS = {
    bullet: /•/g,
    plus: /\+/g,
    number: /\| Rated|(\d+ \+ \d+)/g
  };

  // Pre-compile selectors
  const SELECTORS = {
    gameInfo: '.game-row__infos .header .header__text strong',
    lineBreaks: '.game-row__infos .versus br',
    swords: '.swords'
  };

  // Create template for time spans
  const timeSpanTemplate = document.createElement('span');
  timeSpanTemplate.className = 'time_monospace';

  // WeakSet to track processed elements
  const processedElements = new WeakSet();

  // Optimized text processing using a single pass
  function processElement(el) {
    // Skip if already processed or invalid
    if (processedElements.has(el) || !el?.textContent) return;
    
    const text = el.textContent;
    
    // Quick check if processing is needed
    if (!text.includes('•') && !text.includes('+') && !/\d/.test(text)) {
      processedElements.add(el);
      return;
    }

    // Process text in a single pass
    let result = text
      .replace(PATTERNS.bullet, '|')
      .replace(PATTERNS.plus, ' + ');

    // Only process numbers if they exist
    if (/\d/.test(result)) {
      // Use DocumentFragment for better performance
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      
      result.replace(PATTERNS.number, (match, group, offset) => {
        if (offset > lastIndex) {
          fragment.appendChild(document.createTextNode(result.slice(lastIndex, offset)));
        }
        
        if (match.includes('+')) {
          const span = timeSpanTemplate.cloneNode();
          span.textContent = match;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(match));
        }
        
        lastIndex = offset + match.length;
      });

      if (lastIndex < result.length) {
        fragment.appendChild(document.createTextNode(result.slice(lastIndex)));
      }

      // Batch DOM update
      el.textContent = '';
      el.appendChild(fragment);
    } else if (result !== text) {
      el.textContent = result;
    }

    // Mark element as processed
    processedElements.add(el);
  }

  // Process all elements in a single batch
  function processBatch() {
    // Use faster querySelectorAll with specific selectors
    const elements = document.querySelectorAll(SELECTORS.gameInfo);
    const lineBreaks = document.querySelectorAll(SELECTORS.lineBreaks);
    const swords = document.querySelectorAll(SELECTORS.swords);

    // Batch process all elements
    if (elements.length) {
      requestAnimationFrame(() => {
        elements.forEach(processElement);
      });
    }

    // Batch remove elements
    if (lineBreaks.length || swords.length) {
      requestAnimationFrame(() => {
        lineBreaks.forEach(br => br.remove());
        swords.forEach(sword => {
          const span = document.createElement('span');
          sword.replaceWith(span);
          processedElements.add(span); // Mark new spans as processed
        });
      });
    }
  }

  // Optimized mutation observer with debouncing
  let pendingUpdate = false;
  const observer = new MutationObserver(() => {
    if (!pendingUpdate) {
      pendingUpdate = true;
      requestAnimationFrame(() => {
        processBatch();
        pendingUpdate = false;
      });
    }
  });

  // Function to initialize when DOM is ready
  function initialize() {
    if (!document.body) {
      // If body isn't available yet, try again on next frame
      requestAnimationFrame(initialize);
      return;
    }

    // Start processing immediately
    processBatch();

    // Start observing with optimized config
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['class']
    });
  }

  // Start initialization
  initialize();
})();