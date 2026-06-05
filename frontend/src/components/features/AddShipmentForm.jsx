import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Save, Plus, Search, MapPin, User, Package, Clock, ShieldCheck, FileText, RotateCcw, Trash2 } from "lucide-react"
import { api } from '../../services/api';

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
    items: [{ box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, igst: 0, unit_rate: 0, amount: 0 }],

    // Detailed Charges
    freight_ch: 0,
    transport_ch: 0,
    destination_ch: 0,
    clearance_ch: 0,
    ess_ch: 0,
    other_ch: 0,
    oda_ch: 0,
    ddp_ch: 0,
    fuel_ch: 0,
    charges_date: new Date().toISOString().split('T')[0],

    // Final Billing
    sub_total: 0,
    cgst_ch: 0,
    sgst_ch: 0,
    igst_ch: 0,
    grand_total: 0
  });

  const [masters, setMasters] = useState({
      states: [],
      shipperCities: [],
      consigneeCities: []
  });

  useEffect(() => {
    api.getCustomers()
      .then(data => {
        setCustomers(data);
      })
      .catch(err => console.error('Fetch customers error:', err));

    fetch('/api/masters/states')
      .then(res => res.json())
      .then(data => setMasters(prev => ({ ...prev, states: data })))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
      if (formData.shipper_state) {
          const stateObj = masters.states.find(s => s.name === formData.shipper_state);
          if (stateObj) {
              fetch(`/api/masters/cities?state_id=${stateObj.id}`)
                .then(res => res.json())
                .then(data => setMasters(prev => ({ ...prev, shipperCities: data })))
                .catch(err => console.error(err));
          }
      }
  }, [formData.shipper_state, masters.states]);

  useEffect(() => {
    if (formData.consignee_state) {
        const stateObj = masters.states.find(s => s.name === formData.consignee_state);
        if (stateObj) {
            fetch(`/api/masters/cities?state_id=${stateObj.id}`)
              .then(res => res.json())
              .then(data => setMasters(prev => ({ ...prev, consigneeCities: data })))
              .catch(err => console.error(err));
        }
    }
  }, [formData.consignee_state, masters.states]);

  const handleCustomerChange = (e, customerList = customers) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    const customer = customerList.find(c => c.id.toString() === customerId);
    
    if (customer) {
        setFormData(prev => ({
            ...prev,
            contact_no: customer.phone || '',
            shipper_code: customer.code || '',
            shipper_company: customer.name || '',
            shipper_name: customer.name || '',
            shipper_address1: customer.address || '',
            shipper_city: customer.city || '',
            shipper_state: customer.state || '',
            shipper_zip: customer.pincode || '',
            shipper_email: customer.email || '',
            shipper_phone: customer.phone || '+91',
            account_code: customer.code || ''
        }));
    }
  };

  useEffect(() => {
    const totalActualWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.actual_wt) || 0), 0);
    const totalVolWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.vol_wt) || 0), 0);
    const totalChargeableWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.chargeable_wt) || 0), 0);

    setFormData(prev => ({
        ...prev,
        actual_weight: totalActualWt,
        volumetric_weight: totalVolWt,
        chargeable_weight: totalChargeableWt,
        pcs: formData.packages.length
    }));
  }, [formData.packages]);

  // Billing Calculation
  useEffect(() => {
    const subTotal = [
        formData.freight_ch, formData.destination_ch, formData.ess_ch, 
        formData.oda_ch, formData.transport_ch, formData.clearance_ch, 
        formData.other_ch, formData.ddp_ch, formData.fuel_ch
    ].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const taxes = [formData.cgst_ch, formData.sgst_ch, formData.igst_ch].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    setFormData(prev => ({
        ...prev,
        sub_total: subTotal,
        grand_total: subTotal + taxes
    }));
  }, [
    formData.freight_ch, formData.destination_ch, formData.ess_ch, formData.oda_ch,
    formData.transport_ch, formData.clearance_ch, formData.other_ch, formData.ddp_ch,
    formData.fuel_ch, formData.cgst_ch, formData.sgst_ch, formData.igst_ch
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value.toUpperCase())
    }));
  };

  const fillMockData = () => {
    const customer = customers.find(c => c.name.includes("BRISK")) || customers[0];
    setFormData(prev => ({
        ...prev,
        airway_no: 'BRK' + Math.floor(100000 + Math.random() * 900000),
        product: 'PARCEL',
        service: 'EXPRESS',
        duty: 'SENDER',
        ref_no: 'REF-' + Math.floor(1000 + Math.random() * 9000),
        shipment_value: 5000,
        invoice_no: 'INV-' + Math.floor(10000 + Math.random() * 90000),
        
        // Consignee
        consignee_name: 'PRIYA SHARMA',
        consignee_company: 'HOME DELIVERY',
        consignee_address1: '45, MARINE DRIVE, FLAT 202',
        consignee_zip: '400020',
        consignee_city: 'MUMBAI',
        consignee_state: 'MAHARASHTRA',
        consignee_country: 'INDIA',
        consignee_phone: '9876543210',
        consignee_email: 'priya@example.com',

        packages: [{ box_no: '1', actual_wt: 2.5, length: 20, breadth: 15, height: 10, vol_wt: 0.6, chargeable_wt: 2.5 }],
        bill_amount: 350,
        fuel_amount: 50,
        gst_amount: 72
    }));
    if (customer) {
        setSelectedCustomerId(customer.id);
        handleCustomerChange({ target: { value: customer.id.toString() } }, customers);
    }
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
      const data = await api.createShipment(payload);
      if (data.success) {
        alert('AWB Created Successfully! ID: ' + data.id);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save shipment. Please check the backend.');
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
    <div className="bg-[#f0f2f5] min-h-full p-4 scroll-smooth">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3 mb-6 shadow-sm rounded-lg sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold text-[#1a2f4c] tracking-tight">ADD AWB</h1>
        </div>
        <div className="flex gap-2">
            <Button onClick={fillMockData} className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-6 h-9 rounded shadow-md uppercase tracking-wider">
                FILL MOCK DATA
            </Button>
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
                      onChange={handleCustomerChange}
                  >
                      <option value="">SELECT CUSTOMER...</option>
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
                       <input name="booking_time" type="time" value={formData.booking_time} onChange={handleChange} disabled readOnly className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold bg-slate-100 cursor-not-allowed pointer-events-none" />
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

                <FormField label="CITY">
                    <select name="shipper_city" value={formData.shipper_city} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold outline-none">
                        <option value="">SELECT CITY...</option>
                        {[...new Set([...masters.shipperCities.map(c => c.name), formData.shipper_city])].filter(Boolean).map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="STATE/COUNTY">
                    <select name="shipper_state" value={formData.shipper_state} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold outline-none">
                        <option value="">SELECT STATE...</option>
                        {masters.states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </FormField>
                
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

                <FormField label="CITY">
                    <select name="consignee_city" value={formData.consignee_city} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold outline-none">
                        <option value="">SELECT CITY...</option>
                        {[...new Set([...masters.consigneeCities.map(c => c.name), formData.consignee_city])].filter(Boolean).map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="STATE/COUNTY">
                    <select name="consignee_state" value={formData.consignee_state} onChange={handleChange} className="w-full h-8 px-2 border border-slate-300 rounded text-[11px] font-bold outline-none">
                        <option value="">SELECT STATE...</option>
                        {masters.states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </FormField>
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
            <div className="p-3 bg-slate-50 flex items-center justify-between border-t border-slate-200">
                <Button onClick={() => addArrayItem('packages', { box_no: '', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 })} className="h-8 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 text-[10px] font-bold uppercase gap-2 shadow-sm">
                    <Plus className="h-3 w-3" /> ADD PACKAGE
                </Button>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Brisk Network - Weight Management System</div>
            </div>
        </div>

        {/* Detailed Charges & Billing Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Charges */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="bg-[#1a2f4c] px-4 py-2 text-white flex justify-between items-center rounded-t-lg">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Charges</span>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-300">Charges date :</span>
                        <input type="date" name="charges_date" value={formData.charges_date} onChange={handleChange} className="h-6 px-1 text-slate-900 text-[10px] font-bold rounded" />
                    </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3">
                    <FormField label="Freight" name="freight_ch" type="number" value={formData.freight_ch} />
                    <FormField label="Transport" name="transport_ch" type="number" value={formData.transport_ch} />
                    
                    <FormField label="Destination" name="destination_ch" type="number" value={formData.destination_ch} />
                    <FormField label="Clearance" name="clearance_ch" type="number" value={formData.clearance_ch} />
                    
                    <FormField label="ESS" name="ess_ch" type="number" value={formData.ess_ch} />
                    <FormField label="OtherCh." name="other_ch" type="number" value={formData.other_ch} />
                    
                    <FormField label="ODA" name="oda_ch" type="number" value={formData.oda_ch} />
                    <FormField label="DDP." name="ddp_ch" type="number" value={formData.ddp_ch} />
                    
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                         <label className="text-[10px] font-bold uppercase text-slate-500">Total</label>
                         <div className="h-7 px-2 border border-slate-200 rounded text-[11px] font-black bg-slate-100 flex items-center">{formData.sub_total.toFixed(2)}</div>
                    </div>
                    <FormField label="Fuel Surcharge" name="fuel_ch" type="number" value={formData.fuel_ch} />
                </div>
            </div>

            {/* Final Billing */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                <div className="bg-slate-50 px-4 py-2 text-slate-800 text-[11px] font-black uppercase border-b border-slate-200 rounded-t-lg">Final Billing Summary</div>
                <div className="p-4 space-y-3 flex-1">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                         <label className="text-[10px] font-bold uppercase text-slate-500 text-right">Sub Total</label>
                         <div className="h-9 px-3 border border-slate-200 rounded text-[14px] font-black bg-slate-100 flex items-center text-slate-700">{formData.sub_total.toFixed(2)}</div>
                    </div>

                    <FormField label="CGST Tax" name="cgst_ch" type="number" value={formData.cgst_ch} className="justify-items-end" />
                    <FormField label="SGST Tax" name="sgst_ch" type="number" value={formData.sgst_ch} />
                    <FormField label="IGST Tax" name="igst_ch" type="number" value={formData.igst_ch} />

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <label className="text-[14px] font-black uppercase text-[#1a2f4c]">Grand Total</label>
                        <div className="h-12 px-6 border-2 border-[#1a2f4c] rounded-lg text-[22px] font-black bg-[#f8fafc] flex items-center text-[#1a2f4c] shadow-sm tabular-nums">
                            ₹ {formData.grand_total.toFixed(2)}
                        </div>
                    </div>
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
