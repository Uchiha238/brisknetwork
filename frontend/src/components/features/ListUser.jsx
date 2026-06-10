import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

const userData = [
  { username: 'LU0001', name: 'OM Courier Services', email: 'admin@gmail.com', contact: '1234567890', type: 'Admin', branch: 'BC0002--Thane' },
  { username: 'MAUSAM', name: 'MAUSAM', email: 'nayak.mp99@gmail.com', contact: '9029200429', type: 'Admin', branch: 'BC0002--Thane' },
  { username: 'RATNAKAR', name: 'RATNAKAR NAYAK', email: 'opsomcourier@gmail.com', contact: '9867140072', type: 'Admin', branch: 'BC0002--Thane' },
  { username: 'SUSHEELA', name: 'SUSHEELA YADAV', email: 'YADAVSUSHILA1461@GMAIL.COM', contact: '6394105810', type: 'Admin', branch: 'BC0002--Thane' },
  { username: 'BILLING', name: 'BILLING', email: 'CSDOMCOURIER@GMAIL.COM', contact: '9029200429', type: 'Admin', branch: 'BC0002--Thane' },
  { username: 'demo_customer', name: 'demo_customer', email: 'demo@gmail.com', contact: '09865328956', type: 'Staff', branch: 'BC0002--Thane' },
  { username: 'BANITA', name: 'BANITA', email: '', contact: '9029617174', type: 'Admin', branch: 'BC0003--WAGLE' },
  { username: 'VASANT', name: 'VASANT VANGLE', email: '', contact: '8850272261', type: 'Admin', branch: 'BC0003--WAGLE' },
];

export function ListUser() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">Users Details</h1>
        <div className="flex items-center gap-2">
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
            Add User Details
          </Button>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm">
            Add Partner Details
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-10 text-[11px]">
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-800 uppercase font-black whitespace-nowrap">
                <th className="px-6 py-4 border-r border-slate-100">Username</th>
                <th className="px-6 py-4 border-r border-slate-100">Name</th>
                <th className="px-6 py-4 border-r border-slate-100">Email</th>
                <th className="px-6 py-4 border-r border-slate-100">Contact No</th>
                <th className="px-6 py-4 border-r border-slate-100">UserType</th>
                <th className="px-6 py-4 border-r border-slate-100">Branch Code</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((row) => (
                <tr key={row.username} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase">{row.username}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-100 tracking-tight uppercase">{row.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100 lowercase">{row.email}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100">{row.contact}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase">{row.type}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100 uppercase tracking-tight">
                    {row.branch}
                  </td>
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

      <Footer theme="svp" />

    </div>
  );
}
