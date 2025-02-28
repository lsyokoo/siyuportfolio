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





//remake
document.addEventListener("DOMContentLoaded", function () {
  const mainImage = document.getElementById("remake-main-image");
  const title = document.getElementById("remake-image-title");
  const description = document.getElementById("remake-image-description");
  const thumbnails = document.querySelectorAll(".remake-thumbnails .thumbnail");
  const prevButton = document.querySelector(".carousel-prev");
  const nextButton = document.querySelector(".carousel-next");

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

  prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateMainImage(currentIndex);
  });

  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateMainImage(currentIndex);
  });


  updateMainImage(currentIndex);

  function resizeMainImage() {
    const windowHeight = window.innerHeight * 0.8; 
    mainImage.style.maxHeight = `${windowHeight}px`;
  }


  window.addEventListener("resize", resizeMainImage);
  resizeMainImage();
});


//shoe
document.addEventListener("DOMContentLoaded", function () {
  function setupProcessCarousel(carouselClass, mainImageId, thumbnailsClass, overlayText) {
    const mainImage = document.getElementById(mainImageId);
    const thumbnails = document.querySelectorAll(`.${thumbnailsClass} .thumbnail`);
    const prevButton = document.querySelector(`.${carouselClass} .carousel-prev`);
    const nextButton = document.querySelector(`.${carouselClass} .carousel-next`);
    const overlay = document.querySelector(`.${carouselClass} .hover-overlay`);

    let currentIndex = 0;
    const images = Array.from(thumbnails).map(thumb => thumb.src);

    function updateMainImage(index) {
      mainImage.src = images[index];
      thumbnails.forEach(thumb => thumb.classList.remove("active"));
      thumbnails[index].classList.add("active");
    }

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => {
        currentIndex = index;
        updateMainImage(currentIndex);
      });
    });

    prevButton.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateMainImage(currentIndex);
    });

    nextButton.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateMainImage(currentIndex);
    });

    // gray and text hover
    mainImage.parentElement.addEventListener("mouseenter", () => {
      mainImage.style.filter = "brightness(60%)";
      overlay.textContent = overlayText;
      overlay.style.opacity = "1";
    });

    mainImage.parentElement.addEventListener("mouseleave", () => {
      mainImage.style.filter = "brightness(100%)";
      overlay.style.opacity = "0";
    });


    updateMainImage(currentIndex);
  }


  setupProcessCarousel("basic-carousel", "basic-main-image", "basic-thumbnails", "Basics: Daily Collection");
  setupProcessCarousel("statement-carousel", "statement-main-image", "statement-thumbnails", "Statement Shoes");


  document.querySelectorAll(".research-collage img").forEach((image) => {
    image.addEventListener("mouseenter", function () {
      this.style.filter = "brightness(60%)";
    });
    image.addEventListener("mouseleave", function () {
      this.style.filter = "brightness(100%)";
    });
  });
});


//uniform
document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".finaluniform-carousel-track");

  if (track) {
    const slides = Array.from(track.children);

    slides.forEach((slide) => {
      let clone = slide.cloneNode(true);
      track.appendChild(clone);
    });

    track.addEventListener("mouseenter", function () {
      track.style.animationPlayState = "paused";
    });

    track.addEventListener("mouseleave", function () {
      track.style.animationPlayState = "running";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  function setupUniformProcessCarousel(carouselClass, mainImageId, thumbnailsClass, hoverTextId) {
    const mainImage = document.getElementById(mainImageId);
    const thumbnails = document.querySelectorAll(`.${thumbnailsClass} .thumbnail`);
    const prevButton = document.querySelector(`.${carouselClass} .carousel-prev`);
    const nextButton = document.querySelector(`.${carouselClass} .carousel-next`);
    const hoverText = document.getElementById(hoverTextId);

    let currentIndex = 0;
    const images = Array.from(thumbnails).map(thumb => ({
      src: thumb.src,
      title: thumb.getAttribute("data-title"),
      desc: thumb.getAttribute("data-desc"),
    }));

    function updateMainImage(index) {
      mainImage.src = images[index].src;
      hoverText.innerHTML = `<h3>${images[index].title}</h3><p>${images[index].desc}</p>`;
      thumbnails.forEach(thumb => thumb.classList.remove("active"));
      thumbnails[index].classList.add("active");
    }

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => {
        currentIndex = index;
        updateMainImage(currentIndex);
      });
    });

    prevButton.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateMainImage(currentIndex);
    });

    nextButton.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateMainImage(currentIndex);
    });

    updateMainImage(currentIndex);
  }

  setupUniformProcessCarousel(
    "uniform-process-carousel",
    "uniform-process-main-image",
    "uniform-process-thumbnails",
    "uniform-hover-text"
  );
});

