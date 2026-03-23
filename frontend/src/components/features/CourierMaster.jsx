import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";

const courierData = [
  { sr: 1, name: 'Aramex', type: 'International' },
  { sr: 2, name: 'DHL', type: 'International' },
  { sr: 3, name: 'Fedex', type: 'International' },
  { sr: 4, name: 'TNT', type: 'International' },
  { sr: 5, name: 'TRACKON', type: 'Domestic' },
  { sr: 6, name: 'SHREE ANJANI', type: 'Domestic' },
  { sr: 7, name: 'Delhivery', type: 'Domestic' },
  { sr: 8, name: 'UPS', type: 'International' },
  { sr: 9, name: 'OM COURIER', type: 'International' },
  { sr: 10, name: 'BLUEDART', type: 'Domestic' },
  { sr: 11, name: 'SHREE MARUTI', type: 'Domestic' },
  { sr: 12, name: 'TIRUPATI', type: 'Domestic' },
  { sr: 13, name: 'DTDC', type: 'Domestic' },
  { sr: 14, name: 'AIRWING', type: 'International' },
  { sr: 15, name: 'OM COURIER', type: 'Domestic' },
  { sr: 16, name: 'E COM', type: 'International' },
  { sr: 17, name: 'SELF', type: 'International' },
  { sr: 18, name: 'XPRESS BEES', type: 'Domestic' },
  { sr: 19, name: 'BLUE DART SFC', type: 'Domestic' },
  { sr: 20, name: 'BLUE DART APEX', type: 'Domestic' },
  { sr: 21, name: 'REG EXPRESS', type: 'International' },
  { sr: 22, name: 'SHYPMAX', type: 'International' },
  { sr: 23, name: 'ECOM', type: 'Domestic' },
  { sr: 24, name: 'PACE EXPRESS', type: 'International' },
  { sr: 25, name: 'i way', type: 'Domestic' },
  { sr: 26, name: 'BOMBINO', type: 'International' },
  { sr: 27, name: 'ATLANTIC', type: 'International' },
];

export function CourierMaster() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-white">
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-700">All Courier Company</h2>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-2 rounded shadow-md font-bold text-xs uppercase tracking-wide flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Courier Company
          </Button>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 w-20">Sr.</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800">Company Name</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800">Company Type</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {courierData.map((row, idx) => (
                <tr key={row.sr} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="p-4 text-[11px] font-bold text-slate-500">{row.sr}</td>
                  <td className="p-4 text-[11px] font-black text-slate-800 uppercase tracking-tight">{row.name}</td>
                  <td className="p-4 text-[11px] font-bold text-slate-600 uppercase tracking-tight">{row.type}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all active:scale-95" title="Edit">
                        <Pencil className="h-4 w-4 stroke-[2px]" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-all active:scale-95" title="Delete">
                        <Trash2 className="h-4 w-4 stroke-[2px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Footer (Same as GST Setting) */}
      <div className="mt-8 border-t border-slate-100 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-2 py-6">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            COPYRIGHT © 2026 BRISK NETWORK. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter leading-relaxed">
            PREMIUM LOGISTICS SOLUTIONS & MANAGEMENT SYSTEMS
          </p>
        </div>
      </div>
    </div>
  );
}
