import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Download, Plus, ChevronDown } from "lucide-react";

const domesticZones = [
  { id: 1, name: 'LOCAL' },
  { id: 2, name: 'MAHARASTRA' },
  { id: 3, name: 'NORTH EAST' },
  { id: 4, name: 'REST OF INDIA' },
  { id: 5, name: 'SPECIAL DESTINATION' },
];

export function DomesticZone() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">Domestic Zone Master</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
            Add Zone Details
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Actions Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-slate-500 hover:bg-slate-600 text-white border-none h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded">
              Excel
            </Button>
          </div>
          
          <div className="flex items-center gap-0 w-full max-w-sm group">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="SEARCH" 
                className="w-full bg-white border border-slate-300 rounded-l py-1.5 px-4 text-[11px] font-bold placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button className="bg-[#1e3a8a] text-white px-3 py-[7px] border border-[#1e3a8a] transition-colors">
              <Search className="h-3.5 w-3.5 stroke-[3px]" />
            </button>
            <button className="bg-[#1e3a8a] text-white px-1.5 py-[7px] border-l border-blue-400/50 rounded-r transition-colors">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-slate-800 border-r border-slate-200 w-24">
                  Id <span className="inline-block ml-1 opacity-30">↕</span>
                </th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-slate-800 border-r border-slate-200">
                  Zone <span className="inline-block ml-1 opacity-30">↕</span>
                </th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-slate-800 w-32">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {domesticZones.map((zone) => (
                <tr key={zone.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3.5 font-bold text-slate-600 border-r border-slate-100">{zone.id}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-800 border-r border-slate-100 tracking-tight">{zone.name}</td>
                  <td className="px-6 py-3.5">
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

        {/* Pagination Info */}
        <div className="p-4 flex items-center justify-between border-t border-slate-100 text-[10px] font-bold text-slate-500 mt-4">
          <div>
            Showing 1 to 5 of 5 entries
          </div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 bg-[#1e3a8a] text-white rounded font-black">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Corporate Footer */}
      <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
      </div>

    </div>
  );
}
