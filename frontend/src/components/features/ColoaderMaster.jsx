import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Download, Plus, ChevronDown } from "lucide-react";

const coloaderData = [
  { sr: 1, name: 'UNIVERSAL COURIERS', rateType: '0', rate: '0' },
  { sr: 2, name: 'ARAMEX', rateType: '0', rate: '0' },
  { sr: 3, name: 'TRACK ON', rateType: '0', rate: '0' },
  { sr: 4, name: 'SHREE ANJANI', rateType: '0', rate: '0' },
  { sr: 5, name: 'AIRWINGS', rateType: '0', rate: '0' },
  { sr: 6, name: 'SHREE MARUTI', rateType: '0', rate: '0' },
  { sr: 7, name: 'BLUE DART', rateType: '0', rate: '0' },
  { sr: 8, name: 'E COM', rateType: '0', rate: '0' },
  { sr: 9, name: 'REG EXPRESS', rateType: '0', rate: '200' },
  { sr: 10, name: 'DTDC NEELKANTH', rateType: '10', rate: '10' },
  { sr: 11, name: 'iway', rateType: '0', rate: '0' },
  { sr: 12, name: 'BOMBINO', rateType: '0', rate: '0' },
  { sr: 13, name: 'ATLANTIC', rateType: '1', rate: '1' },
  { sr: 14, name: 'DTDC', rateType: '0', rate: '0' },
];

export function ColoaderMaster() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">All Coloader</h1>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
          Add Coloader
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-10">
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-800 uppercase font-black">
                <th className="px-6 py-4 border-r border-slate-100 w-24">Sr.</th>
                <th className="px-6 py-4 border-r border-slate-100">Coloader Name</th>
                <th className="px-6 py-4 border-r border-slate-100">Rate Type</th>
                <th className="px-6 py-4 border-r border-slate-100">Rate</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {coloaderData.map((row) => (
                <tr key={row.sr} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100">{row.sr}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-100 uppercase tracking-tight">{row.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100">{row.rateType}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100">{row.rate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Footer (Partial shown in shot) */}
      <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
      </div>

    </div>
  );
}
