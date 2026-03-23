import React from 'react';
import { Button } from "@/components/ui/button";
import { Plane, Plus, Pencil, Trash2 } from "lucide-react";

const modeData = [
  { sr: 1, name: 'Air' },
  { sr: 2, name: 'Express' },
  { sr: 3, name: 'Surface' },
  { sr: 4, name: 'Priority' },
];

export function ModeMaster() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-white">
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-700">All Mode</h2>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-2 rounded shadow-md font-bold text-xs uppercase tracking-wide flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Mode
          </Button>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 w-24">Sr.</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800">Mode Name</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 text-center w-48">Action</th>
              </tr>
            </thead>
            <tbody>
              {modeData.map((row, idx) => (
                <tr key={row.sr} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="p-5 text-[11px] font-bold text-slate-500">{row.sr}</td>
                  <td className="p-5 text-[11px] font-black text-slate-800 uppercase tracking-tight">{row.name}</td>
                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-4">
                      <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all active:scale-95" title="Edit">
                        <Pencil className="h-4 w-4 stroke-[2.5px]" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-all active:scale-95" title="Delete">
                        <Trash2 className="h-4 w-4 stroke-[2.5px]" />
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
