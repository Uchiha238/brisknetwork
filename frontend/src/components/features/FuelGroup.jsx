import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const COURIERS = ['All', 'Aramex', 'DHL', 'Fedex', 'TNT', 'TRACKON', 'BLUEDART', 'Delhivery', 'UPS', 'OM COURIER', 'DTDC', 'XPRESS BEES'];
const COMPANY_TYPES = ['Domestic', 'International'];
const CUSTOMERS = ['All'];

const emptyForm = {
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

const emptyGroup = { name: '', type: 'Domestic' };

const FUEL_API = 'http://localhost:5000/api/fuel-entries';
const GROUP_API = 'http://localhost:5000/api/masters/fuel-groups';

// ─────────────────── helpers ───────────────────
function FieldInput({ label, id, value, onChange, placeholder, type = 'text', className = '' }) {
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

function FieldSelect({ label, id, value, onChange, options, className = '' }) {
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

// ─────────────── Add Fuel Group modal ───────────────
function AddFuelGroupModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyGroup);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const res = await fetch(GROUP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), type: form.type }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      onSave();
    } catch (e2) { setErr(e2.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a8a]">
          <h2 className="text-[13px] font-black text-white uppercase tracking-widest">Add Fuel Group</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg font-bold leading-none">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {err && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2 rounded"><AlertCircle className="h-4 w-4" />{err}</div>}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wide mb-1.5">Fuel Group Name <span className="text-red-500">*</span></label>
            <input
              type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter Fuel Group Name"
              className="w-full border-2 border-slate-200 rounded px-3 py-2 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-[#1e3a8a] transition-colors uppercase placeholder:capitalize placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wide mb-1.5">Type <span className="text-red-500">*</span></label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border-2 border-slate-200 rounded px-3 py-2 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-[#1e3a8a] transition-colors bg-white">
              {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-black uppercase text-[11px] tracking-widest py-2.5 rounded transition-all flex items-center justify-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving...' : 'Save Group'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-black uppercase text-[11px] tracking-widest py-2.5 rounded transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────── Main Component ───────────────
export function FuelGroup() {
  const [view, setView] = useState('list'); // 'list' | 'add-fuel' | 'edit-fuel'
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [fuelGroups, setFuelGroups] = useState([]);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [groupError, setGroupError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deletingGroupId, setDeletingGroupId] = useState(null);
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  // ── fetch helpers ──
  const fetchGroups = async () => {
    try { setLoadingGroups(true); setGroupError('');
      const res = await fetch(GROUP_API);
      setFuelGroups(await res.json());
    } catch (e) { setGroupError(e.message); }
    finally { setLoadingGroups(false); }
  };

  const fetchEntries = async () => {
    try { setLoadingEntries(true);
      const res = await fetch(FUEL_API);
      setFuelEntries(await res.json());
    } catch (_) {}
    finally { setLoadingEntries(false); }
  };

  useEffect(() => { fetchGroups(); fetchEntries(); }, []);

  // ── slab helpers ──
  const updateSlab = (key, idx, field, val) => {
    setForm(f => {
      const slabs = [...f[key]];
      slabs[idx] = { ...slabs[idx], [field]: val };
      return { ...f, [key]: slabs };
    });
  };
  const addSlab = (key) => setForm(f => ({ ...f, [key]: [...f[key], { from: '', to: '', rate: '' }] }));
  const removeSlab = (key, idx) => setForm(f => {
    const slabs = f[key].filter((_, i) => i !== idx);
    return { ...f, [key]: slabs.length ? slabs : [{ from: '', to: '', rate: '' }] };
  });

  // ── open add fuel form ──
  const openAddFuel = () => {
    setEditingEntry(null);
    setForm(emptyForm);
    setFormError('');
    setView('add-fuel');
  };

  const openEditFuel = (entry) => {
    setEditingEntry(entry);
    // split rate_slabs back into two arrays
    const allSlabs = entry.rate_slabs || [];
    const half = Math.ceil(allSlabs.length / 2);
    setForm({
      ...emptyForm,
      fuel_courier: entry.fuel_courier || 'All',
      fuel_price_pct: entry.fuel_price_pct ?? '',
      company_type: entry.company_type || 'Domestic',
      docket_charge: entry.docket_charge ?? '',
      customer: entry.customer || 'All',
      fov_min: entry.fov_min ?? '',
      fov_above: entry.fov_above ?? '',
      fov_below: entry.fov_below ?? '',
      fov_base: entry.fov_base ?? '',
      appointment_min: entry.appointment_min ?? '',
      appointment_per_kg: entry.appointment_per_kg ?? '',
      fuel_from_date: entry.fuel_from_date ?? '',
      fuel_to_date: entry.fuel_to_date ?? '',
      cft: entry.cft ?? '',
      air_cft: entry.air_cft ?? '',
      calculate_on: entry.calculate_on || 'Freight',
      cod_fixed: entry.cod_fixed ?? '',
      topay_fixed: entry.topay_fixed ?? '',
      rate_slabs: allSlabs.slice(0, half).length ? allSlabs.slice(0, half) : [{ from: '', to: '', rate: '' }],
      rate_slabs2: allSlabs.slice(half).length ? allSlabs.slice(half) : [{ from: '', to: '', rate: '' }],
    });
    setFormError('');
    setView('add-fuel');
  };

  // ── submit add/edit fuel ──
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const combined = [
        ...form.rate_slabs.filter(s => s.from || s.to || s.rate),
        ...form.rate_slabs2.filter(s => s.from || s.to || s.rate),
      ];
      const payload = { ...form, rate_slabs: combined };
      delete payload.rate_slabs2;

      const url = editingEntry ? `${FUEL_API}/${editingEntry.id}` : FUEL_API;
      const method = editingEntry ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      await fetchEntries();
      setView('list');
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await fetch(`${GROUP_API}/${id}`, { method: 'DELETE' });
      setDeletingGroupId(null);
      await fetchGroups();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await fetch(`${FUEL_API}/${id}`, { method: 'DELETE' });
      setDeletingEntryId(null);
      await fetchEntries();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const f = (key) => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  // ══════════════════════════════════════════════════════════
  //  ADD / EDIT FUEL FORM VIEW
  // ══════════════════════════════════════════════════════════
  if (view === 'add-fuel') {
    return (
      <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-1 hover:bg-slate-100 rounded transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <h2 className="text-[13px] font-black text-[#1a2f4c] uppercase tracking-wide">
            {editingEntry ? 'Edit Fuel' : 'Add Fuel'}
          </h2>
        </div>

        <form onSubmit={handleFuelSubmit} className="flex-1 p-4 md:p-6">
          <div className="w-full max-w-5xl mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden">

            {/* Form title bar */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-wide">
                {editingEntry ? 'Edit Fuel' : 'Add Fuel'}
              </h3>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2 rounded">
                <AlertCircle className="h-4 w-4 shrink-0" />{formError}
              </div>
            )}

            {/* Two-column grid for form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* LEFT column */}
              <div className="divide-y divide-slate-100">
                <FieldSelect label="Fuel Courier" id="sel-courier" value={form.fuel_courier} onChange={f('fuel_courier')} options={COURIERS} />
                <FieldSelect label="Company Type" id="sel-company-type" value={form.company_type} onChange={f('company_type')} options={COMPANY_TYPES} />
                <FieldSelect label="Customer" id="sel-customer" value={form.customer} onChange={f('customer')} options={CUSTOMERS} />
                <FieldInput label="Fov Above" id="inp-fov-above" value={form.fov_above} onChange={f('fov_above')} placeholder="Enter Fov Above" type="number" />
                <FieldInput label="Fov Below" id="inp-fov-below" value={form.fov_below} onChange={f('fov_below')} placeholder="Enter Fov Below" type="number" />
                <FieldInput label="Appointment Min" id="inp-appt-min" value={form.appointment_min} onChange={f('appointment_min')} placeholder="Enter Appointment Min" type="number" />
                <FieldInput label="Fuel From Date" id="inp-fuel-from" value={form.fuel_from_date} onChange={f('fuel_from_date')} placeholder="" type="date" />
                <FieldInput label="CFT" id="inp-cft" value={form.cft} onChange={f('cft')} placeholder="Enter CFT" type="number" />
                {/* Calculate Fuel Charge On */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-2 py-2 px-4 border-b border-slate-100">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">Calculate Fuel Charge On</label>
                  <div className="flex items-center gap-4">
                    {['Freight', 'Total Amount'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="calculate_on" value={opt} checked={form.calculate_on === opt}
                          onChange={f('calculate_on')} className="accent-[#1e3a8a]" />
                        <span className="text-[11px] font-bold text-slate-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FieldInput label="COD Fixed" id="inp-cod" value={form.cod_fixed} onChange={f('cod_fixed')} placeholder="Enter COD" type="number" />
              </div>

              {/* RIGHT column */}
              <div className="divide-y divide-slate-100">
                <FieldInput label="Fuel Price %" id="inp-fuel-price" value={form.fuel_price_pct} onChange={f('fuel_price_pct')} placeholder="Enter Fuel Price" type="number" />
                <FieldInput label="Docket Charge" id="inp-docket" value={form.docket_charge} onChange={f('docket_charge')} placeholder="Enter Docket Charge" type="number" />
                <FieldInput label="Fov Min" id="inp-fov-min" value={form.fov_min} onChange={f('fov_min')} placeholder="Enter Fov Min" type="number" />
                {/* empty row to align with Fov Above */}
                <div className="py-2 px-4 border-b border-slate-100 h-[44px]" />
                <FieldInput label="Fov Base" id="inp-fov-base" value={form.fov_base} onChange={f('fov_base')} placeholder="Enter Fov Base" type="number" />
                <FieldInput label="Appointment Per KG" id="inp-appt-pkg" value={form.appointment_per_kg} onChange={f('appointment_per_kg')} placeholder="Enter Appointment Per KG" type="number" />
                <FieldInput label="Fuel To Date" id="inp-fuel-to" value={form.fuel_to_date} onChange={f('fuel_to_date')} placeholder="" type="date" />
                <FieldInput label="Air CFT" id="inp-air-cft" value={form.air_cft} onChange={f('air_cft')} placeholder="Enter Air CFT" type="number" />
                {/* spacer for radio row */}
                <div className="py-2 px-4 border-b border-slate-100 h-[44px]" />
                <FieldInput label="ToPay Fixed" id="inp-topay" value={form.topay_fixed} onChange={f('topay_fixed')} placeholder="Enter To Pay Charges" type="number" />
              </div>
            </div>

            {/* Rate Slabs */}
            <div className="border-t border-slate-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slab Group 1 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate Slabs (Group 1)</span>
                  </div>
                  <table className="w-full text-[11px] border border-slate-200 rounded overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-2 py-2 font-black text-slate-600 uppercase text-left">From</th>
                        <th className="px-2 py-2 font-black text-slate-600 uppercase text-left">To</th>
                        <th className="px-2 py-2 font-black text-slate-600 uppercase text-left">Rate%</th>
                        <th className="px-2 py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.rate_slabs.map((slab, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="px-1 py-1"><input type="number" value={slab.from} onChange={e => updateSlab('rate_slabs', idx, 'from', e.target.value)} className="w-full h-7 px-1.5 border border-slate-300 rounded text-[11px] outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-1"><input type="number" value={slab.to} onChange={e => updateSlab('rate_slabs', idx, 'to', e.target.value)} className="w-full h-7 px-1.5 border border-slate-300 rounded text-[11px] outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-1"><input type="number" value={slab.rate} onChange={e => updateSlab('rate_slabs', idx, 'rate', e.target.value)} className="w-full h-7 px-1.5 border border-slate-300 rounded text-[11px] outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-1">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => addSlab('rate_slabs')} className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded text-xs font-black flex items-center justify-center">+</button>
                              <button type="button" onClick={() => removeSlab('rate_slabs', idx)} className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded text-xs font-black flex items-center justify-center">−</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Slab Group 2 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate Slabs (Group 2)</span>
                  </div>
                  <table className="w-full text-[11px] border border-slate-200 rounded overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-2 py-2 font-black text-slate-600 uppercase text-left">From</th>
                        <th className="px-2 py-2 font-black text-slate-600 uppercase text-left">To</th>
                        <th className="px-2 py-2 font-black text-slate-600 uppercase text-left">Rate%</th>
                        <th className="px-2 py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.rate_slabs2.map((slab, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="px-1 py-1"><input type="number" value={slab.from} onChange={e => updateSlab('rate_slabs2', idx, 'from', e.target.value)} className="w-full h-7 px-1.5 border border-slate-300 rounded text-[11px] outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-1"><input type="number" value={slab.to} onChange={e => updateSlab('rate_slabs2', idx, 'to', e.target.value)} className="w-full h-7 px-1.5 border border-slate-300 rounded text-[11px] outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-1"><input type="number" value={slab.rate} onChange={e => updateSlab('rate_slabs2', idx, 'rate', e.target.value)} className="w-full h-7 px-1.5 border border-slate-300 rounded text-[11px] outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-1">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => addSlab('rate_slabs2')} className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded text-xs font-black flex items-center justify-center">+</button>
                              <button type="button" onClick={() => removeSlab('rate_slabs2', idx)} className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded text-xs font-black flex items-center justify-center">−</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-black uppercase text-[11px] tracking-widest px-8 py-2.5 rounded shadow-md transition-all hover:scale-[1.02] flex items-center gap-2">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving...' : editingEntry ? 'Update Fuel' : 'Add Rate'}
              </button>
              <button type="button" onClick={() => setView('list')}
                className="border border-slate-300 text-slate-600 font-black uppercase text-[11px] tracking-widest px-6 py-2.5 rounded transition-all hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-4 pb-4 text-center border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pt-4">
            COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL{' '}
            <span className="text-red-500">+91-9022062666</span>
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  LIST VIEW
  // ══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">All Fuel Group List</h1>
        <div className="flex gap-2">
          <Button id="btn-add-fuel-group" onClick={() => setShowGroupModal(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Fuel Group
          </Button>
          <Button id="btn-add-fuel" onClick={openAddFuel}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Fuel
          </Button>
        </div>
      </div>

      {groupError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-4 py-3 rounded">
          <AlertCircle className="h-4 w-4" />{groupError}
          <button onClick={fetchGroups} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Fuel Groups Table */}
      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-6 text-[11px]">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fuel Groups</span>
        </div>
        <div className="overflow-x-auto">
          {loadingGroups ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : fuelGroups.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 font-bold text-[12px]">No fuel groups yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                  <th className="px-4 py-3 border-r border-slate-100 w-16">ID</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel Group Name</th>
                  <th className="px-4 py-3 border-r border-slate-100">Type</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {fuelGroups.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-500 border-r border-slate-100">{row.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 border-r border-slate-100 uppercase">{row.name}</td>
                    <td className="px-4 py-3 border-r border-slate-100">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${row.type === 'International' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{row.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded shadow-sm"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeletingGroupId(row.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Fuel Entries Table */}
      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-10 text-[11px]">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fuel Entries</span>
        </div>
        <div className="overflow-x-auto">
          {loadingEntries ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : fuelEntries.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 font-bold text-[12px]">No fuel entries yet. Click "Add Fuel" to create one.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                  <th className="px-4 py-3 border-r border-slate-100 w-12">ID</th>
                  <th className="px-4 py-3 border-r border-slate-100">Courier</th>
                  <th className="px-4 py-3 border-r border-slate-100">Type</th>
                  <th className="px-4 py-3 border-r border-slate-100">Customer</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel %</th>
                  <th className="px-4 py-3 border-r border-slate-100">Date Range</th>
                  <th className="px-4 py-3 border-r border-slate-100">Calc On</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {fuelEntries.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-500 border-r border-slate-100">{row.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 border-r border-slate-100 uppercase">{row.fuel_courier}</td>
                    <td className="px-4 py-3 border-r border-slate-100">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${row.company_type === 'International' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{row.company_type}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.customer}</td>
                    <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.fuel_price_pct ?? '—'}%</td>
                    <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.fuel_from_date || '—'} → {row.fuel_to_date || '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.calculate_on}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditFuel(row)} className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded shadow-sm"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeletingEntryId(row.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">
          FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE, COLLEGE ADMISSION SOFTWARE CALL 9022062666 EMAIL: INFO@SVPINFOTECH.COM
        </p>
      </div>

      {/* Add Fuel Group Modal */}
      {showGroupModal && (
        <AddFuelGroupModal
          onClose={() => setShowGroupModal(false)}
          onSave={() => { setShowGroupModal(false); fetchGroups(); }}
        />
      )}

      {/* Delete Group Confirm */}
      {deletingGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteGroup(deletingGroupId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] py-2.5 rounded">Delete</button>
              <button onClick={() => setDeletingGroupId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] py-2.5 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entry Confirm */}
      {deletingEntryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteEntry(deletingEntryId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] py-2.5 rounded">Delete</button>
              <button onClick={() => setDeletingEntryId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] py-2.5 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
