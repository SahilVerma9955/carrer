import { useState } from 'react';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();
  const className = normalized === 'running' ? 'running' : normalized === 'upcoming' ? 'upcoming' : 'completed';
  return <span className={`status-badge ${className}`}><span />{status || 'Unknown'}</span>;
}

export function BatchTable({ data, loading, error, onRetry }) {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    await onRetry();
    window.setTimeout(() => setRetrying(false), 350);
  }

  return (
    <div className="table-wrap">
      <table className="batch-table">
        <thead>
          <tr>
            <th>Batch details</th>
            <th>Centre</th>
            <th>Start date</th>
            <th>Capacity</th>
            <th>Status</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="6"><div className="table-message"><span className="spinner" /> Loading batches...</div></td></tr>
          ) : error ? (
            <tr><td colSpan="6"><div className="table-message error-message"><span className="message-icon">!</span><strong>Couldn’t load batches</strong><span>{error}</span><button type="button" className="retry-button" onClick={retry} disabled={retrying}>{retrying ? 'Retrying…' : 'Try again'}</button></div></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan="6"><div className="table-message empty-message"><span className="empty-illustration">⌕</span><strong>No batches found</strong><span>Try changing your search or filters to find what you’re looking for.</span></div></td></tr>
          ) : data.map((batch, index) => {
            const code = batch.batchCode ?? batch.code ?? '—';
            const course = batch.courseName ?? batch.course ?? 'Course';
            const centre = batch.centreName ?? batch.centre ?? '—';
            const enrolled = batch.enrolledStudents ?? batch.enrolled ?? 0;
            const capacity = batch.totalCapacity ?? batch.capacity ?? 0;
            return (
              <tr key={batch.id ?? code}>
                <td><div className="batch-details"><span className={`course-avatar avatar-${index % 5}`}>{course.slice(0, 1).toUpperCase()}</span><span className="batch-copy"><strong>{code}</strong><small>{course}</small></span></div></td>
                <td><span className="centre-name"><span className="pin-icon" aria-hidden="true">⌖</span>{centre}</span></td>
                <td>{formatDate(batch.startDate)}</td>
                <td><div className="capacity-cell"><span>{enrolled} <span className="capacity-total">/ {capacity}</span></span><span className="capacity-track"><span style={{ width: `${capacity > 0 ? Math.min((Number(enrolled) / Number(capacity)) * 100, 100) : 0}%` }} /></span></div></td>
                <td><StatusBadge status={batch.status} /></td>
                <td><button className="row-menu" type="button" aria-label={`More options for ${code}`}>···</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
