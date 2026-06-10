import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { formatDate, getStatus } from './FuelConstants';
import { Footer } from "@/components/shared/Footer";

function FuelDetailView({ selectedGroup, groupEntries, loadingGroupEntries, onBack, onAddFuel, onEditFuel, deletingEntryId, setDeletingEntryId, onDeleteEntry }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 bg-white shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-[16px] font-black text-slate-800 uppercase tracking-tight">
              {selectedGroup.name} Dashboard
            </h1>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Type: <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ml-1 ${selectedGroup.type === 'international' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{selectedGroup.type}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onAddFuel}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add Fuel
          </Button>
        </div>
      </div>

      {/* Group Fuel Entries Table */}
      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-10 text-[11px]">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Fuel Prices & Validity for {selectedGroup.name}
          </span>
        </div>
        <div className="overflow-x-auto">
          {loadingGroupEntries ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading entries...
            </div>
          ) : groupEntries.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 font-bold text-[12px]">
              No fuel price rules added to this group yet. Click "+ Add Fuel" to define one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                  <th className="px-4 py-3 border-r border-slate-100 w-12">Sr.</th>
                  <th className="px-4 py-3 border-r border-slate-100">Courier</th>
                  <th className="px-4 py-3 border-r border-slate-100 text-right">Fuel Price (%)</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel From</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel To</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {groupEntries.map((row, index) => {
                  const status = getStatus(row.fuel_from_date, row.fuel_to_date);
                  return (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-500 border-r border-slate-100">{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-700 border-r border-slate-100 uppercase">
                        {row.fuel_courier}-{row.company_type}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-100 text-right">
                        {row.fuel_price_pct ?? '—'}%
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">
                        {formatDate(row.fuel_from_date)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">
                        {formatDate(row.fuel_to_date)}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => onEditFuel(row)} className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded shadow-sm">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeletingEntryId(row.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer theme="svp" />

      {/* Delete Entry Confirm */}
      {deletingEntryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onDeleteEntry(deletingEntryId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] py-2.5 rounded">Delete</button>
              <button onClick={() => setDeletingEntryId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] py-2.5 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuelDetailView;
