document.addEventListener('DOMContentLoaded', () => {

  const expandButtons = document.querySelectorAll('.record-expand-button');
  const desktopLayout = window.matchMedia('(min-width: 769px)');

  const updateExpandableContent = () => {
    const card = document.querySelector('.record-info');
    const photo = document.querySelector('.record-main-image img');

    if (card) {
      card.style.height = '';
      card.style.maxHeight = '';
      card.style.overflow = '';
    }
    expandButtons.forEach((button) => {
      const target = document.getElementById(button.getAttribute('aria-controls'));
      if (target) target.classList.remove('is-collapsed');
    });

    const photoHeight = photo ? Math.round(photo.getBoundingClientRect().height) : 0;
    const cardNaturalHeight = card ? card.scrollHeight : 0;
    const shouldConstrain = desktopLayout.matches && photoHeight > 0 && cardNaturalHeight > photoHeight;

    if (card && shouldConstrain) {
      card.style.height = `${photoHeight}px`;
      card.style.overflow = 'hidden';
    }

    expandButtons.forEach((button) => {
      const targetId = button.getAttribute('aria-controls');
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) return;

      const lineHeight = parseFloat(window.getComputedStyle(target).lineHeight) || 20;
      const lineCount = Math.max(1, Math.round(target.scrollHeight / lineHeight));
      const hasOverflow = shouldConstrain && lineCount >= 3;

      target.classList.toggle('is-collapsed', hasOverflow);

      button.hidden = !hasOverflow;
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '続きを読む';

      if (button.dataset.expandableInitialized) return;
      button.dataset.expandableInitialized = 'true';

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          target.classList.add('is-collapsed');
          button.setAttribute('aria-expanded', 'false');
          button.textContent = '続きを読む';
          if (card) {
            card.style.height = `${photoHeight}px`;
            card.style.overflow = 'hidden';
          }
        } else {
          target.classList.remove('is-collapsed');
          button.setAttribute('aria-expanded', 'true');
          button.textContent = '閉じる';
          if (card) {
            card.style.height = 'auto';
            card.style.overflow = 'visible';
          }
        }
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
      const mobilePopupStyles = isMobile
        ? 'html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#f3f4f6}' +
          'body{box-sizing:border-box;padding:12px}' +
          '.map-shell{box-sizing:border-box;width:100%;height:100%;display:flex;flex-direction:column;padding:10px;border:1px solid #8a9199;border-radius:8px;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.16)}' +
          '.map-close{align-self:flex-end;min-width:44px;height:44px;margin:0 0 8px;padding:0;border:1px solid #b5bac1;border-radius:6px;background:#fff;color:#333;font-size:1.1rem;font-weight:700;cursor:pointer}' +
          `.map-frame{flex:1;min-height:0;border:1px solid #d0d4d8;border-radius:4px;overflow:hidden}` +
          `iframe{display:block;width:100%;height:100%;border:0}`
        : 'html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#f3f4f6}' +
          'body{box-sizing:border-box;padding:16px}' +
          '.map-shell{box-sizing:border-box;width:fit-content;height:100%;margin:0 auto;display:flex;flex-direction:column;padding:10px;border:1px solid #8a9199;border-radius:8px;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.16)}' +
          '.map-close{display:none}' +
          `.map-frame{flex:1;border:1px solid #d0d4d8;border-radius:4px;overflow:hidden}` +
          `iframe{display:block;width:${popupWidth}px;height:100%;border:0}`;
      popup.document.write(
        '<!doctype html>' +
        '<html lang="ja"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>ヤマレコ山行地図</title>' +
        `<style>${mobilePopupStyles}</style>` +
        '</head><body>' +
        '<div class="map-shell">' +
        '<button type="button" class="map-close" aria-label="地図を閉じる">閉じる</button>' +
        '<div class="map-frame">' +
        '<iframe src="' + safeUrl +
        '" title="ヤマレコ山行地図" frameborder="0" scrolling="no"></iframe>' +
        '</div></div>' +
        '<script>' +
        'document.querySelector(".map-close").addEventListener("click", function () { window.close(); });' +
        (isMobile
          ? 'document.body.addEventListener("click", function (event) { if (event.target === document.body) window.close(); });'
          : '') +
        '</script>' +
        '</body></html>'
      );
      popup.document.close();
    });
  });
});
