import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Upload, FileText, ChevronDown, Download } from "lucide-react";

const zoneHistory = [
  { sr: 1, courier: 'Aramex', type: 'Export', date: '17-04-2021' },
  { sr: 2, courier: 'Aramex', type: 'Export', date: '29-01-2022' },
  { sr: 3, courier: 'Aramex', type: 'Export', date: '01-11-2022' },
  { sr: 4, courier: 'Aramex', type: 'Export', date: '03-01-2023' },
  { sr: 5, courier: 'Aramex', type: 'Export', date: '14-01-2024' },
  { sr: 6, courier: 'Aramex', type: 'Export', date: '01-01-2025' },
];

export function InternationalZone() {
  const [selectedFileName, setSelectedFileName] = useState('NO FILE CHOSEN');

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-white p-6">
      
      {/* Page Title & Top Actions */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <h1 className="text-xl font-bold text-slate-700 tracking-tight">Upload Zone</h1>
        <Button variant="outline" className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-6 py-2 rounded shadow-md font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95">
          Sample File
        </Button>
      </div>

      {/* Upload Form Box */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Zone Date */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone Date</label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="21-03-2026 21:30" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Courier Name Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courier Name</label>
            <div className="relative cursor-pointer">
              <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-500 outline-none focus:border-blue-500 transition-colors cursor-pointer">
                <option>-Select Courier-</option>
                <option>Aramex</option>
                <option>DHL</option>
                <option>Fedex</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Type Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
            <div className="relative cursor-pointer">
              <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-500 outline-none focus:border-blue-500 transition-colors cursor-pointer">
                <option>-Select Type-</option>
                <option>Export</option>
                <option>Import</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Select File */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select File</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="file" 
                  id="zoneFile"
                  className="hidden" 
                  onChange={(e) => setSelectedFileName(e.target.files[0]?.name || 'NO FILE CHOSEN')}
                />
                <label 
                  htmlFor="zoneFile"
                  className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors px-4 py-2 rounded-lg text-xs font-bold text-slate-600 cursor-pointer shadow-sm active:scale-95"
                >
                  Choose File
                </label>
              </div>
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                {selectedFileName}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-10 py-5 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
            <Upload className="h-4 w-4 stroke-[3px]" />
            Upload zone
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-0 w-full mb-6 max-w-xl group">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="SEARCH" 
            className="w-full bg-white border-2 border-slate-200 rounded-l-lg py-1.5 px-4 text-xs font-black placeholder:text-slate-300 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-4 py-[7px] transition-colors">
          <Search className="h-4 w-4 stroke-[3px]" />
        </button>
        <button className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-2 py-[7px] rounded-r-lg border-l border-blue-400 transition-colors">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Table Section */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white mb-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 w-24">Sr.</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800">Courier Name</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800">Type</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-800">Date</th>
            </tr>
          </thead>
          <tbody>
            {zoneHistory.map((row, idx) => (
              <tr key={row.sr} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                <td className="p-4 text-[11px] font-bold text-slate-500">{row.sr}</td>
                <td className="p-4 text-[11px] font-black text-slate-800 uppercase tracking-tight">{row.courier}</td>
                <td className="p-4 text-[11px] font-bold text-slate-600 uppercase tracking-tight">{row.type}</td>
                <td className="p-4 text-[11px] font-bold text-slate-400 tabular-nums">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Corporate Footer */}
      <div className="mt-auto border-t border-slate-100 pt-8 pb-4 text-center space-y-2 opacity-60">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
          COPYRIGHT © 2026 BRISK NETWORK. ALL RIGHTS RESERVED.
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
          PREMIUM LOGISTICS SOLUTIONS & MANAGEMENT SYSTEMS
        </p>
      </div>

    </div>
  );
}
