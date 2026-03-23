import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Save, Plus, Search, MapPin, User, Package, Clock, ShieldCheck, FileText, RotateCcw, Trash2 } from "lucide-react"

export function AddShipmentForm() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [formData, setFormData] = useState({
    airway_no: '',
    edit_awb: false,
    email: '',
    contact_no: '',
    account_code: '',
    origin_hub: 'MUMBAI',
    origin_zone: '',
    destination: '',
    dest_zone: '',
    product: '',
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    usps_number: '',
    service: '',
    duty: '',
    ref_no: '',
    shipment_value: '',
    currency: 'INR',
    invoice_date: '',
    invoice_no: '',

    // Shipper
    shipper_code: '',
    shipper_company: '',
    shipper_name: '',
    shipper_address1: '',
    shipper_address2: '',
    shipper_address3: '',
    shipper_zip: '',
    shipper_city: '',
    shipper_state: '',
    shipper_country: 'INDIA',
    shipper_phone: '+91',
    shipper_email: '',
    shipper_kyc_type: '',
    shipper_kyc_no: '',

    // Consignee
    consignee_code: '',
    consignee_company: '',
    consignee_name: '',
    consignee_address1: '',
    consignee_address2: '',
    consignee_address3: '',
    consignee_zip: '',
    consignee_city: '',
    consignee_state: '',
    consignee_country: '',
    consignee_phone: '',
    consignee_email: '',

    // Weights & Dimensions
    pcs: 1,
    actual_weight: 0,
    volumetric_weight: 0,
    chargeable_weight: 0,
    packages: [{ box_no: '1', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 }],

    // Billing
    bill_amount: 0,
    fuel_amount: 0,
    gst_amount: 0,
    freight_ch: 0,
    total_charges: 0,

    // Invoice
    create_invoice: false,
    invoice_type: 'INVOICE',
    note: 'GIFT',
    items: [{ box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, igst: 0, unit_rate: 0, amount: 0 }]
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        if (data.length > 0) {
            setSelectedCustomerId(data[0].id);
            setFormData(prev => ({
                ...prev,
                contact_no: data[0].phone || '',
                shipper_company: data[0].name || '',
                shipper_name: data[0].name || '',
                shipper_email: data[0].email || '',
                shipper_city: data[0].city || ''
            }));
        }
      })
      .catch(err => console.error('Fetch customers error:', err));
  }, []);

  useEffect(() => {
    const totalActualWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.actual_wt) || 0), 0);
    const totalVolWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.vol_wt) || 0), 0);
    const totalChargeableWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.chargeable_wt) || 0), 0);
    const totalAmount = (parseFloat(formData.bill_amount) || 0) + (parseFloat(formData.fuel_amount) || 0) + (parseFloat(formData.gst_amount) || 0);

    setFormData(prev => ({
        ...prev,
        actual_weight: totalActualWt,
        volumetric_weight: totalVolWt,
        chargeable_weight: totalChargeableWt,
        total_charges: totalAmount,
        pcs: formData.packages.length
    }));
  }, [formData.packages, formData.bill_amount, formData.fuel_amount, formData.gst_amount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value.toUpperCase())
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
        const newArray = [...prev[arrayName]];
        newArray[index] = { ...newArray[index], [field]: value };
        
        // Auto-calculate vol_wt for packages
        if (arrayName === 'packages' && (field === 'length' || field === 'breadth' || field === 'height')) {
            const l = parseFloat(newArray[index].length) || 0;
            const b = parseFloat(newArray[index].breadth) || 0;
            const h = parseFloat(newArray[index].height) || 0;
            newArray[index].vol_wt = (l * b * h) / 5000;
            newArray[index].chargeable_wt = Math.max(newArray[index].actual_wt, newArray[index].vol_wt);
        }

        // Auto-calculate item amount
        if (arrayName === 'items' && (field === 'quantity' || field === 'unit_rate')) {
            const q = parseFloat(newArray[index].quantity) || 0;
            const r = parseFloat(newArray[index].unit_rate) || 0;
            newArray[index].amount = q * r;
        }

        return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], { ...defaultItem, box_no: (prev[arrayName].length + 1).toString(), sr_no: prev[arrayName].length + 1 }]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, customer_id: selectedCustomerId, user_id: 1, type: 'domestic' };
    
    try {
      const res = await fetch('http://localhost:5000/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('AWB Created Successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#1a2f4c] text-white text-[12px] font-bold tracking-wider rounded-t-md">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span className="uppercase">{title}</span>
    </div>
  );

  const FormField = ({ label, name, type = "text", value, placeholder, required = false, icon, children, className = "" }) => (
    <div className={`grid grid-cols-[120px_1fr] items-center gap-2 group ${className}`}>
      <label className={`text-[10px] font-bold ${required ? "text-red-600" : "text-slate-500"} uppercase group-hover:text-slate-900 transition-colors`}>
        {label}
      </label>
      <div className="relative">
        {children ? children : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
        )}
      </div>
    </div>
  );

  const TableHeader = ({ cols }) => (
    <div className="grid border-b border-slate-200 bg-slate-50 py-2 px-4" style={{ gridTemplateColumns: cols.join(' ') }}>
        {cols.map((_, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                {cols[i].label}
            </span>
        ))}
    </div>
  );

  return (
    <div className="bg-[#f0f2f5] min-h-screen p-4 scroll-smooth">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3 mb-6 shadow-sm rounded-lg sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold text-[#1a2f4c] tracking-tight">ADD AWB</h1>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSubmit} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[11px] font-bold px-6 h-9 rounded shadow-md uppercase tracking-wider">
                CREATE AWB AND PRINT LABEL
            </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: AWB Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <SectionHeader title="AIR WAYBILL INFORMATION" icon={FileText} />
              <div className="p-4 space-y-3">
                <FormField label="AWB NUMBER" name="airway_no" value={formData.airway_no}>
                  <div className="flex gap-2 items-center">
                      <input name="airway_no" value={formData.airway_no} onChange={handleChange} className="flex-1 h-8 px-2 bg-slate-100 border border-slate-300 rounded text-[11px] font-bold" />
                      <div className="flex items-center gap-1">
                          <input type="checkbox" name="edit_awb" checked={formData.edit_awb} onChange={handleChange} className="h-3 w-3" />
                          <span className="text-[9px] font-bold text-slate-500">EDIT</span>
                      </div>
                  </div>
                </FormField>

                <FormField label="CUSTOMER" required>
                  <select 
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-[11px] font-semibold"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                      {customers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </FormField>

                <FormField label="EMAIL" name="email" value={formData.email} />
                <FormField label="CONTACT NO" name="contact_no" value={formData.contact_no} />
                <FormField label="ACCOUNT CODE" name="account_code" value={formData.account_code} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="ORIGIN HUB" name="origin_hub" value={formData.origin_hub} />
                  <div className="flex items-center gap-1 group">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">ZONE</span>
                      <input name="origin_zone" value={formData.origin_zone} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="DESTINATION" name="destination" value={formData.destination} />
                  <div className="flex items-center gap-1 group">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">ZONE</span>
                      <input name="dest_zone" value={formData.dest_zone} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold" />
                  </div>
                </div>

                <FormField label="PRODUCT">
                  <select name="product" value={formData.product} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold">
                      <option value="">SELECT...</option>
                      <option value="DOCUMENTS">DOCUMENTS</option>
                      <option value="PARCEL">PARCEL</option>
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-2">
                   <FormField label="BOOKING DATE" name="booking_date" type="date" value={formData.booking_date} />
                   <div className="flex items-center gap-2 pl-2 group">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">TIME</span>
                      <input name="booking_time" type="time" value={formData.booking_time} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold" />
                   </div>
                </div>

                <FormField label="USPS NUMBER" name="usps_number" value={formData.usps_number} />
                <FormField label="SERVICE">
                  <select name="service" value={formData.service} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold">
                      <option value="">SELECT...</option>
                      <option value="EXPRESS">EXPRESS</option>
                      <option value="ECONOMY">ECONOMY</option>
                  </select>
                </FormField>
                <FormField label="DUTY">
                  <select name="duty" value={formData.duty} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold">
                      <option value="">SELECT...</option>
                      <option value="SENDER">SENDER</option>
                      <option value="RECEIVER">RECEIVER</option>
                  </select>
                </FormField>
                
                <FormField label="REF NO" name="ref_no" value={formData.ref_no} />
                
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="SHIPMENT VALUE" name="shipment_value" type="number" value={formData.shipment_value} />
                  <select className="h-8 px-2 border border-slate-300 rounded text-[11px] font-bold" value={formData.currency} onChange={handleChange} name="currency">
                      <option>INR</option>
                      <option>USD</option>
                  </select>
                </div>

                <FormField label="INVOICE NO" name="invoice_no" value={formData.invoice_no} />
              </div>
            </div>
          </div>

          {/* Column 2: Shipper Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <SectionHeader title="SHIPPER / CONSIGNOR / FROM" icon={User} />
              <div className="p-4 space-y-3">
                <FormField label="SEARCH ADDR" placeholder="SEARCH ADDRESS BOOK...">
                  <button className="absolute right-1 top-1 text-slate-400 hover:text-blue-500">
                      <RotateCcw className="h-3 w-3" />
                  </button>
                </FormField>
                
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <FormField label="CODE" name="shipper_code" value={formData.shipper_code} />
                  <div className="flex items-center gap-1">
                      <input type="checkbox" className="h-3 w-3" />
                      <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap uppercase">UPDATE ADDR BOOK?</span>
                  </div>
                </div>

                <FormField label="COMPANY" name="shipper_company" value={formData.shipper_company} />
                <FormField label="PERSON NAME" name="shipper_name" value={formData.shipper_name} />
                <FormField label="ADDRESS 1" name="shipper_address1" value={formData.shipper_address1} />
                <FormField label="ADDRESS 2" name="shipper_address2" value={formData.shipper_address2} />
                <FormField label="ADDRESS 3" name="shipper_address3" value={formData.shipper_address3} />
                
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                   <FormField label="POST/ZIP CODE" name="shipper_zip" value={formData.shipper_zip} />
                   <Button className="h-8 px-3 bg-[#eab308] hover:bg-[#ca8a04] text-white text-[10px] font-black uppercase tracking-wider">SEARCH</Button>
                </div>

                <FormField label="CITY" name="shipper_city" value={formData.shipper_city} />
                <FormField label="STATE/COUNTY" name="shipper_state" value={formData.shipper_state} />
                
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <FormField label="COUNTRY" name="shipper_country" value={formData.shipper_country} />
                  <span className="text-[11px] font-bold text-slate-400">INDIA</span>
                </div>

                <FormField label="PHONE NUMBER" name="shipper_phone" value={formData.shipper_phone} />
                <FormField label="EMAIL ADDRESS" name="shipper_email" value={formData.shipper_email} />
                
                <FormField label="KYC TYPE">
                  <select name="shipper_kyc_type" value={formData.shipper_kyc_type} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold">
                      <option value="">SELECT...</option>
                      <option value="GST NO">GST NO</option>
                      <option value="PAN CARD">PAN CARD</option>
                      <option value="ADHAAR CARD">ADHAAR CARD</option>
                  </select>
                </FormField>
                
                <FormField label="KYC NUMBER" name="shipper_kyc_no" value={formData.shipper_kyc_no} />
                
                <div className="grid grid-cols-2 gap-2">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">UPLOAD KYC</span>
                      <input type="file" className="text-[9px] cursor-pointer" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SHIPPER IMAGE</span>
                      <input type="file" className="text-[9px] cursor-pointer" />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Consignee Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <SectionHeader title="CONSIGNEE / RECEIVER / TO" icon={User} />
              <div className="p-4 space-y-3">
                <FormField label="SEARCH ADDR" placeholder="SEARCH ADDRESS BOOK..." />
                
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <FormField label="CODE" name="consignee_code" value={formData.consignee_code} />
                  <div className="flex items-center gap-1">
                      <input type="checkbox" className="h-3 w-3" />
                      <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap uppercase">UPDATE ADDR BOOK?</span>
                  </div>
                </div>

                <FormField label="COMPANY" name="consignee_company" value={formData.consignee_company} />
                <FormField label="PERSON NAME" name="consignee_name" value={formData.consignee_name} />
                <FormField label="ADDRESS 1" name="consignee_address1" value={formData.consignee_address1} />
                <FormField label="APT # / FLOOR" name="consignee_address2" value={formData.consignee_address2} />
                <FormField label="ADDRESS 3" name="consignee_address3" value={formData.consignee_address3} />
                
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                   <FormField label="POST/ZIP CODE" name="consignee_zip" value={formData.consignee_zip} />
                   <Button className="h-8 px-3 bg-[#eab308] hover:bg-[#ca8a04] text-white text-[10px] font-black uppercase tracking-wider">SEARCH</Button>
                </div>

                <FormField label="CITY" name="consignee_city" value={formData.consignee_city} />
                <FormField label="STATE/COUNTY" name="consignee_state" value={formData.consignee_state} />
                <FormField label="COUNTRY" name="consignee_country" value={formData.consignee_country} />
                <FormField label="PHONE NUMBER" name="consignee_phone" value={formData.consignee_phone} />
                <FormField label="EMAIL ADDRESS" name="consignee_email" value={formData.consignee_email} />
              </div>
            </div>
          </div>
        </div>

        {/* Weights AND Dimensions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-[#1a2f4c] text-white flex justify-between items-center">
                <h4 className="text-[12px] font-bold uppercase tracking-wider">WEIGHTS AND DIMENSIONS</h4>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold opacity-70">PCS</span>
                        <input type="number" name="pcs" value={formData.pcs} onChange={handleChange} className="w-12 h-6 bg-white/20 border-none rounded text-xs px-1 text-center font-bold outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold opacity-70">ACTUAL WEIGHT</span>
                        <input type="number" name="actual_weight" value={formData.actual_weight} readOnly className="w-16 h-6 bg-white/10 border-none rounded text-xs px-1 text-center font-bold outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold opacity-70">VOLUMETRIC WEIGHT</span>
                        <span className="text-sm font-black text-yellow-400">{formData.volumetric_weight.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold opacity-70">CHARGEABLE WEIGHT</span>
                        <span className="text-sm font-black text-green-400">{formData.chargeable_weight.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">PARCEL NO.</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">BOX NO.</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-red-500 uppercase underline">ACTUAL WT.(KG.)</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">L(CM)</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">B(CM)</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">H(CM)</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">VOLUMETRIC WT.(KG.)</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">CHARGEABLE WT.(KG.)</th>
                            <th className="px-4 py-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.packages.map((pkg, idx) => (
                            <tr key={idx} className="border-b border-slate-100 group transition-colors hover:bg-slate-50/50">
                                <td className="px-4 py-2 text-[11px] font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-2">
                                    <input value={pkg.box_no} onChange={e => handleArrayChange('packages', idx, 'box_no', e.target.value)} className="w-full h-8 text-[11px] font-bold text-slate-600 bg-transparent border-0 outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={pkg.actual_wt} onChange={e => handleArrayChange('packages', idx, 'actual_wt', parseFloat(e.target.value))} className="w-32 h-8 px-2 text-[11px] font-bold border border-slate-200 rounded outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={pkg.length} onChange={e => handleArrayChange('packages', idx, 'length', parseFloat(e.target.value))} className="w-20 h-8 px-2 text-[11px] font-semibold border border-dashed border-slate-200 rounded outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={pkg.breadth} onChange={e => handleArrayChange('packages', idx, 'breadth', parseFloat(e.target.value))} className="w-20 h-8 px-2 text-[11px] font-semibold border border-dashed border-slate-200 rounded outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={pkg.height} onChange={e => handleArrayChange('packages', idx, 'height', parseFloat(e.target.value))} className="w-20 h-8 px-2 text-[11px] font-semibold border border-dashed border-slate-200 rounded outline-none" />
                                </td>
                                <td className="px-4 py-2 text-right text-[11px] font-bold text-slate-400">{pkg.vol_wt.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right text-[11px] font-black text-slate-900">{pkg.chargeable_wt.toFixed(2)}</td>
                                <td className="px-4 py-2">
                                    <button onClick={() => removeArrayItem('packages', idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-between">
                <Button onClick={() => addArrayItem('packages', { box_no: '', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 })} className="h-8 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 text-[10px] font-bold uppercase gap-2 shadow-sm">
                    <Plus className="h-3 w-3" /> ADD PACKAGE
                </Button>
                
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">BILL AMOUNT</span>
                        <input type="number" name="bill_amount" value={formData.bill_amount} onChange={handleChange} className="h-10 w-32 px-3 bg-slate-100 border border-slate-300 rounded text-base font-black text-right" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">FUEL AMOUNT</span>
                        <input type="number" name="fuel_amount" value={formData.fuel_amount} onChange={handleChange} className="h-10 w-24 px-3 bg-slate-100 border border-slate-300 rounded text-base font-black text-right" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">GST AMOUNT</span>
                        <input type="number" name="gst_amount" value={formData.gst_amount} onChange={handleChange} className="h-10 w-24 px-3 bg-slate-100 border border-slate-300 rounded text-base font-black text-right" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">TOTAL AMOUNT</span>
                        <div className="h-10 w-44 flex items-center justify-end px-4 bg-blue-600 rounded text-white text-xl font-black shadow-lg shadow-blue-200">
                           ₹{(formData.bill_amount + formData.fuel_amount + formData.gst_amount).toFixed(2)}
                        </div>
                    </div>
                    <Button className="h-10 bg-blue-500 hover:bg-blue-600 text-white font-black text-[12px] uppercase px-6 self-end shadow-lg shadow-blue-100 tracking-wider">CHECK RATE</Button>
                </div>
            </div>
        </div>

        {/* SHIPMENT INVOICE Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input type="checkbox" name="create_invoice" checked={formData.create_invoice} onChange={handleChange} className="h-4 w-4 rounded" />
                    <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-wider">CREATE SHIPMENT INVOICE?</h4>
                </div>
                {formData.create_invoice && (
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">INVOICE TYPE?</span>
                           <select name="invoice_type" value={formData.invoice_type} onChange={handleChange} className="h-7 px-2 border border-slate-300 rounded text-[10px] font-bold outline-none">
                               <option>INVOICE</option>
                           </select>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">NOTE</span>
                           <select name="note" value={formData.note} onChange={handleChange} className="h-7 px-2 border border-slate-300 rounded text-[10px] font-bold outline-none">
                               <option>GIFT</option>
                               <option>SAMPLES</option>
                           </select>
                        </div>
                    </div>
                )}
            </div>

            {formData.create_invoice && (
               <div className="p-4">
                  <div className="bg-[#1a2f4c] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-t border-b border-white/10">
                      SHIPMENT INVOICE ITEMS
                  </div>
                  <div className="overflow-x-auto border-x border-b border-slate-200 rounded-b">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">BOX NO.</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">SR. NO.</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">DESCRIPTION</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">HS CODE</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">UNIT TYPE</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">QUANTITY</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">UNIT WEIGHT</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">IGST</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">UNIT RATES</th>
                              <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">AMOUNT</th>
                              <th className="px-3 py-2 w-10"></th>
                           </tr>
                        </thead>
                        <tbody>
                           {formData.items.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                 <td className="px-3 py-2">
                                    <select value={item.box_no} onChange={e => handleArrayChange('items', idx, 'box_no', e.target.value)} className="w-12 h-8 text-[11px] font-bold bg-transparent outline-none">
                                        {formData.packages.map(p => <option key={p.box_no} value={p.box_no}>{p.box_no}</option>)}
                                    </select>
                                 </td>
                                 <td className="px-3 py-2 text-[11px] font-bold text-slate-400">{item.sr_no}</td>
                                 <td className="px-3 py-2">
                                    <input value={item.description} onChange={e => handleArrayChange('items', idx, 'description', e.target.value)} placeholder="SEARCH HERE..." className="w-full h-8 px-2 text-[11px] font-semibold border border-transparent hover:border-slate-200 focus:border-blue-500 rounded outline-none" />
                                 </td>
                                 <td className="px-3 py-2">
                                    <input value={item.hs_code} onChange={e => handleArrayChange('items', idx, 'hs_code', e.target.value)} className="w-full h-8 px-2 text-[11px] font-semibold bg-transparent outline-none" />
                                 </td>
                                 <td className="px-3 py-2">
                                    <select value={item.unit_type} onChange={e => handleArrayChange('items', idx, 'unit_type', e.target.value)} className="w-full h-8 text-[11px] font-bold bg-transparent outline-none">
                                        <option>PCS</option>
                                        <option>DOZ</option>
                                        <option>SET</option>
                                    </select>
                                 </td>
                                 <td className="px-3 py-2">
                                    <input type="number" value={item.quantity} onChange={e => handleArrayChange('items', idx, 'quantity', parseInt(e.target.value))} className="w-16 h-8 px-1 text-[11px] font-bold text-center border border-dashed border-slate-200 rounded outline-none" />
                                 </td>
                                 <td className="px-3 py-2">
                                    <input type="number" value={item.unit_weight} onChange={e => handleArrayChange('items', idx, 'unit_weight', parseFloat(e.target.value))} className="w-16 h-8 px-1 text-[11px] font-bold text-center rounded outline-none" />
                                 </td>
                                 <td className="px-3 py-2">
                                    <input type="number" value={item.igst} onChange={e => handleArrayChange('items', idx, 'igst', parseFloat(e.target.value))} className="w-16 h-8 px-1 text-[11px] font-bold text-center rounded outline-none" />
                                 </td>
                                 <td className="px-3 py-2">
                                    <input type="number" value={item.unit_rate} onChange={e => handleArrayChange('items', idx, 'unit_rate', parseFloat(e.target.value))} className="w-20 h-8 px-1 text-[11px] font-bold text-center border border-dashed border-slate-200 rounded outline-none" />
                                 </td>
                                 <td className="px-3 py-2 text-[11px] font-black text-slate-900 text-right">{item.amount.toFixed(2)}</td>
                                 <td className="px-3 py-2">
                                    <button onClick={() => removeArrayItem('items', idx)} className="text-red-300 hover:text-red-500 transition-colors uppercase text-[8px] font-black">REMOVE</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     <div className="p-3 bg-slate-50 flex justify-between items-center">
                        <Button onClick={() => addArrayItem('items', { box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, igst: 0, unit_rate: 0, amount: 0 })} className="h-8 bg-[#65a30d] hover:bg-[#4d7c0f] text-white text-[10px] font-black uppercase shadow-md shadow-green-100 gap-2">
                           <Plus className="h-3.5 w-3.5" /> ADD ITEM
                        </Button>
                        <div className="flex gap-8 px-4">
                           <div className="flex flex-col items-end">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">TOTAL WEIGHT</span>
                              <span className="text-sm font-black text-slate-700">0.00</span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">TOTAL AMOUNT</span>
                              <span className="text-sm font-black text-slate-900">{formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
        </div>
      </div>
    </div>
  );
}


export default AddShipmentForm;
