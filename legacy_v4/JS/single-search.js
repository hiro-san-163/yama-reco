// 山行記録 検索・一覧表示用スクリプト
(async function () {
  'use strict';

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const SHOW_SOURCE =
  window.searchConfig?.showSource || false;
  
  /* =====================================
     データ取得
  ===================================== */

  const DATA_URL =
    window.searchConfig?.dataUrl || 'data/records.json';

  const resp = await fetch(DATA_URL);

  if (!resp.ok) return;

  const raw = await resp.json();

  // データ形式差異に対応
  const records = Array.isArray(raw)
    ? raw
    : (raw.records || raw.items || Object.values(raw));

  const norm = records.map(r => ({
    date: r.date_s || '',
    area: r.area || '',
    genre: r.genre || '',
    title: r.title || '',
    summary: r.summary || '',
    url: r.yamareco_url || r.url || '',
    __source: r.__source || ''
  })).filter(r => r.date || r.title);

  /* =====================================
     日付処理
  ===================================== */

  const toYear = d => {
    const m = String(d).match(/(\d{4})/);
    return m ? Number(m[1]) : null;
  };

  const toMonth = d => {
    if (!d) return null;

    const m1 = String(d).match(/\d{4}[-\/](\d{1,2})/);
    if (m1) return Number(m1[1]);

    const m2 = String(d).match(/\d{4}年(\d{1,2})月/);
    if (m2) return Number(m2[1]);

    return null;
  };

  const safeDate = d =>
    isNaN(Date.parse(d)) ? 0 : Date.parse(d);

  /* =====================================
     DOM
  ===================================== */

  const header = document.querySelector('.search-header');
  const filters = document.querySelector('.filters');

  const yearSel = document.getElementById('year');
  const monthSel = document.getElementById('month');
  const areaSel = document.getElementById('area');
  const genreSel = document.getElementById('genre');
  const sortSel = document.getElementById('sort');
  const pageSizeInput = document.getElementById('pageSize');
  const keywordInput = document.getElementById('keyword');

  const countEl = document.getElementById('count');
  const listEl = document.getElementById('list');
  const paginationEl = document.getElementById('pagination');

  /* =====================================
     ページ状態
  ===================================== */

  let currentPage = 1;
  let totalPages = 1;
  let filteredData = [];

  /* =====================================
     セレクト生成
  ===================================== */

  function fillSelect(sel, label, values) {

    sel.innerHTML = `<option value="">${label}：すべて</option>`;

    values.forEach(v => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      sel.appendChild(o);
    });
  }

  fillSelect(
    yearSel,
    '年',
    [...new Set(norm.map(r => toYear(r.date)).filter(Boolean))]
      .sort((a, b) => b - a)
  );

  fillSelect(
    monthSel,
    '月',
    [...new Set(norm.map(r => toMonth(r.date)).filter(Boolean))]
      .sort((a, b) => a - b)
  );

  fillSelect(
    areaSel,
    '山域',
    [...new Set(norm.map(r => r.area).filter(Boolean))]
  );

  fillSelect(
    genreSel,
    'ジャンル',
    [...new Set(norm.map(r => r.genre).filter(Boolean))]
  );

  /* =====================================
     ソート
  ===================================== */

  function sortData(data, sortType) {

    const sorted = [...data];

    switch (sortType) {

      case 'date_asc':
        sorted.sort((a, b) =>
          safeDate(a.date) - safeDate(b.date)
        );
        break;

      case 'date_desc':
        sorted.sort((a, b) =>
          safeDate(b.date) - safeDate(a.date)
        );
        break;

      case 'title_asc':
        sorted.sort((a, b) =>
          a.title.localeCompare(b.title, 'ja')
        );
        break;

      case 'title_desc':
        sorted.sort((a, b) =>
          b.title.localeCompare(a.title, 'ja')
        );
        break;

      default:
        sorted.sort((a, b) =>
          safeDate(b.date) - safeDate(a.date)
        );
    }

    return sorted;
  }

  /* =====================================
     ページネーション
  ===================================== */

  function renderPagination() {

    paginationEl.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {

      const btn = document.createElement('button');

      btn.textContent = i;

      if (i === currentPage) {
        btn.classList.add('active');
      }

      btn.onclick = () => {
        currentPage = i;
        renderResults();
      };

      paginationEl.appendChild(btn);
    }
  }

  /* =====================================
     結果描画
  ===================================== */

  function renderResults() {

    const pageSize = Number(pageSizeInput.value) || 20;

    const startIdx = (currentPage - 1) * pageSize;

    const endIdx = startIdx + pageSize;

    const pageData =
      filteredData.slice(startIdx, endIdx);

    listEl.innerHTML = '';

    if (pageData.length === 0) {

      listEl.innerHTML =
        `<div class="empty">該当する記録がありません</div>`;

      return;
    }

    pageData.forEach(r => {

      const card = document.createElement('div');

      card.className = 'card';

      if (isMobile) {

        card.innerHTML = `
          <div class="meta">
            ${r.date} / ${r.area} / ${r.genre}
            
            ${SHOW_SOURCE && r.__source
              ? `<span class="source source-${r.__source}">
                   ${r.__source}
                 </span>`
             : ''
            }
          </div>

          <div class="title">
            <a href="${r.url}" target="_blank">
              ${r.title}
            </a>
          </div>
        `;

      } else {

        card.innerHTML = `
          <div class="date">${r.date}</div>

          <div class="title">
            <a href="${r.url}" target="_blank">
              ${r.title}
            </a>
          </div>

          <div class="meta">
             山域：${r.area} / ジャンル：${r.genre}

             ${SHOW_SOURCE && r.__source
               ? `<span class="source source-${r.__source}">
                    ${r.__source}
                   </span>`
                 : ''
                }
          </div>
          
          ${r.url
            ? `<a class="btn" href="${r.url}" target="_blank">記事を開く</a>`
            : ''
          }
        `;
      }

      card.style.cursor = 'pointer';

      card.addEventListener('click', (e) => {

        if (e.target.closest('a')) return;

        if (r.url) {
          window.open(r.url, '_blank');
        }
      });

      listEl.appendChild(card);
    });

    renderPagination();
  }

  /* =====================================
     フィルタ
  ===================================== */

  function applyFilters() {

    const y = yearSel.value;
    const m = monthSel.value;
    const a = areaSel.value;
    const g = genreSel.value;

    const keywords =
      keywordInput.value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    const sortType = sortSel.value;

    let filtered = norm.filter(r => {

      if (y && toYear(r.date) !== Number(y)) {
        return false;
      }

      if (m && toMonth(r.date) !== Number(m)) {
        return false;
      }

      if (a && r.area !== a) {
        return false;
      }

      if (g && r.genre !== g) {
        return false;
      }

      if (keywords.length) {

        const text =
          `${r.title} ${r.summary}`.toLowerCase();

        return keywords.every(k =>
          text.includes(k)
        );
      }

      return true;
    });

    filteredData = sortData(filtered, sortType);

    currentPage = 1;

    const pageSize =
      Number(pageSizeInput.value) || 20;

    totalPages =
      Math.ceil(filteredData.length / pageSize) || 1;

    countEl.textContent =
      `該当件数：${filteredData.length}件 / 全${norm.length}件`;

    renderResults();
    renderPagination();
  }

  /* =====================================
     スマホUI
  ===================================== */

  if (isMobile) {

    const searchBtn = document.createElement('button');

    searchBtn.type = 'button';
    searchBtn.className = 'search-apply-btn';
    searchBtn.textContent = '検索する';

    filters.appendChild(searchBtn);

    const summary = document.createElement('div');

    summary.className = 'search-summary';
    summary.hidden = true;

    summary.innerHTML = `
      <div class="summary-text"></div>
      <button class="summary-edit">
        条件を変更
      </button>
    `;

    header.after(summary);

    function buildSummary() {

      const p = [];

      if (yearSel.value) {
        p.push(`年=${yearSel.value}`);
      }

      if (monthSel.value) {
        p.push(`月=${monthSel.value}`);
      }

      if (areaSel.value) {
        p.push(`山域=${areaSel.value}`);
      }

      if (genreSel.value) {
        p.push(`ジャンル=${genreSel.value}`);
      }

      if (keywordInput.value.trim()) {
        p.push(`KW=${keywordInput.value.trim()}`);
      }

      return p.join(' / ') || 'すべて';
    }

    searchBtn.onclick = () => {

      applyFilters();

      header.classList.add('cond-hidden');

      summary.hidden = false;

      summary.querySelector('.summary-text').textContent =
        `検索条件：${buildSummary()}`;
    };

    summary.querySelector('.summary-edit').onclick = () => {

      header.classList.remove('cond-hidden');

      summary.hidden = true;
    };

    applyFilters();

  } else {

    [
      yearSel,
      monthSel,
      areaSel,
      genreSel,
      sortSel,
      pageSizeInput
    ].forEach(el =>
      el.addEventListener('change', applyFilters)
    );

    keywordInput.addEventListener('keyup', (e) => {

      if (e.key === 'Enter') {
        applyFilters();
      }
});
    
    applyFilters();
  }

})();
