export function initNav() {
    const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.main-nav');
const navOverlay = document.querySelector('.nav-overlay');

const toggleNav = () => {
  navMenu.classList.toggle('open');
  navToggle.classList.toggle('active');

  const isOpen = navMenu.classList.contains('open');
  navToggle.setAttribute('aria-expanded', isOpen);

  document.body.style.overflow = isOpen ? "hidden" : "";
};

const closeNav = () => {
  navMenu.classList.remove('open');
  navToggle.classList.remove('active');
  document.body.style.overflow = "";
};

navToggle?.addEventListener('click', toggleNav);
navOverlay?.addEventListener('click', closeNav);
}
