
/* =========================================================
   SIYU PORTFOLIO — CRAFT GALLERY

   Category Filtering
   URL Hash Support
   Visible Video Playback
   Stable Initial Gallery Layout
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

  let animationFrame = null;


  /* =====================================================
     VIDEO PLAYBACK
  ===================================================== */

  function pauseHiddenVideos() {
    videos.forEach(video => {
      const item = video.closest(".craft-item");

      if (item && item.hidden) {
        video.pause();
      }
    });
  }

  if ("IntersectionObserver" in window) {

    const videoObserver = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          const video = entry.target;
          const item = video.closest(".craft-item");

          if (!item) return;

          const shouldPlay =
            entry.isIntersecting &&
            !item.hidden &&
            !document.hidden &&
            !reducedMotion.matches;

          if (shouldPlay) {
            video.play().catch(() => {});
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
     FILTER GALLERY
  ===================================================== */

  function filterGallery(
    category,
    updateURL = true,
    animate = false
  ) {

    const selected = categories.has(category)
      ? category
      : "all";


    /* Cancel previous animation */

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }


    /* Update category buttons */

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


    /* Update gallery visibility */

    let visibleCount = 0;

    items.forEach(item => {

      const matches =
        selected === "all" ||
        item.dataset.category === selected;

      item.classList.remove("is-entering");

      item.hidden = !matches;

      if (matches) {

        visibleCount++;

      } else {

        const video = item.querySelector("video");

        if (video) video.pause();

      }

    });


    /* Animate only after user interaction */

    if (animate && !reducedMotion.matches) {

      animationFrame = requestAnimationFrame(() => {

        items.forEach(item => {

          if (!item.hidden) {
            item.classList.add("is-entering");
          }

        });

        animationFrame = null;

      });

    }


    pauseHiddenVideos();


    /* Accessibility status */

    if (status) {

      const label =
        selected === "all"
          ? "All categories"
          : selected.charAt(0).toUpperCase() +
            selected.slice(1);

      status.textContent =
        `${label}: ${visibleCount} works displayed.`;

    }


    /* Update URL */

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
     CATEGORY BUTTONS
  ===================================================== */

  filters.forEach(button => {

    button.addEventListener("click", () => {

      filterGallery(
        button.dataset.filter,
        true,
        true
      );

    });

  });


  /* =====================================================
     URL HASH SUPPORT
  ===================================================== */

  function categoryFromURL() {

    const hash = window.location.hash
      .slice(1)
      .toLowerCase();

    return categories.has(hash)
      ? hash
      : "all";

  }


  window.addEventListener("hashchange", () => {

    filterGallery(
      categoryFromURL(),
      false,
      false
    );

  });


  /* =====================================================
     INITIALIZE — NO ANIMATION
  ===================================================== */

  filterGallery(
    categoryFromURL(),
    false,
    false
  );

});
