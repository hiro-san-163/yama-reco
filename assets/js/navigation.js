document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (!toggle || !menu) {
    return;
  }

  function openMenu() {

    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

  }

  function closeMenu() {

    menu.classList.remove('is-open');
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

  // メニュー内リンクを押したら閉じる
  menu.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', () => {

      closeMenu();

    });

  });

  // メニュー外をタップしたら閉じる
  document.addEventListener('click', (event) => {

    if (!menu.classList.contains('is-open')) {
      return;
    }

    if (
      !menu.contains(event.target) &&
      !toggle.contains(event.target)
    ) {

      closeMenu();

    }

  });

});
