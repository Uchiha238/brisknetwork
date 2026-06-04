import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Save, Plus, Search, MapPin, User, Package, Clock, ShieldCheck, FileText, RotateCcw, Trash2, Globe, Home } from "lucide-react"
import { api } from '../../services/api';

import { SectionHeader, FormField } from './awb/FormField';
import { AwbInfoSection } from './awb/AwbInfoSection';
import { ShipperInfoSection } from './awb/ShipperInfoSection';
import { ConsigneeInfoSection } from './awb/ConsigneeInfoSection';
import { WeightsDimensionsSection } from './awb/WeightsDimensionsSection';
import { InvoiceSection } from './awb/InvoiceSection';
import { ChargesSection } from './awb/ChargesSection';
import { FinalChargeSection } from './awb/FinalChargeSection';

export function AddUnifiedShipmentForm({ initialType = 'domestic' }) {
  const [shipmentType, setShipmentType] = useState(initialType); // 'domestic' or 'international'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedConsigneeId, setSelectedConsigneeId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [shipperSearch, setShipperSearch] = useState('');
  const [consigneeSearch, setConsigneeSearch] = useState('');
  const [showShipperSuggestions, setShowShipperSuggestions] = useState(false);
  const [showConsigneeSuggestions, setShowConsigneeSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    booking_company: '',
    airway_no: 'BRK' + Math.floor(100000 + Math.random() * 900000),
    edit_awb: false,
    email: 'OPSOMCOURIER@GMAIL.COM',
    payment_mode: 'CASH',
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
    forward_no: '',
    eway_bill_no: '',
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
    new_customer_code: '',
    branch: ''
  });

  const [masters, setMasters] = useState({
      states: [],
      shipperCities: [],
      consigneeCities: [],
      couriers: ['DHL', 'FEDEX', 'UPS', 'SELF'],
      modes: [],
      products: ['DOCUMENTS', 'PARCEL'],
      billTypes: ['PREPAID', 'COD', 'TO PAY', 'CASH', 'CREDIT'],
      forwarders: ['DHL EXPRESS', 'FEDEX PRIORITY', 'SELF'],
      countries: [],
      branches: []
  });

  useEffect(() => {
    // Automatically open native dropdowns (select and date pickers) when tabbed or focused
    const handleFocusIn = (e) => {
      if (e.target && (e.target.tagName === 'SELECT' || e.target.type === 'date')) {
        try {
          e.target.showPicker();
        } catch (err) {
          // Ignore if browser blocks or doesn't support
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);

    api.getCustomers()
      .then(data => {
        setCustomers(data);
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

    fetch('/api/branches')
      .then(res => res.json())
      .then(data => setMasters(prev => ({ ...prev, branches: data })))
      .catch(err => console.error(err));

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
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
        formData.ras_ch, formData.ers_ch, formData.odd_dimension_ch,
        formData.address_change_ch, formData.dg_ch, formData.import_duty_ch,
        formData.adc_noc_ch, formData.electronic_item_ch, formData.odd_weight_ch,
        formData.packing_ch, formData.handling_ch,
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
    formData.ras_ch, formData.ers_ch, formData.odd_dimension_ch, formData.address_change_ch,
    formData.dg_ch, formData.import_duty_ch, formData.adc_noc_ch, formData.electronic_item_ch,
    formData.odd_weight_ch, formData.packing_ch, formData.handling_ch,
    formData.destination_ch, formData.clearance_ch, formData.ess_ch, formData.oda_ch,
    formData.ddp_ch, formData.cgst_ch, formData.sgst_ch, formData.igst_ch
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
        let newData = {
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? value : value.toUpperCase())
        };

        // If pay mode is changed, always clear the shipper form
        if (name === 'payment_mode') {
            const newPayMode = value.toUpperCase(); // e.g. "CASH" or "CREDIT"
            newData.bill_type = newPayMode; // Sync billing type
            
            // Clear selected customer and shipper details
            setSelectedCustomerId('');
            setShipperSearch('');
            newData = {
                ...newData,
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
                shipper_phone: '',
                shipper_email: '',
                shipper_kyc_no: '',
                account_code: ''
            };
        }

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

  const generateCustomerCode = (customerList) => {
      const omsCodes = customerList
          .map(c => c.code)
          .filter(code => code && /^OMS\d+$/i.test(code));
      
      if (omsCodes.length === 0) {
          return 'OMS0221';
      }
      
      const numbers = omsCodes.map(code => parseInt(code.replace(/OMS/i, ''), 10));
      const maxNum = Math.max(...numbers);
      const nextNum = maxNum + 1;
      return `OMS${String(nextNum).padStart(4, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let customerIdToUse = selectedCustomerId;

    // 1. Save Shipper as a new customer if checkbox is checked
    if (formData.shipper_save) {
        if (!formData.shipper_name || !formData.shipper_phone) {
            alert("Please provide Shipper Name and Phone to save as a new customer.");
            return;
        }

        const isCredit = (formData.payment_mode || 'Cash').toLowerCase() === 'credit';
        const generatedCode = isCredit ? generateCustomerCode(customers) : `CSH${Date.now().toString().slice(-6)}`;
        
        const newCustomerData = {
            code: generatedCode,
            name: formData.shipper_name,
            phone: formData.shipper_phone,
            email: formData.shipper_email || '',
            address: formData.shipper_address1 + (formData.shipper_address2 ? `, ${formData.shipper_address2}` : '') + (formData.shipper_address3 ? `, ${formData.shipper_address3}` : ''),
            city: formData.shipper_city,
            state: formData.shipper_state,
            pincode: formData.shipper_zip,
            gst_no: formData.shipper_kyc_no || '',
            password: 'admin@brisk2026',
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
            mis_format: 'SR.No Date Consigner Consignee Destination Pincode Invoice',
            payment_type: isCredit ? 'Credit' : 'Cash'
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
                alert("Failed to save shipper customer: " + custResult.error);
                return;
            }
        } catch (err) {
            console.error("New shipper customer creation error:", err);
            alert("Error saving new shipper customer.");
            return;
        }
    }

    // 1b. Update Shipper in address book if checkbox is checked
    if (formData.shipper_update && selectedCustomerId) {
        const existingShipper = customers.find(c => c.id.toString() === selectedCustomerId.toString());
        if (existingShipper) {
            const updatedShipperData = {
                ...existingShipper,
                code: formData.shipper_code || existingShipper.code,
                name: formData.shipper_name || existingShipper.name,
                phone: formData.shipper_phone || existingShipper.phone,
                email: formData.shipper_email || existingShipper.email,
                address: formData.shipper_address1 + (formData.shipper_address2 ? `, ${formData.shipper_address2}` : '') + (formData.shipper_address3 ? `, ${formData.shipper_address3}` : ''),
                city: formData.shipper_city || existingShipper.city,
                state: formData.shipper_state || existingShipper.state,
                pincode: formData.shipper_zip || existingShipper.pincode,
                gst_no: formData.shipper_kyc_no || existingShipper.gst_no,
                parent_company: formData.shipper_company || existingShipper.parent_company,
                payment_type: (formData.payment_mode || 'Cash').toLowerCase() === 'credit' ? 'Credit' : 'Cash',
                gst_charges: existingShipper.gst_charges ? 'Yes' : 'No'
            };
            try {
                await api.updateCustomer(selectedCustomerId, updatedShipperData);
            } catch (err) {
                console.error("Error updating shipper customer:", err);
            }
        }
    }

    // 2. Save Consignee as a new customer if checkbox is checked
    if (formData.consignee_save) {
        if (!formData.consignee_name || !formData.consignee_phone) {
            alert("Please provide Consignee Name and Phone to save as a new customer.");
            return;
        }

        const isCredit = (formData.payment_mode || 'Cash').toLowerCase() === 'credit';
        const generatedCode = isCredit ? generateCustomerCode(customers) : `CSH${Date.now().toString().slice(-6)}`;
        
        const newConsigneeData = {
            code: generatedCode,
            name: formData.consignee_name,
            phone: formData.consignee_phone,
            email: formData.consignee_email || '',
            address: formData.consignee_address1 + (formData.consignee_address2 ? `, ${formData.consignee_address2}` : '') + (formData.consignee_address3 ? `, ${formData.consignee_address3}` : ''),
            city: formData.consignee_city,
            state: formData.consignee_state,
            pincode: formData.consignee_zip,
            gst_no: '',
            password: 'admin@brisk2026',
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
            mis_format: 'SR.No Date Consigner Consignee Destination Pincode Invoice',
            payment_type: isCredit ? 'Credit' : 'Cash'
        };

        try {
            const custResult = await api.createCustomer(newConsigneeData);
            if (custResult.success) {
                // Update dropdown list
                const updatedCustomers = await api.getCustomers();
                setCustomers(updatedCustomers);
            } else {
                alert("Failed to save consignee customer: " + custResult.error);
                return;
            }
        } catch (err) {
            console.error("New consignee customer creation error:", err);
            alert("Error saving new consignee customer.");
            return;
        }
    }

    // 2b. Update Consignee in address book if checkbox is checked
    if (formData.consignee_update && selectedConsigneeId) {
        const existingConsignee = customers.find(c => c.id.toString() === selectedConsigneeId.toString());
        if (existingConsignee) {
            const updatedConsigneeData = {
                ...existingConsignee,
                code: formData.consignee_code || existingConsignee.code,
                name: formData.consignee_name || existingConsignee.name,
                phone: formData.consignee_phone || existingConsignee.phone,
                email: formData.consignee_email || existingConsignee.email,
                address: formData.consignee_address1 + (formData.consignee_address2 ? `, ${formData.consignee_address2}` : '') + (formData.consignee_address3 ? `, ${formData.consignee_address3}` : ''),
                city: formData.consignee_city || existingConsignee.city,
                state: formData.consignee_state || existingConsignee.state,
                pincode: formData.consignee_zip || existingConsignee.pincode,
                parent_company: formData.consignee_company || existingConsignee.parent_company,
                gst_charges: existingConsignee.gst_charges ? 'Yes' : 'No'
            };
            try {
                await api.updateCustomer(selectedConsigneeId, updatedConsigneeData);
            } catch (err) {
                console.error("Error updating consignee customer:", err);
            }
        }
    }

    // Refresh customers list at the very end of database actions
    if (formData.shipper_save || formData.consignee_save || formData.shipper_update || formData.consignee_update) {
        try {
            const updatedCustomers = await api.getCustomers();
            setCustomers(updatedCustomers);
        } catch (err) {
            console.error("Error reloading customers master:", err);
        }
    }

    const payload = { 
        ...formData, 
        customer_id: customerIdToUse, 
        user_id: 1, 
        type: shipmentType,
        bill_amount: parseFloat(formData.freight_ch) || 0,
        fuel_amount: parseFloat(formData.fuel_surcharge) || 0,
        gst_amount: (parseFloat(formData.cgst_ch) || 0) + (parseFloat(formData.sgst_ch) || 0) + (parseFloat(formData.igst_ch) || 0),
        total_charges: parseFloat(formData.grand_total) || 0
    };
    
    try {
      const data = await api.createShipment(payload);
      if (data.success) {
        alert(`${shipmentType.toUpperCase()} AWB Created Successfully! AWB: ${formData.airway_no}`);
        window.location.reload();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save shipment. Please check the backend.');
    }
  };

  // Filter shipper search results based on shipperSearch query AND pay mode
  const filteredShipperCustomers = customers.filter(cust => {
      // Pay mode filter: Cash / Credit
      const currentPayMode = formData.payment_mode || 'CASH'; // standard uppercase
      const custPayMode = cust.payment_type || 'Credit'; // customer master default to 'Credit'
      
      const matchPayMode = custPayMode.toLowerCase() === currentPayMode.toLowerCase();
      if (!matchPayMode) return false;

      if (!shipperSearch) return true; // Show all matching pay mode if empty
      const q = shipperSearch.toLowerCase();
      return (
          (cust.name && cust.name.toLowerCase().includes(q)) || 
          (cust.code && cust.code.toLowerCase().includes(q)) ||
          (cust.parent_company && cust.parent_company.toLowerCase().includes(q))
      );
  });

  // Filter consignee search results based on consigneeSearch query (any customer from Customer Master)
  const filteredConsigneeCustomers = customers.filter(cust => {
      if (!consigneeSearch) return true; // Show all if empty
      const q = consigneeSearch.toLowerCase();
      return (
          (cust.name && cust.name.toLowerCase().includes(q)) || 
          (cust.code && cust.code.toLowerCase().includes(q)) ||
          (cust.parent_company && cust.parent_company.toLowerCase().includes(q))
      );
  });

  const handleSelectShipper = (customer) => {
      if (!customer) return;
      setSelectedCustomerId(customer.id);
      setShipperSearch(customer.name || customer.parent_company || '');
      const custPayMode = (customer.payment_type || 'Credit').toUpperCase();
      setFormData(prev => ({
          ...prev,
          payment_mode: custPayMode,
          bill_type: custPayMode, // Auto-select bill type to match pay mode (CASH or CREDIT)
          contact_no: customer.phone || prev.contact_no || '',
          account_code: customer.code || prev.account_code || '',
          shipper_code: customer.code || '',
          shipper_company: customer.parent_company || customer.name || '',
          shipper_name: customer.name || '',
          shipper_address1: customer.address || '',
          shipper_city: customer.city || '',
          shipper_state: customer.state || '',
          shipper_zip: customer.pincode || '',
          shipper_email: customer.email || '',
          shipper_phone: customer.phone || '+91',
          shipper_kyc_no: customer.gst_no || '',
      }));
  };

  const handleSelectConsignee = (customer) => {
      if (!customer) return;
      setSelectedConsigneeId(customer.id);
      setConsigneeSearch(customer.name || customer.parent_company || '');
      setFormData(prev => ({
          ...prev,
          consignee_code: customer.code || '',
          consignee_company: customer.parent_company || customer.name || '',
          consignee_name: customer.name || '',
          consignee_address1: customer.address || '',
          consignee_address2: '',
          consignee_address3: '',
          consignee_zip: customer.pincode || '',
          consignee_city: customer.city || '',
          consignee_state: customer.state || '',
          consignee_phone: customer.phone || '',
          consignee_email: customer.email || '',
      }));
  };

  const selectedCompany = companies.find(c => c.company_name === formData.booking_company);
  const filteredBranches = selectedCompany 
    ? masters.branches.filter(b => b.company_id === selectedCompany.id)
    : [];

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
        <AwbInfoSection
          formData={formData}
          handleChange={handleChange}
          companies={companies}
          filteredBranches={filteredBranches}
          shipmentType={shipmentType}
          setShipmentType={setShipmentType}
          setFormData={setFormData}
          masters={masters}
        />
        <ShipperInfoSection
          formData={formData}
          handleChange={handleChange}
          shipperSearch={shipperSearch}
          setShipperSearch={setShipperSearch}
          showShipperSuggestions={showShipperSuggestions}
          setShowShipperSuggestions={setShowShipperSuggestions}
          filteredShipperCustomers={filteredShipperCustomers}
          handleSelectShipper={handleSelectShipper}
        />
        <ConsigneeInfoSection
          formData={formData}
          handleChange={handleChange}
          consigneeSearch={consigneeSearch}
          setConsigneeSearch={setConsigneeSearch}
          showConsigneeSuggestions={showConsigneeSuggestions}
          setShowConsigneeSuggestions={setShowConsigneeSuggestions}
          filteredConsigneeCustomers={filteredConsigneeCustomers}
          handleSelectConsignee={handleSelectConsignee}
        />
      </div>

      <WeightsDimensionsSection
        formData={formData}
        handleChange={handleChange}
        handleArrayChange={handleArrayChange}
        shipmentType={shipmentType}
      />

      <InvoiceSection
        formData={formData}
        handleChange={handleChange}
      />

      {/* Invoice Items Table */}
      {formData.create_invoice && (
        <div className="mt-2 border border-slate-300 bg-white">
          <div className="bg-[#1a2f4c] text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
            Shipment Invoice Items
          </div>
          <div className="overflow-x-auto p-1">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">BOX NO.</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">SR. NO.</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">DESCRIPTION</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">HS CODE</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">UNIT TYPE</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">QUANTITY</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">UNIT WEIGHT</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">IGST</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase border border-slate-200">UNIT RATES</th>
                  <th className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase text-right border border-slate-200">AMOUNT</th>
                  <th className="px-2 py-1 w-10 border border-slate-200"></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-2 py-1 border border-slate-200">
                      <select value={item.box_no} onChange={e => handleArrayChange('items', idx, 'box_no', e.target.value)} className="w-12 h-6 text-[11px] font-bold bg-transparent outline-none">
                        {formData.packages.map(p => <option key={p.box_no} value={p.box_no}>{p.box_no}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1 text-[11px] font-bold text-slate-400 border border-slate-200">{item.sr_no}</td>
                    <td className="px-2 py-1 border border-slate-200">
                      <input value={item.description} onChange={e => handleArrayChange('items', idx, 'description', e.target.value)} placeholder="DESCRIPTION" className="w-full h-6 px-1 text-[11px] font-semibold border border-transparent hover:border-slate-200 focus:border-blue-500 rounded outline-none animate-none" />
                    </td>
                    <td className="px-2 py-1 border border-slate-200">
                      <input value={item.hs_code} onChange={e => handleArrayChange('items', idx, 'hs_code', e.target.value)} className="w-full h-6 px-1 text-[11px] font-semibold bg-transparent outline-none" />
                    </td>
                    <td className="px-2 py-1 border border-slate-200">
                      <select value={item.unit_type} onChange={e => handleArrayChange('items', idx, 'unit_type', e.target.value)} className="w-full h-6 text-[11px] font-bold bg-transparent outline-none">
                        <option>PCS</option>
                        <option>DOZ</option>
                        <option>SET</option>
                      </select>
                    </td>
                    <td className="px-2 py-1 border border-slate-200">
                      <input type="number" value={item.quantity} onChange={e => handleArrayChange('items', idx, 'quantity', parseInt(e.target.value))} className="w-16 h-6 px-1 text-[11px] font-bold text-center border border-dashed border-slate-200 rounded outline-none" />
                    </td>
                    <td className="px-2 py-1 border border-slate-200">
                      <input type="number" value={item.unit_weight} onChange={e => handleArrayChange('items', idx, 'unit_weight', parseFloat(e.target.value))} className="w-16 h-6 px-1 text-[11px] font-bold text-center rounded outline-none" />
                    </td>
                    <td className="px-2 py-1 border border-slate-200">
                      <input type="number" value={item.igst} onChange={e => handleArrayChange('items', idx, 'igst', parseFloat(e.target.value))} className="w-16 h-6 px-1 text-[11px] font-bold text-center rounded outline-none" />
                    </td>
                    <td className="px-2 py-1 border border-slate-200">
                      <input type="number" value={item.unit_rate} onChange={e => handleArrayChange('items', idx, 'unit_rate', parseFloat(e.target.value))} className="w-20 h-6 px-1 text-[11px] font-bold text-center border border-dashed border-slate-200 rounded outline-none" />
                    </td>
                    <td className="px-2 py-1 text-[11px] font-black text-slate-900 text-right border border-slate-200">{(item.amount || 0).toFixed(2)}</td>
                    <td className="px-2 py-1 text-center border border-slate-200">
                      <button onClick={() => removeArrayItem('items', idx)} className="text-red-500 hover:text-red-700 transition-colors uppercase text-[8px] font-black">REMOVE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 bg-slate-50 flex justify-between items-center border-t border-slate-200">
              <Button onClick={() => addArrayItem('items', { box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, igst: 0, unit_rate: 0, amount: 0 })} className="h-6 bg-[#65a30d] hover:bg-[#4d7c0f] text-white text-[9px] font-black uppercase shadow-md shadow-green-100 gap-1 px-2 py-0.5">
                <Plus className="h-2.5 w-2.5" /> ADD ITEM
              </Button>
              <div className="flex gap-6 px-2">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">TOTAL AMOUNT</span>
                  <span className="text-[12px] font-black text-slate-900">{formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charges & Billing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        <ChargesSection
          formData={formData}
          handleChange={handleChange}
        />
        <FinalChargeSection
          formData={formData}
          handleChange={handleChange}
          masters={masters}
          handleSubmit={handleSubmit}
        />
      </div>

    </div>
  );
}

export default AddUnifiedShipmentForm;
