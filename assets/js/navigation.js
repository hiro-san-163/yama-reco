document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  if (!toggle || !menu || !overlay) {
    return;
  }

  function openMenu() {

    menu.classList.add('is-open');
    overlay.classList.add('is-open');

    toggle.setAttribute('aria-expanded', 'true');

    document.body.style.overflow = 'hidden';

  }

  function closeMenu() {

    menu.classList.remove('is-open');
    overlay.classList.remove('is-open');

    toggle.setAttribute('aria-expanded', 'false');

    document.body.style.overflow = '';

  }

  function toggleMenu() {

    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }

  }

  // ハンバーガーボタン
  toggle.addEventListener('click', (event) => {

    event.stopPropagation();
    toggleMenu();

  });

  // メニュー項目選択
  menu.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', () => {

      closeMenu();

    });

  });

  // オーバーレイクリック
  overlay.addEventListener('click', () => {

    closeMenu();

  });

});
