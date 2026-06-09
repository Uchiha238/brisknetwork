import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Printer, Eye, Trash2, Download, 
  Calendar, FileText, ArrowLeft, CheckSquare, Square, 
  Loader2, AlertCircle, CheckCircle2 
} from "lucide-react";

export function InvoiceManager({ mode: initialMode, type, setCurrentPage }) {
  const [mode, setMode] = useState(initialMode); // 'list' or 'generate'
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Search state for list mode
  const [searchTerm, setSearchTerm] = useState('');

  // Generation state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [unbilledShipments, setUnbilledShipments] = useState([]);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState({});
  const [fetchingUnbilled, setFetchingUnbilled] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  
  // Status notifications
  const [notification, setNotification] = useState(null);

  // Fetch list of invoices
  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      // Filter invoices by type (Export, Import, Domestic)
      const filtered = data.filter(inv => {
        if (type === 'Export') return inv.invoice_type === 'Export';
        if (type === 'Import') return inv.invoice_type === 'Import';
        return inv.invoice_type === 'Domestic' || !['Export', 'Import'].includes(inv.invoice_type);
      });
      setInvoices(filtered);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      showNotification('error', 'Failed to load invoices');
    }
  };

  // Fetch list of customers
  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  useEffect(() => {
    setMode(initialMode);
    setUnbilledShipments([]);
    setSelectedCustomerId('');
    setFromDate('');
    setToDate('');
  }, [initialMode, type]);

  useEffect(() => {
    fetchCustomers();
    if (mode === 'list') {
      fetchInvoices();
    }
  }, [mode, type]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Delete invoice
  const handleDeleteInvoice = async (id, invNumber) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invNumber}? This will release all billed shipments back to unbilled status.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showNotification('success', `Invoice ${invNumber} deleted successfully.`);
        fetchInvoices();
      } else {
        showNotification('error', result.error || 'Failed to delete invoice');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', 'Failed to delete invoice');
    }
  };

  // Fetch unbilled shipments
  const handleFetchUnbilled = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !fromDate || !toDate) {
      showNotification('error', 'Please select a customer and date range.');
      return;
    }
    setFetchingUnbilled(true);
    setUnbilledShipments([]);
    try {
      const res = await fetch(
        `/api/invoices/unbilled-shipments?customer_id=${selectedCustomerId}&from_date=${fromDate}&to_date=${toDate}&invoice_type=${type}`
      );
      if (!res.ok) throw new Error('Failed to fetch unbilled shipments');
      const data = await res.json();
      setUnbilledShipments(data);
      
      // Select all by default
      const initialSelected = {};
      data.forEach(s => {
        initialSelected[s.id] = true;
      });
      setSelectedShipmentIds(initialSelected);

      if (data.length === 0) {
        showNotification('info', 'No unbilled shipments found for this customer and range.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load unbilled shipments.');
    } finally {
      setFetchingUnbilled(false);
    }
  };

  // Generate Invoice
  const handleGenerateInvoice = async () => {
    const selectedCount = Object.values(selectedShipmentIds).filter(Boolean).length;
    if (selectedCount === 0) {
      showNotification('error', 'Please select at least one shipment to bill.');
      return;
    }
    setGeneratingInvoice(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          from_date: fromDate,
          to_date: toDate,
          invoice_type: type,
          invoice_date: invoiceDate
        })
      });
      const result = await res.json();
      if (result.success) {
        showNotification('success', `Invoice ${result.invoice_number} generated successfully!`);
        // Open print view in new tab
        window.open(`/?print-invoice=${result.id}`, '_blank');
        // Redirect to list page
        setMode('list');
        setCurrentPage(type === 'Export' ? 'export-final-invoice' : type === 'Import' ? 'import-final-invoice' : 'list-shipments');
      } else {
        showNotification('error', result.error || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Helper calculations for UI preview
  const getSelectedShipments = () => {
    return unbilledShipments.filter(s => selectedShipmentIds[s.id]);
  };

  const calculatePreviewTotals = () => {
    const selected = getSelectedShipments();
    const customer = customers.find(c => c.id === parseInt(selectedCustomerId, 10));
    
    let subTotal = 0;
    selected.forEach(s => {
      const awbSub = (s.freight_charges || 0) + (s.ess_ch || 0) + (s.fuel_amount || 0) + (s.pickup_ch || 0) + 
                     (s.transport_ch || 0) + (s.clearance_ch || 0) + (s.oda_ch || 0) + (s.other_ch || 0) + (s.ddp_ch || 0);
      subTotal += awbSub;
    });

    const isGstApplicable = customer ? (customer.gst_charges === undefined || customer.gst_charges === 'Yes' || customer.gst_charges === 1 || customer.gst_charges === true) : true;
    let cgst = 0, sgst = 0, igst = 0;

    if (isGstApplicable && customer) {
      const custState = (customer.state || '').trim().toUpperCase();
      const isSameState = custState === 'MAHARASHTRA' || custState.includes('MAHARASHTRA') || custState === '';
      if (isSameState) {
        cgst = parseFloat((subTotal * 0.09).toFixed(2));
        sgst = parseFloat((subTotal * 0.09).toFixed(2));
      } else {
        igst = parseFloat((subTotal * 0.18).toFixed(2));
      }
    }

    const grandTotal = Math.round(subTotal + cgst + sgst + igst);
    return { subTotal, cgst, sgst, igst, grandTotal };
  };

  // Excel Table export
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sr No,Invoice Number,Invoice Date,Name,City,GSTNo,CID,Type,Total\n";
    
    invoices.forEach((inv, idx) => {
      const nameClean = (inv.customer_name || '').replace(/,/g, ' ');
      const cityClean = (inv.customer_city || '').replace(/,/g, ' ');
      csvContent += `${idx + 1},${inv.invoice_number},${inv.invoice_date},${nameClean},${cityClean},${inv.customer_gst || ''},${inv.customer_code || ''},${inv.invoice_type},${inv.grand_total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleShipment = (id) => {
    setSelectedShipmentIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllShipments = (e) => {
    const checked = e.target.checked;
    const nextSelected = {};
    unbilledShipments.forEach(s => {
      nextSelected[s.id] = checked;
    });
    setSelectedShipmentIds(nextSelected);
  };

  // Filtering invoices on frontend
  const filteredInvoices = invoices.filter(inv => {
    const query = searchTerm.toLowerCase();
    return (
      (inv.invoice_number || '').toLowerCase().includes(query) ||
      (inv.customer_name || '').toLowerCase().includes(query) ||
      (inv.customer_code || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-white min-h-[calc(100vh-70px)] font-sans">
      
      {/* Notifications Alert Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
          {notification.message}
        </div>
      )}

      {/* Mode 1: List Invoices */}
      {mode === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">View {type} Invoice List</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shipment Billing / Final Invoices</p>
            </div>
            <Button 
              onClick={() => setMode('generate')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 rounded shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[3px]" />
              Generate {type} Invoice
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 py-2 border-y border-slate-100">
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportToExcel}
                variant="outline" 
                className="border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider h-9 flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Excel
              </Button>
              <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>
              <p className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total generated invoices: {filteredInvoices.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by invoice number, name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 w-16 text-[10px] font-black uppercase tracking-wider text-slate-800">Sr No</th>
                    <th className="p-4 w-48 text-[10px] font-black uppercase tracking-wider text-slate-800">Invoice Number</th>
                    <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">Invoice Date</th>
                    <th className="p-4 w-64 text-[10px] font-black uppercase tracking-wider text-slate-800">Name</th>
                    <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800">City</th>
                    <th className="p-4 w-40 text-[10px] font-black uppercase tracking-wider text-slate-800">GSTNo</th>
                    <th className="p-4 w-24 text-[10px] font-black uppercase tracking-wider text-slate-800">CID</th>
                    <th className="p-4 w-24 text-[10px] font-black uppercase tracking-wider text-slate-800 text-center">Type</th>
                    <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800 text-right">Total</th>
                    <th className="p-4 w-32 text-[10px] font-black uppercase tracking-wider text-slate-800 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-l border-l border-slate-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No invoices generated yet
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv, idx) => (
                      <tr key={inv.id} className={`group border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                        <td className="p-4 text-[11px] font-bold text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-4 text-[11px] font-black text-blue-700 font-mono tracking-tighter uppercase">{inv.invoice_number}</td>
                        <td className="p-4 text-[11px] font-semibold text-slate-600 font-mono">{inv.invoice_date}</td>
                        <td className="p-4">
                          <div className="text-[11px] font-black text-slate-800 leading-tight uppercase font-sans">
                            {inv.customer_name}
                          </div>
                        </td>
                        <td className="p-4 text-[11px] font-black text-slate-700 uppercase">{inv.customer_city || 'N/A'}</td>
                        <td className="p-4 text-[11px] font-black text-slate-800 font-mono tracking-tighter uppercase">{inv.customer_gst || 'N/A'}</td>
                        <td className="p-4 text-[11px] font-black text-blue-800 font-mono tracking-tight">{inv.customer_code || 'N/A'}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800`}>
                            {inv.invoice_type}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] font-black text-slate-800 text-right font-mono pr-6">
                          {parseFloat(inv.grand_total || 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-center sticky right-0 bg-white/90 group-hover:bg-blue-50/90 backdrop-blur-sm border-l border-slate-100 group-hover:border-blue-100 transition-all">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              onClick={() => window.open(`/?print-invoice=${inv.id}`, '_blank')}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="Print Layout"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => window.open(`/?print-invoice=${inv.id}`, '_blank')}
                              className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                              title="View Layout"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
                              className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="Delete Invoice"
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
        </>
      )}

      {/* Mode 2: Generate Invoice */}
      {mode === 'generate' && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMode('list')}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 stroke-[3px]" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Generate {type} Invoice</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shipment Billing / Create New Bill</p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <form onSubmit={handleFetchUnbilled} className="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Select Customer</label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setUnbilledShipments([]);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-black uppercase text-slate-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">From Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setUnbilledShipments([]);
                    }}
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-2.5 py-1.5 text-xs font-black text-slate-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                    required
                  />
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">To Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setUnbilledShipments([]);
                    }}
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-2.5 py-1.5 text-xs font-black text-slate-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                    required
                  />
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={fetchingUnbilled}
                className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {fetchingUnbilled ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Fetching...
                  </>
                ) : 'Fetch Shipments'}
              </Button>
            </form>
          </div>

          {/* Unbilled shipments table and invoice summary */}
          {unbilledShipments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 animate-in fade-in duration-300">
              
              {/* Table of Shipments (Col-span 8) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Unbilled Shipments ({unbilledShipments.length})</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="select-all-shipments"
                      checked={getSelectedShipments().length === unbilledShipments.length}
                      onChange={handleSelectAllShipments}
                      className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="select-all-shipments" className="text-[10px] font-black uppercase text-slate-600 cursor-pointer">Select All</label>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/40 border-b border-slate-200 text-slate-700 text-[10px] font-black uppercase">
                        <th className="p-3 w-10 text-center">Select</th>
                        <th className="p-3 w-28">Booking Date</th>
                        <th className="p-3 w-36">Airway No</th>
                        <th className="p-3 w-28">Destination</th>
                        <th className="p-3 w-24">Network</th>
                        <th className="p-3 w-16 text-center">Wt (Kg)</th>
                        <th className="p-3 text-right">Billed Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unbilledShipments.map(s => {
                        const awbSub = (s.freight_charges || 0) + (s.ess_ch || 0) + (s.fuel_amount || 0) + (s.pickup_ch || 0) + 
                                       (s.transport_ch || 0) + (s.clearance_ch || 0) + (s.oda_ch || 0) + (s.other_ch || 0) + (s.ddp_ch || 0);

                        return (
                          <tr key={s.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${selectedShipmentIds[s.id] ? 'bg-blue-50/20' : ''}`}>
                            <td className="p-3 text-center">
                              <input 
                                type="checkbox" 
                                checked={!!selectedShipmentIds[s.id]}
                                onChange={() => handleToggleShipment(s.id)}
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="p-3 text-[11px] font-semibold text-slate-600 font-mono">{s.booking_date}</td>
                            <td className="p-3 text-[11px] font-black text-slate-800 font-mono tracking-tighter uppercase">{s.airway_no}</td>
                            <td className="p-3 text-[11px] font-black text-slate-700 uppercase">{s.destination || 'N/A'}</td>
                            <td className="p-3 text-[11px] font-black text-slate-700 uppercase">{s.forwarder || 'N/A'}</td>
                            <td className="p-3 text-[11px] font-black text-slate-600 text-center font-mono">{parseFloat(s.chargeable_weight || 0).toFixed(2)}</td>
                            <td className="p-3 text-[11px] font-black text-slate-800 text-right font-mono">
                              {parseFloat(awbSub).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Generation Preview Panel (Col-span 4) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">Invoice Details & Preview</h3>
                
                {/* Invoice Date Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Invoice Billing Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-2.5 py-1.5 text-xs font-black text-slate-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                      required
                    />
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                {(() => {
                  const { subTotal, cgst, sgst, igst, grandTotal } = calculatePreviewTotals();
                  const selectedCount = getSelectedShipments().length;

                  return (
                    <>
                      <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 space-y-2.5 text-xs font-semibold text-slate-600">
                        <div className="flex justify-between">
                          <span>Selected Shipments:</span>
                          <span className="font-black text-slate-900">{selectedCount} / {unbilledShipments.length}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="flex justify-between">
                          <span>Sub Total:</span>
                          <span className="font-black text-slate-950 font-mono">{parseFloat(subTotal).toFixed(2)}</span>
                        </div>
                        {cgst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>CGST (9%):</span>
                            <span className="font-bold font-mono">{parseFloat(cgst).toFixed(2)}</span>
                          </div>
                        )}
                        {sgst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>SGST (9%):</span>
                            <span className="font-bold font-mono">{parseFloat(sgst).toFixed(2)}</span>
                          </div>
                        )}
                        {igst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>IGST (18%):</span>
                            <span className="font-bold font-mono">{parseFloat(igst).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="flex justify-between text-slate-900 font-black text-sm">
                          <span>Grand Total:</span>
                          <span className="text-blue-700 font-mono">₹{parseFloat(grandTotal).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleGenerateInvoice}
                        disabled={generatingInvoice || selectedCount === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-lg shadow-lg cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {generatingInvoice ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating Bill...
                          </>
                        ) : 'Create & Print Bill'}
                      </Button>
                    </>
                  );
                })()}

              </div>
            </div>
          )}
        </>
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
