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

const searchButton =
document.getElementById('searchButton');

const resetButton =
document.getElementById('resetButton');

let allRecords = [];

try {

```
const [
  hiroData,
  sbData,
  stData
] = await Promise.all([
  fetch(`${BASE_URL}/data/records_master.json`).then(r => {
    if (!r.ok) throw new Error('records_master.json');
    return r.json();
  }),
  fetch(`${BASE_URL}/data/SBrecords.json`).then(r => {
    if (!r.ok) throw new Error('SBrecords.json');
    return r.json();
  }),
  fetch(`${BASE_URL}/data/STrecords.json`).then(r => {
    if (!r.ok) throw new Error('STrecords.json');
    return r.json();
  })
]);

allRecords = [

  ...hiroData.map(item => ({
    ...item,
    source: 'hiro',
    year: item.date_s
      ? item.date_s.substring(0, 4)
      : '',
    month: item.date_s
      ? item.date_s.substring(5, 7)
      : ''
  })),

  ...sbData.map(item => ({
    ...item,
    source: 'sb',
    year: item.date_s
      ? item.date_s.substring(0, 4)
      : '',
    month: item.date_s
      ? item.date_s.substring(5, 7)
      : ''
  })),

  ...stData.map(item => ({
    ...item,
    source: 'st',
    year: item.date_s
      ? item.date_s.substring(0, 4)
      : '',
    month: item.date_s
      ? item.date_s.substring(5, 7)
      : ''
  }))

];

initialize();
```

} catch (error) {

```
console.error(error);

logsList.innerHTML =
  '<p>データの読み込みに失敗しました。</p>';
```

}

function initialize() {

```
populateFilters();

searchButton.addEventListener(
  'click',
  renderResults
);

resetButton.addEventListener(
  'click',
  resetFilters
);

sortFilter.addEventListener(
  'change',
  renderResults
);

renderResults();
```

}

function resetFilters() {

```
keywordFilter.value = '';

areaFilter.value = '';
genreFilter.value = '';
yearFilter.value = '';
monthFilter.value = '';

sourceHiro.checked = true;
sourceSB.checked = true;
sourceST.checked = true;

sortFilter.value = 'date_desc';

renderResults();
```

}

function populateFilters() {

```
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
```

}

function getUniqueValues(key) {

```
return [...new Set(
  allRecords
    .map(item => item[key])
    .filter(Boolean)
)].sort();
```

}

function populateSelect(select, values) {

```
values.forEach(value => {

  const option =
    document.createElement('option');

  option.value = value;
  option.textContent = value;

  select.appendChild(option);

});
```

}

function renderResults() {

```
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
```

}

function sortResults(records, sort) {

```
const sorted = [...records];

switch (sort) {

  case 'date_asc':

    sorted.sort((a, b) =>
      a.date_s.localeCompare(b.date_s)
    );

    break;

  case 'title_asc':

    sorted.sort((a, b) =>
      a.title.localeCompare(a.title, 'ja')
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
```

}

function truncateSummary(text) {

```
if (!text) return '';

return text.length > 100
  ? text.substring(0, 100) + '…'
  : text;
```

}

function createResultCard(record) {

```
const sourceLabel = {
  hiro: 'hiro-san',
  sb: 'silverboy',
  st: 'ショウタン'
}[record.source];

const card = document.createElement('a');

card.href = record.yamareco_url;

card.target = '_blank';

card.rel = 'noopener noreferrer';

card.className =
  `log-card source-${record.source}`;

card.innerHTML = `
  <div class="log-card-content">

    <div class="log-card-source">
      ${sourceLabel}
    </div>

    <h2 class="log-card-title">
      ${record.title}
    </h2>

    <div class="log-card-meta">
      ${record.date_s}
      ｜ ${record.area}
      ｜ ${record.genre}
    </div>

    <p class="log-card-summary">
      ${truncateSummary(record.summary)}
    </p>

  </div>
`;

return card;
```

}

});
