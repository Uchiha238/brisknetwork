import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Save, Plus, Search, MapPin, User, Package, Clock, ShieldCheck, FileText, RotateCcw, Trash2, Globe, Home } from "lucide-react"
import { api } from '../../services/api';

const SectionHeader = ({ title, className = "", isWhite = false }) => (
    <div className={`flex items-center justify-between px-2 py-1.5 ${isWhite ? "bg-white border-t border-slate-300" : "bg-green-800 text-white"} text-[10px] font-black border-b border-slate-200 ${className}`}>
      <span className="uppercase tracking-widest">{title}</span>
    </div>
  );

const FormField = ({ label, name, type = "text", value, placeholder, required = false, children, className = "", labelWidth = "100px", isRed = false, inputMaxWidth = "none", onChange, readOnly = false }) => (
    <div className={`grid items-center gap-1 leading-none ${className}`} style={{ gridTemplateColumns: `${labelWidth} 1fr` }}>
      <label className={`text-[10px] font-black uppercase truncate ${isRed || required ? "text-red-600" : "text-slate-700"}`}>
        {label}
      </label>
      <div className="relative flex items-center h-[22px]" style={{ maxWidth: inputMaxWidth }}>
        {children ? children : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={readOnly ? undefined : onChange}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`w-full h-full px-2 border border-slate-300 text-[12px] font-bold text-slate-900 outline-none transition-colors placeholder:text-slate-300 placeholder:font-normal ${readOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-[#fcfcfc] focus:bg-white'}`}
            />
        )}
      </div>
    </div>
  );

export function AddUnifiedShipmentForm({ initialType = 'domestic' }) {
  const [shipmentType, setShipmentType] = useState(initialType); // 'domestic' or 'international'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    booking_company: '',
    airway_no: '',
    edit_awb: false,
    email: 'OPSOMCOURIER@GMAIL.COM',
    payment_mode: 'Cash',
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
    mode: '',
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
    shipper_zone: '',
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
    consignee_zone: '',
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
    packages: [
      { box_no: '1', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 },
    ],

    // Billing / Charges
    freight_ch: 0,
    pickup_ch: 0,
    cod_ch: 0,
    other_ch: 0,
    fuel_surcharge: 0,
    transport_ch: 0,
    remote_area_ch: 0,
    awb_ch: 0,
    ras_ch: 0,
    ers_ch: 0,
    odd_dimension_ch: 0,
    address_change_ch: 0,
    dg_ch: 0,
    import_duty_ch: 0,
    adc_noc_ch: 0,
    electronic_item_ch: 0,
    odd_weight_ch: 0,
    packing_ch: 0,
    handling_ch: 0,
    
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
      modes: [],
      products: ['DOCUMENTS', 'PARCEL'],
      billTypes: ['PREPAID', 'COD', 'TO PAY', 'CASH'],
      forwarders: ['DHL EXPRESS', 'FEDEX PRIORITY', 'SELF'],
      countries: []
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

    fetch('/api/company')
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        if (data.length > 0) {
            setFormData(prev => ({ ...prev, booking_company: data[0].company_name }));
        }
      })
      .catch(err => console.error('Fetch companies error:', err));

    fetch('/api/masters/states')
      .then(res => res.json())
      .then(data => setMasters(prev => ({ ...prev, states: data })))
      .catch(err => console.error(err));

    fetch('/api/masters/countries')
      .then(res => res.json())
      .then(data => setMasters(prev => ({ ...prev, countries: data })))
      .catch(err => console.error(err));

    fetch('/api/modes')
      .then(res => res.json())
      .then(data => setMasters(prev => ({ ...prev, modes: data })))
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
    
    // Cargo Logic: Chargeable weight is Math.max of the TOTAL actual and TOTAL volumetric weights
    const rawTotalChargeableWt = Math.max(totalActualWt, totalVolWt);
    
    // Rounding Rule: Round up to the nearest 0.5 kg (e.g. 3.2 rounds to 3.5, 3.6 rounds to 4.0)
    const finalChargeableWt = Math.ceil(rawTotalChargeableWt * 2) / 2;

    setFormData(prev => ({
        ...prev,
        actual_weight: totalActualWt,
        volumetric_weight: parseFloat(totalVolWt.toFixed(2)),
        chargeable_weight: finalChargeableWt
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
    
    setFormData(prev => {
        const newData = {
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? value : value.toUpperCase())
        };

        // Pincode auto-fill using internal local database
        if ((name === 'shipper_zip' || name === 'consignee_zip') && /^\d{6}$/.test(value)) {
            fetch(`http://localhost:5000/api/pincode/${value}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.success) {
                        setFormData(current => {
                            const isShipper = name === 'shipper_zip';
                            const updateObj = {
                                [isShipper ? 'shipper_city' : 'consignee_city']: data.data.city ? data.data.city.toUpperCase() : '',
                                [isShipper ? 'shipper_state' : 'consignee_state']: data.data.state ? data.data.state.toUpperCase() : '',
                                [isShipper ? 'shipper_zone' : 'consignee_zone']: data.data.zone ? data.data.zone.toString().toUpperCase() : '',
                            };
                            
                            // country should automatically come to india with pincode
                            if (!isShipper) {
                                updateObj['consignee_country'] = 'INDIA';
                                setShipmentType('domestic');
                            }
                            
                            if (!isShipper && current.currency === 'USD') {
                                updateObj['currency'] = 'INR';
                            }
                            return { ...current, ...updateObj };
                        });
                    }
                })
                .catch(err => console.error("Error fetching pincode data:", err));
        }

        // Auto-detect shipment type based on consignee country
        if (name === 'consignee_country') {
            const isDomestic = value.toUpperCase() === 'INDIA';
            setShipmentType(isDomestic ? 'domestic' : 'international');
            
            // Auto-update Currency if switching to international
            if (!isDomestic && prev.currency === 'INR') {
                newData.currency = 'USD';
            } else if (isDomestic && prev.currency === 'USD') {
                newData.currency = 'INR';
            }
        }

        // Dynamically update package rows based on PCS input
        if (name === 'pcs') {
            const newPcs = parseInt(value) || 1;
            const currentPackages = [...prev.packages];
            
            if (newPcs > currentPackages.length) {
                // Add rows
                const rowsToAdd = newPcs - currentPackages.length;
                for (let i = 0; i < rowsToAdd; i++) {
                    currentPackages.push({ 
                        box_no: (currentPackages.length + 1).toString(), 
                        actual_wt: 0, length: 0, breadth: 0, height: 0, 
                        vol_wt: 0, chargeable_wt: 0 
                    });
                }
            } else if (newPcs < currentPackages.length && newPcs > 0) {
                // Remove rows (from the end)
                currentPackages.splice(newPcs);
            }
            
            newData.packages = currentPackages;
        }

        return newData;
    });
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

  return (
    <div className="bg-white min-h-screen p-1 font-sans selection:bg-blue-100">
      <datalist id="countries-list">
        {masters.countries.map(c => <option key={c.id} value={c.name} />)}
      </datalist>

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
            <div className="p-1.5 space-y-0.5">
                <FormField onChange={handleChange} label="AWB Number" name="airway_no" isRed labelWidth="85px">
                   <div className="flex gap-1 w-full h-full">
                      <input name="airway_no" value={formData.airway_no} onChange={handleChange} className="flex-1 h-full px-1 bg-slate-100 border border-slate-300 text-[10px] font-bold outline-none" />
                      <button className="bg-slate-400 text-white text-[8px] font-bold px-2 h-full uppercase">Edit</button>
                   </div>
                </FormField>

                <FormField onChange={handleChange} label="Customer" isRed labelWidth="85px">
                    <div className="flex gap-1 w-full h-full">
                        <select 
                            className="flex-1 h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold"
                            value={selectedCustomerId}
                            onChange={handleCustomerChange}
                        >
                            <option value="">SELECT...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                        <select 
                            name="booking_company"
                            value={formData.booking_company}
                            onChange={handleChange}
                            className="flex-[2] h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold outline-none"
                        >
                            {companies.map(c => <option key={c.id} value={c.company_name}>{c.company_name}</option>)}
                        </select>
                    </div>
                </FormField>

                <FormField onChange={handleChange} label="Email" name="email" isRed labelWidth="85px" value={formData.email} />
                <FormField onChange={handleChange} label="Payment Mode" name="payment_mode" isRed labelWidth="85px">
                   <select name="payment_mode" value={formData.payment_mode} onChange={handleChange} className="flex-1 h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold outline-none">
                       <option value="Cash">CASH</option>
                       <option value="Credit">CREDIT</option>
                   </select>
                </FormField>
                <FormField onChange={handleChange} label="Contact No" name="contact_no" isRed labelWidth="85px" value={formData.contact_no} />
                <FormField onChange={handleChange} label="Account Code" name="account_code" isRed labelWidth="85px" value={formData.account_code} />

                <div className="grid grid-cols-2 gap-1">
                   <FormField onChange={handleChange} label="Origin Hub" name="origin_hub" isRed labelWidth="85px">
                      <select name="origin_hub" value={formData.origin_hub} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                         <option>MUMBAI</option>
                      </select>
                   </FormField>
                   <FormField onChange={handleChange} label="Zone" name="shipper_zone" labelWidth="40px" value={formData.shipper_zone} />
                </div>

                <div className="grid grid-cols-[1fr_95px_70px] gap-1">
                   <FormField onChange={handleChange} label="Destination" name="consignee_country" isRed labelWidth="85px">
                       <input list="countries-list" name="consignee_country" value={formData.consignee_country} onChange={handleChange} placeholder="SELECT..." className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none" />
                   </FormField>
                   <FormField onChange={handleChange} label="PIN" name="consignee_zip" isRed labelWidth="25px" value={formData.consignee_zip} />
                   <FormField onChange={handleChange} label="Zone" name="consignee_zone" labelWidth="35px" value={formData.consignee_zone} />
                </div>

                <FormField onChange={handleChange} label="Service" name="service" isRed labelWidth="85px">
                   <select name="service" value={formData.service} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
                       <option value="">SELECT...</option>
                       <option value="DOMESTIC EXPRESS">DOMESTIC EXPRESS - DOMESTIC EXPRESS</option>
                       <option value="DOMESTIC ECONOMY">DOMESTIC ECONOMY - DOMESTIC ECONOMY</option>
                       <option value="DHL EXP">DHL EXP - DHL EXP</option>
                       <option value="FEDEX IP">FEDEX IP - FEDEX IP</option>
                       <option value="UPS EXP SAVER">UPS EXP SAVER - UPS EXP SAVER</option>
                       <option value="BOMBINO SELF PREMIUM">BOMBINO SELF - BOMBINO SELF PREMIUM</option>
                       <option value="BOMBINO SELF SERVICE">BOMBINO SELF SERVICE - BOMBINO SELF SERVICE</option>
                   </select>
                </FormField>

                <div className="grid grid-cols-2 gap-1">
                   <FormField onChange={handleChange} label="Type" name="shipment_type_field" isRed labelWidth="85px">
                      <select name="shipment_type_field" value={shipmentType} onChange={(e) => { setShipmentType(e.target.value); handleChange(e); }} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
                          <option value="domestic">DOMESTIC</option>
                          <option value="international">INTERNATIONAL</option>
                      </select>
                   </FormField>
                   <FormField onChange={handleChange} label="Mode" name="mode" isRed labelWidth="40px">
                      <select name="mode" value={formData.mode} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
                          <option value="">SELECT...</option>
                          {masters.modes
                            .filter(m => !m.type || m.type === 'Both' || m.type.toLowerCase() === shipmentType)
                            .map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                      </select>
                   </FormField>
                </div>

                <FormField onChange={handleChange} label="Product" name="product" isRed labelWidth="85px">
                   <select name="product" value={formData.product} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                      <option>SELECT..</option>
                      {masters.products.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </FormField>

                <div className="grid grid-cols-[1fr_85px_1fr] gap-1 items-center">
                    <FormField onChange={handleChange} label="Booking Date" name="booking_date" isRed labelWidth="85px" type="date" value={formData.booking_date} />
                    <label className="text-[9px] font-bold text-slate-600 uppercase text-right">Booking Time</label>
                    <input name="booking_time" value={formData.booking_time} onChange={handleChange} className="h-5 px-1 border border-slate-300 text-[10px] font-bold bg-slate-50" />
                </div>

                {shipmentType === 'international' && (
                  <>
                    <FormField onChange={handleChange} label="USPS Number" name="usps_number" labelWidth="85px" value={formData.usps_number} />
                    <FormField onChange={handleChange} label="Duty" name="duty" isRed labelWidth="85px">
                      <select name="duty" value={formData.duty} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                          <option>SELECT...</option>
                          <option>DDP</option>
                          <option>DDU</option>
                      </select>
                    </FormField>
                  </>
                )}

                <FormField onChange={handleChange} label="Reference Number" name="ref_no" labelWidth="85px" value={formData.ref_no} />

                <div className="grid grid-cols-2 gap-1">
                    <FormField onChange={handleChange} label="Shipment Value" name="shipment_value" labelWidth="85px" value={formData.shipment_value} />
                    <FormField onChange={handleChange} label="Currency" name="currency" labelWidth="45px">
                        <select name="currency" value={formData.currency} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                            <option>SELECT..</option>
                            <option>INR</option>
                            <option>USD</option>
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-1">
                    <FormField onChange={handleChange} label="Invoice Date" name="invoice_date" isRed labelWidth="85px" type="date" value={formData.invoice_date} />
                    <FormField onChange={handleChange} label="Invoice Number" name="invoice_no" labelWidth="85px" value={formData.invoice_no} />
                </div>

                <div className="flex items-center gap-2 h-5">
                   <input type="checkbox" name="edit_shipment" className="h-3 w-3" />
                   <label className="text-[9px] font-bold text-slate-600 uppercase">Edit</label>
                </div>

                <FormField onChange={handleChange} label="Content" name="content" labelWidth="85px" value={formData.content} />
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
                <FormField onChange={handleChange} label="Search Address Book" labelWidth="95px">
                   <input className="w-full h-full px-1 border border-slate-300" />
                </FormField>

                <div className="grid grid-cols-[1fr_85px] gap-1">
                   <FormField onChange={handleChange} label="Code" name="shipper_code" labelWidth="95px" value={formData.shipper_code} />
                   <div className="flex items-center gap-1">
                      <input type="checkbox" name="shipper_update" checked={formData.shipper_update} onChange={handleChange} className="h-2.5 w-2.5" />
                      <span className="text-[7px] font-bold text-slate-500 uppercase leading-none">Update address book?</span>
                   </div>
                </div>

                <FormField onChange={handleChange} label="Company" name="shipper_company" labelWidth="95px" value={formData.shipper_company} />
                <FormField onChange={handleChange} label="Person Name" name="shipper_name" isRed labelWidth="95px" value={formData.shipper_name} />
                <FormField onChange={handleChange} label="Address 1" name="shipper_address1" isRed labelWidth="95px" value={formData.shipper_address1} />
                <FormField onChange={handleChange} label="Address 2" name="shipper_address2" labelWidth="95px" value={formData.shipper_address2} />
                <FormField onChange={handleChange} label="Address 3" name="shipper_address3" labelWidth="95px" value={formData.shipper_address3} />

                <div className="grid grid-cols-[1fr_50px] gap-1">
                   <FormField onChange={handleChange} label="Post / Zip Code" name="shipper_zip" isRed labelWidth="95px" value={formData.shipper_zip} />
                   <button className="bg-yellow-500 hover:bg-yellow-600 text-[8px] font-bold text-white uppercase h-5">Search</button>
                </div>

                <FormField onChange={handleChange} label="City" name="shipper_city" labelWidth="95px" value={formData.shipper_city} />
                <div className="grid grid-cols-[1fr_80px] gap-1">
                   <FormField onChange={handleChange} label="State / County" name="shipper_state" isRed labelWidth="95px" value={formData.shipper_state} />
                   <FormField onChange={handleChange} label="Zone" name="shipper_zone" labelWidth="35px" value={formData.shipper_zone} />
                </div>

                <FormField onChange={handleChange} label="Country" name="shipper_country" isRed labelWidth="95px">
                   <input list="countries-list" name="shipper_country" value={formData.shipper_country} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none" />
                </FormField>

                <div className="grid grid-cols-[90px_1fr] gap-1 items-center">
                   <label className="text-[9px] font-bold text-red-500 uppercase">Phone Number</label>
                   <div className="flex gap-1 h-5">
                      <input value="+91" readOnly className="w-8 h-full text-center text-[10px] font-bold bg-slate-50 border border-slate-300" />
                      <input name="shipper_phone" value={formData.shipper_phone} onChange={handleChange} className="flex-1 h-full px-1 text-[10px] font-bold border border-slate-300" />
                   </div>
                </div>

                <FormField onChange={handleChange} label="Email Address" name="shipper_email" labelWidth="95px" value={formData.shipper_email} />
                
                <FormField onChange={handleChange} label="KYC Type" name="shipper_kyc_type" labelWidth="95px">
                   <select name="shipper_kyc_type" value={formData.shipper_kyc_type} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                      <option>PAN CARD</option>
                      <option>GSTIN</option>
                   </select>
                </FormField>

                <FormField onChange={handleChange} label="KYC Number" name="shipper_kyc_no" labelWidth="95px" value={formData.shipper_kyc_no} />

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
                <FormField onChange={handleChange} label="Search Address Book" labelWidth="105px" inputMaxWidth="320px">
                   <input className="w-full h-full px-1 border border-slate-300" />
                </FormField>

                <div className="grid grid-cols-[1fr_85px] gap-1">
                   <FormField onChange={handleChange} label="Code" name="consignee_code" labelWidth="105px" value={formData.consignee_code} inputMaxWidth="320px" />
                   <div className="flex items-center gap-1">
                      <input type="checkbox" name="consignee_update" checked={formData.consignee_update} onChange={handleChange} className="h-2.5 w-2.5" />
                      <span className="text-[7px] font-bold text-slate-500 uppercase leading-none">Update address book?</span>
                   </div>
                </div>

                <FormField onChange={handleChange} label="Company" name="consignee_company" labelWidth="105px" value={formData.consignee_company} inputMaxWidth="320px" />
                <FormField onChange={handleChange} label="Person Name" name="consignee_name" isRed labelWidth="105px" value={formData.consignee_name} inputMaxWidth="320px" />
                <FormField onChange={handleChange} label="Address 1" name="consignee_address1" isRed labelWidth="105px" value={formData.consignee_address1} inputMaxWidth="320px" />
                <FormField onChange={handleChange} label="Apartment# / Floor#" name="consignee_address2" labelWidth="105px" value={formData.consignee_address2} inputMaxWidth="320px" />
                <FormField onChange={handleChange} label="Address 3" name="consignee_address3" labelWidth="105px" value={formData.consignee_address3} inputMaxWidth="320px" />

                <div className="grid grid-cols-[1fr_50px] gap-1 max-w-[425px]">
                   <FormField onChange={handleChange} label="Post / Zip Code" name="consignee_zip" isRed labelWidth="105px" value={formData.consignee_zip} inputMaxWidth="320px" readOnly />
                   <button className="bg-slate-300 text-[8px] font-bold text-white uppercase h-[22px] cursor-not-allowed" disabled>Search</button>
                </div>

                <FormField onChange={handleChange} label="City" name="consignee_city" isRed labelWidth="105px" value={formData.consignee_city} inputMaxWidth="320px" readOnly />
                <div className="grid grid-cols-[1fr_80px] gap-1 max-w-[425px]">
                   <FormField onChange={handleChange} label="State / County" name="consignee_state" labelWidth="105px" value={formData.consignee_state} inputMaxWidth="320px" readOnly />
                   <FormField onChange={handleChange} label="Zone" name="consignee_zone" labelWidth="35px" value={formData.consignee_zone} readOnly />
                </div>

                <FormField onChange={handleChange} label="Country" name="consignee_country" isRed labelWidth="105px" inputMaxWidth="320px" readOnly>
                   <input name="consignee_country" value={formData.consignee_country} readOnly className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none bg-slate-100 cursor-not-allowed" />
                </FormField>

                <div className="grid grid-cols-[105px_1fr_1fr] gap-1 items-center max-w-[425px]">
                   <label className="text-[9px] font-bold text-red-500 uppercase">Phone Number</label>
                   <input className="h-[22px] px-1 text-[11px] font-bold border border-slate-300" />
                   <input className="h-[22px] px-1 text-[11px] font-bold border border-slate-300" />
                </div>

                <FormField onChange={handleChange} label="Email Address" name="consignee_email" labelWidth="105px" value={formData.consignee_email} inputMaxWidth="320px" />
            </div>
        </div>
      </div>

      {/* Bottom Section: Weights and Dimensions */}
      <div className="mt-1 border border-slate-300 bg-white">
          <SectionHeader title="Weights and Dimensions" isWhite />
          
          {/* Summary Row */}
          <div className="p-1 flex items-center gap-6 border-b border-slate-200 bg-slate-50/50">
             <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">PCS</label>
                <input type="number" name="pcs" value={formData.pcs} onChange={handleChange} className="w-16 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-white text-slate-900" />
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Actual Weight</label>
                <input type="number" value={formData.actual_weight} className="w-20 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-slate-100 text-slate-900" readOnly />
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Volumetric Weight</label>
                <input type="number" value={formData.volumetric_weight} className="w-20 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-black text-white" readOnly />
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Chargeable Weight</label>
                <input type="number" value={formData.chargeable_weight} className="w-20 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-slate-100 text-slate-900" readOnly />
             </div>
          </div>

          {/* Parcel Detail Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-500 uppercase">
                  <th className="px-2 py-1.5 border-r border-slate-200 w-24">Parcel No.</th>
                  <th className="px-2 py-1.5 border-r border-slate-200 w-20">Box No</th>
                  <th className="px-2 py-1.5 border-r border-slate-200 text-red-600">Actual Wt.(KG.)</th>
                  <th className="px-2 py-1.5 border-r border-slate-200">L(CM)</th>
                  <th className="px-2 py-1.5 border-r border-slate-200">B(CM)</th>
                  <th className="px-2 py-1.5 border-r border-slate-200">H(CM)</th>
                  <th className="px-2 py-1.5 border-r border-slate-200">Volumetric Wt.(KG.)</th>
                  <th className="px-2 py-1.5">Chargeable Wt.(KG.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {formData.packages.map((pkg, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input value={idx + 1} className="w-full h-[22px] bg-slate-50 text-[11px] font-bold px-1 border-none focus:outline-none" readOnly />
                    </td>
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input 
                         value={pkg.box_no} 
                         onChange={(e) => handleArrayChange('packages', idx, 'box_no', e.target.value)}
                         className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                       />
                    </td>
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input 
                         type="number"
                         value={pkg.actual_wt} 
                         onChange={(e) => handleArrayChange('packages', idx, 'actual_wt', e.target.value)}
                         className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                       />
                    </td>
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input 
                         type="number"
                         value={pkg.length} 
                         onChange={(e) => handleArrayChange('packages', idx, 'length', e.target.value)}
                         className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                       />
                    </td>
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input 
                         type="number"
                         value={pkg.breadth} 
                         onChange={(e) => handleArrayChange('packages', idx, 'breadth', e.target.value)}
                         className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                       />
                    </td>
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input 
                         type="number"
                         value={pkg.height} 
                         onChange={(e) => handleArrayChange('packages', idx, 'height', e.target.value)}
                         className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                       />
                    </td>
                    <td className="px-2 py-1 border-r border-slate-200">
                       <input value={pkg.vol_wt?.toFixed(2) || '0'} className="w-full h-[22px] bg-slate-50 text-[11px] font-bold px-1 border-none focus:outline-none" readOnly />
                    </td>
                    <td className="px-2 py-1">
                       <input value={pkg.chargeable_wt?.toFixed(2) || '0'} className="w-full h-[22px] bg-slate-50 text-[11px] font-bold px-1 border-none focus:outline-none" readOnly />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Footer */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Bill Amount</label>
                <input type="number" name="freight_ch" value={formData.freight_ch} onChange={handleChange} className="w-24 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white text-slate-900" />
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Fuel Amount</label>
                <input type="number" name="fuel_surcharge" value={formData.fuel_surcharge} onChange={handleChange} className="w-24 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white text-slate-900" />
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Gst Amount</label>
                <input type="number" name="igst_ch" value={formData.igst_ch} onChange={handleChange} className="w-24 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white text-slate-900" />
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Total Amount</label>
                <input type="number" value={formData.grand_total} className="w-28 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-slate-100 text-slate-900" readOnly />
             </div>

             {shipmentType === 'international' && (
               <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-slate-200 w-full">
                 <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Dest. Ch</label>
                    <input type="number" name="destination_ch" value={formData.destination_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
                 </div>
                 <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase">ESS</label>
                    <input type="number" name="ess_ch" value={formData.ess_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
                 </div>
                 <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase">ODA</label>
                    <input type="number" name="oda_ch" value={formData.oda_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
                 </div>
                 <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Clearance</label>
                    <input type="number" name="clearance_ch" value={formData.clearance_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
                 </div>
               </div>
             )}

             <button type="button" className="ml-auto bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded shadow-sm transition-all">
                Check Rate
             </button>
          </div>
      </div>

      {/* Shipment Invoice Toggle Section */}
      <div className="mt-2 p-2">
         <div className="flex items-center gap-2 mb-3">
            <input 
              type="checkbox" 
              name="create_invoice" 
              checked={formData.create_invoice} 
              onChange={handleChange} 
              className="h-4 w-4 accent-green-800" 
            />
            <span className="text-[13px] font-black text-slate-700 uppercase">Create Shipment Invoice?</span>
         </div>

         {formData.create_invoice && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="grid grid-cols-4 gap-3">
                  <FormField onChange={handleChange} label="Invoice Type ?" name="invoice_type">
                     <select name="invoice_type" value={formData.invoice_type} onChange={handleChange} className="w-full h-full px-2 border border-slate-300 text-[11px] font-bold uppercase">
                        <option>INVOICE</option>
                        <option>PROFORMA</option>
                     </select>
                  </FormField>
                  <FormField onChange={handleChange} label="Note" name="note" value={formData.note} />
                  <FormField onChange={handleChange} label="Currency" name="currency">
                     <select name="currency" value={formData.currency} onChange={handleChange} className="w-full h-full px-2 border border-slate-300 text-[11px] font-bold uppercase">
                        <option>INR</option>
                        <option>USD</option>
                        <option>EUR</option>
                     </select>
                  </FormField>
                  <FormField onChange={handleChange} label="Incoterms" name="incoterms">
                     <select className="w-full h-full px-2 border border-slate-300 text-[11px] font-bold uppercase">
                        <option>CFR</option>
                        <option>FOB</option>
                        <option>CIF</option>
                     </select>
                  </FormField>
               </div>
               <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                     UNSOLICITED GIFT SENT TO MY FRIENDS & FAMILY MEMBERS FOR THERE PERSONAL USE ONLY
                  </span>
               </div>
            </div>
         )}
      </div>

      {/* Shipment Invoice Items Table Section Header */}
      <div className="mt-1 bg-[#1a2f4c] text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
         Shipment Invoice Items
      </div>

      {/* Charges Section */}
      <div className="mt-1 border border-slate-300 bg-white">
          {formData.service === "SURFACE CARGO" ? (
            <>
              <SectionHeader title="Charges" />
              <div className="p-2">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Freight</label>
                      <input type="number" name="freight_ch" value={formData.freight_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">AWB Charges</label>
                      <input type="number" name="awb_ch" value={formData.awb_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">RAS Ch.</label>
                      <input type="number" name="ras_ch" value={formData.ras_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">ERS Ch.</label>
                      <input type="number" name="ers_ch" value={formData.ers_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Odd Dimension Ch.</label>
                      <input type="number" name="odd_dimension_ch" value={formData.odd_dimension_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Address Change Ch.</label>
                      <input type="number" name="address_change_ch" value={formData.address_change_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">DDP Ch.</label>
                      <input type="number" name="ddp_ch" value={formData.ddp_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">DG Ch.</label>
                      <input type="number" name="dg_ch" value={formData.dg_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Import Duty Ch.</label>
                      <input type="number" name="import_duty_ch" value={formData.import_duty_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1 mt-2 pt-2 border-t border-slate-200">
                      <label className="text-[10px] font-black text-slate-900 uppercase">Total</label>
                      <input type="number" value={
                        Number(formData.freight_ch) + Number(formData.awb_ch) + Number(formData.ras_ch) + Number(formData.ers_ch) +
                        Number(formData.odd_dimension_ch) + Number(formData.address_change_ch) + Number(formData.ddp_ch) +
                        Number(formData.dg_ch) + Number(formData.import_duty_ch) + Number(formData.clearance_ch) +
                        Number(formData.adc_noc_ch) + Number(formData.ess_ch) + Number(formData.electronic_item_ch) +
                        Number(formData.odd_weight_ch) + Number(formData.other_ch) + Number(formData.fuel_surcharge) +
                        Number(formData.packing_ch) + Number(formData.handling_ch)
                      } readOnly className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-slate-100 text-slate-900" />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Clearance</label>
                      <input type="number" name="clearance_ch" value={formData.clearance_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">ADC Noc Ch.</label>
                      <input type="number" name="adc_noc_ch" value={formData.adc_noc_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">ESS</label>
                      <input type="number" name="ess_ch" value={formData.ess_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Electronic Item Ch.</label>
                      <input type="number" name="electronic_item_ch" value={formData.electronic_item_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Odd Weight Ch.</label>
                      <input type="number" name="odd_weight_ch" value={formData.odd_weight_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Other Ch.</label>
                      <input type="number" name="other_ch" value={formData.other_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-[#1a2f4c] uppercase">Fuel Surcharge</label>
                      <input type="number" name="fuel_surcharge" value={formData.fuel_surcharge} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-[#1a2f4c] text-white" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Packing Ch.</label>
                      <input type="number" name="packing_ch" value={formData.packing_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-1">
                      <label className="text-[10px] font-black text-slate-700 uppercase">Handling Ch.</label>
                      <input type="number" name="handling_ch" value={formData.handling_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[14px] font-bold text-[#1a2f4c]">Charges</h3>
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-bold text-slate-600">Charges date :</label>
                  <input type="date" name="charges_date" value={formData.charges_date} onChange={handleChange} className="h-[30px] px-2 border border-slate-300 rounded text-[12px] focus:outline-blue-500" />
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">Freight</label>
                      <input type="number" name="freight_ch" value={formData.freight_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">Destination</label>
                      <input type="number" name="destination_ch" value={formData.destination_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">ESS</label>
                      <input type="number" name="ess_ch" value={formData.ess_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">ODA</label>
                      <input type="number" name="oda_ch" value={formData.oda_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-bold text-slate-700">Total</label>
                      <input type="number" value={
                        Number(formData.freight_ch) + Number(formData.destination_ch) + Number(formData.ess_ch) + Number(formData.oda_ch) +
                        Number(formData.transport_ch) + Number(formData.clearance_ch) + Number(formData.other_ch) + Number(formData.ddp_ch) +
                        Number(formData.fuel_surcharge)
                      } readOnly className="h-[35px] px-3 border border-slate-300 rounded bg-slate-100 text-[14px] font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">Transport</label>
                      <input type="number" name="transport_ch" value={formData.transport_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">Clearance</label>
                      <input type="number" name="clearance_ch" value={formData.clearance_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">OtherCh.</label>
                      <input type="number" name="other_ch" value={formData.other_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">DDP.</label>
                      <input type="number" name="ddp_ch" value={formData.ddp_ch} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded text-[14px]" />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <label className="text-[13px] font-medium text-slate-700">Fuel Surcharge</label>
                      <input type="number" name="fuel_surcharge" value={formData.fuel_surcharge} onChange={handleChange} className="h-[35px] px-3 border border-slate-300 rounded bg-slate-100 text-[14px] font-bold" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
      </div>

      {/* Final Charge Section */}
      <div className="mt-1 border border-slate-300 bg-white">
          <SectionHeader title="Final Charge" />
          <div className="p-2 max-w-lg space-y-1">
            <div className="grid grid-cols-[140px_1fr] items-center gap-1">
              <label className="text-[10px] font-black text-red-600 uppercase">Pay By*</label>
              <select name="bill_type" value={formData.bill_type} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc] outline-none">
                <option value="">-Select-</option>
                {masters.billTypes.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-1">
              <label className="text-[10px] font-black text-slate-700 uppercase">Sub Total</label>
              <input type="number" value={
                Number(formData.freight_ch) + Number(formData.awb_ch) + Number(formData.ras_ch) + Number(formData.ers_ch) +
                Number(formData.odd_dimension_ch) + Number(formData.address_change_ch) + Number(formData.ddp_ch) +
                Number(formData.dg_ch) + Number(formData.import_duty_ch) + Number(formData.clearance_ch) +
                Number(formData.adc_noc_ch) + Number(formData.ess_ch) + Number(formData.electronic_item_ch) +
                Number(formData.odd_weight_ch) + Number(formData.other_ch) + Number(formData.fuel_surcharge) +
                Number(formData.packing_ch) + Number(formData.handling_ch) + Number(formData.destination_ch) +
                Number(formData.transport_ch) + Number(formData.oda_ch)
              } readOnly className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-slate-100 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-1">
              <label className="text-[10px] font-black text-slate-700 uppercase">CGST Tax</label>
              <input type="number" name="cgst_ch" value={formData.cgst_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-1">
              <label className="text-[10px] font-black text-slate-700 uppercase">SGST Tax</label>
              <input type="number" name="sgst_ch" value={formData.sgst_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-1">
              <label className="text-[10px] font-black text-slate-700 uppercase">IGST Tax</label>
              <input type="number" name="igst_ch" value={formData.igst_ch} onChange={handleChange} className="h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-[#fcfcfc]" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-1">
              <label className="text-[10px] font-black text-slate-900 uppercase">Grand Total</label>
              <input type="number" value={
                Number(formData.freight_ch) + Number(formData.awb_ch) + Number(formData.ras_ch) + Number(formData.ers_ch) +
                Number(formData.odd_dimension_ch) + Number(formData.address_change_ch) + Number(formData.ddp_ch) +
                Number(formData.dg_ch) + Number(formData.import_duty_ch) + Number(formData.clearance_ch) +
                Number(formData.adc_noc_ch) + Number(formData.ess_ch) + Number(formData.electronic_item_ch) +
                Number(formData.odd_weight_ch) + Number(formData.other_ch) + Number(formData.fuel_surcharge) +
                Number(formData.packing_ch) + Number(formData.handling_ch) + Number(formData.destination_ch) +
                Number(formData.transport_ch) + Number(formData.oda_ch) +
                Number(formData.cgst_ch) + Number(formData.sgst_ch) + Number(formData.igst_ch)
              } readOnly className="h-[22px] px-2 border border-slate-300 text-[11px] font-black bg-slate-100 cursor-not-allowed" />
            </div>

            <div className="flex gap-2 pt-3">
              <button onClick={handleSubmit} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded shadow-md transition-all hover:scale-[1.02]">
                Submit
              </button>
              <button onClick={() => window.location.reload()} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded shadow-md transition-all hover:scale-[1.02]">
                New
              </button>
            </div>
          </div>
      </div>

    </div>
  );
}

export default AddUnifiedShipmentForm;
