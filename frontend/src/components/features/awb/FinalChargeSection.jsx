import React from 'react';
import { SectionHeader } from '../../shared/FormField';

export function FinalChargeSection({
  formData,
  handleChange,
  masters,
  handleSubmit,
  editingShipmentId = null
}) {
  return (
    <div className="mt-1 border border-slate-300 bg-white">
      <SectionHeader title="Final Charge" />
      <div className="p-2 max-w-lg space-y-1">
        <div className="grid grid-cols-[140px_1fr] items-center gap-1">
          <label className="text-[10px] font-black text-red-600 uppercase">Pay By*</label>
          <select 
            name="bill_type" 
            value={(formData.bill_type || '').toUpperCase()} 
            onChange={handleChange} 
            className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc] outline-none"
          >
            <option value="">-Select-</option>
            {masters.billTypes.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center gap-1">
          <label className="text-[10px] font-black text-slate-700 uppercase">Sub Total</label>
          <input type="number" value={formData.sub_total} readOnly tabIndex={-1} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-slate-100 cursor-not-allowed" />
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center gap-1">
          <label className="text-[10px] font-black text-slate-700 uppercase">CGST Tax</label>
          <input type="number" name="cgst_ch" value={formData.cgst_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center gap-1">
          <label className="text-[10px] font-black text-slate-700 uppercase">SGST Tax</label>
          <input type="number" name="sgst_ch" value={formData.sgst_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
        </div>

        <div className="grid grid-cols-[140px_1fr] items-center gap-1">
          <label className="text-[10px] font-black text-slate-900 uppercase">Grand Total</label>
          <input 
            type="number" 
            name="grand_total"
            value={formData.grand_total} 
            onChange={handleChange}
            className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-white outline-none focus:border-blue-500" 
          />
        </div>

        <div className="flex gap-2 pt-3">
          <button onClick={handleSubmit} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded shadow-md transition-all hover:scale-[1.02]">
            {editingShipmentId ? 'Update' : 'Submit'}
          </button>
          <button onClick={() => window.location.reload()} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded shadow-md transition-all hover:scale-[1.02]">
            New
          </button>
        </div>
      </div>
    </div>
  );
}
