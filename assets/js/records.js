document.addEventListener('DOMContentLoaded', () => {

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

  const recordsData = Array.isArray(window.recordsData) ? window.recordsData : [];

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

    renderResults();
  }

  function populateFilters() {
    populateSelect(areaFilter, getUniqueValues('area'));
    populateSelect(genreFilter, getUniqueValues('genre'));
    populateSelect(yearFilter, getUniqueValues('year'));
  }

  function getUniqueValues(key) {
    return [...new Set(
      recordsData
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
    const filtered = recordsData.filter(record => {
      if (areaFilter.value && record.area !== areaFilter.value) return false;
      if (genreFilter.value && record.genre !== genreFilter.value) return false;
      if (yearFilter.value && record.year !== yearFilter.value) return false;
      return true;
    });

    filtered.sort((a, b) => b.date_s.localeCompare(a.date_s));

    pager.setData(filtered);

    const pageItems = pager.getCurrentPageItems();

    recordsCount.textContent = `${pager.getTotalItems()}件中 ${pageItems.length}件表示`;
    emptyMessage.hidden = pager.getTotalItems() !== 0;

    recordsList.innerHTML = '';

    pageItems.forEach(record => {
      recordsList.appendChild(createRecordCard(record));
    });

    renderPagination(pager, paginationContainer, renderResults);
  }

  function createRecordCard(record) {
    const card = document.createElement('a');
    card.href = record.url;
    card.className = 'record-card';

    const hasThumb = Boolean(record.thumbnail);

    card.innerHTML = `
      ${hasThumb ? `
      <div class="record-card-image">
        <img src="${record.thumbnail}" alt="${record.title}">
      </div>
      ` : ''}
      <div class="record-card-content">
        <h2 class="record-card-title">${record.title || ''}</h2>
        <div class="record-card-meta">
          <span>${record.date_s || ''}</span>
          ${record.area ? `<span>｜ ${record.area}</span>` : ''}
          ${record.genre ? `<span>｜ ${record.genre}</span>` : ''}
        </div>
        <p class="record-card-summary">${record.summary || ''}</p>
      </div>
    `;

    if (hasThumb) {
      card.classList.add('has-thumb');
    }

    return card;
  }

});
