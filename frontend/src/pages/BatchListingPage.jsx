import { useEffect, useMemo, useState } from 'react';
import { BatchTable } from '../components/BatchTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { getBatches } from '../services/batchApi.js';

const PAGE_SIZE = 5;
const STATUSES = ['Running', 'Upcoming', 'Completed'];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}

export function BatchListingPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [centre, setCentre] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null, centres: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Something went wrong while loading batches.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, search, status, centre]);

  const availableCentres = useMemo(() => {
    const centresFromResponse = result.centres.length ? result.centres : result.data
      .map((batch) => batch.centreName ?? batch.centre)
      .filter(Boolean);
    return [...new Set([...centresFromResponse, ...(centre ? [centre] : [])])].sort((a, b) => a.localeCompare(b));
  }, [result.centres, result.data, centre]);

  const pagination = result.pagination;
  const totalRecords = pagination?.totalRecords ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const firstRecord = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRecord = Math.min(page * PAGE_SIZE, totalRecords);

  function updateFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#batches" aria-label="Learnly home">
          <span className="brand-mark"><LayersIcon /></span>
          <span>learnly<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a href="#dashboard" className="nav-item"><span className="nav-symbol">▦</span> Dashboard</a>
          <a href="#courses" className="nav-item"><span className="nav-symbol">▤</span> Courses</a>
          <a href="#batches" className="nav-item active" aria-current="page"><span className="nav-symbol">▧</span> Batches</a>
          <a href="#students" className="nav-item"><span className="nav-symbol">♙</span> Students</a>
          <a href="#reports" className="nav-item"><span className="nav-symbol">▥</span> Reports</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need a hand?</strong>
            <span>Visit our help center for tips and answers.</span>
            <a href="#help">Go to help center <span aria-hidden="true">↗</span></a>
          </div>
          <button className="profile" type="button">
            <span className="avatar">SV</span>
            <span className="profile-copy"><strong>Workspace Admin</strong><small>Administrator</small></span>
            <span className="profile-menu" aria-hidden="true">···</span>
          </button>
        </div>
      </aside>

      <main className="main-content" id="batches">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Batches</strong></div>
          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notifications"><span className="notification-dot" />♧</button>
            <span className="topbar-divider" />
            <span className="topbar-avatar">SV</span>
            <span className="topbar-name">Sahil Verma</span>
            <span className="chevron" aria-hidden="true">⌄</span>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading-row">
            <div>
              <div className="eyebrow">LEARNING MANAGEMENT</div>
              <h1>Batch operations</h1>
              <p className="page-subtitle">Manage and keep track of all your learning batches.</p>
            </div>
            <button type="button" className="primary-button" title="Batch creation is not included in this assignment">
              <span className="plus">+</span> Create batch
            </button>
          </div>

          <section className="summary-grid" aria-label="Batch overview">
            <article className="summary-card">
              <div className="summary-top"><span>Total batches</span><span className="summary-icon purple">▧</span></div>
              <strong>{loading && !pagination ? '—' : totalRecords}</strong>
              <small><span className="status-dot purple-dot" /> Matching your current view</small>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span>Running</span><span className="summary-icon green">↗</span></div>
              <strong className="muted-number">—</strong>
              <small>Across all centres</small>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span>Upcoming</span><span className="summary-icon blue">◷</span></div>
              <strong className="muted-number">—</strong>
              <small>Across all centres</small>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span>Completed</span><span className="summary-icon amber">✓</span></div>
              <strong className="muted-number">—</strong>
              <small>Across all centres</small>
            </article>
          </section>

          <section className="list-card" aria-labelledby="batch-list-title">
            <div className="list-card-heading">
              <div>
                <h2 id="batch-list-title">All batches</h2>
                <p>View and manage your batches across all learning centres.</p>
              </div>
              <button className="export-button" type="button" onClick={() => window.print()}><span aria-hidden="true">⇩</span> Export</button>
            </div>

            <div className="toolbar">
              <label className="search-box">
                <SearchIcon />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by batch or course..."
                  aria-label="Search by batch code or course name"
                />
                <kbd>⌘ K</kbd>
              </label>
              <div className="filter-group">
                <Filters
                  status={status}
                  centre={centre}
                  statuses={STATUSES}
                  centres={availableCentres}
                  onStatusChange={updateFilter(setStatus)}
                  onCentreChange={updateFilter(setCentre)}
                />
                <button className="more-filters" type="button" onClick={() => { setSearchInput(''); setStatus(''); setCentre(''); setPage(1); }}>
                  <span aria-hidden="true">↺</span> Reset
                </button>
              </div>
            </div>

            <BatchTable data={result.data} loading={loading} error={error} onRetry={() => setPage((current) => current)} />

            {!loading && !error && (
              <Pagination
                page={page}
                totalPages={totalPages}
                firstRecord={firstRecord}
                lastRecord={lastRecord}
                totalRecords={totalRecords}
                onPageChange={setPage}
              />
            )}
          </section>
          <footer className="page-footer"><span>© 2025 Learnly. All rights reserved.</span><span>Help center&nbsp;&nbsp; · &nbsp;&nbsp;Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Terms</span></footer>
        </section>
      </main>
    </div>
  );
}
