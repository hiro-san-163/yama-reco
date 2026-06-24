document.addEventListener('DOMContentLoaded', () => {

  const areaFilter = document.getElementById('areaFilter');
  const genreFilter = document.getElementById('genreFilter');
  const yearFilter = document.getElementById('yearFilter');

  const pageSizeSelect = document.getElementById('pageSize');

  const recordsList = document.getElementById('recordsList');
  const recordsCount = document.getElementById('recordsCount');

  if (!recordsList) return;

  const pager = new Pagination(10);

  initialize();

  function initialize() {

    populateFilters();

    setupPageSize(
      pageSizeSelect,
      pager,
      renderRecords
    );

    areaFilter.addEventListener('change', renderRecords);
    genreFilter.addEventListener('change', renderRecords);
    yearFilter.addEventListener('change', renderRecords);

    renderRecords();

  }

  function populateFilters() {

    const areas = getUniqueValues('area');
    const genres = getUniqueValues('genre');
    const years = getUniqueValues('year');

    populateSelect(areaFilter, areas);
    populateSelect(genreFilter, genres);
    populateSelect(yearFilter, years);

  }

  function getUniqueValues(key) {

    return [...new Set(
      recordsData
        .map(item => item[key])
        .filter(Boolean)
    )].sort();

  }

  function populateSelect(select, values) {

    values.forEach(value => {

      const option = document.createElement('option');

      option.value = value;
      option.textContent = value;

      select.appendChild(option);

    });

  }

  function renderRecords() {

    const area = areaFilter.value;
    const genre = genreFilter.value;
    const year = yearFilter.value;

    const filtered = recordsData.filter(record => {

      if (area && record.area !== area) return false;
      if (genre && record.genre !== genre) return false;
      if (year && record.year !== year) return false;

      return true;

    });

    filtered.sort((a, b) =>
      b.date_s.localeCompare(a.date_s)
    );

    pager.setData(filtered);

    const pageItems = pager.getCurrentPageItems();

    recordsCount.textContent = `${filtered.length}件`;

    recordsList.innerHTML = '';

    pageItems.forEach(record => {

      recordsList.appendChild(
        createRecordCard(record)
      );

    });

    renderPagination(
      pager,
      document.getElementById('pagination'),
      renderRecords
    );

  }

  function createRecordCard(record) {

    const card = document.createElement('a');

    card.href = record.url;

    card.className = 'record-card';

    card.innerHTML = `
      <div class="record-card-image">
        <img
          src="${record.thumbnail}"
          alt="${record.title}">
      </div>

      <div class="record-card-content">

        <h2 class="record-card-title">
          ${record.title}
        </h2>

        <div class="record-card-meta">

          <span>${record.date_s}</span>

          ${record.area
            ? `<span>｜ ${record.area}</span>`
            : ''}

          ${record.genre
            ? `<span>｜ ${record.genre}</span>`
            : ''}

        </div>

        <p class="record-card-summary">
          ${record.summary || ''}
        </p>

      </div>
    `;

    return card;

  }

});
