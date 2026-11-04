import { useEffect, useMemo, useState } from 'react';
import { BatchTable } from '../components/BatchTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { getBatches } from '../services/batchApi.js';

const PAGE_SIZE = 5;
const STATUSES = ['Running', 'Upcoming', 'Completed'];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
}

function FilterIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4" /></svg>;
}

const navigation = [
  ['♟', 'Franchise Management'],
  ['♙', 'Student Management'],
  ['▣', 'LMS'],
  ['▤', 'Finance'],
  ['▣', 'HRMS'],
  ['⌖', 'Centers'],
  ['▧', 'Assets'],
  ['◉', 'Support'],
];

export function BatchListingPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [centre, setCentre] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null, centres: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getBatches({ page, limit: PAGE_SIZE, search, status, centre, signal: controller.signal })
      .then(setResult)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Something went wrong while loading batches.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, search, status, centre, retryKey]);

  const availableCentres = useMemo(() => {
    const fromApi = result.centres.length ? result.centres : result.data
      .map((batch) => batch.centreName ?? batch.centre)
      .filter(Boolean);
    return [...new Set([...fromApi, ...(centre ? [centre] : [])])].sort((a, b) => a.localeCompare(b));
  }, [result.centres, result.data, centre]);

  const totalRecords = result.pagination?.totalRecords ?? 0;
  const totalPages = result.pagination?.totalPages ?? 0;
  const firstRecord = totalRecords ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, totalRecords);

  function resetFilters() {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setCentre('');
    setPage(1);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(([icon, label], index) => (
            <a key={label} href={`#${label.toLowerCase().replaceAll(' ', '-')}`} className={`nav-item ${index === 0 ? 'active' : ''}`} aria-current={index === 0 ? 'page' : undefined}>
              <span className="nav-symbol" aria-hidden="true">{icon}</span><span>{label}</span>
            </a>
          ))}
        </div>
        <button type="button" className="logout-button"><span aria-hidden="true">⇥</span>Log Out</button>
      </aside>

      <main className="main-content" id="batches">
        <header className="page-header">
          <h1>Batch Operations</h1>
          <button type="button" className="primary-button" title="Batch creation is not included in this assignment"><span className="plus">+</span>Create Batch</button>
        </header>

        <section className="list-card" aria-label="Batch listing">
          <div className="toolbar">
            <label className="search-box">
              <SearchIcon />
              <input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by Name or Tag" aria-label="Search by batch code or course name" />
            </label>
            <div className="filter-group">
              <Filters status={status} centre={centre} statuses={STATUSES} centres={availableCentres} onStatusChange={(value) => { setStatus(value); setPage(1); }} onCentreChange={(value) => { setCentre(value); setPage(1); }} />
              <button type="button" className="filter-button" onClick={resetFilters} aria-label="Reset search and filters" title="Reset search and filters"><FilterIcon /></button>
            </div>
          </div>

          <BatchTable data={result.data} loading={loading} error={error} onRetry={() => setRetryKey((key) => key + 1)} />

          {!loading && !error && <Pagination page={page} totalPages={totalPages} firstRecord={firstRecord} lastRecord={lastRecord} totalRecords={totalRecords} onPageChange={setPage} />}
        </section>
      </main>
    </div>
  );
}
