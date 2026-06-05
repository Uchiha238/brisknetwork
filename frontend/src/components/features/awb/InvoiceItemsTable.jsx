import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function InvoiceItemsTable({
  formData,
  handleArrayChange,
  addArrayItem,
  removeArrayItem
}) {
  if (!formData.create_invoice) return null;

  return (
    <div className="mt-2 border border-slate-300 bg-white">
      <div className="bg-[#1a2f4c] text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
        Shipment Invoice Items
      </div>
      <div className="overflow-x-auto p-1">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">BOX NO.</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">SR. NO.</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">DESCRIPTION</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">HS CODE</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">UNIT TYPE</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">QUANTITY</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">UNIT WEIGHT</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">IGST</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">UNIT RATES</th>
              <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase text-right border border-slate-200">AMOUNT</th>
              <th className="px-2 py-1 w-10 border border-slate-200"></th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-2 py-1 border border-slate-200">
                  <select
                    value={item.box_no}
                    onChange={e => handleArrayChange('items', idx, 'box_no', e.target.value)}
                    className="w-12 h-6 text-[11px] font-bold bg-transparent outline-none"
                  >
                    {formData.packages.map(p => <option key={p.box_no} value={p.box_no}>{p.box_no}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1 text-[11px] font-bold text-slate-400 border border-slate-200">{item.sr_no}</td>
                <td className="px-2 py-1 border border-slate-200">
                  <input
                    value={item.description}
                    onChange={e => handleArrayChange('items', idx, 'description', e.target.value)}
                    placeholder="DESCRIPTION"
                    className="w-full h-6 px-1 text-[11px] font-semibold border border-transparent hover:border-slate-200 focus:border-blue-500 rounded outline-none animate-none"
                  />
                </td>
                <td className="px-2 py-1 border border-slate-200">
                  <input
                    value={item.hs_code}
                    onChange={e => handleArrayChange('items', idx, 'hs_code', e.target.value)}
                    className="w-full h-6 px-1 text-[11px] font-semibold bg-transparent outline-none"
                  />
                </td>
                <td className="px-2 py-1 border border-slate-200">
                  <select
                    value={item.unit_type}
                    onChange={e => handleArrayChange('items', idx, 'unit_type', e.target.value)}
                    className="w-full h-6 text-[11px] font-bold bg-transparent outline-none"
                  >
                    <option>PCS</option>
                    <option>DOZ</option>
                    <option>SET</option>
                  </select>
                </td>
                <td className="px-2 py-1 border border-slate-200">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleArrayChange('items', idx, 'quantity', parseInt(e.target.value))}
                    className="w-16 h-6 px-1 text-[11px] font-bold text-center border border-dashed border-slate-200 rounded outline-none"
                  />
                </td>
                <td className="px-2 py-1 border border-slate-200">
                  <input
                    type="number"
                    value={item.unit_weight}
                    onChange={e => handleArrayChange('items', idx, 'unit_weight', parseFloat(e.target.value))}
                    className="w-16 h-6 px-1 text-[11px] font-bold text-center rounded outline-none"
                  />
                </td>
                <td className="px-2 py-1 border border-slate-200">
                  <input
                    type="number"
                    value={item.igst}
                    onChange={e => handleArrayChange('items', idx, 'igst', parseFloat(e.target.value))}
                    className="w-16 h-6 px-1 text-[11px] font-bold text-center rounded outline-none"
                  />
                </td>
                <td className="px-2 py-1 border border-slate-200">
                  <input
                    type="number"
                    value={item.unit_rate}
                    onChange={e => handleArrayChange('items', idx, 'unit_rate', parseFloat(e.target.value))}
                    className="w-20 h-6 px-1 text-[11px] font-bold text-center border border-dashed border-slate-200 rounded outline-none"
                  />
                </td>
                <td className="px-2 py-1 text-[11px] font-black text-slate-900 text-right border border-slate-200">{(item.amount || 0).toFixed(2)}</td>
                <td className="px-2 py-1 text-center border border-slate-200">
                  <button onClick={() => removeArrayItem('items', idx)} className="text-red-500 hover:text-red-700 transition-colors uppercase text-[8px] font-black">REMOVE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2 bg-slate-50 flex justify-between items-center border-t border-slate-200">
          <Button
            onClick={() => addArrayItem('items', { box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, igst: 0, unit_rate: 0, amount: 0 })}
            className="h-6 bg-[#65a30d] hover:bg-[#4d7c0f] text-white text-[9px] font-black uppercase shadow-md shadow-green-100 gap-1 px-2 py-0.5"
          >
            <Plus className="h-2.5 w-2.5" /> ADD ITEM
          </Button>
          <div className="flex gap-6 px-2">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-slate-400 uppercase">TOTAL AMOUNT</span>
              <span className="text-[12px] font-black text-slate-900">{formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
