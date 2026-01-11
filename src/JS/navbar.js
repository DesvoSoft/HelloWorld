// ============ Navbar Script ============

function loadNavbar(basePath = "./") {
  const navbarHTML = `
    <div class="navbar-inner">
        <div class="logo">
            <a href="${basePath}index.html"><span class="code-line-logo"></span>Hello World</a>
        </div>
        <nav>
            <ul class="links">
                <li><a href="${basePath}src/pages/python.html" class="navbutton">Python</a></li>
                <li><a href="${basePath}src/pages/git.html" class="navbutton">Git</a></li>
                <li><a href="${basePath}src/pages/raptor.html" class="navbutton">Raptor</a></li>
                <li><a href="${basePath}src/pages/crypto.html" class="navbutton">Crypto</a></li>
                <li><a href="${basePath}index.html#contact" class="navbutton">Contacto</a></li>
            </ul>
        </nav>
        
        <!-- Boton hamburguesa -->
        <button class="dropdown-btn" aria-label="Abrir menú">☰</button>

        <!-- Menu desplegable -->
        <div class="dropdown">
            <ul>
                <li><a href="${basePath}src/pages/python.html" class="navbutton">Python</a></li>
                <li><a href="${basePath}src/pages/git.html" class="navbutton">Git</a></li>
                <li><a href="${basePath}src/pages/raptor.html" class="navbutton">Raptor</a></li>
                <li><a href="${basePath}src/pages/crypto.html" class="navbutton">Crypto</a></li>
                <li><a href="${basePath}index.html#contact" class="navbutton">Contacto</a></li>
            </ul>
        </div>
    </div>
    `;

  const navbarContainer = document.querySelector(".navbar");
  if (navbarContainer) {
    navbarContainer.innerHTML = navbarHTML;
    setupNavbarEvents();
  }
}

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
        !dropdown.contains(event.target) &&
        !dropdownBtn.contains(event.target)
      ) {
        dropdown.classList.remove("open");
      }
    });
  }
}

// Initialize based on script attribute or default
document.addEventListener("DOMContentLoaded", () => {
  const scriptTag = document.querySelector('script[src*="navbar.js"]');
  const basePath = scriptTag
    ? scriptTag.getAttribute("data-basepath") || "./"
    : "./";
  loadNavbar(basePath);
});
