import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ArrowLeft, AlertCircle } from "lucide-react";

const initialGstData = [
  { sr: 1, from: '2026-04-01', to: '2027-03-31', cgst: '9.00', sgst: '9.00' },
];

const LOCAL_STORAGE_KEY = 'om-courier-gst-settings';

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateStr;
};

export function GstSetting() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [gstRecords, setGstRecords] = useState([]);
  const [formData, setFormData] = useState({
    from: '', to: '', cgst: '', sgst: ''
  });
  const [error, setError] = useState('');

  // Load records from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out settings older than 2026
        const cleaned = parsed.filter(r => {
          if (!r.from) return false;
          const year = parseInt(r.from.split('-')[0]);
          return year >= 2026;
        });

        if (cleaned.length > 0) {
          const mapped = cleaned.map((r, idx) => ({ ...r, sr: idx + 1 }));
          setGstRecords(mapped);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        } else {
          setGstRecords(initialGstData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialGstData));
        }
      } catch (e) {
        setGstRecords(initialGstData);
      }
    } else {
      setGstRecords(initialGstData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialGstData));
    }
  }, []);

  const saveRecords = (records) => {
    setGstRecords(records);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      from: record.from,
      to: record.to,
      cgst: record.cgst,
      sgst: record.sgst
    });
    setIsAdding(true);
    setError('');
  };

  const handleDelete = (sr) => {
    if (window.confirm("Are you sure you want to delete this GST rate setting?")) {
      const updated = gstRecords.filter(r => r.sr !== sr).map((r, idx) => ({
        ...r,
        sr: idx + 1
      }));
      saveRecords(updated);
    }
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData({ from: '', to: '', cgst: '', sgst: '' });
    setIsAdding(true);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.cgst || !formData.sgst) {
      setError('All fields are required.');
      return;
    }

    if (isNaN(parseFloat(formData.cgst)) || parseFloat(formData.cgst) < 0) {
      setError('CGST must be a valid positive number.');
      return;
    }

    if (isNaN(parseFloat(formData.sgst)) || parseFloat(formData.sgst) < 0) {
      setError('SGST must be a valid positive number.');
      return;
    }

    if (new Date(formData.from) > new Date(formData.to)) {
      setError('Applicable From Date cannot be after Applicable To Date.');
      return;
    }

    let updatedRecords;
    if (editingRecord) {
      updatedRecords = gstRecords.map(r => 
        r.sr === editingRecord.sr 
          ? {
              ...r,
              from: formData.from,
              to: formData.to,
              cgst: parseFloat(formData.cgst).toFixed(2),
              sgst: parseFloat(formData.sgst).toFixed(2)
            }
          : r
      );
    } else {
      const newRecord = {
        sr: gstRecords.length + 1,
        from: formData.from,
        to: formData.to,
        cgst: parseFloat(formData.cgst).toFixed(2),
        sgst: parseFloat(formData.sgst).toFixed(2)
      };
      updatedRecords = [...gstRecords, newRecord];
    }

    saveRecords(updatedRecords);
    setIsAdding(false);
    setEditingRecord(null);
    setFormData({ from: '', to: '', cgst: '', sgst: '' });
  };

  if (isAdding) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => {
              setIsAdding(false);
              setEditingRecord(null);
            }} 
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 bg-white"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div>
            <h2 className="text-sm font-black text-[#1a2f4c] uppercase tracking-wide">
              {editingRecord ? 'Edit GST Setting' : 'Add GST Setting'}
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define Taxes & Validity Dates</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 p-4 md:p-8 flex justify-center items-start">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-lg border-2 border-slate-200 shadow-md overflow-hidden">
            <div className="px-5 py-4 bg-[#1a2f4c] border-b border-slate-200">
              <h3 className="text-[12px] font-black text-white uppercase tracking-wide">
                {editingRecord ? 'Modify GST Rates' : 'Create New GST Rate'}
              </h3>
            </div>

            {error && (
              <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2.5 rounded">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            {/* Form Rows */}
            <div className="divide-y divide-slate-150 p-6 space-y-4">
              {/* Row 1: From Date */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2 py-1">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Applicable From Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  required
                  value={formData.from}
                  onChange={(e) => setFormData({...formData, from: e.target.value})}
                  className="w-full h-9 px-3 border-2 border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] transition-all bg-white"
                />
              </div>

              {/* Row 2: To Date */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2 py-1">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Applicable To Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  required
                  value={formData.to}
                  onChange={(e) => setFormData({...formData, to: e.target.value})}
                  className="w-full h-9 px-3 border-2 border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] transition-all bg-white"
                />
              </div>

              {/* Row 3: CGST */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2 py-1">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">CGST Rate (%) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="ENTER CGST RATE (E.G. 9.00)"
                  value={formData.cgst}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setFormData({...formData, cgst: val});
                    }
                  }}
                  className="w-full h-9 px-3 border-2 border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] transition-all bg-white placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* Row 4: SGST */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2 py-1">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">SGST Rate (%) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="ENTER SGST RATE (E.G. 9.00)"
                  value={formData.sgst}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setFormData({...formData, sgst: val});
                    }
                  }}
                  className="w-full h-9 px-3 border-2 border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] transition-all bg-white placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Submit Button Row */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-8 py-2 rounded shadow-md font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02]">
                {editingRecord ? 'Update Setting' : 'Save Setting'}
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingRecord(null);
                }}
                className="border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 px-6 py-2 rounded font-black text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Branding */}
        <div className="mt-8 border-t border-slate-100 py-6 text-center space-y-1 bg-white">
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            COPYRIGHT © 2026 BRISK NETWORK. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            PREMIUM LOGISTICS SOLUTIONS & MANAGEMENT SYSTEMS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      <div className="p-4 md:p-6 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">GST Setting</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Master Management / View Records</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-5 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Add GST Setting
          </Button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-800 font-black">
                <th className="p-3.5 text-[10px] font-black uppercase tracking-wider w-16 text-center border-r border-slate-150">Sr.</th>
                <th className="p-3.5 text-[10px] font-black uppercase tracking-wider border-r border-slate-150">Applicable From</th>
                <th className="p-3.5 text-[10px] font-black uppercase tracking-wider border-r border-slate-150">Applicable To</th>
                <th className="p-3.5 text-[10px] font-black uppercase tracking-wider border-r border-slate-150 text-right">CGST Rate</th>
                <th className="p-3.5 text-[10px] font-black uppercase tracking-wider border-r border-slate-150 text-right">SGST Rate</th>
                <th className="p-3.5 text-[10px] font-black uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {gstRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-bold uppercase text-[11px]">
                    No GST settings configured. Click "+ Add GST Setting" to create one.
                  </td>
                </tr>
              ) : (
                gstRecords.map((row) => (
                  <tr key={row.sr} className="group border-b border-slate-100 hover:bg-blue-50/20 transition-colors">
                    <td className="p-3.5 text-[11px] font-bold text-slate-400 text-center border-r border-slate-100">{row.sr}</td>
                    <td className="p-3.5 text-[11px] font-bold text-slate-700 uppercase border-r border-slate-100">{formatDateDisplay(row.from)}</td>
                    <td className="p-3.5 text-[11px] font-bold text-slate-700 uppercase border-r border-slate-100">{formatDateDisplay(row.to)}</td>
                    <td className="p-3.5 text-[11px] font-black text-blue-700 font-mono border-r border-slate-100 text-right">{row.cgst}%</td>
                    <td className="p-3.5 text-[11px] font-black text-blue-700 font-mono border-r border-slate-100 text-right">{row.sgst}%</td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleEdit(row)} 
                          className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded shadow-sm transition-colors" 
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(row.sr)} 
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Footer */}
      <div className="mt-auto border-t border-slate-100 pb-8 px-4 opacity-80">
        <div className="max-w-7xl mx-auto text-center space-y-2 py-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            COPYRIGHT © 2026 BRISK NETWORK. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[8px] text-slate-300 font-bold uppercase tracking-tight">
            PREMIUM LOGISTICS SOLUTIONS & MANAGEMENT SYSTEMS
          </p>
        </div>
      </div>
    </div>
  );
}
