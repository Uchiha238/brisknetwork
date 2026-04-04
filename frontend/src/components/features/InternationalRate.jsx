import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2 } from "lucide-react";

const mockRates = [
  { sr: 1, courier: 'CO COURIER 1', date: '04-04-2026', type: 'Export', transfer: 'Rate Transfer' },
  { sr: 2, courier: 'ARAMEX', date: '01-04-2026', type: 'Export', transfer: 'Rate Transfer' },
  { sr: 3, courier: 'DHL', date: '28-03-2026', type: 'Import', transfer: 'Rate Transfer' },
  { sr: 4, courier: 'FEDEX', date: '25-03-2026', type: 'Export', transfer: 'Rate Transfer' },
];

export function InternationalRate() {
  const [selectedCourier, setSelectedCourier] = useState('CO COURIER 1');
  const couriers = ['CO COURIER 1', 'ARAMEX', 'DHL', 'FEDEX', 'UPS', 'TNT'];

  const selectClass = "w-full md:w-64 appearance-none bg-white border border-slate-300 rounded px-4 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 transition-all cursor-pointer shadow-sm";

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-black text-slate-700 tracking-tight">International Rate</h1>
      </div>

      {/* Filter/Selection Area */}
      <div className="p-4 md:p-6">
        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative">
            <select 
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className={selectClass}
            >
              {couriers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          
          <Button className="bg-[#1a2f4c] hover:bg-[#25426d] text-white px-8 py-2 rounded font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md">
            Submit
          </Button>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 uppercase font-black tracking-tight">
                <th className="px-6 py-4 border-r border-slate-100 w-20">Sr. <span className="opacity-30 ml-1 italic tracking-widest text-[8px] line-through">↕</span></th>
                <th className="px-6 py-4 border-r border-slate-100">Courier <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-4 border-r border-slate-100">Date <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-4 border-r border-slate-100">Export/Import <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-4 border-r border-slate-100">Rate Transfer <span className="opacity-30 ml-1">↕</span></th>
                <th className="px-6 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockRates.map((rate) => (
                <tr key={rate.sr} className="group border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-400 border-r border-slate-100">{rate.sr}</td>
                  <td className="px-6 py-4 font-black text-slate-700 uppercase border-r border-slate-100">{rate.courier}</td>
                  <td className="px-6 py-4 font-bold text-slate-500 border-r border-slate-100 tabular-nums">{rate.date}</td>
                  <td className="px-6 py-4 font-black text-blue-600 uppercase border-r border-slate-100">
                    <span className={`px-2 py-0.5 rounded-full ${rate.type === 'Export' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                      {rate.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-100">
                    <Button variant="outline" className="h-7 px-4 bg-[#1a2f4c] hover:bg-[#25426d] text-white border-none text-[9px] font-black uppercase tracking-wider rounded transition-all active:scale-95">
                      Rate Transfer
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <button className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete">
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
      <div className="mt-auto border-t border-slate-100 py-6 px-4 text-center space-y-1 bg-white">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight max-w-4xl mx-auto leading-relaxed">
          FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE, COLLEGE ADMISSION SOFTWARE CALL 9022062666
        </p>
      </div>
    </div>
  );
}
