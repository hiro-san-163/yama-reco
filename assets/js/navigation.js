document.addEventListener('DOMContentLoaded', () => {

  /* ======================================
     Elements
  ====================================== */

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  if (!toggle || !menu || !overlay) return;

  let isOpen = false;

  /* ======================================
     State Control
  ====================================== */

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

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  }

  /* ======================================
     Events
  ====================================== */

  // ハンバーガー
  toggle.addEventListener('click', (e) => {

    e.preventDefault();
    e.stopPropagation();

    toggleMenu();

  });

  // オーバーレイ
  overlay.addEventListener('click', () => {
    closeMenu();
  });

  // メニューリンク（重要：遷移安定化）
  menu.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', (e) => {

      // 先に閉じるだけ（遷移はブラウザに完全委任）
      closeMenu();

      // Safari対策：一部環境で再描画遅延が遷移阻害するため軽く逃がす
      setTimeout(() => {}, 0);

    });

  });

  // 画面リサイズで強制リセット
  window.addEventListener('resize', () => {

    if (window.innerWidth > 768) {
      closeMenu();
    }

  });

  // 画面回転対策（スマホ特有）
  window.addEventListener('orientationchange', () => {

    setTimeout(() => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    }, 200);

  });

});
