document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll(".record-card"));
  const list = document.getElementById("records-list");

  const titleFilter = document.getElementById("record-filter-title");
  const areaFilter = document.getElementById("record-filter-area");
  const genreFilter = document.getElementById("record-filter-genre");
  const sortSelect = document.getElementById("record-sort");

  const searchButton = document.getElementById("record-search-button");
  const resetButton = document.getElementById("record-reset-button");

  const listTitle = document.getElementById("record-list-title");
  const resultCount = document.getElementById("record-result-count");
  const emptyMessage = document.getElementById("record-empty-message");
  const pagination = document.getElementById("record-pagination");

  const PAGE_SIZE = 12;

  let filteredCards = [];
  let currentPage = 1;

  initializeFilters();
  bindEvents();
  applyRecords({ resetPage: true, initial: true });

  function bindEvents() {
    searchButton.addEventListener("click", () => {
      applyRecords({ resetPage: true });
    });

    resetButton.addEventListener("click", () => {
      titleFilter.value = "";
      areaFilter.value = "";
      genreFilter.value = "";
      sortSelect.value = "desc";
      applyRecords({ resetPage: true, initial: true });
    });

    titleFilter.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        applyRecords({ resetPage: true });
      }
    });

    sortSelect.addEventListener("change", () => {
      applyRecords({ resetPage: true });
    });

    cards.forEach(card => {
      card.addEventListener("click", () => {
        const url = card.dataset.url;

        if (url) {
          window.location.href = url;
        }
      });
    });
  }

  function initializeFilters() {
    populateSelect(
      areaFilter,
      getUniqueValues(cards, "recordArea").sort((a, b) => a.localeCompare(b, "ja"))
    );

    populateSelect(
      genreFilter,
      getUniqueValues(cards, "recordGenre").sort((a, b) => a.localeCompare(b, "ja"))
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

  function applyRecords({ resetPage = false, initial = false } = {}) {
    if (resetPage) {
      currentPage = 1;
    }

    filteredCards = cards
      .filter(matchesFilters)
      .sort(compareCards);

    renderCards();
    renderPagination();
    updateStatus(initial);
  }

  function matchesFilters(card) {
    const titleQuery = normalize(titleFilter.value);
    const selectedArea = areaFilter.value;
    const selectedGenre = genreFilter.value;

    const titleMatch =
      !titleQuery ||
      normalize(card.dataset.recordTitle).includes(titleQuery);

    const areaMatch =
      !selectedArea ||
      card.dataset.recordArea === selectedArea;

    const genreMatch =
      !selectedGenre ||
      card.dataset.recordGenre === selectedGenre;

    return titleMatch && areaMatch && genreMatch;
  }

  function compareCards(a, b) {
    const aDate = a.dataset.recordDate || "";
    const bDate = b.dataset.recordDate || "";

    if (sortSelect.value === "asc") {
      return aDate.localeCompare(bDate);
    }

    return bDate.localeCompare(aDate);
  }

  function renderCards() {
    cards.forEach(card => {
      card.hidden = true;
    });

    filteredCards.forEach(card => {
      list.appendChild(card);
    });

    const pageCards = getCurrentPageCards();

    pageCards.forEach(card => {
      card.hidden = false;
    });
  }

  function getCurrentPageCards() {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCards.slice(start, start + PAGE_SIZE);
  }

  function renderPagination() {
    const pageCount = Math.ceil(filteredCards.length / PAGE_SIZE);

    pagination.innerHTML = "";
    pagination.hidden = pageCount <= 1;

    if (pageCount <= 1) {
      return;
    }

    pagination.appendChild(createPageButton("前へ", currentPage - 1, currentPage === 1));

    for (let page = 1; page <= pageCount; page++) {
      if (shouldShowPage(page, pageCount)) {
        pagination.appendChild(createPageButton(String(page), page, false, page === currentPage));
      }
    }

    pagination.appendChild(createPageButton("次へ", currentPage + 1, currentPage === pageCount));
  }

  function shouldShowPage(page, pageCount) {
    return (
      page === 1 ||
      page === pageCount ||
      Math.abs(page - currentPage) <= 2
    );
  }

  function createPageButton(label, page, disabled, current = false) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "pagination-button";
    button.textContent = label;
    button.disabled = disabled;

    if (current) {
      button.classList.add("is-current");
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      if (disabled || current) {
        return;
      }

      currentPage = page;
      renderCards();
      renderPagination();
      updateStatus(false);
    });

    return button;
  }

  function updateStatus(initial) {
    const visibleCount = getCurrentPageCards().length;
    const totalCount = filteredCards.length;

    listTitle.textContent = initial ? "最新の山行記録" : "検索結果";
    resultCount.textContent = `${totalCount}件中 ${visibleCount}件表示`;
    emptyMessage.hidden = totalCount !== 0;
  }

  function normalize(value) {
    return (value || "").trim().toLowerCase();
  }
});
