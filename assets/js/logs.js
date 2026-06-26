document.addEventListener('DOMContentLoaded', async () => {

  const logsPage = document.querySelector('.logs-page');
  const logsList = document.getElementById('logsList');
  const logsCount = document.getElementById('logsCount');
  const logsFilterPanel = document.getElementById('logsFilterPanel');
  const logsConditionBar = document.getElementById('logsConditionBar');
  const logsConditionSummary = document.getElementById('logsConditionSummary');
  const paginationContainer = document.getElementById('pagination');

  const sourceHiro = document.getElementById('sourceHiro');
  const sourceSB = document.getElementById('sourceSB');
  const sourceST = document.getElementById('sourceST');

  const keywordFilter = document.getElementById('keywordFilter');
  const areaFilter = document.getElementById('areaFilter');
  const genreFilter = document.getElementById('genreFilter');
  const yearFilter = document.getElementById('yearFilter');
  const monthFilter = document.getElementById('monthFilter');
  const sortFilter = document.getElementById('sortFilter');
  const pageSizeSelect = document.getElementById('pageSize');

  const searchButton = document.getElementById('searchButton');
  const resetButton = document.getElementById('resetButton');
  const logsResetButton = document.getElementById('logsResetButton');

  const pager = new Pagination(10);
  const mobileQuery = window.matchMedia('(max-width: 768px)');

  let allRecords = [];
  let searchApplied = false;
  let currentResults = [];

  try {
    const [hiroData, sbData, stData] = await Promise.all([
      fetch(`${BASE_URL}/data/records_master.json`).then(response => {
        if (!response.ok) throw new Error('records_master.json');
        return response.json();
      }),
      fetch(`${BASE_URL}/data/SBrecords.json`).then(response => {
        if (!response.ok) throw new Error('SBrecords.json');
        return response.json();
      }),
      fetch(`${BASE_URL}/data/STrecords.json`).then(response => {
        if (!response.ok) throw new Error('STrecords.json');
        return response.json();
      })
    ]);

    allRecords = [
      ...hiroData.map(item => normalizeRecord(item, 'hiro')),
      ...sbData.map(item => normalizeRecord(item, 'sb')),
      ...stData.map(item => normalizeRecord(item, 'st'))
    ];

    initialize();
  } catch (error) {
    console.error(error);
    logsList.innerHTML = '<p>データの読み込みに失敗しました。</p>';
  }

  function normalizeRecord(item, source) {
    return {
      ...item,
      source,
      year: item.date_s ? item.date_s.substring(0, 4) : '',
      month: item.date_s ? item.date_s.substring(5, 7) : ''
    };
  }

  function initialize() {
    populateFilters();

    setupPageSize(pageSizeSelect, pager, () => {
      pager.setPage(1);
      renderResults();
    });

    searchButton.addEventListener('click', () => {
      searchApplied = true;
      pager.setPage(1);
      renderResults();
    });

    resetButton.addEventListener('click', resetAndShowFilters);
    logsResetButton.addEventListener('click', resetAndShowFilters);

    sortFilter.addEventListener('change', () => {
      pager.setPage(1);
      renderResults();
    });

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', syncSearchPanelVisibility);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(syncSearchPanelVisibility);
    }

    renderResults();
  }

  function resetAndShowFilters() {
    resetFilters();
    searchApplied = false;
    pager.setPage(1);
    renderResults();
  }

  function syncSearchPanelVisibility() {
    const isMobile = mobileQuery.matches;
    const shouldHidePanel = Boolean(searchApplied && isMobile);

    if (logsFilterPanel) {
      logsFilterPanel.hidden = shouldHidePanel;
    }

    if (logsPage) {
      logsPage.classList.toggle('is-search-active', shouldHidePanel);
    }

    if (logsConditionBar) {
      logsConditionBar.hidden = !shouldHidePanel;
    }
  }

  function resetFilters() {
    keywordFilter.value = '';
    areaFilter.value = '';
    genreFilter.value = '';
    yearFilter.value = '';
    monthFilter.value = '';

    sourceHiro.checked = true;
    sourceSB.checked = true;
    sourceST.checked = true;

    sortFilter.value = 'date_desc';
  }

  function populateFilters() {
    populateSelect(areaFilter, getUniqueValues('area'));
    populateSelect(genreFilter, getUniqueValues('genre'));
    populateSelect(yearFilter, getUniqueValues('year'));
    populateSelect(monthFilter, getUniqueValues('month'));
  }

  function getUniqueValues(key) {
    return [...new Set(
      allRecords
        .map(item => item[key])
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'ja'));
  }

  function populateSelect(select, values) {
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function renderResults() {
    currentResults = sortRecords(getFilteredRecords());
    pager.setData(currentResults);

    const pageItems = pager.getCurrentPageItems();

    logsCount.textContent = `${pager.getTotalItems()}件中 ${pageItems.length}件表示`;

    logsList.innerHTML = '';

    pageItems.forEach(record => {
      logsList.appendChild(createResultCard(record));
    });

    renderPagination(pager, paginationContainer, renderResults);
    renderConditionSummary();
    syncSearchPanelVisibility();
  }

  function getFilteredRecords() {
    const keyword = keywordFilter.value.trim().toLowerCase();
    const area = areaFilter.value;
    const genre = genreFilter.value;
    const year = yearFilter.value;
    const month = monthFilter.value;

    const enabledSources = [];

    if (sourceHiro.checked) enabledSources.push('hiro');
    if (sourceSB.checked) enabledSources.push('sb');
    if (sourceST.checked) enabledSources.push('st');

    return allRecords.filter(record => {
      if (!enabledSources.includes(record.source)) return false;
      if (area && record.area !== area) return false;
      if (genre && record.genre !== genre) return false;
      if (year && record.year !== year) return false;
      if (month && record.month !== month) return false;

      if (keyword) {
        const title = (record.title || '').toLowerCase();
        const summary = (record.summary || '').toLowerCase();

        if (!title.includes(keyword) && !summary.includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  }

  function sortRecords(records) {
    const sorted = [...records];

    switch (sortFilter.value) {
      case 'date_asc':
        sorted.sort((a, b) => a.date_s.localeCompare(b.date_s));
        break;
      case 'title_asc':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ja'));
        break;
      case 'title_desc':
        sorted.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'ja'));
        break;
      default:
        sorted.sort((a, b) => b.date_s.localeCompare(a.date_s));
    }

    return sorted;
  }

  function renderConditionSummary() {
    if (!logsConditionSummary) return;

    const sources = [];
    if (sourceHiro.checked) sources.push('hiro-san');
    if (sourceSB.checked) sources.push('silverboy');
    if (sourceST.checked) sources.push('ショウタン');

    const summaryParts = [];

    if (sources.length !== 3) {
      summaryParts.push(`対象データ: ${sources.length ? sources.join(' / ') : 'なし'}`);
    }

    if (keywordFilter.value.trim()) {
      summaryParts.push(`キーワード: ${keywordFilter.value.trim()}`);
    }

    if (areaFilter.value) {
      summaryParts.push(`エリア: ${areaFilter.value}`);
    }

    if (genreFilter.value) {
      summaryParts.push(`ジャンル: ${genreFilter.value}`);
    }

    if (yearFilter.value) {
      summaryParts.push(`年: ${yearFilter.value}`);
    }

    if (monthFilter.value) {
      summaryParts.push(`月: ${monthFilter.value}`);
    }

    if (sortFilter.value !== 'date_desc') {
      summaryParts.push(`並び順: ${getSortLabel(sortFilter.value)}`);
    }

    logsConditionSummary.textContent = summaryParts.length ? summaryParts.join(' / ') : '条件指定なし';
    logsConditionSummary.hidden = false;
  }

  function getSortLabel(value) {
    switch (value) {
      case 'date_asc':
        return '日付昇順';
      case 'title_asc':
        return 'タイトル昇順';
      case 'title_desc':
        return 'タイトル降順';
      default:
        return '日付降順';
    }
  }

  function truncateSummary(text) {
    if (!text) return '';
    return text.length > 100 ? `${text.substring(0, 100)}…` : text;
  }

  function createResultCard(record) {
    const sourceLabel = {
      hiro: 'hiro-san',
      sb: 'silverboy',
      st: 'ショウタン'
    }[record.source];

    const card = document.createElement('a');

    card.href = record.yamareco_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = `log-card source-${record.source}`;

    card.innerHTML = `
      <div class="log-card-content">
        <div class="log-card-source">${sourceLabel}</div>
        <h2 class="log-card-title">${record.title || ''}</h2>
        <div class="log-card-meta">
          ${record.date_s || ''}
          ｜ ${record.area || ''}
          ｜ ${record.genre || ''}
        </div>
        <p class="log-card-summary">
          ${truncateSummary(record.summary)}
        </p>
      </div>
    `;

    return card;
  }

});
