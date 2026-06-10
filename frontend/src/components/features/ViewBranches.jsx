import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

const branches = [
  { 
    sr: 1, 
    name: 'Thane', 
    code: 'BC0002', 
    email: 'OPSOMCOURIER@GMAIL.COM', 
    contact: '9867140072', 
    address: 'THANE', 
    city: 'THANE', 
    state: 'MAHARASHTRA', 
    pincode: '400604', 
    person: 'MR RATNAKAR' 
  },
  { 
    sr: 2, 
    name: 'WAGLE', 
    code: 'BC0003', 
    email: 'csdomcourier@gmail.com', 
    contact: '9867140072', 
    address: 'shop no 33, road no 16z, near agriculture bus stop, wagle industrial estate', 
    city: 'THANE', 
    state: 'MAHARASHTRA', 
    pincode: '400604', 
    person: 'Ratnakar' 
  },
];

export function ViewBranches() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">All Branches</h1>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
          Add Branche
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-10 text-[11px]">
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-800 uppercase font-black whitespace-nowrap">
                <th className="px-4 py-4 border-r border-slate-100">Sr.</th>
                <th className="px-4 py-4 border-r border-slate-100">Branch Name</th>
                <th className="px-4 py-4 border-r border-slate-100">Branch Code</th>
                <th className="px-4 py-4 border-r border-slate-100">Email</th>
                <th className="px-4 py-4 border-r border-slate-100">Contact No</th>
                <th className="px-4 py-4 border-r border-slate-100">Address</th>
                <th className="px-4 py-4 border-r border-slate-100">City</th>
                <th className="px-4 py-4 border-r border-slate-100">State</th>
                <th className="px-4 py-4 border-r border-slate-100">Pincode</th>
                <th className="px-4 py-4 border-r border-slate-100">Contact Person</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((row) => (
                <tr key={row.sr} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100">{row.sr}</td>
                  <td className="px-4 py-4 font-bold text-slate-800 border-r border-slate-100 tracking-tight">{row.name}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100">{row.code}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase tracking-tighter">{row.email}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100">{row.contact}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase tracking-tight max-w-[200px] truncate" title={row.address}>
                    {row.address}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase">{row.city}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase">{row.state}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100">{row.pincode}</td>
                  <td className="px-4 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase">{row.person}</td>
                  <td className="px-4 py-4">
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

      <Footer theme="svp" />

    </div>
  );
}
