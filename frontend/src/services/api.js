const BASE_URL = '/api';

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
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
