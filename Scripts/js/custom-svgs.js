document.addEventListener("DOMContentLoaded", () => {
  // Function to process and modify specific <g> elements
  function processGElements(targetNode) {
    targetNode.querySelectorAll("g").forEach((g) => {
      const transform = g.getAttribute("transform");

      // Always replace the scale value with "scale(0.35)"
      if (transform) {
        const newTransform = transform.replace(/scale\([^)]+\)/, "scale(0.375)");
        g.setAttribute("transform", newTransform);
      }

      // Modify the circle's "r" attribute if it exists
      const hasCircle = g.querySelector("circle");
      if (hasCircle && hasCircle.getAttribute("r") !== null) {
        hasCircle.setAttribute("r", "57.25");
      }
    });
  }

  // Observe the entire document for changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Process newly added nodes that contain <g> elements
            if (node.matches("svg") || node.querySelector("g")) {
              processGElements(node);
            }
          }
        });
      }
    });
  });

  // Start observing the document for additions of SVG elements
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial processing for elements already on the page
  processGElements(document.body);
});
