/* ======================================
   Navigation Rev.3
   Mobile Navigation Controller
====================================== */

document.addEventListener('DOMContentLoaded', () => {

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  /* Scroll Position */
   
  let scrollPosition = 0; 

  if (!navToggle || !navMenu || !navOverlay) {
    return;
  }

  /* ======================================
     Open Menu
  ====================================== */

  function openMenu() {

    if (navMenu.classList.contains('is-open')) {
       return;
    } 

  scrollPosition = window.scrollY;

  document.body.style.top = `-${scrollPosition}px`;

  navMenu.classList.add('is-open');
  navOverlay.classList.add('is-open');

  document.body.classList.add('nav-open');

  navToggle.setAttribute('aria-expanded', 'true');

}
   
  /* ======================================
     Close Menu
  ====================================== */

  function closeMenu() {

  if (!navMenu.classList.contains('is-open')) {
      return;
   }

  navMenu.classList.remove('is-open');
  navOverlay.classList.remove('is-open');

  document.body.classList.remove('nav-open');

  document.body.style.top = '';

  window.scrollTo(0, scrollPosition);

  navToggle.setAttribute('aria-expanded', 'false');

}
   
  /* ======================================
     Toggle Menu
  ====================================== */

  function toggleMenu() {
    if (navMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* ======================================
     Events
  ====================================== */

  navToggle.addEventListener('click', toggleMenu);

  navOverlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 769) {
      closeMenu();
    }
  });

/* ======================================
   Close Menu After Navigation
====================================== */

navMenu.querySelectorAll('a').forEach((link) => {

  link.addEventListener('click', () => {

    if (window.innerWidth <= 768) {
      closeMenu();
    }

  });

});
   

});
