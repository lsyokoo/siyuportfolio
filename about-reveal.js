
document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     ABOUT PAGE — SCROLL REVEAL
  ===================================================== */

  const sections = document.querySelectorAll(
    ".about-offclock-inner, " +
    ".about-background-inner, " +
    ".about-leadership-inner"
  );

  if (!sections.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (reducedMotion.matches) return;

  if (!("IntersectionObserver" in window)) return;

  // Prevent invisible content from flashing while
  // the observer is preparing the animation.
  document.documentElement.classList.add(
    "about-reveal-enabled"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.08,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
});
