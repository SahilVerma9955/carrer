export function Pagination({ page, totalPages, firstRecord, lastRecord, totalRecords, onPageChange }) {
  if (totalRecords === 0) {
    return <div className="pagination-bar"><span className="record-count">Showing <strong>0</strong> of <strong>0</strong> batches</span></div>;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.length <= 5
    ? pages
    : [...new Set([1, ...(page > 3 ? ['left-ellipsis'] : []), ...pages.filter((number) => number >= page - 1 && number <= page + 1 && number !== 1 && number !== totalPages), ...(page < totalPages - 2 ? ['right-ellipsis'] : []), totalPages])];

  return (
    <div className="pagination-bar">
      <span className="record-count">Showing <strong>{firstRecord}–{lastRecord}</strong> of <strong>{totalRecords}</strong> batches</span>
      <nav className="pagination-controls" aria-label="Batch pages">
        <button type="button" className="page-arrow" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">← <span>Previous</span></button>
        {visiblePages.map((item) => typeof item === 'number'
          ? <button type="button" key={item} className={`page-number ${page === item ? 'selected' : ''}`} onClick={() => onPageChange(item)} aria-current={page === item ? 'page' : undefined}>{item}</button>
          : <span className="page-ellipsis" key={item}>…</span>)}
        <button type="button" className="page-arrow" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page"><span>Next</span> →</button>
      </nav>
    </div>
  );
}
