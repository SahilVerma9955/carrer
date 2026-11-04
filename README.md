# Batch Operations

Frontend-first implementation for the batch listing assignment. The React app expects a backend endpoint at `GET /api/batches` and is configured to proxy API requests to `http://localhost:5000` during development. Backend implementation is intentionally not included yet.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. To use a backend running on a different port, set `VITE_API_PROXY_TARGET`, for example:

```bash
VITE_API_PROXY_TARGET=http://localhost:4000 npm run dev
```

The frontend requests `GET /api/batches?page=1&limit=5&search=&status=&centre=`. It expects a JSON response with a `data` array and pagination fields such as `totalRecords` and `totalPages`. Loading, API error, and empty-result states are included.
