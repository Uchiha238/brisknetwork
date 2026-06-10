import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plane, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

export function ModeMaster() {
  const [isAdding, setIsAdding] = useState(false);
  const [modes, setModes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Domestic'
  });

  const fetchModes = () => {
    fetch('/api/modes')
      .then(res => res.json())
      .then(data => setModes(data))
      .catch(err => console.error('Fetch modes error:', err));
  };

  useEffect(() => {
    fetchModes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/modes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, type: formData.type })
      });
      const data = await res.json();
      if (data.success) {
        fetchModes();
        setIsAdding(false);
        setFormData({ name: '', type: 'Domestic' });
      }
    } catch (err) {
      console.error('Add mode error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mode?')) return;
    try {
      await fetch(`/api/modes/${id}`, { method: 'DELETE' });
      fetchModes();
    } catch (err) {
      console.error('Delete mode error:', err);
    }
  };

  if (isAdding) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
          <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <h2 className="text-sm font-bold text-[#1a2f4c] uppercase tracking-wide">Add Mode</h2>
        </div>

        {/* Form Container */}
        <div className="flex-1 p-4 md:p-8 flex justify-center items-start">
          <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Form Rows */}
            <div className="divide-y divide-slate-100">
              {/* Row 1: Mode Name */}
              <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] items-center p-4">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Mode Name</label>
                <input 
                  type="text" 
                  placeholder="ENTER MODE NAME"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  className="w-full md:max-w-md h-9 px-3 border border-slate-300 rounded text-[11px] font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 uppercase"
                />
              </div>

              {/* Row 2: Type */}
              <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] items-center p-4">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full md:max-w-md h-9 px-3 border border-slate-300 rounded text-[11px] font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all bg-white cursor-pointer"
                >
                  <option value="Domestic">DOMESTIC</option>
                  <option value="International">INTERNATIONAL</option>
                  <option value="Both">BOTH</option>
                </select>
              </div>

              {/* Submit Button Row */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-start">
                <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-8 py-2 rounded shadow-md font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02]">
                  Add Mode
                </Button>
              </div>
            </div>
          </form>
        </div>

        <Footer theme="brisk" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      <div className="p-4 md:p-6 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight">All Mode</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Master Management / View Records</p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-5 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Add Mode
          </Button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-slate-600 w-24 text-center border-r border-slate-100">Sr.</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-100">Mode Name</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-100 w-40">Type</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-slate-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {modes.map((row, idx) => (
                <tr key={row.id} className={`group border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="p-3 text-[11px] font-bold text-slate-400 text-center border-r border-slate-50">{idx + 1}</td>
                  <td className="p-3 text-[11px] font-black text-slate-800 uppercase border-r border-slate-50">{row.name}</td>
                  <td className="p-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-50">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                      row.type === 'Domestic' ? 'bg-green-100 text-green-700' :
                      row.type === 'International' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {row.type ? row.type.toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete">
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

      <Footer theme="brisk" />
    </div>
  );
}
