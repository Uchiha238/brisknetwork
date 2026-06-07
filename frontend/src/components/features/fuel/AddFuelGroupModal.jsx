import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from "lucide-react";
import { COMPANY_TYPES, emptyGroup, GROUP_API } from './FuelConstants';

function AddFuelGroupModal({ onClose, onSave, editingGroup }) {
  const [form, setForm] = useState(emptyGroup);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editingGroup) {
      setForm({
        name: editingGroup.name,
        type: editingGroup.type.toLowerCase() === 'international' ? 'International' : 'Domestic'
      });
    } else {
      setForm(emptyGroup);
    }
  }, [editingGroup]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const url = editingGroup ? `${GROUP_API}/${editingGroup.id}` : GROUP_API;
      const method = editingGroup ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), type: form.type.toLowerCase() }),
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
          <h2 className="text-[13px] font-black text-white uppercase tracking-widest">
            {editingGroup ? 'Edit Fuel Group' : 'Add Fuel Group'}
          </h2>
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
              {saving ? 'Saving...' : editingGroup ? 'Update Group' : 'Save Group'}
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

export default AddFuelGroupModal;
