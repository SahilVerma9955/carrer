export function Filters({ status, centre, statuses, centres, onStatusChange, onCentreChange }) {
  return (
    <>
      <label className="select-wrap">
        <span className="sr-only">Filter by status</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <span className="select-chevron" aria-hidden="true">⌄</span>
      </label>
      <label className="select-wrap">
        <span className="sr-only">Filter by centre</span>
        <select value={centre} onChange={(event) => onCentreChange(event.target.value)}>
          <option value="">All centres</option>
          {centres.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <span className="select-chevron" aria-hidden="true">⌄</span>
      </label>
    </>
  );
}
