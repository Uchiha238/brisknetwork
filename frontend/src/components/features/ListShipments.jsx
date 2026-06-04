import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Download, FileText, Calendar, MapPin, Package, RefreshCw, Layers } from "lucide-react";

export function ListShipments() {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await api.getShipments();
      setShipments(data);
    } catch (err) {
      console.error('Fetch shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleExportCSV = () => {
    if (shipments.length === 0) return;
    
    // Headers
    const headers = [
      'ID', 'AWB No', 'Type', 'Status', 'Booking Date', 'Customer',
      'Origin Hub', 'Destination', 'Pcs', 'Actual Weight', 'Chargeable Weight',
      'Bill Type', 'Total Charges', 'E-Way Bill No'
    ];
    
    // Rows
    const rows = filteredShipments.map(s => [
      s.id,
      s.airway_no,
      s.type,
      s.status,
      s.booking_date,
      s.customer_name || s.shipper_name || 'N/A',
      s.origin_hub,
      s.destination,
      s.pcs,
      s.actual_weight,
      s.chargeable_weight,
      s.bill_type,
      s.total_charges,
      s.eway_bill_no
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shipments_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredShipments = shipments.filter(s => {
    // Search filter
    const matchesSearch = 
      (s.airway_no && s.airway_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.shipper_name && s.shipper_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.consignee_name && s.consignee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.destination && s.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.origin_hub && s.origin_hub.toLowerCase().includes(searchTerm.toLowerCase()));

    // Type filter
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || (s.status || '').toUpperCase() === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-white min-h-[calc(100vh-70px)] font-sans">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">List Shipments</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shipment Operations / Booking Register</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchShipments}
            disabled={loading}
            className="border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider h-10 px-4 rounded shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-10 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="h-4 w-4 stroke-[3px]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 py-2 border-y border-slate-100">
        
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filters:</span>
            
            {/* Shipment Type Selector */}
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-tight text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="DOMESTIC">DOMESTIC</option>
              <option value="INTERNATIONAL">INTERNATIONAL</option>
            </select>

            {/* Status Selector */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-tight text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="BOOKED">BOOKED</option>
              <option value="IN TRANSIT">IN TRANSIT</option>
              <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
            
            <div className="h-6 w-px bg-slate-200 mx-2 hidden lg:block"></div>
            <p className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {filteredShipments.length} bookings
            </p>
        </div>

        {/* Search Field */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search AWB, Customer, Shipper, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 w-16 text-[10px] font-black uppercase tracking-wider text-slate-800">ID</th>
                <th className="p-4 w-28 text-[10px] font-black uppercase tracking-wider text-slate-800">AWB No</th>
                <th className="p-4 w-28 text-[10px] font-black uppercase tracking-wider text-slate-800">Date</th>
                <th className="p-4 w-60 text-[10px] font-black uppercase tracking-wider text-slate-800">Shipper / Customer</th>
                <th className="p-4 w-48 text-[10px] font-black uppercase tracking-wider text-slate-800">Consignee</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">Destination</th>
                <th className="p-4 w-24 text-[10px] font-black uppercase tracking-wider text-slate-800">Pcs</th>
                <th className="p-4 w-28 text-[10px] font-black uppercase tracking-wider text-slate-800">Chargeable Wt</th>
                <th className="p-4 w-28 text-[10px] font-black uppercase tracking-wider text-slate-800">Total Charges</th>
                <th className="p-4 w-28 text-[10px] font-black uppercase tracking-wider text-slate-800">Pay Mode</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-400 font-bold uppercase text-[11px]">
                    No shipments found matching filters
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s, idx) => (
                  <tr key={s.id} className={`group border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                    <td className="p-4 text-[11px] font-bold text-slate-500">{s.id}</td>
                    <td className="p-4 text-[11px] font-black text-blue-700 font-mono tracking-tighter">
                      <div className="flex flex-col">
                        <span>{s.airway_no}</span>
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase">{s.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-bold text-slate-700">{s.booking_date}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{s.booking_time}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[11px] font-black text-slate-800 leading-tight uppercase font-sans">
                        {s.customer_name || s.shipper_company || s.shipper_name || 'N/A'}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">Code: {s.account_code || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-[11px] font-bold text-slate-700 leading-tight uppercase">
                        {s.consignee_company || s.consignee_name || 'N/A'}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">{s.consignee_phone || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-black text-slate-700 uppercase">{s.destination || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-black text-slate-700 font-mono">{s.pcs || 1}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[11px] font-black text-slate-700 font-mono">
                      {s.chargeable_weight ? `${parseFloat(s.chargeable_weight).toFixed(2)} KG` : '0.00 KG'}
                    </td>
                    <td className="p-4 text-[11px] font-black text-slate-900 font-mono">
                      {s.total_charges ? `${parseFloat(s.total_charges).toLocaleString('en-IN', { style: 'currency', currency: s.currency || 'INR', minimumFractionDigits: 0 })}` : '₹0'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${s.bill_type === 'CASH' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {s.bill_type || 'CASH'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                        (s.status || '').toLowerCase() === 'delivered' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {s.status || 'BOOKED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
