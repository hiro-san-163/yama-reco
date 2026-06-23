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
