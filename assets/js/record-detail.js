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
  if (returnButton) {
    returnButton.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = returnButton.href;
    });
  }

  document.querySelectorAll('.record-map-button[data-map-url]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();

      let mapUrl;
      try {
        mapUrl = new URL(button.dataset.mapUrl, window.location.href);
      } catch (error) {
        console.error('Invalid Yamareco map URL.', error);
        return;
      }

      if (mapUrl.protocol !== 'https:' && mapUrl.protocol !== 'http:') {
        console.error('Yamareco map URL must use HTTP or HTTPS.');
        return;
      }

      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const screenWidth = window.screen && window.screen.availWidth
        ? window.screen.availWidth
        : window.innerWidth;
      const screenHeight = window.screen && window.screen.availHeight
        ? window.screen.availHeight
        : window.innerHeight;
      const popupWidth = isMobile
        ? Math.max(280, screenWidth)
        : Math.min(800, Math.max(280, screenWidth - 100));
      const availableHeight = Math.max(320, screenHeight - 100);
      const hasGraph = mapUrl.searchParams.get('graph') === '1';
      const graphOffset = hasGraph ? 182 : 36;
      const ratio = isMobile ? 0.75 : 0.62;
      const mapHeight = Math.max(
        210,
        Math.min(Math.round(popupWidth * ratio), availableHeight - graphOffset - 40)
      );
      mapUrl.searchParams.set('w', String(popupWidth));
      mapUrl.searchParams.set('h', String(mapHeight));

      const popupHeight = Math.min(screenHeight, mapHeight + graphOffset + 40);
      const popupLeft = Math.max(0, Math.round((screenWidth - popupWidth) / 2));
      const popupTop = Math.max(0, Math.round((screenHeight - popupHeight) / 2));
      const features = [
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${popupLeft}`,
        `top=${popupTop}`,
        'resizable=yes',
        'scrollbars=no'
      ].join(',');

      const popup = window.open('about:blank', '_blank', features);
      if (!popup) return;

      const iframeHeight = mapHeight + graphOffset;
      const safeUrl = mapUrl.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
      popup.document.open();
      popup.document.write(
        '<!doctype html>' +
        '<html lang="ja"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>ヤマレコ山行地図</title>' +
        '<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff}' +
        `iframe{display:block;border:0;width:${popupWidth}px;height:${iframeHeight}px;max-width:100%;max-height:100%;margin:0 auto}</style>` +
        '</head><body><iframe src="' + safeUrl +
        '" title="ヤマレコ山行地図" frameborder="0" scrolling="no"></iframe></body></html>'
      );
      popup.document.close();
    });
  });
});
