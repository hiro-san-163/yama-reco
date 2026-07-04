/* ======================================
   V5 NAVIGATION Rev.2
   assets/js/navigation.js
   Minimal Implementation (3 functions only)
====================================== */

(function () {
  'use strict';

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  if (!navToggle || !navMenu || !navOverlay) return;

  function openMenu() {
    navMenu.classList.add('is-open');
    navOverlay.classList.add('is-active');

    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-lock');
  }

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navOverlay.classList.remove('is-active');

    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-lock');
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.contains('is-open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* --------------------------------------
     EVENT BINDING (minimal only)
  -------------------------------------- */

  navToggle.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', closeMenu);

  /* ESC key support (minimal safety) */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

})();
