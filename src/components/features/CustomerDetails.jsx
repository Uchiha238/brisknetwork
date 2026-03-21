import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Download, Plus, ArrowUpDown, Filter, MoreVertical, Pencil, Trash2 } from "lucide-react";

const initialCustomerData = [
  { 
    srNo: 1, 
    code: 'OMS0220', 
    name: 'INDOMAX ENGINEERS', 
    email: 'indomaxengineers@gmail.com',
    phone: '9029200429',
    city: 'BHIWANDI',
    state: 'MAHARASHTRA',
    address: 'B 9 UNIT 1 PARASNATH COMPLEX, MANKHOLI ANJUR ROAD',
    pincode: '421302',
    gstNo: '27AESPA7643D1ZG',
    password: 'mpn',
    api: 'Yes'
  },
  { 
    srNo: 2, 
    code: 'OMS0219', 
    name: 'USHASH EARTH SCIENCES PRIVATE LIMITED', 
    email: 'arllogistics@gmail.com',
    phone: '9029200429',
    city: 'Vadodara',
    state: 'GUJARAT',
    address: '278, 281, horizon industrial park, Bamangam, Karjan, Vadodara',
    pincode: '391240',
    gstNo: '24AADCU0541NIZC',
    password: 'Yes',
    api: 'Yes'
  },
  { 
    srNo: 3, 
    code: 'OMS0218', 
    name: 'BALAJI CONSULTANTS', 
    email: 'arllogistics@gmail.com',
    phone: '9029200429',
    city: 'PUNE',
    state: 'MAHARASHTRA',
    address: 'OFFICE NO. 304, 3RD FLOOR, C BUILD PRIDE KUMAR SENATE CO OPERATIVE SO PUNE MAHARASHTRA',
    pincode: '411016',
    gstNo: '27AGVPJ5100H1ZC',
    password: 'arllogistics@gmail.com',
    api: 'Yes'
  },
  { 
    srNo: 4, 
    code: 'OMS0217', 
    name: 'SPHERE ENGINEERS PRIVATE LIMITED', 
    email: 'sphereballs@gmail.com',
    phone: '9757442793',
    city: 'THANE',
    state: 'MAHARASHTRA',
    address: 'PLOT NO A-287, ROAD NO 16/Z, WAGLE INDUSTRIAL ESTATE',
    pincode: '400604',
    gstNo: '27AAACS5475Q1ZM',
    password: 'SPHERE@2025',
    api: 'Yes'
  },
  { 
    srNo: 5, 
    code: 'OMS0216', 
    name: 'THANE VAIBHAV', 
    email: 'thanevaibhav1975@gmail.com',
    phone: '9819249280',
    city: 'THANE',
    state: 'MAHARASHTRA',
    address: 'Shop No 1, B BUILDING, Damle Apartment, Veer Savarkar Road, Tembhi Naka',
    pincode: '400602',
    gstNo: '27AADFT1816G1ZC',
    password: 'TV@2025',
    api: 'Yes'
  },
];

export function CustomerDetails() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-white min-h-[calc(100vh-70px)]">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Customer Details</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Master Management / View Records</p>
        </div>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-5 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add Customer Details
        </Button>
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 py-2 border-y border-slate-100">
        <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider h-9 flex items-center gap-2">
                <Download className="h-3.5 w-3.5" />
                Excel
            </Button>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>
            <p className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {initialCustomerData.length} Total Customers
            </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by code, name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <Button variant="outline" className="h-9 w-9 p-0 border-slate-200 text-slate-400 hover:text-blue-600">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed lg:table-auto min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 w-16 text-[10px] font-black uppercase tracking-wider text-slate-800">SrNo <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-30" /></th>
                <th className="p-4 w-28 text-[10px] font-black uppercase tracking-wider text-slate-800">C.Code <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-30" /></th>
                <th className="p-4 w-48 text-[10px] font-black uppercase tracking-wider text-slate-800">Customer <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-30" /></th>
                <th className="p-4 w-48 text-[10px] font-black uppercase tracking-wider text-slate-800">Email</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">Phone</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">City</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">State</th>
                <th className="p-4 w-60 text-[10px] font-black uppercase tracking-wider text-slate-800">Address</th>
                <th className="p-4 w-24 text-[10px] font-black uppercase tracking-wider text-slate-800">Pincode</th>
                <th className="p-4 w-36 text-[10px] font-black uppercase tracking-wider text-slate-800">Gstno</th>
                <th className="p-4 w-32 text-[10px) font-black uppercase tracking-wider text-slate-800">Password</th>
                <th className="p-4 w-16 text-[10px] font-black uppercase tracking-wider text-slate-800 text-center">API</th>
                <th className="p-4 w-24 text-[10px] font-black uppercase tracking-wider text-slate-800 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-l border-l border-slate-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {initialCustomerData.map((customer, idx) => (
                <tr key={customer.srNo} className={`group border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="p-4 text-[11px] font-bold text-slate-500">{customer.srNo}</td>
                  <td className="p-4 text-[11px] font-black text-blue-700 font-mono tracking-tighter">{customer.code}</td>
                  <td className="p-4">
                    <div className="text-[11px] font-black text-slate-800 leading-tight uppercase max-w-[180px]">
                      {customer.name}
                    </div>
                  </td>
                  <td className="p-4 text-[11px] font-semibold text-slate-500 group-hover:text-blue-600 transition-colors uppercase break-all">
                    {customer.email}
                  </td>
                  <td className="p-4 text-[11px] font-bold text-slate-600 font-mono italic">{customer.phone}</td>
                  <td className="p-4 text-[11px] font-black text-slate-700 uppercase">{customer.city}</td>
                  <td className="p-4 text-[11px] font-semibold text-slate-500 uppercase">{customer.state}</td>
                  <td className="p-4">
                    <div className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase max-w-[220px] line-clamp-3 group-hover:line-clamp-none transition-all">
                      {customer.address}
                    </div>
                  </td>
                  <td className="p-4 text-[11px] font-black text-slate-600 font-mono">{customer.pincode}</td>
                  <td className="p-4 text-[11px] font-black text-slate-800 font-mono tracking-tighter uppercase">{customer.gstNo}</td>
                  <td className="p-4 text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors italic">{customer.password}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-600 uppercase">
                      {customer.api}
                    </span>
                  </td>
                  <td className="p-4 text-center sticky right-0 bg-white/90 group-hover:bg-blue-50/90 backdrop-blur-sm border-l border-slate-100 group-hover:border-blue-100 transition-all">
                    <div className="flex justify-center gap-2">
                        <button className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        <button className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 border-t border-slate-100 pt-8 pb-4 text-center space-y-2 opacity-60">
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
