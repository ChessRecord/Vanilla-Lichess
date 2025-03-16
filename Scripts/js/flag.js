(function () {
  "use strict";

  // Debugging enabled by default - change to false in production
  const DEBUG = false;

  // Flag dimensions constants
  const FLAG_HEIGHT = "25px";
  const FLAG_WIDTH = "33.33px";
  const BASE_FLAG_STYLE = `height: ${FLAG_HEIGHT}; width: ${FLAG_WIDTH}; object-fit: contain; vertical-align: middle;`;
  const BASE_PARENT_STYLE = `height: ${FLAG_HEIGHT}; width: ${FLAG_WIDTH}; display: inline-flex; align-items: center; vertical-align: text-bottom;`;
  const TWEMOJI_BASE_URL = "https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/";
  const FLAG_IMG_SELECTOR = 'img[src*="lichess1.org/assets/hashed/"]';

  // Log only if debugging is enabled
  function debugLog(...args) {
    if (DEBUG) console.log("[Flag Script]", ...args);
  }

  // Configuration for the MutationObserver - fixed configuration
  const observerConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"],
  };

  // Caches
  const flagCache = new Map();
  const preloadedFlags = new Map();

  const earthFlagSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="2442" width="82px" height="66px" viewBox="0 0 82 66" version="1.1"><title>ambassador</title><g id="ambassador" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Group-5-Copy" transform="translate(6.000000, 6.000000)"><path d="M57.4369625,-2 L12.5630375,-2 C7.62820119,-2 5.86681923,-1.41548743 4.07025832,-0.45467615 C2.11952904,0.588585286 0.588585286,2.11952904 -0.45467615,4.07025832 C-1.41548743,5.86681923 -2,7.62820119 -2,12.5630375 L-2,41.4369625 C-2,46.3717988 -1.41548743,48.1331808 -0.45467615,49.9297417 C0.588585286,51.880471 2.11952904,53.4114147 4.07025832,54.4546762 C5.86681923,55.4154874 7.62820119,56 12.5630375,56 L57.4369625,56 C62.3717988,56 64.1331808,55.4154874 65.9297417,54.4546762 C67.880471,53.4114147 69.4114147,51.880471 70.4546762,49.9297417 C71.4154874,48.1331808 72,46.3717988 72,41.4369625 L72,12.5630375 C72,7.62820119 71.4154874,5.86681923 70.4546762,4.07025832 C69.4114147,2.11952904 67.880471,0.588585286 65.9297417,-0.45467615 C64.1331808,-1.41548743 62.3717988,-2 57.4369625,-2 Z" id="Rectangle-3" stroke="#FFFFFF" stroke-width="0" fill="#FFC800" fill-rule="nonzero"/><path d="M31.5437377,-3.05533376e-13 L37.8032859,3.4429154 L31.5437377,11.5983788 L29.0405088,21.0947 L22.076372,16.2801604 L22.076372,23.2687817 L44.8380081,32.851759 L29.436,54 L25.599,54 L27.0517263,41.3593787 L20.7571893,35.7250479 L20.7571893,27.4332431 L12.4480899,19.1391378 L4,5.5 L6.35168303,0.708230406 C7.66228877,0.243326751 9.36790007,-3.05533376e-13 12.5630375,-3.05533376e-13 L31.5437377,-3.05533376e-13 Z" id="Path" fill="#FF9600" fill-rule="nonzero"/><path d="M57.4369625,0 C61.8054044,0 63.3895069,0.454845494 64.986544,1.30895025 C66.583581,2.163055 67.836945,3.41641901 68.6910498,5.01345604 C69.5451545,6.61049308 70,8.19459564 70,12.5630375 L70,41.4369625 C70,44.8460898 69.7229889,46.5594919 69.1953857,47.9066585 L63.4003906,46 L62.0561856,33 L53.3588414,27.4332431 L53.3588414,14.4628706 L61.6546051,14.4628706 L57.5067233,8.03996548 L51.5941033,8.03996548 L54.6816406,0 L57.4369625,0 Z" id="Combined-Shape" fill="#FF9600"/><g id="Group-7" transform="translate(4.000000, 0.000000)"/></g></g></svg>`;

  // Create and cache earth flag data URL just once
  const earthFlagDataUrl = (() => {
    const svgBlob = new Blob([earthFlagSvg], {
      type: "image/svg+xml;charset=utf-8",
    });
    return URL.createObjectURL(svgBlob);
  })();

  // List of common country codes to preload
  const commonCountryCodes = [
    "US", "GB", "FR", "DE", "IT", "ES", "RU", "CN", "JP", "IN", 
    "BR", "CA", "AU", "NZ", "UA", "PH", "ID", "HR", "NL", "PS", 
    "IR", "CU", "AZ"
  ];

  /**
   * Preload common flag images
   */
  function preloadCommonFlags() {
    for (const countryCode of commonCountryCodes) {
      const twemojiCode = countryCodeToTwemoji(countryCode);
      if (twemojiCode) {
        const img = new Image();
        img.src = `${TWEMOJI_BASE_URL}${twemojiCode}.svg`;
        preloadedFlags.set(countryCode, img);
      }
    }
  }

  /**
   * Get a preloaded flag image or create a new one
   * @param {string} countryCode - The country code
   * @returns {HTMLImageElement} The image element
   */
  function getFlagImage(countryCode) {
    if (preloadedFlags.has(countryCode)) {
      return preloadedFlags.get(countryCode).cloneNode();
    }
    return new Image();
  }

  /**
   * Converts a 2-letter country code to the corresponding Twemoji hex code
   * Uses memoization for performance
   * @param {string} countryCode - A 2-letter ISO country code (e.g., "US", "GB")
   * @returns {string|null} The Twemoji hex code or null if invalid
   */
  function countryCodeToTwemoji(countryCode) {
    // Quick validation
    if (!countryCode || countryCode.length !== 2) {
      return null;
    }

    // Convert to uppercase and check cache
    countryCode = countryCode.toUpperCase();
    if (flagCache.has(countryCode)) {
      return flagCache.get(countryCode);
    }

    try {
      // Convert directly to hex without string operations
      const codePoint1 = countryCode.charCodeAt(0) + 127397;
      const codePoint2 = countryCode.charCodeAt(1) + 127397;
      const twemojiCode = `${codePoint1.toString(16)}-${codePoint2.toString(16)}`;
      
      // Cache the result
      flagCache.set(countryCode, twemojiCode);
      return twemojiCode;
    } catch (error) {
      debugLog("Error converting country code:", error);
      return null;
    }
  }

  /**
   * Extract country code from a Lichess flag URL
   * @param {string} url - The flag image URL
   * @returns {string|null} The 2-letter country code or null if not found
   */
  function extractCountryCode(url) {
    if (!url) return null;
    
    // Use a single regex test for better performance
    const match = url.match(/\/hashed\/([A-Z]{2})\.\w+\.png/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Replace a single flag image with its Twemoji equivalent
   * @param {HTMLImageElement} img - The image element to replace
   * @returns {boolean} Whether the replacement was successful
   */
  function replaceFlagImage(img) {
    try {
      const originalSrc = img.src;

      // Check for earth flag
      if (originalSrc.includes("earth")) {
        const newImg = new Image();
        newImg.style.cssText = BASE_FLAG_STYLE;

        if (img.parentElement) {
          img.parentElement.style.cssText = BASE_PARENT_STYLE;
        }

        newImg.src = earthFlagDataUrl;
        img.parentNode.replaceChild(newImg, img);
        return true;
      }

      const countryCode = extractCountryCode(originalSrc);
      if (!countryCode) return false;

      const twemojiCode = countryCodeToTwemoji(countryCode);
      if (!twemojiCode) return false;

      // Skip if already replaced
      if (originalSrc.includes("twemoji") && originalSrc.includes(twemojiCode)) {
        return false;
      }

      const newImg = getFlagImage(countryCode);
      newImg.style.cssText = BASE_FLAG_STYLE;

      if (img.parentElement) {
        img.parentElement.style.cssText = BASE_PARENT_STYLE;
      }

      newImg.onerror = () => {
        newImg.src = originalSrc;
        newImg.onerror = null;
      };

      newImg.src = `${TWEMOJI_BASE_URL}${twemojiCode}.svg`;
      img.parentNode.replaceChild(newImg, img);
      return true;
    } catch (error) {
      debugLog("Error processing image:", error);
      return false;
    }
  }

  /**
   * Replace flag image URLs with Twemoji SVGs
   * Optimized to process only visible flags first
   */
  function replaceFlagUrls() {
    const flagImages = document.querySelectorAll(FLAG_IMG_SELECTOR);
    if (!flagImages.length) return;
    
    debugLog(`Found ${flagImages.length} potential flag images`);

    // Process images in batches with optimization for visible ones
    const batchSize = 10;
    let currentIndex = 0;
    const flagsArray = Array.from(flagImages);
    
    // Sort by visibility to process visible flags first
    flagsArray.sort((a, b) => {
      const aVisible = isInViewport(a);
      const bVisible = isInViewport(b);
      return (bVisible - aVisible);
    });

    function processBatch() {
      const endIndex = Math.min(currentIndex + batchSize, flagsArray.length);
      let replacedCount = 0;

      for (let i = currentIndex; i < endIndex; i++) {
        if (replaceFlagImage(flagsArray[i])) {
          replacedCount++;
        }
      }

      currentIndex = endIndex;
      
      if (currentIndex < flagsArray.length) {
        // Use requestIdleCallback if available, otherwise fall back to requestAnimationFrame
        if (window.requestIdleCallback) {
          window.requestIdleCallback(processBatch, { timeout: 100 });
        } else {
          requestAnimationFrame(processBatch);
        }
      }
      
      if (replacedCount > 0) {
        debugLog(`Replaced ${replacedCount} flags in this batch`);
      }
    }

    processBatch();
  }

  /**
   * Check if an element is in viewport
   * @param {Element} elem - The element to check
   * @returns {boolean} Whether the element is in viewport
   */
  function isInViewport(elem) {
    if (!elem || !elem.getBoundingClientRect) return false;
    
    const rect = elem.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * Handle DOM mutations and determine whether to replace flag URLs
   */
  const handleMutations = function (mutations) {
    // Check if any mutations are relevant
    const shouldReplace = mutations.some(mutation => {
      // Check added nodes
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (
              (node.tagName === 'IMG' && node.src && node.src.includes("lichess1.org/assets/hashed/")) ||
              (node.querySelector && node.querySelector(FLAG_IMG_SELECTOR))
            ) {
              return true;
            }
          }
        }
      }
      
      // Check attribute changes
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "src" &&
        mutation.target.tagName === "IMG" &&
        mutation.target.src &&
        mutation.target.src.includes("lichess1.org/assets/hashed/")
      ) {
        return true;
      }
      
      return false;
    });

    if (shouldReplace) {
      debugLog("DOM changed, replacing flag URLs");
      replaceFlagUrls();
    }
  };

  // Create the observer
  const observer = new MutationObserver(handleMutations);

  /**
   * Initialize the script
   */
  function initScript() {
    debugLog("Initializing flag replacement script");

    // Preload common flags
    preloadCommonFlags();

    // Run the initial replacement
    replaceFlagUrls();

    // Observe the document body
    observer.observe(document.body, observerConfig);
    debugLog("Observer started");
  }

  // Run on page load with improved readiness check
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScript);
  } else {
    setTimeout(initScript, 0); // Use setTimeout to avoid blocking
  }
})();
