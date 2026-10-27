
/* =========================================================
   SIYU PORTFOLIO — CRAFT GALLERY

   Category Filtering
   URL Hash Support
   Visible Video Playback
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const gallery = document.getElementById("craftGallery");

  if (!gallery) return;

  const filters = Array.from(
    document.querySelectorAll(".craft-filter")
  );

  const items = Array.from(
    gallery.querySelectorAll(".craft-item")
  );

  const videos = Array.from(
    gallery.querySelectorAll("video")
  );

  const status = document.getElementById(
    "craftFilterStatus"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const categories = new Set([
    "all",
    "visual",
    "fashion",
    "photography",
    "sketchbook"
  ]);

  /* =====================================================
     VIDEO PLAYBACK
  ===================================================== */

  function pauseHiddenVideos() {
    videos.forEach(video => {
      if (video.closest(".craft-item").hidden) {
        video.pause();
      }
    });
  }

  // Play videos only when visible on screen.
  // Pause them when they leave the viewport.

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          const item = video.closest(".craft-item");

          const shouldPlay =
            entry.isIntersecting &&
            !item.hidden &&
            !document.hidden &&
            !reducedMotion.matches;

          if (shouldPlay) {
            video.play().catch(() => {
              // Browser may restrict playback.
              // Native controls remain available.
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    videos.forEach(video => {
      videoObserver.observe(video);
    });
  }

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        videos.forEach(video => video.pause());
      }
    }
  );

  /* =====================================================
     FILTER WORK
  ===================================================== */

  function filterGallery(category, updateURL = true) {
    const selected = categories.has(category)
      ? category
      : "all";

    /* Update buttons */

    filters.forEach(button => {
      const isActive =
        button.dataset.filter === selected;

      button.classList.toggle(
        "is-active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    /* Show matching items */

    let visibleCount = 0;

    items.forEach(item => {
      const matches =
        selected === "all" ||
        item.dataset.category === selected;

      item.hidden = !matches;

      item.classList.remove("is-entering");

      if (matches) {
        visibleCount++;
      } else {
        const video = item.querySelector("video");

        if (video) video.pause();
      }
    });

    /* Animate newly visible items */

    if (!reducedMotion.matches) {
      requestAnimationFrame(() => {
        items.forEach(item => {
          if (!item.hidden) {
            item.classList.add("is-entering");
          }
        });
      });
    }

    pauseHiddenVideos();

    /* Accessible feedback */

    if (status) {
      const label =
        selected === "all"
          ? "All categories"
          : selected.charAt(0).toUpperCase() +
            selected.slice(1);

      status.textContent =
        `${label}: ${visibleCount} works displayed.`;
    }

    /* Keep selected category shareable */

    if (updateURL) {
      const newURL =
        selected === "all"
          ? window.location.pathname +
            window.location.search
          : "#" + selected;

      history.replaceState(
        null,
        "",
        newURL
      );
    }
  }

  /* =====================================================
     FILTER BUTTONS
  ===================================================== */

  filters.forEach(button => {
    button.addEventListener("click", () => {
      filterGallery(button.dataset.filter);
    });
  });

  /* =====================================================
     DIRECT LINKS

     extra.html#fashion
     extra.html#visual
     extra.html#photography
     extra.html#sketchbook
  ===================================================== */

  function categoryFromURL() {
    const hash = window.location.hash
      .slice(1)
      .toLowerCase();

    return categories.has(hash) ? hash : "all";
  }

  window.addEventListener("hashchange", () => {
    filterGallery(categoryFromURL(), false);
  });

  /* =====================================================
     INITIALIZE
  ===================================================== */

  filterGallery(categoryFromURL(), false);

});
