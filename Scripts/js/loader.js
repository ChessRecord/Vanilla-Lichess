(function () {
  // Prevent multiple initializations by checking a global flag.
  if (window.__loaderInitialized) return;
  window.__loaderInitialized = true;

  const MESSAGE_INTERVAL = 1750;

  const loadingMessages = [
    "Loading...",
    "Setting Up the Chessboard...",
    "Positioning Pieces...",
    "Shuffling the Pawns...",
    "Calculating Best Move...",
    "Castling into Action...",
    "Preparing Grandmaster Strategies...",
    "Unleashing Chess Algorithms...",
    "Summoning Knight Moves...",
    "Charging Rook Batteries...",
    "Aligning Chess Dimensions...",
  ];

  let animationFrameId = null;

  const loader = document.createElement("div");
  loader.id = "lichess-custom-loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");

  const loadingTextContainer = document.createElement("div");
  loadingTextContainer.classList.add("loading-text");

  const messageElements = loadingMessages.map((message) => {
    const messageEl = document.createElement("div");
    messageEl.classList.add("loading-message");
    messageEl.textContent = message;
    return messageEl;
  });

  messageElements.forEach((el) => loadingTextContainer.appendChild(el));
  loader.appendChild(loadingTextContainer);

  function showMessage(index) {
    messageElements.forEach((el) => el.classList.remove("active"));
    if (index >= 0 && index < messageElements.length) {
      messageElements[index].classList.add("active");
    }
  }

  function removeLoader() {
    // Remove the load event listener so it doesn't trigger removeLoader again
    window.removeEventListener("load", removeLoader);

    if (loader && loader.parentNode) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Use RAF to ensure the loader's visible state is rendered before starting the fade out
      requestAnimationFrame(() => {
        loader.classList.add("hidden");
        // Re-enable scrolling
        document.body.classList.remove("loading");
        setTimeout(() => {
          if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 500); // Allow time for the opacity transition to complete
      });
    }
  }

  function tryInitLoader() {
    if (document.body) {
      messageElements.forEach((el) => el.classList.remove("active"));

      // Disable scrolling
      document.body.classList.add("loading");

      document.body.appendChild(loader);

      // Temporarily disable the transition so that the fade in is instant.
      loader.style.transition = "none";
      // Retain the RAF for the first frame as before.
      requestAnimationFrame(() => {
        loader.classList.add("visible");
        // On the next frame, restore the CSS transition so that the fade out will animate.
        requestAnimationFrame(() => {
          loader.style.transition = "";
        });
      });

      let currentIndex = -1;
      let lastTimestamp = null;

      function animateMessages(timestamp) {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
          animationFrameId = requestAnimationFrame(animateMessages);
          return;
        }

        const elapsed = timestamp - lastTimestamp;

        if (elapsed >= MESSAGE_INTERVAL) {
          currentIndex = (currentIndex + 1) % messageElements.length;
          showMessage(currentIndex);
          lastTimestamp = timestamp;
        }

        animationFrameId = requestAnimationFrame(animateMessages);
      }

      animationFrameId = requestAnimationFrame(animateMessages);

      window.addEventListener("load", removeLoader);
      setTimeout(removeLoader, 10000);

      return true;
    }
    return false;
  }

  if (!tryInitLoader()) {
    const bodyCheckInterval = setInterval(() => {
      if (tryInitLoader()) {
        clearInterval(bodyCheckInterval);
      }
    }, 5);
    setTimeout(() => clearInterval(bodyCheckInterval), 5000);
  }
})();
