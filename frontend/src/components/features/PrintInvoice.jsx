import React, { useState, useEffect } from 'react';
import defaultLogo from "@/assets/logo.png";

// Helper to convert numbers to Indian Rupee word format
function numberToWords(num) {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'hundred ' + (n % 100 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'thousand ' + (n % 1000 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'lakh ' + (n % 100000 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'crore ' + (n % 10000000 ? inWords(n % 10000000) : '');
  }

  const roundedNum = Math.round(num);
  if (roundedNum === 0) return 'zero Rupees Only';
  const words = inWords(roundedNum) + 'Rupees Only';
  return words.replace(/\s+/g, ' ').trim();
}

// Format date from YYYY-MM-DD to DD-MM-YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

// Format date short from YYYY-MM-DD to DD-MM-YY
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const yrShort = parts[0].substring(2);
    return `${parts[2]}-${parts[1]}-${yrShort}`;
  }
  return dateStr;
}

export function PrintInvoice({ invoiceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`/api/invoices/${invoiceId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch invoice details');
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setData(res);
          setError(null);
          // Trigger print dialog after DOM settles
          setTimeout(() => {
            window.print();
          }, 800);
        } else {
          throw new Error(res.error || 'Failed to load data');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans bg-slate-50">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generating Print Preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans bg-slate-50 text-red-600 p-4">
        <div className="bg-white border border-red-200 rounded-lg p-6 shadow-md max-w-md text-center">
          <p className="font-black text-sm uppercase tracking-wider mb-2">Error Loading Invoice</p>
          <p className="text-xs font-bold text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.close()} 
            className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { invoice, company, shipments } = data;
  const isMahState = (invoice.customer_state || '').trim().toUpperCase().includes('MAHARASHTRA');
  
  // Calculate state code from GST number
  const customerGst = invoice.customer_gst || '';
  const stateCode = customerGst ? customerGst.substring(0, 2) : (isMahState ? '27' : '');

  // Default company details matching the database / sample bill
  const compName = company?.company_name || 'OM COURIER SERVICES';
  const compAddress = company?.address || 'SHOP NO 1, OM DEEP SAI POOJA CHS, NEAR ALMEIDA SIGNAL, CHARAI NAKA, THANE(W)-400601';
  const compPhone = company?.contact_no || '9324120237';
  const compEmail = company?.email || 'csdomcourier@gmail.com';
  const compWebsite = company?.website || 'www.omcourier.net';
  const compGst = company?.gst_no || '27ADAPN6620J1ZJ';
  const compPan = company?.pan || 'ADAPN6620J';

  return (
    <div className="print-page-wrapper bg-slate-100 min-h-screen py-8 print:py-0 print:bg-white font-sans text-black">
      
      {/* Control panel for screen only */}
      <div className="no-print max-w-[842px] mx-auto mb-4 bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">Invoice Print Preview</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Press CTRL+P or click print if the dialog did not open automatically</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded shadow transition-all active:scale-95"
          >
            Print Invoice
          </button>
          <button 
            onClick={() => window.close()} 
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded transition-all active:scale-95"
          >
            Close Tab
          </button>
        </div>
      </div>

      {/* Invoice Sheet Area (standard A4 width at 96 DPI: 794px) */}
      <div className="invoice-container bg-white w-full max-w-[800px] mx-auto print:max-w-none shadow-lg print:shadow-none border border-black p-0 box-sizing-border-content select-none leading-normal">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white;
              color: black;
              margin: 8mm;
            }
            .no-print {
              display: none !important;
            }
            .invoice-container {
              border: 1px solid black !important;
              box-shadow: none !important;
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
            }
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          .custom-double-border {
            border-top: 3px double black;
            border-bottom: 3px double black;
          }
          th, td {
            font-size: 10px;
            line-height: 1.15;
          }
        `}} />

        {/* 1. Header block */}
        <div className="flex items-stretch border-b border-black">
          {/* Company details */}
          <div className="flex-1 p-3 space-y-1">
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">{compName}</h1>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-tight max-w-[450px] leading-tight">
              {compAddress}
            </p>
            <div className="text-[9px] font-bold text-slate-800 space-y-0.5 leading-none">
              <p><span className="font-black">Telephone:</span> {compPhone}</p>
              <p><span className="font-black">E-Mail:</span> {compEmail}</p>
              <p><span className="font-black">Web Site:</span> {compWebsite}</p>
            </div>
          </div>
          {/* Logo */}
          <div className="w-[180px] p-2 flex items-center justify-center border-l border-black bg-white">
            <img 
              src={company?.logo || defaultLogo} 
              alt="Logo" 
              className="max-h-[70px] max-w-full object-contain"
              onError={(e) => {
                e.target.src = defaultLogo;
              }}
            />
          </div>
        </div>

        {/* 2. TAX INVOICE Banner */}
        <div className="text-center py-1.5 custom-double-border bg-slate-50/50">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">TAX INVOICE</h2>
        </div>

        {/* 3. Billing Info (To and Invoice Details) */}
        <div className="grid grid-cols-12 border-b border-black">
          {/* Customer Address Details (Left) */}
          <div className="col-span-7 p-3 border-r border-black flex flex-col justify-start">
            <span className="text-[10px] font-black text-black">To,</span>
            <div className="mt-1 space-y-1 text-[10px]">
              <p className="font-black uppercase tracking-tight text-slate-900 leading-tight">
                {invoice.customer_name}
              </p>
              <p className="font-bold text-slate-800 uppercase leading-tight max-w-[380px]">
                {invoice.customer_address ? `${invoice.customer_address}, ` : ''}
                {invoice.customer_city ? `${invoice.customer_city} ` : ''}
                {invoice.customer_pincode ? `- ${invoice.customer_pincode}` : ''}
              </p>
              <div className="pt-2 text-[9px] font-bold text-slate-800 space-y-0.5">
                <p><span className="font-black uppercase">Gst No :</span> <span className="font-black font-mono tracking-tighter uppercase">{customerGst || 'N/A'}</span></p>
                <p><span className="font-black uppercase">PLACE OF SUPPLY :</span> <span className="font-black uppercase">{invoice.customer_state || 'N/A'}</span></p>
                <p><span className="font-black uppercase">State Code :</span> <span className="font-black font-mono">{stateCode || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          {/* Invoice Info (Right) */}
          <div className="col-span-5 p-3 flex flex-col justify-start space-y-1 text-[10px]">
            <p className="flex justify-between"><span className="font-black uppercase">Invoice No:</span> <span className="font-black font-mono text-blue-800">{invoice.invoice_number}</span></p>
            <p className="flex justify-between"><span className="font-black uppercase">Invoice Date:</span> <span className="font-black font-mono">{formatDate(invoice.invoice_date)}</span></p>
            <p className="flex justify-between"><span className="font-black uppercase">Invoice Period:</span> <span className="font-black font-mono">{formatDateShort(invoice.from_date)} - {formatDateShort(invoice.to_date)}</span></p>
          </div>
        </div>

        {/* 4. Shipments Table */}
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-black text-slate-900 text-center font-black">
                <th className="p-1.5 border-r border-black w-[40px] text-center">SR NO</th>
                <th className="p-1.5 border-r border-black w-[80px]">DATE</th>
                <th className="p-1.5 border-r border-black w-[100px]">AWB NO</th>
                <th className="p-1.5 border-r border-black w-[95px]">DESTINATION</th>
                <th className="p-1.5 border-r border-black w-[90px]">NETWORK</th>
                <th className="p-1.5 border-r border-black w-[150px]">CONSIGNEE</th>
                <th className="p-1.5 border-r border-black w-[50px] text-center">PROD</th>
                <th className="p-1.5 border-r border-black w-[60px] text-center">WEIGHT</th>
                <th className="p-1.5 w-[115px] text-right pr-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, idx) => {
                // Determine layout charges
                const freight = s.freight_charges || 0;
                const ess = s.ess_ch || 0;
                const fuel = s.fuel_amount || 0;
                const oda = s.oda_ch || 0;
                const pickup = s.pickup_ch || 0;
                const trans = s.transport_ch || 0;
                const clear = s.clearance_ch || 0;
                const other = s.other_ch || 0;
                const ddp = s.ddp_ch || 0;

                // Collect charges to display inside Amount column
                const charges = [
                  { label: 'Freight', val: freight }
                ];
                if (ess > 0) charges.push({ label: 'ESS', val: ess });
                if (fuel > 0) charges.push({ label: 'Fuel', val: fuel });
                if (oda > 0) charges.push({ label: 'ODA', val: oda });
                if (pickup > 0) charges.push({ label: 'Pickup', val: pickup });
                if (trans > 0) charges.push({ label: 'Transport', val: trans });
                if (clear > 0) charges.push({ label: 'Clearance', val: clear });
                if (ddp > 0) charges.push({ label: 'DDP', val: ddp });
                if (other > 0) charges.push({ label: 'Other', val: other });

                // Construct full consignee details
                const consigneeParts = [];
                if (s.consignee_company) consigneeParts.push(s.consignee_company);
                if (s.consignee_name) consigneeParts.push(s.consignee_name);
                const consigneeText = consigneeParts.join(' / ') || 'N/A';

                return (
                  <tr key={s.id} className="border-b border-black align-top font-bold text-slate-800">
                    <td className="p-1.5 border-r border-black text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5 border-r border-black text-center font-mono">{formatDate(s.booking_date)}</td>
                    <td className="p-1.5 border-r border-black text-center font-mono tracking-tight font-black text-slate-900">{s.airway_no}</td>
                    <td className="p-1.5 border-r border-black uppercase text-xs leading-none">{s.destination || 'N/A'}</td>
                    <td className="p-1.5 border-r border-black uppercase text-xs leading-none">{s.forwarder || 'N/A'}</td>
                    <td className="p-1.5 border-r border-black uppercase text-[9px] leading-tight max-w-[150px] break-words">
                      {consigneeText}
                    </td>
                    <td className="p-1.5 border-r border-black text-center uppercase font-mono">{s.type_of_doc || s.product || 'ND'}</td>
                    <td className="p-1.5 border-r border-black text-center font-mono font-black">{parseFloat(s.chargeable_weight || 0).toFixed(2)}</td>
                    <td className="p-1 w-[115px] align-middle">
                      <table className="w-full text-[9px] font-mono leading-none">
                        <tbody>
                          {charges.map((c, cidx) => (
                            <tr key={cidx}>
                              <td className="text-left font-sans font-bold text-slate-500 py-0.5">{c.label}:</td>
                              <td className="text-right font-black text-slate-900 py-0.5 pr-1">{parseFloat(c.val).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Bottom breakdown block */}
        <div className="grid grid-cols-12 border-b border-black">
          {/* Tax Identification (Left) */}
          <div className="col-span-5 p-2.5 border-r border-black flex flex-col justify-between text-[10px] space-y-1">
            <div className="space-y-1">
              <p className="font-black text-slate-900 leading-none">UDYAM-MH-33-0076515</p>
              <p><span className="font-black">GST No :</span> <span className="font-black font-mono tracking-tighter uppercase">{compGst}</span></p>
              <p><span className="font-black">PAN No. :</span> <span className="font-black font-mono uppercase">{compPan}</span></p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[9px] text-slate-700 leading-tight">
              <p><span className="font-black">TAXABLE SERVICES :</span> COURIER AGENCY</p>
              <p><span className="font-black">SAC No. :</span> 996812</p>
            </div>
          </div>

          {/* Bank Details (Center) */}
          <div className="col-span-4 p-2.5 border-r border-black flex flex-col justify-start text-[9px] leading-tight space-y-0.5">
            <span className="text-[10px] font-black text-black mb-1 uppercase tracking-wide">BANK DETAILS:</span>
            <p className="font-black text-slate-900 uppercase leading-none">{company?.account_name || compName}</p>
            <p className="font-bold text-slate-700 uppercase">{company?.bank_name || 'BANK OF INDIA'}, {company?.branch_name || 'PANCHPAKHADI BRANCH'}</p>
            <p className="pt-1"><span className="font-black">A/C NO :</span> <span className="font-black font-mono text-[10px] tracking-tight">{company?.account_number || '006820110000416'}</span></p>
            <p><span className="font-black">IFSC :</span> <span className="font-black font-mono">{company?.ifsc || 'BKID0000068'}</span></p>
            <p><span className="font-black">MICR :</span> <span className="font-mono">400013076</span></p>
          </div>

          {/* Subtotal and GST calculations (Right) */}
          <div className="col-span-3 p-2 flex flex-col justify-between text-[10px] font-bold">
            <div className="space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="font-black">{parseFloat(invoice.sub_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST 9%</span>
                <span className="font-black">{parseFloat(invoice.cgst || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST 9%</span>
                <span className="font-black">{parseFloat(invoice.sgst || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IGST 18%</span>
                <span className="font-black">{parseFloat(invoice.igst || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-black font-mono">
              <div className="flex justify-between text-black font-black text-xs">
                <span>Total</span>
                <span className="text-blue-900">{parseFloat(invoice.grand_total).toFixed(2)}</span>
              </div>
              <p className="text-[8px] font-black uppercase text-right tracking-tight text-slate-400 mt-0.5 leading-none">(Rounded Off)</p>
            </div>
          </div>
        </div>

        {/* 6. Footer (Amount in words, terms, sign block) */}
        <div>
          {/* Amount in words */}
          <div className="p-2.5 border-b border-black text-[10px] font-bold bg-slate-50/20 leading-none">
            <span className="font-black text-slate-700 uppercase">Amount in Words:</span>{' '}
            <span className="font-black underline capitalize text-slate-900 text-[10.5px] tracking-tight">{numberToWords(invoice.grand_total)}</span>
          </div>

          {/* Declarations and Signature */}
          <div className="grid grid-cols-12 text-[8px] font-bold leading-normal text-slate-600">
            {/* Terms and Notes (Left) */}
            <div className="col-span-8 p-2.5 border-r border-black space-y-1 font-medium">
              <p>Payment Payees A/c Cheques in favor of <span className="font-black text-slate-900">OM COURIER SERVICES Only</span></p>
              <p>Bill may please be settles immediately. Interest @24% p.a. will be charged if this bill is not paid within 10 days.</p>
              <p>Queries/Disputes relating to this must be brought to our notice in writing immediately.</p>
              <p className="font-black text-slate-800">SUBJECT TO THANE JURISDICTION</p>
              <p>Rs.750/- will be charged extra for Dishonored Cheque</p>
            </div>

            {/* Authorised Signatory (Right) */}
            <div className="col-span-4 flex flex-col justify-between p-2.5 text-center min-h-[90px]">
              <span className="font-black text-[9px] text-slate-800 leading-none">For Om Courier Services</span>
              <div className="h-8"></div> {/* signature spacing */}
              <div className="border-t border-slate-200 pt-1">
                <span className="font-black text-[9px] text-slate-800 uppercase tracking-widest leading-none">Authorized Sign</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
