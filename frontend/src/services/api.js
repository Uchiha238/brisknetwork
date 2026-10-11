export const API_BASE_URL = '/api';

// ─── Token Utilities ────────────────────────────────────────────────────────
export function getAuthToken() {
  try {
    return localStorage.getItem('om-courier-token') || null;
  } catch (e) {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('om-courier-token', token);
    } else {
      localStorage.removeItem('om-courier-token');
    }
  } catch (e) {
    // ignore
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem('om-courier-token');
    localStorage.removeItem('om-courier-user');
  } catch (e) {
    // ignore
  }
}

// ─── Transparent Global Fetch Interceptor ────────────────────────────────────
// Attaches Authorization: Bearer <token> to all /api calls across the frontend
// and catches 401 Unauthorized to trigger session expiration
if (typeof window !== 'undefined' && !window.__om_fetch_interceptor_registered__) {
  window.__om_fetch_interceptor_registered__ = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input, init = {}) {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    }

    const isApiRequest = url.startsWith('/api') || url.includes('/api/');

    if (isApiRequest) {
      const token = getAuthToken();
      let headersObj = {};

      if (init.headers instanceof Headers) {
        init.headers.forEach((val, key) => { headersObj[key] = val; });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, val]) => { headersObj[key] = val; });
      } else if (init.headers && typeof init.headers === 'object') {
        headersObj = { ...init.headers };
      }

      if (token && !headersObj['Authorization'] && !headersObj['authorization']) {
        headersObj['Authorization'] = `Bearer ${token}`;
      }

      init = { ...init, headers: headersObj };
    }

    const response = await originalFetch(input, init);

    if (isApiRequest && response.status === 401) {
      // Don't trigger session expiry for the login attempt itself
      if (!url.includes('/login')) {
        clearAuthSession();
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: { url } }));
      }
    }

    return response;
  };
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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
