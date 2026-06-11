import { useState, useMemo } from 'react';

export function usePagination({ totalItems, initialPageSize = 10, initialPage = 1 }) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return { pages, start, end };
  }, [page, totalPages]);

  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);
  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page,
    pageSize,
    totalPages,
    pageNumbers: pageNumbers.pages,
    goTo,
    next,
    prev,
    setPage,
    changePageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
