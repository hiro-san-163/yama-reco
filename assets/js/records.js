document.addEventListener('DOMContentLoaded', () => {

 const cards = Array.from(
  document.querySelectorAll('#recordsList .record-card-link'));
  const recordsPage = document.querySelector('.records-page');
  const recordsFilterPanel = document.getElementById('recordsFilterPanel');
  const recordsConditionBar = document.getElementById('recordsConditionBar');
  const recordsConditionSummary = document.getElementById('recordsConditionSummary');

  const areaFilter = document.getElementById('areaFilter');
  const genreFilter = document.getElementById('genreFilter');
  const yearFilter = document.getElementById('yearFilter');
  const pageSizeSelect = document.getElementById('pageSize');
  const searchButton = document.getElementById('searchButton');
  const recordsResetButton = document.getElementById('recordsResetButton');

  const recordsList = document.getElementById('recordsList');
  const recordsCount = document.getElementById('recordsCount');
  const emptyMessage = document.getElementById('recordEmptyMessage');
  const paginationContainer = document.getElementById('pagination');

  const pager = new Pagination(10);
  const mobileQuery = window.matchMedia('(max-width: 768px)');

  let searchApplied = false;

 /**
 * URLへ保持する検索状態キー
 */
const SEARCH_STATE_KEYS = [
  'area',
  'genre',
  'year',
  'page',
  'pageSize'
];
 
  initialize();

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

    recordsResetButton.addEventListener('click', () => {
      resetFilters();

    /**
 * 現在の検索状態を取得する
 *
 * @returns {URLSearchParams}
 */
function getCurrentSearchState() {

  const params = new URLSearchParams();

  if (areaFilter.value) {
    params.set('area', areaFilter.value);
  }

  if (genreFilter.value) {
    params.set('genre', genreFilter.value);
  }

  if (yearFilter.value) {
    params.set('year', yearFilter.value);
  }

  if (pager.getCurrentPage() > 1) {
    params.set('page', pager.getCurrentPage());
  }

  if (pageSizeSelect.value) {
    params.set('pageSize', pageSizeSelect.value);
  }

  return params;

}
     
      searchApplied = false;
      pager.setPage(1);
      renderResults();
    });

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', syncPanelVisibility);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(syncPanelVisibility);
    }

  renderResults();
    
  }

  function populateFilters() {
    populateSelect(areaFilter, getUniqueValues('recordArea'));
    populateSelect(genreFilter, getUniqueValues('recordGenre'));
    populateSelect(yearFilter, getUniqueValues('recordDate', value => value.slice(0, 4)));
  }

  function getUniqueValues(key, mapper) {
    const values = cards
      .map(card => mapper ? mapper(card.dataset[key] || '') : card.dataset[key])
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => b.localeCompare(a, 'ja'));
  }

  function populateSelect(select, values) {
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function resetFilters() {
    areaFilter.value = '';
    genreFilter.value = '';
    yearFilter.value = '';
  }

  function renderResults() {
    const filtered = cards.filter(card => {
      if (areaFilter.value && card.dataset.recordArea !== areaFilter.value) return false;
      if (genreFilter.value && card.dataset.recordGenre !== genreFilter.value) return false;
      if (yearFilter.value && card.dataset.recordDate.slice(0, 4) !== yearFilter.value) return false;
      return true;
    });

    filtered.sort((a, b) => b.dataset.recordDate.localeCompare(a.dataset.recordDate));

    pager.setData(filtered);

    const pageItems = pager.getCurrentPageItems();

    recordsCount.textContent = `${pager.getTotalItems()}件中 ${pageItems.length}件表示`;
    emptyMessage.hidden = pager.getTotalItems() !== 0;

    recordsList.innerHTML = '';

    pageItems.forEach(card => {
      card.hidden = false;
      recordsList.appendChild(card);
    });

    renderPagination(pager, paginationContainer, renderResults);
    renderConditionSummary();
    syncPanelVisibility();
  }

  function renderConditionSummary() {
    if (!recordsConditionSummary) return;

    const summaryParts = [];

    if (areaFilter.value) {
      summaryParts.push(`エリア: ${areaFilter.value}`);
    }

    if (genreFilter.value) {
      summaryParts.push(`ジャンル: ${genreFilter.value}`);
    }

    if (yearFilter.value) {
      summaryParts.push(`年: ${yearFilter.value}`);
    }

    const shouldShowSummary = Boolean(searchApplied && mobileQuery.matches);
    recordsConditionSummary.textContent = summaryParts.length ? summaryParts.join(' / ') : '条件指定なし';
    recordsConditionSummary.hidden = !(shouldShowSummary && summaryParts.length);
  }

  function syncPanelVisibility() {
    const isMobile = mobileQuery.matches;
    const shouldHidePanel = Boolean(searchApplied && isMobile);
    const shouldShowSummary = Boolean(searchApplied && isMobile && shouldHidePanel);

    if (recordsFilterPanel) {
      recordsFilterPanel.hidden = shouldHidePanel;
    }

    if (recordsConditionBar) {
      recordsConditionBar.hidden = !shouldShowSummary;
    }

    if (recordsPage) {
      recordsPage.classList.toggle('is-search-active', shouldHidePanel);
    }

    if (recordsConditionSummary) {
      const summaryParts = [];

      if (areaFilter.value) {
        summaryParts.push(`エリア: ${areaFilter.value}`);
      }

      if (genreFilter.value) {
        summaryParts.push(`ジャンル: ${genreFilter.value}`);
      }

      if (yearFilter.value) {
        summaryParts.push(`年: ${yearFilter.value}`);
      }

      recordsConditionSummary.textContent = summaryParts.length ? summaryParts.join(' / ') : '条件指定なし';
      recordsConditionSummary.hidden = !(shouldShowSummary && summaryParts.length);
    }
  }

});
