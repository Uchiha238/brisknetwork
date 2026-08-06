export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://brisknetwork-backend.onrender.com/api'
);

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // Guard: if the server returns non-JSON (e.g. HTML error page when backend is down),
  // parse safely and throw a meaningful error instead of crashing with SyntaxError
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Backend unreachable (HTTP ${res.status}). Is the server running?`);
  }

  const data = await res.json();

  // Surface HTTP error codes as thrown errors so callers can catch them
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
  }

  return data;
}

function jsonBody(method, data) {
  return { method, body: JSON.stringify(data) };
}

// ─── Masters ─────────────────────────────────────────────────────────────────
export const getStates     = ()     => apiFetch('/masters/states');
export const getCountries  = ()     => apiFetch('/masters/countries');
export const getModes      = ()     => apiFetch('/modes');
export const getBranches   = ()     => apiFetch('/branches');
export const getCompanies  = ()     => apiFetch('/company');
export const getRateGroups = (type) => apiFetch(`/masters/rate-groups?type=${type}`);
export const getFuelGroups = (type) => apiFetch(`/masters/fuel-groups?type=${type}`);

// ─── Legacy api object (kept for existing callers) ───────────────────────────
export const api = {
  // Auth
  login: (credentials) =>
    apiFetch('/login', jsonBody('POST', credentials)),

  // Dashboard
  getDashboardStats: () => apiFetch('/dashboard'),

  // Customers
  getCustomers:    ()               => apiFetch('/customers'),
  createCustomer:  (data)           => apiFetch('/customers',     jsonBody('POST', data)),
  updateCustomer:  (id, data)       => apiFetch(`/customers/${id}`, jsonBody('PUT', data)),
  deleteCustomer:  (id)             => apiFetch(`/customers/${id}`, { method: 'DELETE' }),

  // Shipments
  getShipments:         ()         => apiFetch('/shipments'),
  getShipment:          (id)       => apiFetch(`/shipments/${id}`),
  createShipment:       (data)     => apiFetch('/shipments',        jsonBody('POST', data)),
  updateShipment:       (id, data) => apiFetch(`/shipments/${id}`,  jsonBody('PUT', data)),
  deleteShipment:       (id)       => apiFetch(`/shipments/${id}`,  { method: 'DELETE' }),
  updateShipmentStatus: (id, data) => apiFetch(`/shipments/${id}/status`, jsonBody('PUT', data)),
  getShipmentTracking:  (id)       => apiFetch(`/shipments/${id}/tracking`),

  // Reports
  getExportReport: () => apiFetch('/reports/export'),
};
