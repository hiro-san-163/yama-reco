document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  if (!toggle || !menu || !overlay) return;

  let isOpen = false;

  function openMenu() {
    if (isOpen) return;

    isOpen = true;
    menu.classList.add('is-open');
    overlay.classList.add('is-open');

    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!isOpen) return;

    isOpen = false;
    menu.classList.remove('is-open');
    overlay.classList.remove('is-open');

    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // ★重要：遷移100%保証
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {

      closeMenu();

      // Safari描画安定化（遷移阻害回避）
      setTimeout(() => {}, 0);

    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (window.innerWidth > 768) closeMenu();
    }, 150);
  });

});
