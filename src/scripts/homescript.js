// @ts-nocheck
function initializeSwiper() {
  if (typeof Swiper === 'undefined') return;

  // Coverflow recalcula transforms 3D de todas las slides en cada frame y
  // slideShadows crea 20 elementos de sombra mas. En movil no compensa: se usa
  // el efecto plano, que es un solo translate compuesto por GPU.
  const wantsCoverflow =
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  const swiper = new Swiper(".mySwiper", {
    effect: wantsCoverflow ? "coverflow" : "slide",
    direction: "horizontal",
    centeredSlides: true,
    slidesPerView: "2",

    coverflowEffect: {
      rotate: 25,
      stretch: 10,
      depth: 300,
      modifier: 1,
      slideShadows: false,
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

  // El autoplay corria tambien con la galeria fuera de pantalla, moviendo
  // slides que nadie estaba viendo.
  const el = swiper.el;
  if (el && swiper.autoplay && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) swiper.autoplay.start();
          else swiper.autoplay.stop();
        }
      },
      { rootMargin: '100px' }
    ).observe(el);
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
