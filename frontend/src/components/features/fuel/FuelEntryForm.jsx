import React from 'react';
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { COURIERS } from './FuelConstants';
import { Footer } from "@/components/shared/Footer";

function FuelEntryForm({ form, setForm, fuelGroups, selectedGroup, editingEntry, formError, saving, onSubmit, onCancel, handlePriceChange }) {
  const f = (key) => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <h2 className="text-[13px] font-black text-[#1a2f4c] uppercase tracking-wide">
          {editingEntry ? 'Edit Fuel' : 'Add Fuel'}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border-2 border-slate-200 rounded shadow-md overflow-hidden">

          {/* Form title bar */}
          <div className="px-4 py-3 bg-[#1a2f4c] border-b border-slate-200">
            <h3 className="text-[12px] font-black text-white uppercase tracking-wide">
              {editingEntry ? 'Edit Fuel Settings' : 'Add Fuel Settings'}
            </h3>
          </div>

          {/* Error banner */}
          {formError && (
            <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2 rounded">
              <AlertCircle className="h-4 w-4 shrink-0" />{formError}
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Fuel Group Selector/Display */}
            {!selectedGroup ? (
              <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">Fuel Group</label>
                <select
                  value={form.fuel_group_id || ''}
                  onChange={e => {
                    const gId = e.target.value;
                    const matchingGroup = fuelGroups.find(g => g.id.toString() === gId.toString());
                    setForm(f => ({
                      ...f,
                      fuel_group_id: gId,
                      company_type: matchingGroup ? (matchingGroup.type.toLowerCase() === 'international' ? 'International' : 'Domestic') : 'Domestic'
                    }));
                  }}
                  className="h-9 px-3 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all bg-white w-full"
                >
                  <option value="">None (Global)</option>
                  {fuelGroups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.type.toUpperCase()})</option>)}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1">
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Fuel Group</span>
                <span className="text-[12px] font-bold text-slate-800 uppercase bg-slate-100 px-3 py-1.5 rounded">{selectedGroup.name}</span>
              </div>
            )}

            {/* Fuel Courier */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">Fuel Courier <span className="text-red-500">*</span></label>
              <select
                value={form.fuel_courier}
                onChange={f('fuel_courier')}
                required
                className="h-9 px-3 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all bg-white w-full"
              >
                <option value="">-Select Courier Company-</option>
                {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Fuel Price % */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">Fuel Price % <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.fuel_price_pct}
                onChange={handlePriceChange}
                placeholder="ENTER FUEL PRICE"
                className="h-9 px-3 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all w-full placeholder:text-slate-400 placeholder:font-bold"
              />
            </div>

            {/* Fuel From Date */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">Fuel From Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.fuel_from_date}
                onChange={f('fuel_from_date')}
                className="h-9 px-3 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all w-full"
              />
            </div>

            {/* Fuel To Date */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide leading-tight">Fuel To Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.fuel_to_date}
                onChange={f('fuel_to_date')}
                className="h-9 px-3 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all w-full"
              />
            </div>
          </div>

          {/* Submit / Action buttons */}
          <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-black uppercase text-[11px] tracking-widest px-8 py-2.5 rounded shadow-md transition-all hover:scale-[1.02] flex items-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving...' : editingEntry ? 'Update Rate' : 'Add Rate'}
            </button>
            <button type="button" onClick={onCancel}
              className="border border-slate-300 text-slate-600 font-black uppercase text-[11px] tracking-widest px-6 py-2.5 rounded transition-all hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      </form>

      <Footer theme="svp" />
    </div>
  );
}

export default FuelEntryForm;
