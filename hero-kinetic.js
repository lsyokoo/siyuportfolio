
document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     HERO — INLINE KINETIC TYPOGRAPHY
  ===================================================== */

  const selectors = [
    "#home .hero-name",
    "#home .hero-title-highlight"
  ];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  if (reducedMotion.matches) return;

  const DURATION = 650;
  const STAGGER = 25;
  const LOAD_DELAY = 450;

  /* PREPARE LETTERS */

  const items = selectors
    .map(selector => document.querySelector(selector))
    .filter(Boolean)
    .map(element => {
      const fragment = document.createDocumentFragment();
      const letters = [];

      const tokens =
        element.textContent.match(/\s+|[^\s]+/g) || [];

      tokens.forEach(token => {
        if (/^\s+$/.test(token)) {
          fragment.append(
            document.createTextNode(token)
          );
          return;
        }

        const word = document.createElement("span");
        word.className = "kinetic-inline-word";

        for (const char of Array.from(token)) {
          const letter = document.createElement("span");

          letter.className = "kinetic-inline-letter";
          letter.textContent = char;

          word.append(letter);
          letters.push(letter);
        }

        fragment.append(word);
      });

      element.replaceChildren(fragment);

      return {
        element,
        letters,
        timer: null
      };
    });

  let openingTimer = null;
  let openingCancelled = false;

  /* STOP ANIMATION */

  function stop(item) {
    clearTimeout(item.timer);
    item.timer = null;

    item.element.classList.remove(
      "kinetic-inline-playing"
    );
  }

  /* PLAY ANIMATION */

  function play(item) {
    if (document.hidden || reducedMotion.matches) return;

    stop(item);

    // Reset CSS animation for replay.
    void item.element.offsetWidth;

    item.letters.forEach((letter, index) => {
      letter.style.setProperty(
        "--kinetic-delay",
        `${index * STAGGER}ms`
      );

      letter.style.setProperty(
        "--kinetic-rotation",
        index % 2 === 0 ? "-3deg" : "3deg"
      );
    });

    item.element.classList.add(
      "kinetic-inline-playing"
    );

    item.timer = window.setTimeout(
      () => stop(item),
      DURATION + item.letters.length * STAGGER + 30
    );
  }

  /* CANCEL OPENING ANIMATION */

  function cancelOpening() {
    openingCancelled = true;
    clearTimeout(openingTimer);
  }

  /* HOVER EVENTS */

  items.forEach(item => {
    item.element.addEventListener(
      "pointerenter",
      event => {
        if (!canHover.matches) return;

        if (
          event.pointerType &&
          event.pointerType !== "mouse"
        ) {
          return;
        }

        cancelOpening();
        play(item);
      }
    );
  });

  /* OPENING ANIMATION */

  Promise.resolve(document.fonts?.ready).then(() => {
    if (openingCancelled || document.hidden) return;

    openingTimer = window.setTimeout(() => {
      if (openingCancelled || document.hidden) return;

      // Both highlighted phrases start together.
      items.forEach(play);

    }, LOAD_DELAY);
  });

  /* CLEANUP */

  function cleanup() {
    cancelOpening();
    items.forEach(stop);
  }

  window.addEventListener("blur", cleanup);

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) cleanup();
    }
  );

  reducedMotion.addEventListener(
    "change",
    event => {
      if (event.matches) cleanup();
    }
  );
});
