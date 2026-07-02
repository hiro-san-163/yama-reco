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

  // クリックしたメニュー項目から確実にページ遷移する
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const targetUrl = link.getAttribute('href');
      closeMenu();

      if (!targetUrl) return;

      // メニュー閉じ動作と遷移の競合を避けるため少し遅らせて遷移
      window.setTimeout(() => {
        window.location.assign(new URL(targetUrl, window.location.href).href);
      }, 60);
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
