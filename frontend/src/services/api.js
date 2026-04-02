const BASE_URL = '/api';

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return res.json();
  },

  // Customers
  getCustomers: async () => {
    const res = await fetch(`${BASE_URL}/customers`);
    return res.json();
  },
  
  createCustomer: async (customerData) => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    return res.json();
  },

  updateCustomer: async (id, customerData) => {
    const res = await fetch(`${BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    return res.json();
  },

  deleteCustomer: async (id) => {
    const res = await fetch(`${BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Shipments
  getShipments: async () => {
    const res = await fetch(`${BASE_URL}/shipments`);
    return res.json();
  },

  createShipment: async (shipmentData) => {
    const res = await fetch(`${BASE_URL}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipmentData),
    });
    return res.json();
  },

  updateShipmentStatus: async (id, statusData) => {
    const res = await fetch(`${BASE_URL}/shipments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData),
    });
    return res.json();
  },

  getShipmentTracking: async (id) => {
    const res = await fetch(`${BASE_URL}/shipments/${id}/tracking`);
    return res.json();
  },

  // Reports
  getExportReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/export`);
    return res.json();
  }
};
