import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const cnodeData = [
  { id: 9, branch: 'BC0003 (WAGLE)', range: '100-2000', date: '23-12-2020 13:44:19 PM' },
  { id: 10, branch: 'BC0003 (WAGLE)', range: '100-2000', date: '23-12-2020 13:44:20 PM' },
];

export function BranchWiseCnode() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">View Cnode</h1>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
          Assign Cnode
        </Button>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-10 text-[11px]">
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                <th className="px-6 py-4 border-r-2 border-slate-100">ID</th>
                <th className="px-6 py-4 border-r-2 border-slate-100">Branch Code</th>
                <th className="px-6 py-4 border-r-2 border-slate-100">Airway No. Range</th>
                <th className="px-6 py-4 border-r-2 border-slate-100">Date.</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {cnodeData.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-600 border-r-2 border-slate-100">{row.id}</td>
                  <td className="px-6 py-4 font-bold text-[#1e3a8a] border-r-2 border-slate-100 tracking-tight">{row.branch}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r-2 border-slate-100">{row.range}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r-2 border-slate-100 tabular-nums">{row.date}</td>
                  <td className="px-6 py-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Footer Section */}
      <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">
          FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE, COLLEGE ADMISSION SOFTWARE CALL 9022062666 EMAIL: INFO@SVPINFOTECH.COM , SVPINFOTECH@GMAIL.COM
        </p>
      </div>

    </div>
  );
}
