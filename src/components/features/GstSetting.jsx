import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";

const gstData = [
  { sr: 1, from: '01-04-2023', to: '31-03-2024', cgst: '9.00', sgst: '9.00', igst: '18.00' },
  { sr: 2, from: '01-04-2022', to: '31-03-2023', cgst: '9.00', sgst: '9.00', igst: '18.00' },
  { sr: 3, from: '01-04-2023', to: '01-04-2023', cgst: '9.00', sgst: '9.00', igst: '18.00' },
  { sr: 4, from: '01-04-2024', to: '31-03-2025', cgst: '9.00', sgst: '9.00', igst: '18.00' },
  { sr: 5, from: '01-04-2025', to: '31-03-2026', cgst: '9.00', sgst: '9.00', igst: '18.00' },
];

export function GstSetting() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-white">
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-700">GST Setting</h2>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-2 rounded shadow-md font-bold text-xs uppercase tracking-wide flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add GST
          </Button>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800 w-16">Sr.</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800">Applicable from</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800">Applicable To</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800">CGST</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800">SGST</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800">IGST</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {gstData.map((row) => (
                <tr key={row.sr} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-xs font-medium text-slate-600">{row.sr}</td>
                  <td className="p-4 text-xs font-medium text-slate-600">{row.from}</td>
                  <td className="p-4 text-xs font-medium text-slate-600">{row.to}</td>
                  <td className="p-4 text-xs font-medium text-slate-600 font-mono italic">{row.cgst}</td>
                  <td className="p-4 text-xs font-medium text-slate-600 font-mono italic">{row.sgst}</td>
                  <td className="p-4 text-xs font-medium text-slate-600 font-mono italic">{row.igst}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Footer */}
      <div className="mt-auto border-t border-slate-100 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-2 py-6">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-600">+91-9022062666</span>
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter leading-relaxed">
            FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE, COLLEGE ADMISSION SOFTWARE CALL 9022062666 EMAIL: INFO@SVPINFOTECH.COM, SVPINFOTECH@GMAIL.COM
          </p>
        </div>
      </div>
    </div>
  );
}
