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

    button.className = 'pagination-button';

    if (active) {
      button.classList.add('active');
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

  container.appendChild(
    createButton('‹', current - 1, current === 1)
  );

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

  container.appendChild(
    createButton(
      '›',
      current + 1,
      current === totalPages
    )
  );

}

window.renderPagination = renderPagination;
