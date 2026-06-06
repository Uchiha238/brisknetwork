import React from 'react';
import { FormField } from '../../shared/FormField';

export function InvoiceSection({
  formData,
  handleChange
}) {
  return (
    <div className="mt-2 p-2">
      <div className="flex items-center gap-2 mb-3">
        <input 
          type="checkbox" 
          name="create_invoice" 
          checked={formData.create_invoice} 
          onChange={handleChange} 
          className="h-4 w-4 accent-green-800" 
        />
        <span className="text-[13px] font-black text-slate-700 uppercase">Create Shipment Invoice?</span>
      </div>

      {formData.create_invoice && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-4 gap-3">
            <FormField onChange={handleChange} label="Invoice Type ?" name="invoice_type">
              <select name="invoice_type" value={formData.invoice_type} onChange={handleChange} className="w-full h-full px-2 border border-slate-300 text-[11px] font-bold uppercase">
                <option>INVOICE</option>
                <option>PROFORMA</option>
              </select>
            </FormField>
            <FormField onChange={handleChange} label="Note" name="note" value={formData.note} />
            <FormField onChange={handleChange} label="Currency" name="currency">
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full h-full px-2 border border-slate-300 text-[11px] font-bold uppercase">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </FormField>
            <FormField onChange={handleChange} label="Incoterms" name="incoterms">
              <select className="w-full h-full px-2 border border-slate-300 text-[11px] font-bold uppercase">
                <option>CFR</option>
                <option>FOB</option>
                <option>CIF</option>
              </select>
            </FormField>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              UNSOLICITED GIFT SENT TO MY FRIENDS & FAMILY MEMBERS FOR THERE PERSONAL USE ONLY
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
