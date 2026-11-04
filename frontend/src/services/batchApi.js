export async function getBatches({ page, limit, search, status, centre, signal }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    status,
    centre,
  });

  const response = await fetch(`/api/batches?${params.toString()}`, { signal });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(response.ok ? 'The server returned an invalid response.' : `Request failed with status ${response.status}.`);
  }

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Unable to fetch batches (HTTP ${response.status}).`);
  }

  if (!Array.isArray(body.data)) {
    throw new Error('The batches API response is missing a data array.');
  }

  return {
    data: body.data,
    pagination: body.pagination ?? { page, limit, totalRecords: body.data.length, totalPages: body.data.length ? 1 : 0 },
    centres: body.availableFilters?.centres ?? body.filters?.centres ?? [],
  };
}
