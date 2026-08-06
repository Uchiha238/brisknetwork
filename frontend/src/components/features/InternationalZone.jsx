import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Search, Upload, FileText, ChevronDown, Download, Trash2, 
  AlertCircle, CheckCircle2, Loader2, Info, Calendar, List, 
  MapPin, XCircle
} from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { API_BASE_URL } from "@/services/api";

export function InternationalZone() {
  const [zoneSheets, setZoneSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(true);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form States
  const [courier, setCourier] = useState('DHL');
  const [customCourier, setCustomCourier] = useState('');
  const [type, setType] = useState('EXPORT');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('9999-12-31');
  const [selectedFileName, setSelectedFileName] = useState('NO FILE CHOSEN');
  const [selectedFile, setSelectedFile] = useState(null);

  // Search & Filter States
  const [searchHistory, setSearchHistory] = useState('');
  const [searchMapping, setSearchMapping] = useState('');
  
  // Notification & Row-wise Validation Errors
  const [notification, setNotification] = useState(null);
  const [rowErrors, setRowErrors] = useState([]);

  const couriers = ['DHL', 'FEDEX', 'UPS', 'ARAMEX', 'OTHER'];

  const fetchZoneSheets = async () => {
    setIsLoadingSheets(true);
    try {
      const res = await fetch(`${API_BASE_URL}/international-zones/groups`);
      const data = await res.json();
      if (data.success) {
        setZoneSheets(data.data);
      } else {
        showNotification('error', data.error || 'Failed to fetch zone sheets');
      }
    } catch (err) {
      showNotification('error', 'Network error while fetching zone sheets');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const fetchMappings = async (sheet, searchQuery = '') => {
    setIsLoadingMappings(true);
    try {
      const url = `${API_BASE_URL}/international-zones/mappings?courier=${encodeURIComponent(sheet.courier)}&type=${encodeURIComponent(sheet.type)}&effective_from=${encodeURIComponent(sheet.effective_from)}&effective_to=${encodeURIComponent(sheet.effective_to)}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMappings(data.data);
      } else {
        showNotification('error', data.error || 'Failed to fetch mappings');
      }
    } catch (err) {
      showNotification('error', 'Network error while fetching country mappings');
    } finally {
      setIsLoadingMappings(false);
    }
  };

  useEffect(() => {
    fetchZoneSheets();
  }, []);

  useEffect(() => {
    if (selectedSheet) {
      fetchMappings(selectedSheet, searchMapping);
    } else {
      setMappings([]);
    }
  }, [selectedSheet, searchMapping]);

  const showNotification = (type, message, duration = 6000) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleDelete = async (e, sheet) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete all zone mappings for ${sheet.courier} (${sheet.type}) active ${sheet.effective_from} to ${sheet.effective_to}?`)) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/international-zones/groups?courier=${encodeURIComponent(sheet.courier)}&type=${encodeURIComponent(sheet.type)}&effective_from=${encodeURIComponent(sheet.effective_from)}&effective_to=${encodeURIComponent(sheet.effective_to)}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Successfully deleted zones for ${sheet.courier}`);
        if (selectedSheet && 
            selectedSheet.courier === sheet.courier && 
            selectedSheet.type === sheet.type && 
            selectedSheet.effective_from === sheet.effective_from && 
            selectedSheet.effective_to === sheet.effective_to) {
          setSelectedSheet(null);
        }
        fetchZoneSheets();
      } else {
        showNotification('error', data.error || 'Failed to delete zone sheet');
      }
    } catch (err) {
      showNotification('error', 'Network error while deleting zones');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setRowErrors([]);

    if (!selectedFile) {
      showNotification('error', 'Please choose an Excel file to upload');
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
        const response = await fetch(`${API_BASE_URL}/international-zones/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courier: finalCourier,
            type,
            effective_from: validFrom,
            effective_to: validTo,
            fileData
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          showNotification('success', `Imported ${data.count} countries for ${finalCourier}! ${data.warning ? `(${data.warning})` : ''}`, 8000);
          setSelectedFile(null);
          setSelectedFileName('NO FILE CHOSEN');
          setCustomCourier('');
          const fileInput = document.getElementById('zone-file-input');
          if (fileInput) fileInput.value = '';
          fetchZoneSheets();
        } else {
          showNotification('error', data.error || 'Validation errors found in the file.');
          if (data.errors) {
            setRowErrors(data.errors);
          }
        }
      } catch (err) {
        showNotification('error', 'Network error during file upload');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      showNotification('error', 'Failed to read file content');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDownloadSample = () => {
    window.open(`${API_BASE_URL}/international-zones/sample`, '_blank');
  };

  const filteredSheets = zoneSheets.filter(sheet => {
    return sheet.courier.toLowerCase().includes(searchHistory.toLowerCase()) ||
           sheet.type.toLowerCase().includes(searchHistory.toLowerCase());
  });

  const selectClass = "w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-sm";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors shadow-sm";

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans p-4 md:p-6">
      
      {/* Page Title & Top Actions */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4 bg-white -mx-6 -mt-6 px-6 py-4">
        <div>
          <h1 className="text-xl font-black text-slate-700 tracking-tight">International Zone Master</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Manage country-to-zone mappings by courier</p>
        </div>
        <Button 
          onClick={handleDownloadSample}
          className="bg-[#1a2f4c] hover:bg-[#25426d] text-white border-none px-5 py-2 rounded shadow-md font-black text-[10px] uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          Download Sample
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Upload & Warnings */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">
          
          {/* Notification Alert */}
          {notification && (
            <div className={`p-4 rounded-lg border flex items-start gap-3 shadow-md transition-all ${
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

          {/* Validation Row-wise Errors Report */}
          {rowErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm flex flex-col max-h-60 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <XCircle className="h-4 w-4 shrink-0" />
                <h4 className="text-[10px] font-black uppercase tracking-wider">File Errors ({rowErrors.length})</h4>
              </div>
              <ul className="text-[9px] font-bold text-red-600 space-y-1 list-disc pl-4 leading-normal font-mono">
                {rowErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Form */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#1a2f4c]" />
              Upload Zone Master
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Courier Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courier Name</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Courier Name</label>
                  <input 
                    type="text"
                    value={customCourier}
                    onChange={(e) => setCustomCourier(e.target.value)}
                    placeholder="E.G. FEDEX, ARAMEX"
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {/* Mode Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slab Type</label>
                <div className="relative">
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Valid From
                  </label>
                  <input 
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Valid To
                  </label>
                  <input 
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Choose File */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spreadsheet File (.xlsx, .xls)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 text-center hover:bg-slate-50/50 hover:border-slate-300 transition-all cursor-pointer relative">
                  <input 
                    id="zone-file-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <FileText className="h-6 w-6 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                      {selectedFileName}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">Excel files only</span>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <Button 
                type="submit"
                disabled={isUploading}
                className="w-full bg-[#1a2f4c] hover:bg-[#25426d] text-white py-3 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Upload Zone
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Guide Card */}
          <div className="bg-[#1a2f4c]/5 border border-[#1a2f4c]/10 rounded-lg p-4 text-[10px] text-slate-600 space-y-2">
            <h4 className="font-black text-[#1a2f4c] uppercase tracking-wider flex items-center gap-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Zone Upload Guide
            </h4>
            <ul className="list-disc pl-4 space-y-1 font-semibold leading-relaxed">
              <li>Template headers are <code className="text-[#1a2f4c] font-black">Country</code>, <code className="text-[#1a2f4c] font-black">Country Code</code>, and <code className="text-[#1a2f4c] font-black">Zone</code>.</li>
              <li>Only valid country codes present in the system countries database will be imported.</li>
              <li>Setting overlapping ranges displays a warning but processes the file cleanly.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Masters list & Details mappings list */}
        <div className="flex-1 flex flex-col gap-6 font-sans">
          
          {/* Active Masters Section */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Zone Masters</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Click any master sheet to view detailed mappings</p>
              </div>

              {/* History Search */}
              <div className="relative">
                <input 
                  type="text"
                  placeholder="SEARCH COURIER / TYPE"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-[10px] font-bold text-slate-600 outline-none focus:border-blue-500 w-48 shadow-sm placeholder:text-slate-300"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {isLoadingSheets ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#1a2f4c]" />
                <p className="text-[10px] font-black uppercase tracking-wider">Loading masters...</p>
              </div>
            ) : filteredSheets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <List className="h-8 w-8 mb-4 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-wider">No zone masters found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 uppercase font-black tracking-tight">
                      <th className="px-6 py-3 border-r border-slate-100 w-16 text-center">Sr.</th>
                      <th className="px-6 py-3 border-r border-slate-100">Courier</th>
                      <th className="px-6 py-3 border-r border-slate-100 text-center">Mode</th>
                      <th className="px-6 py-3 border-r border-slate-100">Valid From</th>
                      <th className="px-6 py-3 border-r border-slate-100">Valid To</th>
                      <th className="px-6 py-3 border-r border-slate-100">Uploaded At</th>
                      <th className="px-6 py-3 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSheets.map((sheet, idx) => {
                      const isSelected = selectedSheet && 
                        selectedSheet.courier === sheet.courier && 
                        selectedSheet.type === sheet.type && 
                        selectedSheet.effective_from === sheet.effective_from && 
                        selectedSheet.effective_to === sheet.effective_to;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => setSelectedSheet(sheet)}
                          className={`group border-b border-slate-100 hover:bg-blue-50/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/80 font-black' : ''
                          }`}
                        >
                          <td className="px-6 py-3.5 font-bold text-slate-400 border-r border-slate-100 text-center">{idx + 1}</td>
                          <td className="px-6 py-3.5 font-black text-slate-700 uppercase border-r border-slate-100">{sheet.courier}</td>
                          <td className="px-6 py-3.5 border-r border-slate-100 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              sheet.type === 'EXPORT' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                              {sheet.type}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-600 border-r border-slate-100 tabular-nums">{sheet.effective_from}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-500 border-r border-slate-100 tabular-nums">
                            {sheet.effective_to === '9999-12-31' ? (
                              <span className="text-emerald-600 font-bold uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded">Ongoing</span>
                            ) : sheet.effective_to}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-400 border-r border-slate-100 tabular-nums">{sheet.uploaded_at}</td>
                          <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={(e) => handleDelete(e, sheet)}
                              className="text-slate-300 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                              title="Delete Zone Sheet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mappings Details Section */}
          {selectedSheet && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 bg-[#1a2f4c]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#1a2f4c]" />
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Mappings: {selectedSheet.courier} ({selectedSheet.type})
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      Period: {selectedSheet.effective_from} to {selectedSheet.effective_to === '9999-12-31' ? 'Ongoing' : selectedSheet.effective_to}
                    </p>
                  </div>
                </div>

                {/* Mapping search filter */}
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="FILTER COUNTRY / CODE / ZONE"
                    value={searchMapping}
                    onChange={(e) => setSearchMapping(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-[10px] font-bold text-slate-600 outline-none focus:border-blue-500 w-52 shadow-sm placeholder:text-slate-300"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {isLoadingMappings ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mb-3 text-[#1a2f4c]" />
                  <p className="text-[10px] font-bold uppercase">Loading details...</p>
                </div>
              ) : mappings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Info className="h-6 w-6 mb-2 text-slate-300" />
                  <p className="text-[10px] font-bold uppercase">No records found matching filters</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                      <tr className="text-slate-800 uppercase font-black tracking-tight">
                        <th className="px-6 py-2.5 w-16 text-center">Sr.</th>
                        <th className="px-6 py-2.5">Country Name</th>
                        <th className="px-6 py-2.5 text-center">Country Code</th>
                        <th className="px-6 py-2.5 text-center">Assigned Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((m, idx) => (
                        <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-sans">
                          <td className="px-6 py-2 font-bold text-slate-400 text-center">{idx + 1}</td>
                          <td className="px-6 py-2 font-black text-slate-700 uppercase">{m.country}</td>
                          <td className="px-6 py-2 font-bold text-slate-500 text-center tabular-nums">{m.country_code}</td>
                          <td className="px-6 py-2 font-black text-blue-600 text-center">{m.zone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <Footer theme="brisk" />

    </div>
  );
}
