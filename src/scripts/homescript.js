// @ts-nocheck
/* Creating an intersection observer */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry);
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});

/* Adding the observer to the elements */
const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

// Wait for Swiper to be available and DOM to be ready
function initializeSwiper() {
  if (typeof Swiper !== 'undefined') {
    var swiper = new Swiper(".mySwiper", {
      effect: "coverflow",
      direction: "horizontal",
      centeredSlides: true,
      slidesPerView: "2",

      // Settings for coverflow effect
      coverflowEffect: {
        rotate: 25,
        stretch: 10,
        depth: 500,
        modifier: 1,
        slideShadows: true,
      },

      // Loop and autoplay
      loop: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },

      // Pagination
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },

      // Navigation
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // Navigation with keyboard and mouse
      grabCursor: true,
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
    });
  }
}

// Initialize both features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      console.log(entry);
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show");
      }
    });
  });

  // Adding the observer to the elements
  const hiddenElements = document.querySelectorAll(".hidden");
  hiddenElements.forEach((el) => observer.observe(el));

  // Initialize Swiper with a small delay to ensure Swiper library is loaded
  setTimeout(initializeSwiper, 100);
});
