
/* =====================================================
 CURIOSITY WORDS
===================================================== */

(() => {
  function initCuriosityWords() {
    const image = document.querySelector(
      "#home .hero-image-base"
    );

    const container = document.querySelector(
      "#home .hero-image"
    );

    if (!image || !container) return;

    if (container.querySelector(".industry-words-layer")) {
      return;
    }

    /* Words to discover */

const WORDS = [
     "SYSTEMS THINKING",
     "COMMUNITY",
  "ADAPTABILITY",
   "AI ETHICS"
];

    const DURATION = 2600;
    const MAX_VISIBLE = 3;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let remaining = [...WORDS];
    let activeWords = [];

    /* Create overlay */

    const layer = document.createElement("div");
    layer.className = "industry-words-layer";
    layer.setAttribute("aria-hidden", "true");

    container.appendChild(layer);

    /* Match image dimensions */

    function syncLayer() {
      const imageRect = image.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      layer.style.left =
        `${imageRect.left - containerRect.left}px`;

      layer.style.top =
        `${imageRect.top - containerRect.top}px`;

      layer.style.width = `${imageRect.width}px`;
      layer.style.height = `${imageRect.height}px`;
    }

    /* Random word without immediate repeats */

    function getWord() {
      if (remaining.length === 0) {
        remaining = [...WORDS];
      }

      const index = Math.floor(
        Math.random() * remaining.length
      );

      return remaining.splice(index, 1)[0];
    }

    /* Remove individual word */

    function removeWord(element) {
      element.remove();

      activeWords = activeWords.filter(
        item => item !== element
      );
    }

    /* Reveal a word at click position */

    function revealWord(event) {
      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      syncLayer();

      const rect = layer.getBoundingClientRect();

      const word = getWord();

      const element = document.createElement("span");
      element.className = "industry-word";
      element.textContent = word;

      if (word.length > 11) {
        element.classList.add("industry-word-long");
      }

      if (reducedMotion.matches) {
        element.classList.add("no-motion");
      }

      layer.appendChild(element);

      const width = element.offsetWidth;
      const height = element.offsetHeight;

      /* Keep text inside the image */

      const padding = 5;

      const minX = width / 2 + padding;
      const maxX = rect.width - width / 2 - padding;

      const minY = height / 2 + padding;
      const maxY = rect.height - height / 2 - padding;

      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const x = Math.max(
        minX,
        Math.min(clickX, Math.max(minX, maxX))
      );

      const y = Math.max(
        minY,
        Math.min(clickY, Math.max(minY, maxY))
      );

      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      /* Keep the interaction subtle */

      activeWords.push(element);

      if (activeWords.length > MAX_VISIBLE) {
        removeWord(activeWords[0]);
      }

      setTimeout(() => {
        removeWord(element);
      }, DURATION);
    }

    /* Detect clicks within the actual image */

    document.addEventListener(
      "pointerdown",
      event => {
        const rect = image.getBoundingClientRect();

        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!inside) return;

        revealWord(event);
      },
      true
    );

    window.addEventListener("resize", syncLayer);

    if (image.complete) {
      syncLayer();
    } else {
      image.addEventListener(
        "load",
        syncLayer,
        { once: true }
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initCuriosityWords,
      { once: true }
    );
  } else {
    initCuriosityWords();
  }
})();
