import React from 'react';

export const COURIERS = ['All', 'Aramex', 'DHL', 'Fedex', 'TNT', 'TRACKON', 'BLUEDART', 'Delhivery', 'UPS', 'OM COURIER', 'DTDC', 'XPRESS BEES'];
export const COMPANY_TYPES = ['Domestic', 'International'];
export const CUSTOMERS = ['All'];

export const emptyForm = {
  fuel_group_id: '',
  fuel_courier: 'All',
  fuel_price_pct: '',
  company_type: 'Domestic',
  docket_charge: '',
  customer: 'All',
  fov_min: '',
  fov_above: '',
  fov_below: '',
  fov_base: '',
  appointment_min: '',
  appointment_per_kg: '',
  fuel_from_date: '',
  fuel_to_date: '',
  cft: '',
  air_cft: '',
  calculate_on: 'Freight',
  cod_fixed: '',
  topay_fixed: '',
  rate_slabs: [{ from: '', to: '', rate: '' }],
  rate_slabs2: [{ from: '', to: '', rate: '' }],
};

export const emptyGroup = { name: '', type: 'Domestic' };

import { API_BASE_URL } from '@/services/api';

export const FUEL_API = `${API_BASE_URL}/fuel-entries`;
export const GROUP_API = `${API_BASE_URL}/masters/fuel-groups`;

// ─────────────────── helpers ───────────────────
export function FieldInput({ label, id, value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <div className={`grid grid-cols-[160px_1fr] items-center gap-2 py-2 px-4 border-b border-slate-100 ${className}`}>
      <label htmlFor={id} className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-8 px-2 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal w-full max-w-xs"
      />
    </div>
  );
}

export function FieldSelect({ label, id, value, onChange, options, className = '' }) {
  return (
    <div className={`grid grid-cols-[160px_1fr] items-center gap-2 py-2 px-4 border-b border-slate-100 ${className}`}>
      <label htmlFor={id} className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="h-8 px-2 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all bg-white w-full max-w-xs"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// Format date to DD/MM/YYYY
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Calculate Active Status dynamically based on date range
export const getStatus = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 'Inactive';
  const todayStr = new Date().toISOString().split('T')[0];
  if (todayStr >= fromDate && todayStr <= toDate) {
    return 'Active';
  }
  return 'Expired';
};
