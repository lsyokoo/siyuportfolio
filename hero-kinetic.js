
document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================
     HERO KINETIC TYPOGRAPHY
     - Play once on page load
     - Replay on hover
     - Preserve original text layout
     - No overlapping letters
  ========================================== */

  const elements = [
    document.querySelector("#home .hero-name"),
    document.querySelector("#home .hero-title-highlight")
  ].filter(Boolean);

  if (!elements.length) return;

  const hoverQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (motionQuery.matches) return;

  const DURATION = 650;
  const STAGGER = 25;

const LOAD_DELAYS = [300, 700];

  /* ==========================================
     GLOBAL ANIMATION LAYER
  ========================================== */

  const layer = document.createElement("div");
  layer.className = "kinetic-letter-layer";
  layer.setAttribute("aria-hidden", "true");

  document.body.appendChild(layer);

  let activeElement = null;
  let animationTimer = null;
  let loadTimers = [];


  /* ==========================================
     STOP ANIMATION
  ========================================== */

  function stopAnimation() {
    clearTimeout(animationTimer);

    if (activeElement) {
      activeElement.classList.remove(
        "kinetic-playing"
      );
    }

    layer.replaceChildren();
    activeElement = null;
  }


  /* ==========================================
     INITIALIZE ELEMENTS
  ========================================== */

  const items = elements.map((element) => {

    const text = element.textContent;

    const original = document.createElement("span");
    original.className = "kinetic-original";
    original.textContent = text;

    element.replaceChildren(original);

    return { element, original };
  });


  /* ==========================================
     PLAY KINETIC ANIMATION
  ========================================== */

  function playAnimation(item) {
    if (motionQuery.matches) return;

    const { element, original } = item;

    stopAnimation();

    const textNode = original.firstChild;
    if (!textNode) return;

    const computed = window.getComputedStyle(element);
    const letters = [];

    let animatedIndex = 0;

    // Measure the exact positions of the original letters.
    for (let i = 0; i < textNode.length; i++) {

      const char = textNode.textContent[i];

      if (/\s/.test(char)) continue;

      const range = document.createRange();

      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);

      const rect = range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) {
        continue;
      }

      const letter = document.createElement("span");

      letter.className = "kinetic-letter";
      letter.textContent = char;

      letter.style.left = `${rect.left}px`;
      letter.style.top = `${rect.top}px`;

      letter.style.fontFamily = computed.fontFamily;
      letter.style.fontStyle = computed.fontStyle;
      letter.style.fontWeight = computed.fontWeight;
      letter.style.fontSize = computed.fontSize;
      letter.style.lineHeight = computed.lineHeight;
      letter.style.letterSpacing = computed.letterSpacing;
      letter.style.color = computed.color;

      letter.style.setProperty(
        "--letter-delay",
        `${animatedIndex * STAGGER}ms`
      );

      letter.style.setProperty(
        "--letter-rotation",
        animatedIndex % 2 === 0
          ? "-3deg"
          : "3deg"
      );

      letters.push(letter);
      animatedIndex++;
    }

    if (!letters.length) return;

    layer.replaceChildren(...letters);

    element.classList.add("kinetic-playing");
    activeElement = element;

    animationTimer = window.setTimeout(() => {
      stopAnimation();
    }, DURATION + animatedIndex * STAGGER + 50);
  }


  /* ==========================================
     HOVER INTERACTION
  ========================================== */

  items.forEach((item) => {

    const { element } = item;

    element.addEventListener("pointerenter", (event) => {
      if (!hoverQuery.matches) return;

      if (
        event.pointerType &&
        event.pointerType !== "mouse"
      ) {
        return;
      }

      // Cancel automatic animations if user
      // interacts before they finish.
      loadTimers.forEach(clearTimeout);
      loadTimers = [];

      playAnimation(item);
    });

    element.addEventListener(
      "pointerleave",
      stopAnimation
    );

    element.addEventListener(
      "pointercancel",
      stopAnimation
    );
  });


  /* ==========================================
     OPENING ANIMATION — ONCE PER LOAD
  ========================================== */

  function playOpeningAnimation() {

    if (motionQuery.matches) return;

    // Wait for Playfair Display to finish loading
    // so character measurements are accurate.
    const fontsReady = document.fonts
      ? document.fonts.ready
      : Promise.resolve();

    fontsReady.then(() => {

      requestAnimationFrame(() => {

        items.forEach((item, index) => {

          const timer = window.setTimeout(() => {
            playAnimation(item);
          }, LOAD_DELAYS[index] ?? 600);

          loadTimers.push(timer);

        });

      });

    });
  }

  playOpeningAnimation();


  /* ==========================================
     CLEANUP
  ========================================== */

  function cleanup() {
    loadTimers.forEach(clearTimeout);
    loadTimers = [];
    stopAnimation();
  }

  window.addEventListener(
    "scroll",
    cleanup,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    cleanup,
    { passive: true }
  );

  window.addEventListener(
    "blur",
    cleanup
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cleanup();
      }
    }
  );

});
