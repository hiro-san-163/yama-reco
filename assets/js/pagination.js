class Pagination {

  constructor(pageSize = 10) {

    this.pageSize = pageSize;
    this.currentPage = 1;
    this.data = [];

  }

  setData(data) {

    this.data = Array.isArray(data) ? data : [];

    const totalPages = this.getTotalPages();

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages || 1;
    }

  }

  setPage(page) {

    const totalPages = this.getTotalPages();

    if (totalPages === 0) {
      this.currentPage = 1;
      return;
    }

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    this.currentPage = page;

  }

  setPageSize(size) {

    this.pageSize = Number(size) || 10;
    this.currentPage = 1;

  }

  getCurrentPageItems() {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.data.slice(
      start,
      start + this.pageSize
    );

  }

  getTotalPages() {

    return Math.ceil(
      this.data.length / this.pageSize
    );

  }

  getCurrentPage() {

    return this.currentPage;

  }

  getPageSize() {

    return this.pageSize;

  }

  getTotalItems() {

    return this.data.length;

  }

}

window.Pagination = Pagination;

/**
 * 表示件数セレクトボックスを初期化する
 *
 * @param {HTMLSelectElement} selectElement 表示件数<select>
 * @param {Pagination} pager Paginationインスタンス
 * @param {Function} onChange 表示件数変更時のコールバック
 */
function setupPageSize(selectElement, pager, onChange) {

  const pageSizes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  // option生成
  selectElement.innerHTML = "";

  pageSizes.forEach(size => {

    const option = document.createElement("option");

    option.value = size;
    option.textContent = `${size}件`;

    selectElement.appendChild(option);

  });

  // 現在の表示件数を反映
  selectElement.value = String(pager.getPageSize());

  // 変更イベント
  selectElement.addEventListener("change", (event) => {

    const pageSize = Number(event.target.value);

    pager.setPageSize(pageSize);

    if (typeof onChange === "function") {
      onChange();
    }

  });

}

window.setupPageSize = setupPageSize;

/**
 * ページネーションを描画する
 *
 * @param {Pagination} pager Paginationインスタンス
 * @param {HTMLElement} container ページネーション表示先
 * @param {Function} onPageChange ページ変更時のコールバック
 */
function renderPagination(pager, container, onPageChange) {

  if (!container) return;

  container.innerHTML = '';

  const totalPages = pager.getTotalPages();

  if (totalPages <= 1) return;

  const current = pager.getCurrentPage();

  function createButton(label, page, disabled = false, active = false) {

    const button = document.createElement('button');

    button.textContent = label;
    button.type = 'button';
    button.className = 'pagination-btn';

    if (active) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'page');
    }

    if (disabled) {
      button.disabled = true;
      return button;
    }

    button.addEventListener('click', () => {

      pager.setPage(page);
      onPageChange();

    });

    return button;

  }

	function createDots() {

  const dots = document.createElement('span');

  dots.className = 'pagination-dots';
  dots.textContent = '⋯';

  return dots;

}
  
  container.appendChild(
  createButton('«', 1, current === 1)
　);

  container.appendChild(
  createButton('‹', current - 1, current === 1)
  );

  const maxVisiblePages = 10;

if (totalPages <= maxVisiblePages) {

  for (let page = 1; page <= totalPages; page++) {

    container.appendChild(
      createButton(
        page,
        page,
        false,
        page === current
      )
    );

  }

} else {

// 先頭ページ
container.appendChild(
  createButton(
    1,
    1,
    false,
    current === 1
  )
);

// 左側の ... が必要な場合
if (current > 4) {

  container.appendChild(
    createDots()
  );

}

let startPage;
let endPage;

if (current <= 4) {

  startPage = 2;
  endPage = Math.min(5, totalPages - 1);

} else if (current >= totalPages - 3) {

  startPage = Math.max(2, totalPages - 4);
  endPage = totalPages - 1;

} else {

  startPage = current - 1;
  endPage = current + 1;

}

for (let page = startPage; page <= endPage; page++) {

  container.appendChild(
    createButton(
      page,
      page,
      false,
      page === current
    )
  );

}
	
// 右側の ... が必要な場合
if (current < totalPages - 3) {

  container.appendChild(
    createDots()
  );

}

// 最終ページ
container.appendChild(
  createButton(
    totalPages,
    totalPages,
    false,
    current === totalPages
  )
);

}   // else の終了

container.appendChild(
  createButton(
    '›',
    current + 1,
    current === totalPages
  )
);

container.appendChild(
  createButton(
    '»',
    totalPages,
    current === totalPages
  )
);

}   // renderPagination の終了

window.renderPagination = renderPagination; 
