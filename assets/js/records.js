document.addEventListener('DOMContentLoaded', () => {

  const cards = Array.from(document.querySelectorAll('#recordsList .record-card'));
  const areaFilter = document.getElementById('areaFilter');
  const genreFilter = document.getElementById('genreFilter');
  const yearFilter = document.getElementById('yearFilter');
  const pageSizeSelect = document.getElementById('pageSize');
  const searchButton = document.getElementById('searchButton');

  const recordsList = document.getElementById('recordsList');
  const recordsCount = document.getElementById('recordsCount');
  const emptyMessage = document.getElementById('recordEmptyMessage');
  const paginationContainer = document.getElementById('pagination');

  const pager = new Pagination(10);

  initialize();

  function initialize() {
    populateFilters();

    setupPageSize(pageSizeSelect, pager, () => {
      pager.setPage(1);
      renderResults();
    });

    searchButton.addEventListener('click', () => {
      pager.setPage(1);
      renderResults();
    });

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        if (url) {
          window.location.href = url;
        }
      });
    });

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
  }

});
