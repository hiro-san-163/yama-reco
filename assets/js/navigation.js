document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {

    menu.classList.toggle('is-open');

    const expanded =
      toggle.getAttribute('aria-expanded') === 'true';

    toggle.setAttribute(
      'aria-expanded',
      String(!expanded)
    );

  });

});
