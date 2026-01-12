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

  /*Pagination
    pagination: {
    el: '.swiper-pagination',
    },*/

  // Navigation with keyboard and mouse
  grabCursor: true,
  keyboard: {
    enabled: true,
    onlyInViewport: false,
  },
});
