import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Save, Plus, Search, MapPin, User, Package, Clock, ShieldCheck, FileText, RotateCcw, Trash2, Globe, Home } from "lucide-react"
import { api } from '../../services/api';

export function AddUnifiedShipmentForm({ initialType = 'domestic' }) {
  const [shipmentType, setShipmentType] = useState(initialType); // 'domestic' or 'international'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [formData, setFormData] = useState({
    airway_no: '',
    edit_awb: false,
    email: 'OPSOMCOURIER@GMAIL.COM',
    contact_no: '9029200429',
    account_code: 'WCC9723',
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
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_no: '',
    content: '',

    // Shipper / Consigner
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
    shipper_kyc_type: 'PAN CARD',
    shipper_kyc_no: '',
    shipper_save: false,
    shipper_update: false,

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
    consignee_country: 'INDIA',
    consignee_phone: '',
    consignee_email: '',
    consignee_save: false,
    consignee_update: false,

    // Weights & Dimensions
    pcs: 1,
    actual_weight: 0,
    volumetric_weight: 0,
    chargeable_weight: 0,
    packages: [{ box_no: '1', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0, per_box_wt: 0 }],

    // Billing / Charges
    freight_ch: 0,
    pickup_ch: 0,
    cod_ch: 0,
    other_ch: 0,
    fuel_surcharge: 0,
    transport_ch: 0,
    remote_area_ch: 0,
    awb_ch: 0,
    
    // International Specific Charges
    destination_ch: 0,
    clearance_ch: 0,
    ess_ch: 0,
    oda_ch: 0,
    ddp_ch: 0,

    charges_date: new Date().toISOString().split('T')[0],

    // Final Billing
    sub_total: 0,
    cgst_ch: 0,
    sgst_ch: 0,
    igst_ch: 0,
    grand_total: 0,

    // Invoice
    create_invoice: false,
    invoice_type: 'INVOICE',
    note: 'GIFT',
    items: [{ box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, igst: 0, unit_rate: 0, amount: 0 }],

    // Behavior
    save_as_new_customer: false,
    new_customer_code: ''
  });

  const [masters, setMasters] = useState({
      states: [],
      shipperCities: [],
      consigneeCities: [],
      couriers: ['DHL', 'FEDEX', 'UPS', 'SELF'],
      modes: ['AIR', 'SEA', 'SURFACE'],
      products: ['DOCUMENTS', 'PARCEL'],
      billTypes: ['PREPAID', 'COD', 'TO PAY', 'CASH'],
      forwarders: ['DHL EXPRESS', 'FEDEX PRIORITY', 'SELF']
  });

  useEffect(() => {
    api.getCustomers()
      .then(data => {
        setCustomers(data);
        if (data.length > 0 && !selectedCustomerId) {
            handleCustomerChange({ target: { value: data[0].id.toString() } }, data);
        }
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
            account_code: customer.code || '',
            shipper_kyc_no: customer.gst_no || ''
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
        formData.freight_ch, formData.pickup_ch, formData.cod_ch, 
        formData.other_ch, formData.fuel_surcharge, formData.transport_ch, 
        formData.remote_area_ch, formData.awb_ch,
        formData.destination_ch, formData.clearance_ch, formData.ess_ch,
        formData.oda_ch, formData.ddp_ch
    ].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const taxes = [formData.cgst_ch, formData.sgst_ch, formData.igst_ch].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    setFormData(prev => ({
        ...prev,
        sub_total: subTotal,
        grand_total: subTotal + taxes
    }));
  }, [
    formData.freight_ch, formData.pickup_ch, formData.cod_ch, formData.other_ch,
    formData.fuel_surcharge, formData.transport_ch, formData.remote_area_ch, formData.awb_ch,
    formData.destination_ch, formData.clearance_ch, formData.ess_ch, formData.oda_ch,
    formData.ddp_ch, formData.cgst_ch, formData.sgst_ch, formData.igst_ch
  ]);

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
        if (arrayName === 'packages') {
            if (['length', 'breadth', 'height'].includes(field)) {
                const l = parseFloat(newArray[index].length) || 0;
                const b = parseFloat(newArray[index].breadth) || 0;
                const h = parseFloat(newArray[index].height) || 0;
                // Domestic divisor is often 5000, International might be different but we'll stick to 5000 for now or make it dynamic
                newArray[index].vol_wt = (l * b * h) / 5000;
                newArray[index].chargeable_wt = Math.max(newArray[index].actual_wt, newArray[index].vol_wt);
            }
            if (field === 'actual_wt') {
                newArray[index].chargeable_wt = Math.max(parseFloat(value) || 0, newArray[index].vol_wt);
            }
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
    
    let customerIdToUse = selectedCustomerId;

    if (formData.save_as_new_customer) {
        if (!formData.shipper_name || !formData.shipper_phone) {
            alert("Please provide Shipper Name and Phone to save as a new customer.");
            return;
        }

        const generatedCode = formData.new_customer_code || `CSH${Date.now().toString().slice(-6)}`;
        
        const newCustomerData = {
            code: generatedCode,
            name: formData.shipper_name,
            phone: formData.shipper_phone,
            email: formData.shipper_email || '',
            address: formData.shipper_address1,
            city: formData.shipper_city,
            state: formData.shipper_state,
            pincode: formData.shipper_zip,
            gst_no: formData.shipper_kyc_no || '',
            password: 'admin@brisk2026', // Placeholder
            gst_charges: 'Yes',
            staff_allotment: 'Admin',
            api_access: 'Enabled',
            sac_code: '996812',
            credit_days: '30',
            cft: '10',
            domestic_rate_group: 'Domestic 1',
            international_rate_group: 'CO COURIER 1',
            domestic_fuel_group: 'Group A',
            international_fuel_group: 'Group A',
            mis_emails: '',
            mis_format: 'SR.No Date Consigner Consignee Destination Pincode Invoice'
        };

        try {
            const custResult = await api.createCustomer(newCustomerData);
            if (custResult.success) {
                customerIdToUse = custResult.id;
                // Update dropdown list
                const updatedCustomers = await api.getCustomers();
                setCustomers(updatedCustomers);
                setSelectedCustomerId(customerIdToUse.toString());
            } else {
                alert("Failed to save customer: " + custResult.error);
                return;
            }
        } catch (err) {
            console.error("New customer creation error:", err);
            alert("Error saving new customer.");
            return;
        }
    }

    const payload = { 
        ...formData, 
        customer_id: customerIdToUse, 
        user_id: 1, 
        type: shipmentType 
    };
    
    try {
      const data = await api.createShipment(payload);
      if (data.success) {
        alert(`${shipmentType.toUpperCase()} AWB Created Successfully! ID: ${data.id}`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save shipment. Please check the backend.');
    }
  };

  const SectionHeader = ({ title, className = "" }) => (
    <div className={`flex items-center justify-between px-2 py-1 bg-green-800 text-white text-[10px] font-bold border-b border-slate-300 ${className}`}>
      <span className="uppercase">{title}</span>
    </div>
  );

  const FormField = ({ label, name, type = "text", value, placeholder, required = false, children, className = "", labelWidth = "100px", isRed = false }) => (
    <div className={`grid grid-cols-[${labelWidth}_1fr] items-center gap-1 leading-none ${className}`}>
      <label className={`text-[9px] font-bold uppercase truncate ${isRed || required ? "text-red-500" : "text-slate-600"}`}>
        {label}
      </label>
      <div className="relative flex items-center h-5">
        {children ? children : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-full px-1 bg-[#f8f9fa] border border-slate-300 text-[10px] font-semibold text-slate-800 focus:bg-white outline-none transition-colors"
            />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-1 font-sans selection:bg-blue-100">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-green-800 p-1 mb-1">
         <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-tighter">AWB Details</span>
         </div>
         <div className="flex gap-1">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded shadow-sm transition-colors uppercase">
               Create AWB and Print Label
            </button>
         </div>
      </div>

      <div className="mb-1">
         <h2 className="text-[14px] font-bold text-slate-800 uppercase px-1 pb-1">Add AWB</h2>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-3 gap-0 border border-slate-300 divide-x divide-slate-300">
        
        {/* Column 1: AWB INFO */}
        <div className="flex flex-col">
            <div className="px-2 py-1 border-b border-slate-300 bg-slate-50">
                <h3 className="text-[10px] font-bold text-blue-800 uppercase">Air Waybill Information</h3>
            </div>
            <div className="p-1.5 space-y-1">
                <FormField label="AWB Number" name="airway_no" isRed labelWidth="85px">
                   <div className="flex gap-1 w-full h-full">
                      <input name="airway_no" value={formData.airway_no} onChange={handleChange} className="flex-1 h-full px-1 bg-slate-100 border border-slate-300 text-[10px] font-bold outline-none" />
                      <button className="bg-slate-400 text-white text-[8px] font-bold px-2 h-full uppercase">Edit</button>
                   </div>
                </FormField>

                <FormField label="Customer" isRed labelWidth="85px">
                    <div className="flex gap-1 w-full h-full">
                        <select 
                            className="flex-1 h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold"
                            value={selectedCustomerId}
                            onChange={handleCustomerChange}
                        >
                            <option value="">SELECT...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                        <input value="OM COURIER SERVICES" readOnly className="flex-[2] h-full px-1 bg-slate-100 border border-slate-300 text-[10px] font-bold" />
                    </div>
                </FormField>

                <FormField label="Email" name="email" isRed labelWidth="85px" value={formData.email} />
                <FormField label="Contact No" name="contact_no" isRed labelWidth="85px" value={formData.contact_no} />
                <FormField label="Account Code" name="account_code" isRed labelWidth="85px" value={formData.account_code} />

                <div className="grid grid-cols-2 gap-1">
                   <FormField label="Origin Hub" name="origin_hub" isRed labelWidth="85px">
                      <select name="origin_hub" value={formData.origin_hub} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                         <option>MUMBAI</option>
                      </select>
                   </FormField>
                   <FormField label="Zone" name="origin_zone" labelWidth="40px" value={formData.origin_zone} />
                </div>

                <div className="grid grid-cols-2 gap-1">
                   <FormField label="Destination" name="destination" isRed labelWidth="85px" value={formData.destination} />
                   <FormField label="Zone" name="dest_zone" labelWidth="40px" value={formData.dest_zone} />
                </div>

                <FormField label="Product" name="product" isRed labelWidth="85px">
                   <select name="product" value={formData.product} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                      <option>SELECT..</option>
                      {masters.products.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </FormField>

                <div className="grid grid-cols-[1fr_85px_1fr] gap-1 items-center">
                    <FormField label="Booking Date" name="booking_date" isRed labelWidth="85px" type="date" value={formData.booking_date} />
                    <label className="text-[9px] font-bold text-slate-600 uppercase text-right">Booking Time</label>
                    <input name="booking_time" value={formData.booking_time} onChange={handleChange} className="h-5 px-1 border border-slate-300 text-[10px] font-bold bg-slate-50" />
                </div>

                <FormField label="USPS Number" name="usps_number" labelWidth="85px" value={formData.usps_number} />

                <FormField label="Service" name="service" isRed labelWidth="85px">
                   <select name="service" value={formData.service} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                      <option>SELECT..</option>
                   </select>
                </FormField>

                <FormField label="Duty" name="duty" isRed labelWidth="85px">
                   <select name="duty" value={formData.duty} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                      <option>SELECT...</option>
                   </select>
                </FormField>

                <FormField label="Reference Number" name="ref_no" labelWidth="85px" value={formData.ref_no} />

                <div className="grid grid-cols-2 gap-1">
                    <FormField label="Shipment Value" name="shipment_value" labelWidth="85px" value={formData.shipment_value} />
                    <FormField label="Currency" name="currency" labelWidth="45px">
                        <select name="currency" value={formData.currency} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                            <option>SELECT..</option>
                            <option>INR</option>
                            <option>USD</option>
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-1">
                    <FormField label="Invoice Date" name="invoice_date" isRed labelWidth="85px" type="date" value={formData.invoice_date} />
                    <FormField label="Invoice Number" name="invoice_no" labelWidth="85px" value={formData.invoice_no} />
                </div>

                <div className="flex items-center gap-2 h-5">
                   <input type="checkbox" name="edit_shipment" className="h-3 w-3" />
                   <label className="text-[9px] font-bold text-slate-600 uppercase">Edit</label>
                </div>

                <FormField label="Content" name="content" labelWidth="85px" value={formData.content} />
            </div>
        </div>

        {/* Column 2: SHIPPER INFO */}
        <div className="flex flex-col">
            <div className="px-2 py-1 border-b border-slate-300 bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-blue-800 uppercase">Shipper / Consignor / From</h3>
                <div className="flex gap-2">
                   <RotateCcw className="h-3 w-3 text-blue-800 cursor-pointer" />
                   <div className="flex items-center gap-1">
                      <input type="checkbox" name="shipper_save" checked={formData.shipper_save} onChange={handleChange} className="h-3 w-3" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Save to address book?</span>
                   </div>
                </div>
            </div>
            <div className="p-1.5 space-y-1">
                <FormField label="Search Address Book" labelWidth="95px">
                   <input className="w-full h-full px-1 border border-slate-300" />
                </FormField>

                <div className="grid grid-cols-[1fr_85px] gap-1">
                   <FormField label="Code" name="shipper_code" labelWidth="95px" value={formData.shipper_code} />
                   <div className="flex items-center gap-1">
                      <input type="checkbox" name="shipper_update" checked={formData.shipper_update} onChange={handleChange} className="h-2.5 w-2.5" />
                      <span className="text-[7px] font-bold text-slate-500 uppercase leading-none">Update address book?</span>
                   </div>
                </div>

                <FormField label="Company" name="shipper_company" labelWidth="95px" value={formData.shipper_company} />
                <FormField label="Person Name" name="shipper_name" isRed labelWidth="95px" value={formData.shipper_name} />
                <FormField label="Address 1" name="shipper_address1" isRed labelWidth="95px" value={formData.shipper_address1} />
                <FormField label="Address 2" name="shipper_address2" labelWidth="95px" value={formData.shipper_address2} />
                <FormField label="Address 3" name="shipper_address3" labelWidth="95px" value={formData.shipper_address3} />

                <div className="grid grid-cols-[1fr_50px] gap-1">
                   <FormField label="Post / Zip Code" name="shipper_zip" isRed labelWidth="95px" value={formData.shipper_zip} />
                   <button className="bg-yellow-500 hover:bg-yellow-600 text-[8px] font-bold text-white uppercase h-5">Search</button>
                </div>

                <FormField label="City" name="shipper_city" labelWidth="95px" value={formData.shipper_city} />
                <FormField label="State / County" name="shipper_state" isRed labelWidth="95px" value={formData.shipper_state} />

                <div className="grid grid-cols-[30px_1fr] gap-1">
                   <label className="text-[9px] font-bold text-slate-600 uppercase">Country</label>
                   <div className="flex gap-1 h-5">
                      <input value="IN" readOnly className="w-8 h-full text-center text-[10px] font-bold bg-slate-100 border border-slate-300" />
                      <input value="INDIA" readOnly className="flex-1 h-full px-1 text-[10px] font-bold bg-slate-100 border border-slate-300 uppercase" />
                   </div>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-1 items-center">
                   <label className="text-[9px] font-bold text-red-500 uppercase">Phone Number</label>
                   <div className="flex gap-1 h-5">
                      <input value="+91" readOnly className="w-8 h-full text-center text-[10px] font-bold bg-slate-50 border border-slate-300" />
                      <input name="shipper_phone" value={formData.shipper_phone} onChange={handleChange} className="flex-1 h-full px-1 text-[10px] font-bold border border-slate-300" />
                   </div>
                </div>

                <FormField label="Email Address" name="shipper_email" labelWidth="95px" value={formData.shipper_email} />
                
                <FormField label="KYC Type" name="shipper_kyc_type" labelWidth="95px">
                   <select name="shipper_kyc_type" value={formData.shipper_kyc_type} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                      <option>PAN CARD</option>
                      <option>GSTIN</option>
                   </select>
                </FormField>

                <FormField label="KYC Number" name="shipper_kyc_no" labelWidth="95px" value={formData.shipper_kyc_no} />

                <div className="grid grid-cols-[95px_1fr_1fr] gap-1 items-center h-5">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Upload KYC</label>
                    <input type="file" className="text-[7px] w-full" />
                    <input type="file" className="text-[7px] w-full" />
                </div>

                <div className="grid grid-cols-[95px_1fr] gap-1 items-center h-5">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Shipper Image</label>
                    <input type="file" className="text-[7px] w-full" />
                </div>
            </div>
        </div>

        {/* Column 3: CONSIGNEE INFO */}
        <div className="flex flex-col">
            <div className="px-2 py-1 border-b border-slate-300 bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-blue-800 uppercase">Consignee / Receiver / To</h3>
                <div className="flex gap-2">
                   <RotateCcw className="h-3 w-3 text-blue-800 cursor-pointer" />
                   <div className="flex items-center gap-1">
                      <input type="checkbox" name="consignee_save" checked={formData.consignee_save} onChange={handleChange} className="h-3 w-3" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Save to address book?</span>
                   </div>
                </div>
            </div>
            <div className="p-1.5 space-y-1">
                <FormField label="Search Address Book" labelWidth="105px">
                   <input className="w-full h-full px-1 border border-slate-300" />
                </FormField>

                <div className="grid grid-cols-[1fr_85px] gap-1">
                   <FormField label="Code" name="consignee_code" labelWidth="105px" value={formData.consignee_code} />
                   <div className="flex items-center gap-1">
                      <input type="checkbox" name="consignee_update" checked={formData.consignee_update} onChange={handleChange} className="h-2.5 w-2.5" />
                      <span className="text-[7px] font-bold text-slate-500 uppercase leading-none">Update address book?</span>
                   </div>
                </div>

                <FormField label="Company" name="consignee_company" labelWidth="105px" value={formData.consignee_company} />
                <FormField label="Person Name" name="consignee_name" isRed labelWidth="105px" value={formData.consignee_name} />
                <FormField label="Address 1" name="consignee_address1" isRed labelWidth="105px" value={formData.consignee_address1} />
                <FormField label="Apartment# / Floor#" name="consignee_address2" labelWidth="105px" value={formData.consignee_address2} />
                <FormField label="Address 3" name="consignee_address3" labelWidth="105px" value={formData.consignee_address3} />

                <div className="grid grid-cols-[1fr_50px] gap-1">
                   <FormField label="Post / Zip Code" name="consignee_zip" isRed labelWidth="105px" value={formData.consignee_zip} />
                   <button className="bg-yellow-500 hover:bg-yellow-600 text-[8px] font-bold text-white uppercase h-5">Search</button>
                </div>

                <FormField label="City" name="consignee_city" isRed labelWidth="105px" value={formData.consignee_city} />
                <FormField label="State / County" name="consignee_state" labelWidth="105px" value={formData.consignee_state} />

                <div className="grid grid-cols-[105px_1fr_1fr] gap-1 items-center">
                   <label className="text-[9px] font-bold text-slate-600 uppercase">Country</label>
                   <input className="h-5 px-1 text-[10px] font-bold border border-slate-300 uppercase" />
                   <input className="h-5 px-1 text-[10px] font-bold border border-slate-300 uppercase" />
                </div>

                <div className="grid grid-cols-[105px_1fr_1fr] gap-1 items-center">
                   <label className="text-[9px] font-bold text-red-500 uppercase">Phone Number</label>
                   <input className="h-5 px-1 text-[10px] font-bold border border-slate-300" />
                   <input className="h-5 px-1 text-[10px] font-bold border border-slate-300" />
                </div>

                <FormField label="Email Address" name="consignee_email" labelWidth="105px" value={formData.consignee_email} />
            </div>
        </div>
      </div>

      {/* Bottom Section: Weights and Dimensions */}
      <div className="mt-1 border border-slate-300 bg-slate-50">
          <SectionHeader title="Weights and Dimensions" />
          <div className="p-1 flex divide-x divide-slate-300 items-center overflow-x-auto">
             <div className="px-2 py-0.5 flex items-center gap-2 whitespace-nowrap">
                <label className="text-[9px] font-bold text-slate-500 uppercase">PCS</label>
                <input type="number" value={formData.pcs} className="w-10 h-5 px-1 border border-slate-300 text-[10px] font-bold bg-white" readOnly />
             </div>
             <div className="px-2 py-0.5 flex items-center gap-2 whitespace-nowrap">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Actual Weight</label>
                <div className="flex items-center gap-1 h-5">
                   <input type="number" value={formData.actual_weight} className="w-14 h-full px-1 border border-slate-300 text-[10px] font-bold bg-white" readOnly />
                   <span className="text-[8px] font-bold">KG</span>
                </div>
             </div>
             <div className="px-2 py-0.5 flex items-center gap-2 whitespace-nowrap">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Volumetric</label>
                <input type="number" value={formData.volumetric_weight} className="w-14 h-5 px-1 border border-slate-300 text-[10px] font-bold bg-white" readOnly />
             </div>
             <div className="px-2 py-0.5 flex items-center gap-2 whitespace-nowrap">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Chargeable</label>
                <input type="number" value={formData.chargeable_weight} className="w-14 h-5 px-1 border border-slate-300 text-[10px] font-bold bg-white" readOnly />
             </div>
             {/* This section would normally have a button to open the detailed weight popup or shows the first row */}
             <div className="px-2 py-0.5 flex-1 flex justify-end">
                <button onClick={() => addArrayItem('packages', {})} className="bg-slate-200 text-[8px] font-bold px-2 py-0.5 uppercase border border-slate-300">Detailed Weights</button>
             </div>
          </div>
      </div>

      <div className="mt-1 flex justify-center opacity-70">
          <p className="text-[8px] font-bold text-slate-400">ITD POWERED BY ITD SERVICES PVT. LTD.</p>
      </div>
    </div>
  );
}

export default AddUnifiedShipmentForm;
