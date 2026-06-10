import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Trash2, ChevronDown, Plus, Minus, Calendar } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

const domesticRates = [
  { sr: 1, group: 'Domestic 1', courier: 'BLUEDART', date: '01-07-2025' },
  { sr: 2, group: 'Domestic 1', courier: 'SHREE MARUTI', date: '01-07-2025' },
  { sr: 3, group: 'Domestic 1', courier: 'SHREE ANJANI', date: '01-07-2025' },
  { sr: 4, group: 'Domestic 1', courier: 'DTDC', date: '01-07-2025' },
  { sr: 5, group: 'Domestic 1', courier: 'TRACKON', date: '01-07-2025' },
  { sr: 6, group: 'co courier bd', courier: 'BLUEDART', date: '01-02-2025' },
  { sr: 7, group: 'Domestic 1', courier: 'BLUEDART', date: '01-02-2025' },
  { sr: 8, group: 'co courier bd', courier: 'BLUEDART', date: '01-11-2024' },
  { sr: 9, group: 'Domestic 1', courier: 'BLUEDART', date: '01-05-2024' },
  { sr: 10, group: 'WAGLE 1', courier: 'SHREE ANJANI', date: '01-04-2024' },
];

export function DomesticRate() {
  const inputClass = "w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors";
  const selectClass = "w-full appearance-none bg-white border border-slate-300 rounded px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer";
  const labelClass = "text-[11px] font-bold text-slate-600 mb-1";

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-6 font-sans">
      
      {/* Page Title */}
      <h1 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight mb-6">Add Domestic Rate</h1>

      {/* Form Section */}
      <div className="bg-white border border-slate-200 rounded shadow-sm p-6 mb-8 group">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          <div className="flex flex-col">
            <label className={labelClass}>Rate Group Name</label>
            <div className="relative">
              <select className={selectClass}>
                <option>Domestic 1</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Courier</label>
            <div className="relative">
              <select className={`${selectClass} bg-[#1e3a8a] text-white border-[#1e3a8a]`}>
                <option>None selected</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Zone Name</label>
            <div className="relative">
              <select className={`${selectClass} bg-[#1e3a8a] text-white border-[#1e3a8a]`}>
                <option>None selected</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Mode Name</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select className={`${selectClass} bg-[#1e3a8a] text-white border-[#1e3a8a]`}>
                  <option>None selected</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="bg-[#1e3a8a] text-white w-7 h-7 flex items-center justify-center rounded transition-all active:scale-90">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button className="bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded transition-all active:scale-90">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Shipment</label>
            <div className="relative">
              <select className={selectClass}>
                <option>-Select-</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Applicable From</label>
            <div className="relative">
              <input type="text" placeholder="DD-MM-YYYY" className={inputClass} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Weight Range Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 border-t border-slate-100 pt-6">
          <div className="flex flex-col">
            <label className={labelClass}>Weight Range-From</label>
            <input type="text" placeholder="FROM" className={inputClass} />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Weight Range-To</label>
            <input type="text" placeholder="TO" className={inputClass} />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Rate</label>
            <input type="text" placeholder="ENTER RATE" className={inputClass} />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Rate Type</label>
            <div className="relative">
              <select className={selectClass}>
                <option>-Select Type-</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-6 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
            Add Rate
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-10">
        <div className="p-4 border-b border-slate-100 flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Search:</span>
            <input 
              type="text" 
              className="border border-slate-300 rounded px-2 py-1 text-[11px] outline-none focus:border-blue-500 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 uppercase font-black tracking-tight">
                <th className="px-6 py-3 border-r border-slate-100 w-20">Sr. <span className="opacity-30 ml-1 italic tracking-widest text-[8px] line-through">↕</span></th>
                <th className="px-6 py-3 border-r border-slate-100">Rate Group Name <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-3 border-r border-slate-100">Courier <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-3 border-r border-slate-100">Date <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-3 border-r border-slate-100 w-40">Rate Transfer</th>
                <th className="px-6 py-3 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {domesticRates.map((rate) => (
                <tr key={rate.sr} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-bold text-slate-500 border-r border-slate-100">{rate.sr}</td>
                  <td className="px-6 py-3 font-bold text-slate-700 border-r border-slate-100">{rate.group}</td>
                  <td className="px-6 py-3 font-bold text-slate-700 border-r border-slate-100 uppercase tracking-tight">{rate.courier}</td>
                  <td className="px-6 py-3 font-bold text-slate-500 border-r border-slate-100 tabular-nums">{rate.date}</td>
                  <td className="px-6 py-3 border-r border-slate-100">
                    <Button variant="outline" className="h-7 px-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none text-[10px] font-bold rounded">
                      Rate Transfer
                    </Button>
                  </td>
                  <td className="px-6 py-3">
                    <button className="text-red-500 hover:text-red-700 transition-all p-1.5 hover:bg-red-50 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info/Pagination */}
        <div className="p-4 flex items-center justify-between border-t border-slate-100 text-[10px] font-bold text-slate-500 mt-4">
          <div>
            Showing 1 to 10 of 23 entries
          </div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50">Previous</button>
            <button className="px-3 py-1.5 bg-[#1e3a8a] text-white rounded font-black">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50">3</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      <Footer theme="svp" />

    </div>
  );
}
