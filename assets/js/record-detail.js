document.addEventListener('DOMContentLoaded', () => {

  const expandButtons = document.querySelectorAll('.record-expand-button');
  const desktopLayout = window.matchMedia('(min-width: 769px)');

  const updateExpandableContent = () => {
    expandButtons.forEach((button) => {
      const targetId = button.getAttribute('aria-controls');
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) return;

      target.classList.toggle('is-collapsed', desktopLayout.matches);
      const hasOverflow = desktopLayout.matches && target.scrollHeight > target.clientHeight;

      if (!hasOverflow) {
        target.classList.remove('is-collapsed');
      }

      button.hidden = !hasOverflow;
      button.setAttribute('aria-expanded', String(!hasOverflow));
      button.textContent = hasOverflow ? '続きを読む' : '閉じる';

      if (button.dataset.expandableInitialized) return;
      button.dataset.expandableInitialized = 'true';

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        target.classList.toggle('is-collapsed', isExpanded);
        button.setAttribute('aria-expanded', String(!isExpanded));
        button.textContent = isExpanded ? '続きを読む' : '閉じる';
      });
    });
  };

  updateExpandableContent();
  desktopLayout.addEventListener('change', updateExpandableContent);

  const returnButton = document.getElementById('recordsReturnButton');

  if (!returnButton) return;

  returnButton.addEventListener('click', (event) => {
    event.preventDefault();

    window.location.href = returnButton.href;
    
    }
  });

});
