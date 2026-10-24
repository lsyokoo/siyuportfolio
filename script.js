
/* =========================================================
   SIYU PORTFOLIO
   SHARED SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =======================================================
     LANGUAGE DROPDOWN
  ======================================================= */

  const dropdown = document.querySelector(".language-dropdown");

  if (dropdown) {
    let langOptions = dropdown.querySelector(".language-options");

    if (!langOptions) {
      langOptions = document.createElement("div");
      langOptions.classList.add("language-options");

      langOptions.innerHTML = `
        <span data-lang="en" class="lang-option active">EN</span>
        <span data-lang="zh" class="lang-option disabled">中文</span>
        <span data-lang="jp" class="lang-option disabled">日本語</span>
      `;

      dropdown.appendChild(langOptions);
    }

    dropdown.addEventListener("click", function (event) {
      event.stopPropagation();
      dropdown.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("active");
      }
    });
  }


  /* =======================================================
     MOBILE HAMBURGER MENU
  ======================================================= */

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }


  /* =======================================================
     HOMEPAGE SUBTITLE DELAY
  ======================================================= */

  const subtitle = document.getElementById("subtitle");

  if (subtitle) {
    setTimeout(function () {
      subtitle.classList.add("visible");
    }, 800);
  }


  /* =======================================================
     HOMEPAGE SCROLL DOWN ARROW
  ======================================================= */

  const scrollDownArrow = document.getElementById("scrollDownArrow");
  const firstProject = document.querySelector(".project-preview");

  if (scrollDownArrow && firstProject) {
    scrollDownArrow.addEventListener("click", function () {
      firstProject.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }


  /* =======================================================
     SCROLL REVEAL
  ======================================================= */

  const revealElements = document.querySelectorAll(
    ".hidden-left, .hidden-up"
  );

  if (revealElements.length > 0) {
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach(function (element) {
        element.classList.add("show");
      });
    } else {
      const revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.1
        }
      );

      revealElements.forEach(function (element) {
        revealObserver.observe(element);
      });
    }
  }


  /* =======================================================
     SCROLL TO TOP
  ======================================================= */

  const scrollTopArrow = document.getElementById("scrollTopArrow");

  if (scrollTopArrow) {
    scrollTopArrow.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }


  /* =======================================================
     CASE STUDY SIDEBAR
     Automatically generated from section headings.
  ======================================================= */

  const sidebar = document.querySelector(".case-sidebar");
  const linkHost = document.getElementById("caseSidebarLinks");
  const caseStudy = document.querySelector("main.case-study");

  // Homepage and other non-case-study pages are unaffected.
  if (!sidebar || !linkHost || !caseStudy) {
    return;
  }

  const sections = Array.from(
    caseStudy.querySelectorAll(".case-hero, .case-section")
  ).filter(function (section) {
    return (
      section.classList.contains("case-hero") ||
      section.querySelector("h2.case-section-title")
    );
  });

  // Track existing IDs to prevent duplicates.
  const usedIds = new Set(
    Array.from(document.querySelectorAll("[id]"), function (el) {
      return el.id;
    })
  );

  const navItems = sections.map(function (section, index) {
    const heading = section.querySelector("h2.case-section-title");

    let label = section.dataset.navLabel;

    if (!label) {
      label = heading
        ? heading.textContent.trim()
        : "Overview";
    }

    // Create unique IDs when missing.
    if (!section.id) {
      const slug =
        label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        "section-" + (index + 1);

      let candidate = slug;
      let suffix = 2;

      while (usedIds.has(candidate)) {
        candidate = slug + "-" + suffix;
        suffix++;
      }

      section.id = candidate;
      usedIds.add(candidate);
    }

    // Build the navigation link.
    const link = document.createElement("a");

    link.className = "case-sidebar-link";
    link.href = "#" + section.id;
    link.textContent = label;

    linkHost.appendChild(link);

    return {
      section: section,
      link: link
    };
  });


  /* =======================================================
     ACTIVE SECTION HIGHLIGHT
  ======================================================= */

  let ticking = false;

  function updateActiveSection() {
    if (!navItems.length) {
      return;
    }

    const offset = window.innerWidth <= 1100 ? 164 : 155;

    let currentIndex = 0;

    navItems.forEach(function (item, index) {
      const top = item.section.getBoundingClientRect().top;

      if (top <= offset) {
        currentIndex = index;
      }
    });

    // When the visitor reaches the bottom,
    // select the last section.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 8;

    if (atBottom) {
      currentIndex = navItems.length - 1;
    }

    navItems.forEach(function (item, index) {
      if (index === currentIndex) {
        item.link.setAttribute("aria-current", "location");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });

    ticking = false;
  }

  function requestActiveUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    }
  }

  window.addEventListener("scroll", requestActiveUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestActiveUpdate);

  // Highlight the current section when the page loads.
  updateActiveSection();


  /* =======================================================
     DIRECT ANCHOR LINKS
  ======================================================= */

  if (window.location.hash) {
    let hash = window.location.hash.slice(1);

    try {
      hash = decodeURIComponent(hash);
    } catch (error) {
      // Keep the original hash if decoding fails.
    }

    const target = document.getElementById(hash);

    if (target) {
      window.requestAnimationFrame(function () {
        target.scrollIntoView({
          block: "start"
        });

        updateActiveSection();
      });
    }
  }

});
