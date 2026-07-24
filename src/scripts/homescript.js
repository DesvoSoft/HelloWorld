// @ts-nocheck
function initializeSwiper() {
  if (typeof Swiper !== 'undefined') {
    var swiper = new Swiper(".mySwiper", {
      effect: "coverflow",
      direction: "horizontal",
      centeredSlides: true,
      slidesPerView: "2",

      coverflowEffect: {
        rotate: 25,
        stretch: 10,
        depth: 500,
        modifier: 1,
        slideShadows: true,
      },

      loop: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },

      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },

      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      grabCursor: true,
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
    });
  }
}

function initializeRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeSwiper, 100);
  initializeRevealObserver();
});
