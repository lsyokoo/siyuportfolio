document.addEventListener("DOMContentLoaded", () => {
  const highlights = document.querySelectorAll(".ma-hero-highlight");

  const hoverQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (motionQuery.matches) return;

  const DURATION = 750;
  const STAGGER = 18;

  highlights.forEach((highlight) => {
    const text = highlight.textContent.trim();

    // Keep the original text accessible.
    highlight.setAttribute("aria-label", text);

    // Split into words and letters without changing spaces.
    const fragment = document.createDocumentFragment();

    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "ma-kinetic-word";
      word.setAttribute("aria-hidden", "true");

      Array.from(part).forEach((character) => {
        const letter = document.createElement("span");
        letter.className = "ma-kinetic-letter";
        letter.textContent = character;
        word.appendChild(letter);
      });

      fragment.appendChild(word);
    });

    highlight.replaceChildren(fragment);

    let timer = null;

    function stopAnimation() {
      window.clearTimeout(timer);
      timer = null;

      highlight.classList.remove("ma-kinetic-playing");
    }

    function playAnimation() {
      if (!hoverQuery.matches || motionQuery.matches) return;

      stopAnimation();

      const letters = highlight.querySelectorAll(".ma-kinetic-letter");

      letters.forEach((letter, index) => {
        letter.style.setProperty(
          "--ma-letter-delay",
          `${index * STAGGER}ms`
        );
      });

      // Restart the animation on each hover.
      void highlight.offsetWidth;

      highlight.classList.add("ma-kinetic-playing");

      timer = window.setTimeout(() => {
        stopAnimation();
      }, DURATION + (letters.length - 1) * STAGGER);
    }

    highlight.addEventListener("pointerenter", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      playAnimation();
    });

    highlight.addEventListener("pointerleave", stopAnimation);
    highlight.addEventListener("pointercancel", stopAnimation);

    window.addEventListener("blur", stopAnimation);
  });
});