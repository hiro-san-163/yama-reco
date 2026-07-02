document.addEventListener('DOMContentLoaded', () => {

  /* ======================================
     Elements
  ====================================== */

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  if (!toggle || !menu || !overlay) {
    return;
  }

  /* ======================================
     Menu Controls
  ====================================== */

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

  /* ======================================
     Events
  ====================================== */

  // ハンバーガーボタン
  toggle.addEventListener('click', (event) => {

    event.preventDefault();
    event.stopPropagation();

    toggleMenu();

  });

  // メニュー項目選択
  menu.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', () => {

      closeMenu();

      // ブラウザ本来のリンク遷移を妨げない
      // preventDefault() は使用しない

    });

  });

  // オーバーレイをタップ
  overlay.addEventListener('click', () => {

    closeMenu();

  });

  // 画面幅がPCになったらメニューを閉じる
  window.addEventListener('resize', () => {

    if (window.innerWidth > 768) {

      closeMenu();

    }

  });

});
