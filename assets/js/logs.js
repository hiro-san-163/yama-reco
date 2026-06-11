document.addEventListener('DOMContentLoaded', async () => {

  const logsList = document.getElementById('logsList');
  const logsCount = document.getElementById('logsCount');

  const sourceHiro = document.getElementById('sourceHiro');
  const sourceSB = document.getElementById('sourceSB');
  const sourceST = document.getElementById('sourceST');

  const keywordFilter = document.getElementById('keywordFilter');
  const areaFilter = document.getElementById('areaFilter');
  const genreFilter = document.getElementById('genreFilter');
  const yearFilter = document.getElementById('yearFilter');
  const monthFilter = document.getElementById('monthFilter');
  const sortFilter = document.getElementById('sortFilter');

  let allRecords = [];

  try {

    const [
      hiroData,
      sbData,
      stData
    ] = await Promise.all([
      fetch('/data/records_master.json').then(r => r.json()),
      fetch('/data/SBrecords.json').then(r => r.json()),
      fetch('/data/STrecords.json').then(r => r.json())
    ]);

    allRecords = [
  ...hiroData.map(item => ({
    ...item,
    source: 'hiro',
    year: item.date_s ? item.date_s.substring(0, 4) : '',
    month: item.date_s ? item.date_s.substring(5, 7) : ''
  })),

  ...sbData.map(item => ({
    ...item,
    source: 'sb',
    year: item.date_s ? item.date_s.substring(0, 4) : '',
    month: item.date_s ? item.date_s.substring(5, 7) : ''
  })),

  ...stData.map(item => ({
    ...item,
    source: 'st',
    year: item.date_s ? item.date_s.substring(0, 4) : '',
    month: item.date_s ? item.date_s.substring(5, 7) : ''
  }))
];
    
    initialize();

  } catch (error) {

    console.error(error);

    logsList.innerHTML =
      '<p>データの読み込みに失敗しました。</p>';

  }

  function initialize() {

    populateFilters();

    [
      sourceHiro,
      sourceSB,
      sourceST,
      keywordFilter,
      areaFilter,
      genreFilter,
      yearFilter,
      monthFilter,
      sortFilter
    ].forEach(element => {

      const eventType =
        element.type === 'search'
          ? 'input'
          : 'change';

      element.addEventListener(
        eventType,
        renderResults
      );

    });

    renderResults();

  }

  function populateFilters() {

    populateSelect(
      areaFilter,
      getUniqueValues('area')
    );

    populateSelect(
      genreFilter,
      getUniqueValues('genre')
    );

    populateSelect(
      yearFilter,
      getUniqueValues('year')
    );

    populateSelect(
      monthFilter,
      getUniqueValues('month')
    );

  }

  function getUniqueValues(key) {

    return [...new Set(
      allRecords
        .map(item => item[key])
        .filter(Boolean)
    )].sort();

  }

  function populateSelect(select, values) {

    values.forEach(value => {

      const option =
        document.createElement('option');

      option.value = value;
      option.textContent = value;

      select.appendChild(option);

    });

  }

  function renderResults() {

    const keyword =
      keywordFilter.value.trim().toLowerCase();

    const area = areaFilter.value;
    const genre = genreFilter.value;
    const year = yearFilter.value;
    const month = monthFilter.value;
    const sort = sortFilter.value;

    const enabledSources = [];

    if (sourceHiro.checked)
      enabledSources.push('hiro');

    if (sourceSB.checked)
      enabledSources.push('sb');

    if (sourceST.checked)
      enabledSources.push('st');

    let results = allRecords.filter(record => {

      if (
        !enabledSources.includes(record.source)
      ) {
        return false;
      }

      if (area && record.area !== area)
        return false;

      if (genre && record.genre !== genre)
        return false;

      if (year && record.year !== year)
        return false;

      if (month && record.month !== month)
        return false;

      if (keyword) {

        const title =
          (record.title || '').toLowerCase();

        const summary =
          (record.summary || '').toLowerCase();

        if (
          !title.includes(keyword) &&
          !summary.includes(keyword)
        ) {
          return false;
        }

      }

      return true;

    });

    results = sortResults(results, sort);

    logsCount.textContent =
      `${results.length}件`;

    logsList.innerHTML = '';

    results.forEach(record => {

      logsList.appendChild(
        createResultCard(record)
      );

    });

  }

  function sortResults(records, sort) {

    const sorted = [...records];

    switch (sort) {

      case 'date_asc':

        sorted.sort((a, b) =>
          a.date_s.localeCompare(b.date_s)
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
          b.date_s.localeCompare(a.date_s)
        );

    }

    return sorted;

  }

  function createResultCard(record) {

    const card = document.createElement('a');

    card.href = record.yamareco_url;

    card.target = '_blank';

    card.rel = 'noopener noreferrer';

    card.className = 'log-card';

    card.innerHTML = `
      <div class="log-card-content">

        <h2 class="log-card-title">
          ${record.title}
        </h2>

        <div class="log-card-meta">
          ${record.date_s}
          ｜ ${record.area}
          ｜ ${record.genre}
        </div>

        <p class="log-card-summary">
          ${record.summary || ''}
        </p>

      </div>
    `;

    return card;

  }

});
