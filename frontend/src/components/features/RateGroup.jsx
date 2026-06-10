import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

const rateGroups = [
  { id: 1, name: 'CO COURIER 1', type: 'International' },
  { id: 2, name: 'CO COURIER 2', type: 'International' },
  { id: 3, name: 'CUSTOMER 1', type: 'International' },
  { id: 4, name: 'CUSTOMER 2', type: 'International' },
  { id: 5, name: 'CUSTOMER 3', type: 'International' },
  { id: 6, name: 'Domestic 1', type: 'Domestic' },
  { id: 7, name: 'Domestic 2', type: 'Domestic' },
  { id: 8, name: 'OM', type: 'International' },
  { id: 9, name: 'OM', type: 'Domestic' },
  { id: 10, name: 'WAGLE 1', type: 'Domestic' },
  { id: 11, name: 'Testvp', type: 'International' },
  { id: 12, name: 'co courier bd', type: 'Domestic' },
];

export function RateGroup() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">All Rate Group List</h1>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
          Add Rate Group
        </Button>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-10 text-[11px]">
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                <th className="px-6 py-4 border-r-2 border-slate-100 w-24">ID</th>
                <th className="px-6 py-4 border-r-2 border-slate-100">Rate Group Name</th>
                <th className="px-6 py-4 border-r-2 border-slate-100">Rate Group Type</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {rateGroups.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-600 border-r-2 border-slate-100">{row.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r-2 border-slate-100 uppercase tracking-tight">{row.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r-2 border-slate-100 uppercase">{row.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded transition-colors shadow-sm">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors shadow-sm">
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

      <Footer theme="svp" />

    </div>
  );
}
