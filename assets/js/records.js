document.addEventListener("DOMContentLoaded", () => {

  const cards = Array.from(document.querySelectorAll(".record-card"));

  const yearFilter = document.getElementById("record-filter-year");
  const areaFilter = document.getElementById("record-filter-area");
  const genreFilter = document.getElementById("record-filter-genre");

  const searchButton = document.getElementById("record-search-button");
  const resetButton = document.getElementById("record-reset-button");

  const listTitle = document.getElementById("record-list-title");
  const resultCount = document.getElementById("record-result-count");
  const emptyMessage = document.getElementById("record-empty-message");

  const INITIAL_COUNT = 5;

  /* -----------------------------
     初期化
  ----------------------------- */

  initializeFilters();
  initializeCards();
  showLatestRecords();

  /* -----------------------------
     イベント
  ----------------------------- */

  searchButton.addEventListener("click", searchRecords);

  resetButton.addEventListener("click", () => {

    yearFilter.value = "";
    areaFilter.value = "";
    genreFilter.value = "";

    showLatestRecords();

  });

  /* -----------------------------
     カードクリック
  ----------------------------- */

  cards.forEach(card => {

    card.addEventListener("click", () => {

      const url = card.dataset.url;

      if (url) {
        window.location.href = url;
      }

    });

  });

  /* -----------------------------
     フィルター生成
  ----------------------------- */

  function initializeFilters() {

    populateSelect(
      yearFilter,
      getUniqueValues(cards, "recordYear").sort().reverse()
    );

    populateSelect(
      areaFilter,
      getUniqueValues(cards, "recordArea").sort()
    );

    populateSelect(
      genreFilter,
      getUniqueValues(cards, "recordGenre").sort()
    );

  }

  function getUniqueValues(cardList, key) {

    return [...new Set(
      cardList
        .map(card => card.dataset[key])
        .filter(Boolean)
    )];

  }

  function populateSelect(selectElement, values) {

    values.forEach(value => {

      const option = document.createElement("option");

      option.value = value;
      option.textContent = value;

      selectElement.appendChild(option);

    });

  }

  /* -----------------------------
     初期表示
  ----------------------------- */

  function showLatestRecords() {

    cards.forEach(card => {
      card.hidden = true;
    });

    cards.slice(0, INITIAL_COUNT).forEach(card => {
      card.hidden = false;
    });

    listTitle.textContent = "最新の山行記録";
    resultCount.textContent = `${Math.min(INITIAL_COUNT, cards.length)}件表示`;

    emptyMessage.hidden = true;

  }

  /* -----------------------------
     検索
  ----------------------------- */

  function searchRecords() {

    const selectedYear = yearFilter.value;
    const selectedArea = areaFilter.value;
    const selectedGenre = genreFilter.value;

    let visibleCount = 0;

    cards.forEach(card => {

      const yearMatch =
        !selectedYear ||
        card.dataset.recordYear === selectedYear;

      const areaMatch =
        !selectedArea ||
        card.dataset.recordArea === selectedArea;

      const genreMatch =
        !selectedGenre ||
        card.dataset.recordGenre === selectedGenre;

      const matched =
        yearMatch &&
        areaMatch &&
        genreMatch;

      card.hidden = !matched;

      if (matched) {
        visibleCount++;
      }

    });

    listTitle.textContent = "検索結果";
    resultCount.textContent = `${visibleCount}件表示`;

    emptyMessage.hidden = visibleCount !== 0;

  }

});
