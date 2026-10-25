
document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     CREATIVE TECH — KINETIC TYPOGRAPHY
     Opening sequence + hover interaction
  ===================================================== */

  const elements = Array.from(
    document.querySelectorAll(".ma-hero-highlight")
  );

  if (!elements.length) return;

  const hoverQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (motionQuery.matches) return;

  /* =====================================================
     ANIMATION SETTINGS
  ===================================================== */

  const DURATION = 650;
  const STAGGER = 18;


  /* =====================================================
     FLOATING LETTER LAYER
  ===================================================== */

  const layer = document.createElement("div");
  layer.className = "ma-kinetic-layer";
  layer.setAttribute("aria-hidden", "true");

  document.body.appendChild(layer);

  let activeElement = null;
  let animationTimer = null;


  /* =====================================================
     PREPARE ORIGINAL TEXT
  ===================================================== */

  const items = elements.map((element) => {
    const text = element.textContent.trim();

    const original = document.createElement("span");
    original.className = "ma-kinetic-original";
    original.textContent = text;

    element.replaceChildren(original);

    return { element, original };
  });

  /* =====================================================
     STOP ACTIVE ANIMATION
  ===================================================== */

  function stopAnimation() {
    clearTimeout(animationTimer);
    animationTimer = null;

    if (activeElement) {
      activeElement.classList.remove("ma-kinetic-playing");
    }

    layer.replaceChildren();
    activeElement = null;
  }


  /* =====================================================
     PLAY LETTER ANIMATION
  ===================================================== */

  function playAnimation(item) {
    if (motionQuery.matches || document.hidden) return;

    stopAnimation();

    const { element, original } = item;
    const textNode = original.firstChild;

    if (!textNode) return;

    const computed = window.getComputedStyle(element);
    const letters = [];

    let animatedIndex = 0;

    for (let i = 0; i < textNode.length; i++) {
      const char = textNode.textContent[i];

      if (/\s/.test(char)) continue;

      const range = document.createRange();

      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);

      const rect = range.getBoundingClientRect();

      if (!rect.width || !rect.height) continue;

      const letter = document.createElement("span");
      letter.className = "ma-kinetic-letter";
      letter.textContent = char;

    letter.style.left = `${rect.left}px`;
letter.style.top = `${rect.top - 2}px`;

      letter.style.fontFamily = computed.fontFamily;
      letter.style.fontStyle = computed.fontStyle;
      letter.style.fontWeight = computed.fontWeight;
      letter.style.fontSize = computed.fontSize;
      letter.style.lineHeight = computed.lineHeight;
      letter.style.letterSpacing = computed.letterSpacing;
      letter.style.color = computed.color;

      letter.style.setProperty(
        "--ma-letter-delay",
        `${animatedIndex * STAGGER}ms`
      );

      letter.style.setProperty(
        "--ma-letter-rotation",
        animatedIndex % 2 === 0 ? "-3deg" : "3deg"
      );

      letters.push(letter);
      animatedIndex++;
    }

    if (!letters.length) return;

    layer.replaceChildren(...letters);

    element.classList.add("ma-kinetic-playing");
    activeElement = element;

    animationTimer = window.setTimeout(() => {
      stopAnimation();
    }, DURATION + animatedIndex * STAGGER + 50);
  }

  /* =====================================================
     HOVER INTERACTIONS
  ===================================================== */

  items.forEach((item) => {
    item.element.addEventListener("pointerenter", (event) => {
      if (!hoverQuery.matches || motionQuery.matches) return;

      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      playAnimation(item);
    });

    item.element.addEventListener("pointerleave", stopAnimation);
    item.element.addEventListener("pointercancel", stopAnimation);
  });

  

  /* =====================================================
     CLEANUP
  ===================================================== */

  function cleanup() {
    stopAnimation();
  }

  window.addEventListener("scroll", cleanup, {
    passive: true
  });

  window.addEventListener("resize", cleanup, {
    passive: true
  });

  window.addEventListener("blur", cleanup);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cleanup();
  });

  motionQuery.addEventListener("change", (event) => {
    if (event.matches) cleanup();
  });
});
