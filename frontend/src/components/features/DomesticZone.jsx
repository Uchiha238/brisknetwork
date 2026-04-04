import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Download, Plus, ChevronDown, ArrowLeft } from "lucide-react";

const initialDomesticZones = [
  { id: 1, name: 'LOCAL' },
  { id: 2, name: 'MAHARASTRA' },
  { id: 3, name: 'NORTH EAST' },
  { id: 4, name: 'REST OF INDIA' },
  { id: 5, name: 'SPECIAL DESTINATION' },
];

export function DomesticZone() {
  const [isAdding, setIsAdding] = useState(false);
  const [zones, setZones] = useState(initialDomesticZones);
  const [formData, setFormData] = useState({
    zone: '',
    state: 'None selected',
    city: 'None selected'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: zones.length + 1,
      name: formData.zone.toUpperCase()
    };
    setZones([...zones, newRecord]);
    setIsAdding(false);
    setFormData({ zone: '', state: 'None selected', city: 'None selected' });
  };
  if (isAdding) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            <h2 className="text-sm font-bold text-[#1a2f4c] uppercase tracking-wide">Add Domestic Zone</h2>
          </div>
          <Button 
            onClick={() => setIsAdding(false)}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-2 rounded shadow-md font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02]"
          >
            View Zone
          </Button>
        </div>

        {/* Form Container */}
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded shadow-sm p-8">
            <div className="flex flex-wrap items-end gap-8 mb-8">
              {/* Zone Input */}
              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Zone</label>
                <input 
                  type="text" 
                  placeholder="ZONE"
                  value={formData.zone}
                  onChange={(e) => setFormData({...formData, zone: e.target.value.toUpperCase()})}
                  className="w-full h-9 px-3 border border-slate-300 rounded text-[11px] font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 uppercase"
                />
              </div>

              {/* State Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">State</label>
                <div className="relative">
                  <select 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="appearance-none bg-[#1e3a8a] text-white border-none py-2 px-6 pr-10 rounded text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-[#1e40af] transition-colors"
                  >
                    <option>None selected</option>
                    <option>MAHARASTRA</option>
                    <option>GUJARAT</option>
                    <option>DELHI</option>
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* City Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">City</label>
                <div className="relative">
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="appearance-none bg-[#1e3a8a] text-white border-none py-2 px-6 pr-10 rounded text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-[#1e40af] transition-colors"
                  >
                    <option>None selected</option>
                    <option>MUMBAI</option>
                    <option>PUNE</option>
                    <option>SURAT</option>
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-start">
              <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-8 py-2 rounded shadow-md font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02]">
                Submit
              </Button>
            </div>
          </form>
        </div>

        {/* Corporate Footer */}
        <div className="mt-8 border-t border-slate-100 py-6 text-center space-y-1 bg-white">
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">Domestic Zone Master</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm"
          >
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
              {zones.map((zone) => (
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
            Showing 1 to {zones.length} of {zones.length} entries
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
