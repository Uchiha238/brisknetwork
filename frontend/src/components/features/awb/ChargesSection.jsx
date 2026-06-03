import React from 'react';
import { SectionHeader } from './FormField';

export function ChargesSection({
  formData,
  handleChange
}) {
  return (
    <div className="mt-1 border border-slate-300 bg-white">
      {formData.service === "SURFACE CARGO" ? (
        <>
          <SectionHeader title="Charges" />
          <div className="p-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {/* Left Column */}
              <div className="space-y-1">
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Freight</label>
                  <input type="number" name="freight_ch" value={formData.freight_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">AWB Charges</label>
                  <input type="number" name="awb_ch" value={formData.awb_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">RAS Ch.</label>
                  <input type="number" name="ras_ch" value={formData.ras_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">ERS Ch.</label>
                  <input type="number" name="ers_ch" value={formData.ers_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Odd Dimension Ch.</label>
                  <input type="number" name="odd_dimension_ch" value={formData.odd_dimension_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Address Change Ch.</label>
                  <input type="number" name="address_change_ch" value={formData.address_change_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">DDP Ch.</label>
                  <input type="number" name="ddp_ch" value={formData.ddp_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">DG Ch.</label>
                  <input type="number" name="dg_ch" value={formData.dg_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Import Duty Ch.</label>
                  <input type="number" name="import_duty_ch" value={formData.import_duty_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1 mt-2 pt-2 border-t border-slate-200">
                  <label className="text-[10px] font-black text-slate-900 uppercase">Total</label>
                  <input type="number" value={
                    Number(formData.freight_ch) + Number(formData.awb_ch) + Number(formData.ras_ch) + Number(formData.ers_ch) +
                    Number(formData.odd_dimension_ch) + Number(formData.address_change_ch) + Number(formData.ddp_ch) +
                    Number(formData.dg_ch) + Number(formData.import_duty_ch) + Number(formData.clearance_ch) +
                    Number(formData.adc_noc_ch) + Number(formData.ess_ch) + Number(formData.electronic_item_ch) +
                    Number(formData.odd_weight_ch) + Number(formData.other_ch) + Number(formData.fuel_surcharge) +
                    Number(formData.packing_ch) + Number(formData.handling_ch)
                  } readOnly className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-slate-100 text-slate-900" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-1">
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Clearance</label>
                  <input type="number" name="clearance_ch" value={formData.clearance_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">ADC Noc Ch.</label>
                  <input type="number" name="adc_noc_ch" value={formData.adc_noc_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">ESS</label>
                  <input type="number" name="ess_ch" value={formData.ess_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Electronic Item Ch.</label>
                  <input type="number" name="electronic_item_ch" value={formData.electronic_item_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Odd Weight Ch.</label>
                  <input type="number" name="odd_weight_ch" value={formData.odd_weight_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Other Ch.</label>
                  <input type="number" name="other_ch" value={formData.other_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-[#1a2f4c] uppercase">Fuel Surcharge</label>
                  <input type="number" name="fuel_surcharge" value={formData.fuel_surcharge} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-[#1a2f4c] text-white" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Packing Ch.</label>
                  <input type="number" name="packing_ch" value={formData.packing_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Handling Ch.</label>
                  <input type="number" name="handling_ch" value={formData.handling_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="px-3 py-2 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[14px] font-bold text-[#1a2f4c]">Charges</h3>
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-bold text-slate-600">Charges date :</label>
              <input type="date" name="charges_date" value={formData.charges_date} onChange={handleChange} className="h-[30px] px-2 border border-slate-300 rounded text-[12px] focus:outline-blue-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              <div className="space-y-2">
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">Freight</label>
                  <input type="number" name="freight_ch" value={formData.freight_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">Destination</label>
                  <input type="number" name="destination_ch" value={formData.destination_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">ESS</label>
                  <input type="number" name="ess_ch" value={formData.ess_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">ODA</label>
                  <input type="number" name="oda_ch" value={formData.oda_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-bold text-slate-700">Total</label>
                  <input type="number" value={
                    Number(formData.freight_ch) + Number(formData.destination_ch) + Number(formData.ess_ch) + Number(formData.oda_ch) +
                    Number(formData.transport_ch) + Number(formData.clearance_ch) + Number(formData.other_ch) + Number(formData.ddp_ch) +
                    Number(formData.fuel_surcharge)
                  } readOnly className="h-[35px] px-3 border border-slate-300 rounded bg-slate-100 text-[14px] font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">Transport</label>
                  <input type="number" name="transport_ch" value={formData.transport_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">Clearance</label>
                  <input type="number" name="clearance_ch" value={formData.clearance_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">OtherCh.</label>
                  <input type="number" name="other_ch" value={formData.other_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">DDP.</label>
                  <input type="number" name="ddp_ch" value={formData.ddp_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-[13px] font-medium text-slate-700">Fuel Surcharge</label>
                  <input type="number" name="fuel_surcharge" value={formData.fuel_surcharge} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded bg-slate-100 text-[14px] font-bold" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
