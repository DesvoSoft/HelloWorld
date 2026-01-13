// ============ Navbar Script ============
// Note: In Astro, the navbar structure is already in the HTML, so we only need event handlers

function setupNavbarEvents() {
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const dropdown = document.querySelector(".dropdown");

  if (dropdownBtn && dropdown) {
    // Abrir/cerrar el menu al hacer clic en el boton
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });

    // Cerrar el menu si se hace clic fuera
    document.addEventListener("click", (event) => {
      if (
        event.target instanceof Node &&
        !dropdown.contains(event.target) &&
        !dropdownBtn.contains(event.target)
      ) {
        dropdown.classList.remove("open");
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", setupNavbarEvents);
