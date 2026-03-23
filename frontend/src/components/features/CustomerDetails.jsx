import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Plus, ArrowUpDown, Filter, Pencil, Trash2, X } from "lucide-react";

export function CustomerDetails() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', phone: '', email: '', city: '', gst_no: ''
  });

  const fetchCustomers = async () => {
    try {
      const response = await fetch(' http://localhost:5000/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await fetch(`http://localhost:5000/api/customers/${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingCustomer ? 'PUT' : 'POST';
    const url = editingCustomer 
      ? `http://localhost:5000/api/customers/${editingCustomer.id}` 
      : 'http://localhost:5000/api/customers';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ code: '', name: '', phone: '', email: '', city: '', gst_no: '' });
      fetchCustomers();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      gst_no: customer.gst_no
    });
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-white min-h-[calc(100vh-70px)] font-sans">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Customer Details</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Master Management / View Records</p>
        </div>
        <Button 
          onClick={() => { setEditingCustomer(null); setFormData({ code: '', name: '', phone: '', email: '', city: '', gst_no: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
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
                Showing {filteredCustomers.length} Customers
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
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 w-16 text-[10px] font-black uppercase tracking-wider text-slate-800">ID</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">Code</th>
                <th className="p-4 w-64 text-[10px] font-black uppercase tracking-wider text-slate-800">Customer Name</th>
                <th className="p-4 w-48 text-[10px] font-black uppercase tracking-wider text-slate-800">Email</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">Phone</th>
                <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">City</th>
                <th className="p-4 w-48 text-[10px] font-black uppercase tracking-wider text-slate-800">GST No</th>
                <th className="p-4 w-24 text-[10px] font-black uppercase tracking-wider text-slate-800 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-l border-l border-slate-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, idx) => (
                <tr key={customer.id} className={`group border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="p-4 text-[11px] font-bold text-slate-500">{customer.id}</td>
                  <td className="p-4 text-[11px] font-black text-blue-700 font-mono tracking-tighter">{customer.code}</td>
                  <td className="p-4">
                    <div className="text-[11px] font-black text-slate-800 leading-tight uppercase font-sans">
                      {customer.name}
                    </div>
                  </td>
                  <td className="p-4 text-[11px] font-semibold text-slate-500 uppercase">{customer.email}</td>
                  <td className="p-4 text-[11px] font-bold text-slate-600 font-mono">{customer.phone}</td>
                  <td className="p-4 text-[11px] font-black text-slate-700 uppercase">{customer.city}</td>
                  <td className="p-4 text-[11px] font-black text-slate-800 font-mono tracking-tighter uppercase">{customer.gst_no}</td>
                  <td className="p-4 text-center sticky right-0 bg-white/90 group-hover:bg-blue-50/90 backdrop-blur-sm border-l border-slate-100 group-hover:border-blue-100 transition-all">
                    <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(customer)} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(customer.id)} className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] p-5 flex justify-between items-center">
              <h2 className="text-white font-black uppercase tracking-widest text-sm">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Code</label>
                  <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required className="h-10 border-2 focus:border-blue-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GST No</label>
                  <Input value={formData.gst_no} onChange={e => setFormData({...formData, gst_no: e.target.value})} required className="h-10 border-2 focus:border-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="h-10 border-2 focus:border-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="h-10 border-2 focus:border-blue-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="h-10 border-2 focus:border-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <Input value={formData.email} type="email" onChange={e => setFormData({...formData, email: e.target.value})} required className="h-10 border-2 focus:border-blue-600" />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 uppercase font-black text-xs tracking-widest">Cancel</Button>
                <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 uppercase font-black text-xs tracking-widest">Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
