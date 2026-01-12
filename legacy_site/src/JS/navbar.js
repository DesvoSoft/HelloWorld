// ============ Navbar Script ============

const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdown = document.querySelector('.dropdown');

// Abrir/cerrar el menu al hacer clic en el boton
dropdownBtn.addEventListener('click', () => {
    dropdown.classList.toggle('open');
});

// Cerrar el menu si se hace clic fuera
document.addEventListener('click', event => {
    if (!dropdown.contains(event.target) && !dropdownBtn.contains(event.target)) {
        dropdown.classList.remove('open');
    }
});
