import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2, Upload, Calendar, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

export function InternationalRate() {
  const [rateSheets, setRateSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form States
  const [courier, setCourier] = useState('DHL');
  const [customCourier, setCustomCourier] = useState('');
  const [exportImport, setExportImport] = useState('EXPORT');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveTo, setEffectiveTo] = useState('9999-12-31');
  const [selectedFile, setSelectedFile] = useState(null);

  const couriers = ['DHL', 'ARAMEX', 'FEDEX', 'UPS', 'TNT', 'CO COURIER 1', 'OTHER'];

  const fetchRateSheets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/international-rates/groups');
      const data = await res.json();
      if (data.success) {
        setRateSheets(data.data);
      } else {
        showNotification('error', data.error || 'Failed to fetch rate sheets');
      }
    } catch (err) {
      showNotification('error', 'Network error while fetching rate sheets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRateSheets();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDelete = async (sheet) => {
    if (!window.confirm(`Are you sure you want to delete all rates for ${sheet.courier} (${sheet.export_import}) effective ${sheet.effective_from} to ${sheet.effective_to}?`)) {
      return;
    }

    try {
      const url = `/api/international-rates/groups?courier=${encodeURIComponent(sheet.courier)}&export_import=${encodeURIComponent(sheet.export_import)}&effective_from=${encodeURIComponent(sheet.effective_from)}&effective_to=${encodeURIComponent(sheet.effective_to)}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Deleted rates for ${sheet.courier} successfully.`);
        fetchRateSheets();
      } else {
        showNotification('error', data.error || 'Failed to delete rates');
      }
    } catch (err) {
      showNotification('error', 'Network error while deleting rates');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('error', 'Please select a CSV or Excel file to upload');
      return;
    }

    const finalCourier = courier === 'OTHER' ? customCourier.trim().toUpperCase() : courier.toUpperCase();
    if (!finalCourier) {
      showNotification('error', 'Please enter a valid courier name');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target.result.split(',')[1];
      try {
        const response = await fetch('/api/international-rates/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courier: finalCourier,
            export_import: exportImport,
            effective_from: effectiveFrom,
            effective_to: effectiveTo,
            fileData
          })
        });
        const data = await response.json();
        if (data.success) {
          showNotification('success', `Successfully imported ${data.count} rates for ${finalCourier}!`);
          setSelectedFile(null);
          setCustomCourier('');
          const fileInput = document.getElementById('rate-file-input');
          if (fileInput) fileInput.value = '';
          fetchRateSheets();
        } else {
          showNotification('error', data.error || 'Failed to upload rates');
        }
      } catch (err) {
        showNotification('error', 'Network error during file upload');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      showNotification('error', 'Error reading file');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const selectClass = "w-full appearance-none bg-white border border-slate-300 rounded px-4 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 transition-all cursor-pointer shadow-sm";
  const inputClass = "w-full bg-white border border-slate-300 rounded px-4 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm";

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-700 tracking-tight">International Rate Master</h1>
        <div className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Rate Management
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side: List of Uploaded Sheets */}
        <div className="flex-1 order-2 lg:order-1">
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Rate Sheets</h2>
              <button onClick={fetchRateSheets} className="text-[10px] text-blue-600 font-bold hover:underline">
                Refresh List
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#1a2f4c]" />
                <p className="text-[11px] font-bold uppercase tracking-wider">Loading rate sheets...</p>
              </div>
            ) : rateSheets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Info className="h-8 w-8 mb-4 text-slate-300" />
                <p className="text-[11px] font-bold uppercase tracking-wider">No rate sheets uploaded yet</p>
                <p className="text-[10px] text-slate-400 mt-1">Use the upload form to import courier rate sheets.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 uppercase font-black tracking-tight">
                      <th className="px-6 py-4 border-r border-slate-100 w-16 text-center">Sr.</th>
                      <th className="px-6 py-4 border-r border-slate-100">Courier</th>
                      <th className="px-6 py-4 border-r border-slate-100">Effective From</th>
                      <th className="px-6 py-4 border-r border-slate-100">Effective To</th>
                      <th className="px-6 py-4 border-r border-slate-100 text-center">Export/Import</th>
                      <th className="px-6 py-4 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateSheets.map((sheet, index) => (
                      <tr key={index} className="group border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-400 border-r border-slate-100 text-center">{index + 1}</td>
                        <td className="px-6 py-4 font-black text-slate-700 uppercase border-r border-slate-100">{sheet.courier}</td>
                        <td className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100 tabular-nums">{sheet.effective_from}</td>
                        <td className="px-6 py-4 font-bold text-slate-500 border-r border-slate-100 tabular-nums">
                          {sheet.effective_to === '9999-12-31' ? (
                            <span className="text-emerald-600 font-bold uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded">Ongoing</span>
                          ) : sheet.effective_to}
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${sheet.export_import === 'EXPORT' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                            {sheet.export_import}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(sheet)}
                            className="text-slate-300 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50" 
                            title="Delete Rate Sheet"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Upload Form */}
        <div className="w-full lg:w-96 order-1 lg:order-2 flex flex-col gap-4">
          {/* Notification Toast */}
          {notification && (
            <div className={`p-4 rounded border flex items-start gap-3 shadow-md transition-all ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              )}
              <div className="text-[11px] font-bold leading-normal">
                {notification.message}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#1a2f4c]" />
              Upload Rate Sheet
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Courier Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Courier Company</label>
                <div className="relative">
                  <select 
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className={selectClass}
                  >
                    {couriers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Custom Courier input (if "OTHER" selected) */}
              {courier === 'OTHER' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Enter Courier Name</label>
                  <input 
                    type="text"
                    value={customCourier}
                    onChange={(e) => setCustomCourier(e.target.value)}
                    placeholder="E.G. ARAMEX, FEDEX"
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {/* Export/Import Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Slab Mode</label>
                <div className="relative">
                  <select 
                    value={exportImport}
                    onChange={(e) => setExportImport(e.target.value)}
                    className={selectClass}
                  >
                    <option value="EXPORT">EXPORT</option>
                    <option value="IMPORT">IMPORT</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> From Date
                  </label>
                  <input 
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> To Date
                  </label>
                  <input 
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* File Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Spreadsheet File (.csv, .xlsx)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50/50 hover:border-slate-300 transition-all cursor-pointer relative">
                  <input 
                    id="rate-file-input"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                      {selectedFile ? selectedFile.name : 'Select or drop file'}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">CSV or Excel format</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={isUploading}
                className="w-full bg-[#1a2f4c] hover:bg-[#25426d] text-white py-3 rounded font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" />
                    Import Rates
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Form Guide */}
          <div className="bg-[#1a2f4c]/5 border border-[#1a2f4c]/10 rounded p-4 text-[10px] text-slate-600 space-y-2">
            <h4 className="font-black text-[#1a2f4c] uppercase tracking-wider flex items-center gap-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Slab Upload Guide
            </h4>
            <ul className="list-disc pl-4 space-y-1 font-semibold leading-relaxed">
              <li>Expected format: a grid/matrix with a row containing <code className="text-[#1a2f4c] font-black">Weight</code> and zones like <code className="text-[#1a2f4c] font-black">1, 2, 3...</code>.</li>
              <li>Columns before <code className="text-[#1a2f4c] font-black">Weight</code> can define mode (Export/Import), doc type, and rate type (Fixed/Per Kg).</li>
              <li>Uploads automatically overwrite existing rates for the exact same courier, mode, and date range.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer theme="svp" />
    </div>
  );
}
