import React from 'react';
import { SectionHeader } from './FormField';

export function FinalChargeSection({
  formData,
  handleChange,
  masters,
  handleSubmit
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
          <input type="number" value={
            Number(formData.freight_ch) + Number(formData.awb_ch) + Number(formData.ras_ch) + Number(formData.ers_ch) +
            Number(formData.odd_dimension_ch) + Number(formData.address_change_ch) + Number(formData.ddp_ch) +
            Number(formData.dg_ch) + Number(formData.import_duty_ch) + Number(formData.clearance_ch) +
            Number(formData.adc_noc_ch) + Number(formData.ess_ch) + Number(formData.electronic_item_ch) +
            Number(formData.odd_weight_ch) + Number(formData.other_ch) + Number(formData.fuel_surcharge) +
            Number(formData.packing_ch) + Number(formData.handling_ch) + Number(formData.destination_ch) +
            Number(formData.transport_ch) + Number(formData.oda_ch)
          } readOnly className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-slate-100 cursor-not-allowed" />
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
          <label className="text-[10px] font-black text-slate-700 uppercase">IGST Tax</label>
          <input type="number" name="igst_ch" value={formData.igst_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center gap-1">
          <label className="text-[10px] font-black text-slate-900 uppercase">Grand Total</label>
          <input type="number" value={
            Number(formData.freight_ch) + Number(formData.awb_ch) + Number(formData.ras_ch) + Number(formData.ers_ch) +
            Number(formData.odd_dimension_ch) + Number(formData.address_change_ch) + Number(formData.ddp_ch) +
            Number(formData.dg_ch) + Number(formData.import_duty_ch) + Number(formData.clearance_ch) +
            Number(formData.adc_noc_ch) + Number(formData.ess_ch) + Number(formData.electronic_item_ch) +
            Number(formData.odd_weight_ch) + Number(formData.other_ch) + Number(formData.fuel_surcharge) +
            Number(formData.packing_ch) + Number(formData.handling_ch) + Number(formData.destination_ch) +
            Number(formData.transport_ch) + Number(formData.oda_ch) +
            Number(formData.cgst_ch) + Number(formData.sgst_ch) + Number(formData.igst_ch)
          } readOnly className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-slate-100 cursor-not-allowed" />
        </div>

        <div className="flex gap-2 pt-3">
          <button onClick={handleSubmit} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded shadow-md transition-all hover:scale-[1.02]">
            Submit
          </button>
          <button onClick={() => window.location.reload()} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded shadow-md transition-all hover:scale-[1.02]">
            New
          </button>
        </div>
      </div>
    </div>
  );
}
