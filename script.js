// burger icon
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

document.addEventListener("DOMContentLoaded", function() {
  // =============== Subtitle delayed appear ===============
  const subtitle = document.getElementById("subtitle");
  if (subtitle) {
    setTimeout(() => {
      subtitle.classList.add("visible");
    }, 800); // 0.8s
  }

  // =============== scrolldown arrow ===============
  const scrollDownArrow = document.getElementById("scrollDownArrow");
  if (scrollDownArrow) {
    scrollDownArrow.addEventListener("click", function() {
      const nextSection = document.getElementById("next");
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ===============  textimage slide in ===============
  const hiddenLeftElems = document.querySelectorAll('.hidden-left');
  const hiddenUpElems = document.querySelectorAll('.hidden-up');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  hiddenLeftElems.forEach(el => observer.observe(el));
  hiddenUpElems.forEach(el => observer.observe(el));

  // =============== highlight current page in the menu ===============
  const currentPage = window.location.pathname.split("/").pop(); 
  const navLinks = document.querySelectorAll(".nav-menu li a");

  navLinks.forEach(link => {
    const linkHref = link.getAttribute("href");
    if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });


  const fadeInObserverOptions = {
    threshold: 0.2, 
  };

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, fadeInObserverOptions);


  const fadeInElements = document.querySelectorAll(".video-text-container, .triple-grid, .single-image, .sigil-grid");
  fadeInElements.forEach(el => fadeInObserver.observe(el));


  // ===============carousel ===============
  const carouselContainers = document.querySelectorAll('.carousel-container');
  carouselContainers.forEach(container => {
    const track = container.querySelector('.carousel-track');
    if (!track) return; 

    const slides = Array.from(track.children);
    const prevButton = container.querySelector('.carousel-button.prev');
    const nextButton = container.querySelector('.carousel-button.next');
    let currentSlideIndex = 0;

    function updateCarousel() {
      if (slides.length > 0) {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
      }
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateCarousel();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      });
    }

    window.addEventListener('load', updateCarousel);
  });
});



document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".underground-carousel-track");
  const slides = Array.from(track.children);
  let slideWidth = slides[0].getBoundingClientRect().width + 5; // gap
  let scrollSpeed = 1.3; // speed
  let currentPosition = 0;
  let animationFrame;

  // coping for unlimited move
  slides.forEach((slide) => {
    let clone = slide.cloneNode(true);
    track.appendChild(clone);
  });

  function moveCarousel() {
    currentPosition -= scrollSpeed;
    track.style.transform = `translateX(${currentPosition}px)`;

    // always moving
    if (currentPosition <= -slideWidth * slides.length) {
      currentPosition = 0;
    }

    animationFrame = requestAnimationFrame(moveCarousel);
  }

  function startCarousel() {
    animationFrame = requestAnimationFrame(moveCarousel);
  }

  function stopCarousel() {
    cancelAnimationFrame(animationFrame);
  }

  startCarousel();

  // stop while hover
  track.addEventListener("mouseenter", stopCarousel);
  track.addEventListener("mouseleave", startCarousel);
});






document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".remake-carousel")) {
    const carousels = document.querySelectorAll(".remake-carousel");
    carousels.forEach(carousel => {
      const track = carousel.querySelector(".underground-carousel-track");
      const prevButton = carousel.querySelector(".carousel-prev");
      const nextButton = carousel.querySelector(".carousel-next");
      let currentIndex = 0;

      function updateCarousel() {
        const slideWidth = track.children[0].clientWidth;
        track.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
      }

      nextButton.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % track.children.length;
        updateCarousel();
      });

      prevButton.addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + track.children.length) % track.children.length;
        updateCarousel();
      });

      window.addEventListener("resize", updateCarousel);
    });
  }

  if (document.querySelector(".remake-process-carousel")) {
    const mainImage = document.getElementById("remake-main-image");
    const title = document.getElementById("remake-image-title");
    const description = document.getElementById("remake-image-description");
    const thumbnails = document.querySelectorAll(".remake-thumbnails .thumbnail");
    let currentIndex = 0;

    const images = Array.from(thumbnails).map(thumb => ({
      src: thumb.src,
      title: thumb.getAttribute("data-title"),
      description: thumb.getAttribute("data-desc"),
    }));

    function updateMainImage(index) {
      mainImage.src = images[index].src;
      title.textContent = images[index].title;
      description.textContent = images[index].description;
      thumbnails.forEach(thumb => thumb.classList.remove("active"));
      thumbnails[index].classList.add("active");
    }

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => {
        currentIndex = index;
        updateMainImage(currentIndex);
      });
    });

    updateMainImage(currentIndex);
  }
});
