/* =========================================================
   SIYU PORTFOLIO
   SHARED SCRIPT
========================================================= */


/* =========================================================
   LANGUAGE DROPDOWN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const dropdown = document.querySelector(".language-dropdown");

  if (!dropdown) return;


  /* Create language options if the current page
     doesn't already contain them */

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


  /* Open / close dropdown */

  dropdown.addEventListener("click", function (event) {

    event.stopPropagation();

    dropdown.classList.toggle("active");

  });


  /* Close when clicking elsewhere */

  document.addEventListener("click", function (event) {

    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }

  });

});


/* =========================================================
   MOBILE HAMBURGER MENU
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (!hamburger || !navMenu) return;


  hamburger.addEventListener("click", function () {

    navMenu.classList.toggle("active");

  });

});


/* =========================================================
   HOMEPAGE SUBTITLE DELAY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const subtitle = document.getElementById("subtitle");

  if (!subtitle) return;


  setTimeout(function () {

    subtitle.classList.add("visible");

  }, 800);

});


/* =========================================================
   HOMEPAGE SCROLL DOWN ARROW
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const scrollDownArrow =
    document.getElementById("scrollDownArrow");

  const firstProject =
    document.querySelector(".project-preview");


  if (!scrollDownArrow || !firstProject) return;


  scrollDownArrow.addEventListener("click", function () {

    firstProject.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

});


/* =========================================================
   SCROLL REVEAL
   Used by:
   .hidden-left
   .hidden-up
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const revealElements = document.querySelectorAll(
    ".hidden-left, .hidden-up"
  );


  if (revealElements.length === 0) return;


  /* Fallback for browsers without IntersectionObserver */

  if (!("IntersectionObserver" in window)) {

    revealElements.forEach(function (element) {
      element.classList.add("show");
    });

    return;
  }


  const observer = new IntersectionObserver(

    function (entries, observerInstance) {

      entries.forEach(function (entry) {

        if (entry.isIntersecting) {

          entry.target.classList.add("show");

          observerInstance.unobserve(entry.target);

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

    observer.observe(element);

  });

});


/* =========================================================
   SCROLL TO TOP
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const scrollTopArrow =
    document.getElementById("scrollTopArrow");

  if (!scrollTopArrow) return;


  scrollTopArrow.addEventListener("click", function () {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

});