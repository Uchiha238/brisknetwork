import { useState, useEffect } from 'react';
import { api, getCompanies, getStates, getCountries, getModes, getBranches } from '../services/api';
import { calcVolumetricWt, calcChargeableWt, roundToHalfKg, isDomesticCountry } from '../utils/weight';
import { getCountryCallingCode } from '../components/shared/FormField';


const parseGstDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return new Date(dateStr);
    } else {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }
  return new Date(dateStr);
};

const getActiveGstRates = (bookingDate) => {
  const defaultMock = [
    { sr: 1, from: '2026-04-01', to: '2027-03-31', cgst: '9.00', sgst: '9.00' },
  ];
  const saved = localStorage.getItem('om-courier-gst-settings');
  let records = defaultMock;
  if (saved) {
    try {
      records = JSON.parse(saved);
    } catch (e) {
      records = defaultMock;
    }
  }
  const date = new Date(bookingDate);
  
  if (isNaN(date.getTime())) {
    return { cgst: 9, sgst: 9 };
  }
  
  date.setHours(0, 0, 0, 0);
  
  for (const r of records) {
    const fromDate = parseGstDate(r.from);
    const toDate = parseGstDate(r.to);
    if (fromDate && toDate) {
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (date >= fromDate && date <= toDate) {
        return {
          cgst: parseFloat(r.cgst) || 0,
          sgst: parseFloat(r.sgst) || 0
        };
      }
    }
  }
  return { cgst: 9, sgst: 9 };
};

export function useUnifiedShipmentForm(initialType = 'domestic', editingShipmentId = null) {
  const [shipmentType, setShipmentType] = useState(initialType);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedConsigneeId, setSelectedConsigneeId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [shipperSearch, setShipperSearch] = useState('');
  const [consigneeSearch, setConsigneeSearch] = useState('');
  const [showShipperSuggestions, setShowShipperSuggestions] = useState(false);
  const [showConsigneeSuggestions, setShowConsigneeSuggestions] = useState(false);
  const [lastFetchedRateKey, setLastFetchedRateKey] = useState('');
  const [lastFetchedFuelKey, setLastFetchedFuelKey] = useState('');
  const [fuelPricePct, setFuelPricePct] = useState(0);
  const [formData, setFormData] = useState({
    booking_company: '',
    airway_no: (initialType === 'domestic' ? 'DOM' : 'INT') + Math.floor(100000 + Math.random() * 900000),
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
    grand_total: 0,

    // Invoice
    create_invoice: false,
    invoice_type: 'INVOICE',
    note: 'GIFT',
    items: [{ box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, unit_rate: 0, amount: 0 }],

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
    api.getCustomers()
      .then(data => {
        setCustomers(data);
      })
      .catch(err => console.error('Fetch customers error:', err));

    getCompanies()
      .then(data => {
        setCompanies(data);
        if (data.length > 0) {
            setFormData(prev => ({ ...prev, booking_company: data[0].company_name }));
        }
      })
      .catch(err => console.error('Fetch companies error:', err));

    getStates()
      .then(data => setMasters(prev => ({ ...prev, states: data })))
      .catch(err => console.error(err));

    getCountries()
      .then(data => setMasters(prev => ({ ...prev, countries: data })))
      .catch(err => console.error(err));

    getModes()
      .then(data => setMasters(prev => ({ ...prev, modes: data })))
      .catch(err => console.error(err));

    getBranches()
      .then(data => setMasters(prev => ({ ...prev, branches: data })))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (editingShipmentId) return;

    setFormData(prev => {
      const currentNo = prev.airway_no || '';
      const digits = currentNo.replace(/^\D+/, '') || Math.floor(100000 + Math.random() * 900000).toString();
      const prefix = shipmentType === 'domestic' ? 'DOM' : 'INT';
      return {
        ...prev,
        airway_no: prefix + digits
      };
    });
  }, [shipmentType, editingShipmentId]);

  useEffect(() => {
    if (!editingShipmentId) return;

    api.getShipment(editingShipmentId)
      .then(res => {
        if (res && res.success && res.shipment) {
          const s = res.shipment;
          
          setShipmentType(s.type || 'domestic');
          
          if (s.customer_id) {
            setSelectedCustomerId(s.customer_id.toString());
            const cust = customers.find(c => c.id.toString() === s.customer_id.toString());
            if (cust) {
              setShipperSearch(cust.name || cust.parent_company || '');
            } else {
              setShipperSearch(s.shipper_name || '');
            }
          }
          
          setConsigneeSearch(s.consignee_name || '');
          
          setFormData(prev => ({
            ...prev,
            booking_company: s.booking_company || prev.booking_company,
            airway_no: s.airway_no || '',
            email: s.shipper_email || s.email || prev.email,
            payment_mode: (s.bill_type || 'CASH').toUpperCase(),
            contact_no: s.shipper_phone || s.contact_no || prev.contact_no,
            account_code: s.account_code || '',
            origin_hub: s.origin_hub || 'MUMBAI',
            origin_zone: s.origin_zone || '',
            destination: s.destination || (s.type === 'domestic' ? s.consignee_city : s.consignee_country) || '',
            dest_zone: s.dest_zone || '',
            product: s.product || '',
            booking_date: s.booking_date || '',
            booking_time: s.booking_time || '',
            usps_number: s.usps_number || '',
            forward_no: s.forward_no || '',
            eway_bill_no: s.eway_bill_no || '',
            service: s.service || '',
            mode: s.mode || '',
            duty: s.duty || '',
            ref_no: s.ref_no || '',
            shipment_value: s.shipment_value ?? '',
            currency: s.currency || 'INR',
            invoice_date: s.invoice_date || '',
            invoice_no: s.invoice_no || '',
            content: s.description || s.content || '',
            
            // Shipper Info
            shipper_code: s.shipper_code || '',
            shipper_company: s.shipper_company || '',
            shipper_name: s.shipper_name || '',
            shipper_address1: s.shipper_address1 || '',
            shipper_address2: s.shipper_address2 || '',
            shipper_address3: s.shipper_address3 || '',
            shipper_zip: s.shipper_zip || '',
            shipper_city: s.shipper_city || '',
            shipper_state: s.shipper_state || '',
            shipper_zone: s.shipper_zone || '',
            shipper_country: s.shipper_country || 'INDIA',
            shipper_phone: s.shipper_phone || '',
            shipper_email: s.shipper_email || '',
            shipper_kyc_type: s.shipper_kyc_type || 'PAN CARD',
            shipper_kyc_no: s.shipper_kyc_no || '',
            
            // Consignee Info
            consignee_code: s.consignee_code || '',
            consignee_company: s.consignee_company || '',
            consignee_name: s.consignee_name || '',
            consignee_address1: s.consignee_address1 || '',
            consignee_address2: s.consignee_address2 || '',
            consignee_address3: s.consignee_address3 || '',
            consignee_zip: s.consignee_zip || '',
            consignee_city: s.consignee_city || '',
            consignee_state: s.consignee_state || '',
            consignee_zone: s.consignee_zone || '',
            consignee_country: s.consignee_country || 'INDIA',
            consignee_phone: s.consignee_phone || '',
            consignee_email: s.consignee_email || '',
            
            // Weights
            pcs: s.pcs || 1,
            actual_weight: s.actual_weight || 0,
            volumetric_weight: s.volumetric_weight || 0,
            chargeable_weight: s.chargeable_weight || 0,
            packages: s.packages && s.packages.length > 0 
              ? s.packages.map(p => ({
                  box_no: p.box_no || '1',
                  actual_wt: p.actual_wt || 0,
                  length: p.length || 0,
                  breadth: p.breadth || 0,
                  height: p.height || 0,
                  vol_wt: p.vol_wt || 0,
                  chargeable_wt: p.chargeable_wt || 0
                }))
              : [{ box_no: '1', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 }],
              
            // Billing
            freight_ch: s.freight_charges || 0,
            pickup_ch: s.pickup_ch || 0,
            cod_ch: s.cod_ch || 0,
            other_ch: s.other_ch || 0,
            fuel_surcharge: s.fuel_amount || 0,
            transport_ch: s.transport_ch || 0,
            remote_area_ch: s.remote_area_ch || 0,
            awb_ch: s.awb_ch || 0,
            ras_ch: s.ras_ch || 0,
            ers_ch: s.ers_ch || 0,
            odd_dimension_ch: s.odd_dimension_ch || 0,
            address_change_ch: s.address_change_ch || 0,
            dg_ch: s.dg_ch || 0,
            import_duty_ch: s.import_duty_ch || 0,
            adc_noc_ch: s.adc_noc_ch || 0,
            electronic_item_ch: s.electronic_item_ch || 0,
            odd_weight_ch: s.odd_weight_ch || 0,
            packing_ch: s.packing_ch || 0,
            handling_ch: s.handling_ch || 0,
            
            destination_ch: s.destination_ch || 0,
            clearance_ch: s.clearance_ch || 0,
            ess_ch: s.ess_ch || 0,
            oda_ch: s.oda_ch || 0,
            ddp_ch: s.ddp_ch || 0,
            
            charges_date: s.charges_date || '',
            
            cgst_ch: s.gst_amount / 2 || 0,
            sgst_ch: s.gst_amount / 2 || 0,
            
            grand_total: s.total_charges || 0,
            
            items: s.items && s.items.length > 0
              ? s.items.map(it => ({
                  box_no: it.box_no || '1',
                  sr_no: it.sr_no || 1,
                  description: it.description || '',
                  hs_code: it.hs_code || '',
                  unit_type: it.unit_type || 'PCS',
                  quantity: it.quantity || 1,
                  unit_weight: it.unit_weight || 0,
                  unit_rate: it.unit_rate || 0,
                  amount: it.amount || 0
                }))
              : [{ box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, unit_rate: 0, amount: 0 }],
            
            branch: s.branch || '',
            eway_bill_no: s.eway_bill_no || ''
          }));
        }
      })
      .catch(err => console.error("Error loading shipment details:", err));
  }, [editingShipmentId, customers]);

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

  useEffect(() => {
    const country = formData.consignee_country;
    const isDomestic = isDomesticCountry(country);
    
    if (!isDomestic) {
      let courier = 'DHL';
      const serviceUpper = (formData.service || '').toUpperCase();
      if (serviceUpper.includes('DHL')) {
          courier = 'DHL';
      } else if (serviceUpper.includes('FEDEX')) {
          courier = 'FEDEX';
      } else if (serviceUpper.includes('UPS')) {
          courier = 'UPS';
      } else if (serviceUpper.includes('ARAMEX')) {
          courier = 'ARAMEX';
      }
      
      const mode = formData.mode || 'EXPORT';
      
      if (country && courier) {
        fetch(`/api/international-zone?country=${encodeURIComponent(country)}&courier=${encodeURIComponent(courier)}&type=${encodeURIComponent(mode)}`)
          .then(res => {
            if (!res.ok) throw new Error("Zone not found");
            return res.json();
          })
          .then(data => {
            if (data && data.success && data.zone) {
              setFormData(prev => ({
                ...prev,
                consignee_zone: data.zone.toString()
              }));
            }
          })
          .catch(err => {
            console.error("Error fetching international zone:", err);
          });
      }
    }
  }, [formData.consignee_country, formData.service, formData.mode]);

  useEffect(() => {
    const code = getCountryCallingCode(formData.shipper_country);
    if (code) {
      setFormData(prev => {
        const currentPhone = prev.shipper_phone || '';
        if (currentPhone.startsWith(code)) return prev;
        const cleanPhone = currentPhone.replace(/^\+\d+/, '');
        return {
          ...prev,
          shipper_phone: code + cleanPhone
        };
      });
    }
  }, [formData.shipper_country]);

  useEffect(() => {
    const code = getCountryCallingCode(formData.consignee_country);
    if (code) {
      setFormData(prev => {
        const currentPhone = prev.consignee_phone || '';
        if (currentPhone.startsWith(code)) return prev;
        const cleanPhone = currentPhone.replace(/^\+\d+/, '');
        return {
          ...prev,
          consignee_phone: code + cleanPhone
        };
      });
    }
  }, [formData.consignee_country]);

  useEffect(() => {
    const isDomestic = isDomesticCountry(formData.consignee_country);
    if (isDomestic) return;
    
    const zone = formData.consignee_zone;
    const weight = formData.chargeable_weight;
    const mode = formData.mode || 'EXPORT';
    
    let courier = '';
    const serviceUpper = (formData.service || '').toUpperCase();
    if (serviceUpper.includes('DHL')) {
        courier = 'DHL';
    } else if (serviceUpper.includes('FEDEX')) {
        courier = 'FEDEX';
    } else if (serviceUpper.includes('UPS')) {
        courier = 'UPS';
    } else if (serviceUpper.includes('ARAMEX')) {
        courier = 'ARAMEX';
    }
    
    if (courier !== 'DHL') return;

    if (weight > 2.0 && formData.product !== 'PARCEL') {
      setFormData(prev => ({ ...prev, product: 'PARCEL' }));
      return;
    } else if (weight > 0 && weight <= 2.0 && (!formData.product || formData.product === 'SELECT..')) {
      setFormData(prev => ({ ...prev, product: 'DOCUMENTS' }));
      return;
    }
    
    if (zone && weight > 0 && courier) {
      const currentKey = `${courier}-${zone}-${weight}-${mode}`;
      if (currentKey === lastFetchedRateKey) return;
      
      fetch(`/api/international-rate?courier=${encodeURIComponent(courier)}&zone=${encodeURIComponent(zone)}&weight=${encodeURIComponent(weight)}`)
        .then(res => {
          if (!res.ok) throw new Error("Rate not found");
          return res.json();
        })
        .then(data => {
          if (data && data.success && data.rate !== undefined) {
            setFormData(prev => ({
              ...prev,
              freight_ch: data.rate
            }));
            setLastFetchedRateKey(currentKey);
          }
        })
        .catch(err => {
          console.error("Error auto-calculating international rate:", err);
        });
    }
  }, [formData.consignee_zone, formData.chargeable_weight, formData.service, formData.mode, formData.product, lastFetchedRateKey]);

  // Fetch active fuel price percentage from backend
  useEffect(() => {
    if (!selectedCustomerId || !formData.service || !formData.booking_date) {
      setFuelPricePct(0);
      return;
    }

    const customer = customers.find(c => c.id.toString() === selectedCustomerId.toString());
    if (!customer) return;

    const fuelGroupName = shipmentType === 'domestic' 
      ? customer.domestic_fuel_group 
      : customer.international_fuel_group;

    if (!fuelGroupName) {
      setFuelPricePct(0);
      return;
    }

    let courier = 'All';
    const serviceUpper = (formData.service || '').toUpperCase();
    if (serviceUpper.includes('DHL')) {
      courier = 'DHL';
    } else if (serviceUpper.includes('FEDEX')) {
      courier = 'Fedex';
    } else if (serviceUpper.includes('UPS')) {
      courier = 'UPS';
    } else if (serviceUpper.includes('ARAMEX')) {
      courier = 'Aramex';
    } else if (serviceUpper.includes('TNT')) {
      courier = 'TNT';
    } else if (serviceUpper.includes('TRACKON')) {
      courier = 'TRACKON';
    } else if (serviceUpper.includes('BLUEDART')) {
      courier = 'BLUEDART';
    } else if (serviceUpper.includes('DELHIVERY')) {
      courier = 'Delhivery';
    } else if (serviceUpper.includes('DTDC')) {
      courier = 'DTDC';
    } else if (serviceUpper.includes('OM COURIER')) {
      courier = 'OM COURIER';
    }

    const currentKey = `${fuelGroupName}-${shipmentType}-${courier}-${formData.booking_date}`;
    if (currentKey === lastFetchedFuelKey) return;

    const url = `http://localhost:5000/api/fuel-entries/lookup?fuel_group_name=${encodeURIComponent(fuelGroupName)}&company_type=${encodeURIComponent(shipmentType)}&courier=${encodeURIComponent(courier)}&booking_date=${encodeURIComponent(formData.booking_date)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          const pct = parseFloat(data.fuel_price_pct) || 0;
          setFuelPricePct(pct);
          setLastFetchedFuelKey(currentKey);
        }
      })
      .catch(err => console.error("Error looking up fuel price:", err));

  }, [selectedCustomerId, formData.service, formData.booking_date, shipmentType, customers, lastFetchedFuelKey]);

  // Calculate fuel surcharge amount locally when freight charge or percentage changes
  useEffect(() => {
    const freight = parseFloat(formData.freight_ch) || 0;
    const surcharge = parseFloat(((freight * fuelPricePct) / 100).toFixed(2));
    setFormData(prev => {
      if (prev.fuel_surcharge !== surcharge) {
        return { ...prev, fuel_surcharge: surcharge };
      }
      return prev;
    });
  }, [formData.freight_ch, fuelPricePct]);

  useEffect(() => {
    const totalActualWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.actual_wt) || 0), 0);
    const totalVolWt = formData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.vol_wt) || 0), 0);
    const rawTotalChargeableWt = Math.max(totalActualWt, totalVolWt);
    const finalChargeableWt = roundToHalfKg(rawTotalChargeableWt);

    setFormData(prev => ({
        ...prev,
        actual_weight: totalActualWt,
        volumetric_weight: parseFloat(totalVolWt.toFixed(2)),
        chargeable_weight: finalChargeableWt
    }));
  }, [formData.packages]);

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

    const taxes = [formData.cgst_ch, formData.sgst_ch].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
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
    formData.ddp_ch, formData.cgst_ch, formData.sgst_ch
  ]);

  useEffect(() => {
    const customer = customers.find(c => c.id.toString() === selectedCustomerId.toString());
    const isGstApplicable = !customer || customer.gst_charges === undefined || customer.gst_charges === 'Yes' || customer.gst_charges === 1 || customer.gst_charges === true;
    
    if (!isGstApplicable) {
      setFormData(prev => {
        if (prev.cgst_ch !== 0 || prev.sgst_ch !== 0) {
          return { ...prev, cgst_ch: 0, sgst_ch: 0 };
        }
        return prev;
      });
      return;
    }
    
    const { cgst, sgst } = getActiveGstRates(formData.booking_date);
    const subTotal = parseFloat(formData.sub_total) || 0;
    
    const cgstAmount = parseFloat(((subTotal * cgst) / 100).toFixed(2));
    const sgstAmount = parseFloat(((subTotal * sgst) / 100).toFixed(2));
    
    setFormData(prev => {
      if (prev.cgst_ch !== cgstAmount || prev.sgst_ch !== sgstAmount) {
        return {
          ...prev,
          cgst_ch: cgstAmount,
          sgst_ch: sgstAmount
        };
      }
      return prev;
    });
  }, [formData.sub_total, formData.booking_date, selectedCustomerId, customers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
        let newData = {
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? value : value.toUpperCase())
        };

        if (name === 'payment_mode') {
            const newPayMode = value.toUpperCase();
            newData.bill_type = newPayMode;
            
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
                            
                            if (!isShipper) {
                                updateObj['consignee_country'] = 'INDIA';
                                updateObj['destination'] = data.data.city ? data.data.city.toUpperCase() : 'INDIA';
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

        if (name === 'shipper_zip' || name === 'consignee_zip') {
            const isShipper = name === 'shipper_zip';
            const country = isShipper ? prev.shipper_country : prev.consignee_country;
            const isUS = country && (
                country.toUpperCase() === 'UNITED STATES' || 
                country.toUpperCase() === 'USA' || 
                country.toUpperCase() === 'US' || 
                country.toUpperCase() === 'UNITED STATES OF AMERICA'
            );
            
            if (isUS && /^\d{5}$/.test(value)) {
                fetch(`https://api.zippopotam.us/us/${value}`)
                    .then(res => {
                        if (!res.ok) throw new Error("Zip code not found");
                        return res.json();
                    })
                    .then(data => {
                        if (data && data.places && data.places.length > 0) {
                            const place = data.places[0];
                            setFormData(current => ({
                                ...current,
                                [isShipper ? 'shipper_city' : 'consignee_city']: place['place name'] ? place['place name'].toUpperCase() : '',
                                [isShipper ? 'shipper_state' : 'consignee_state']: place['state'] ? place['state'].toUpperCase() : '',
                            }));
                        }
                    })
                    .catch(err => console.error("Error fetching US zip code data:", err));
            }
        }

        if (name === 'consignee_country') {
            const isDomestic = isDomesticCountry(value);
            setShipmentType(isDomestic ? 'domestic' : 'international');
            newData.destination = (isDomestic ? prev.consignee_city : value.toUpperCase());
        }

        if (name === 'consignee_city') {
            const isDomestic = isDomesticCountry(prev.consignee_country);
            if (isDomestic) {
                newData.destination = value.toUpperCase();
            }
        }

        if (name === 'pcs') {
            const newPcs = parseInt(value) || 1;
            const currentPackages = [...prev.packages];
            
            if (newPcs > currentPackages.length) {
                const rowsToAdd = newPcs - currentPackages.length;
                for (let i = 0; i < rowsToAdd; i++) {
                    currentPackages.push({ 
                        box_no: (currentPackages.length + 1).toString(), 
                        actual_wt: 0, length: 0, breadth: 0, height: 0, 
                        vol_wt: 0, chargeable_wt: 0 
                    });
                }
            } else if (newPcs < currentPackages.length && newPcs > 0) {
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
        
        if (arrayName === 'packages') {
            if (['length', 'breadth', 'height'].includes(field)) {
                const l = parseFloat(newArray[index].length) || 0;
                const b = parseFloat(newArray[index].breadth) || 0;
                const h = parseFloat(newArray[index].height) || 0;
                
                newArray[index].vol_wt = calcVolumetricWt(l, b, h);
                newArray[index].chargeable_wt = calcChargeableWt(newArray[index].actual_wt, newArray[index].vol_wt);
            }
            if (field === 'actual_wt') {
                newArray[index].chargeable_wt = calcChargeableWt(parseFloat(value) || 0, newArray[index].vol_wt);
            }
        }

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

  const generateCustomerCode = (customerList, isCredit = true) => {
      if (isCredit) {
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
      } else {
          let attempts = 0;
          let code = '';
          do {
              const suffix = Math.floor(100 + Math.random() * 900).toString();
              code = `CSH${Date.now().toString().slice(-6)}${suffix}`;
              attempts++;
          } while (customerList.some(c => c.code === code) && attempts < 20);
          return code;
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.consignee_email && formData.consignee_email.trim() !== '') {
      const emailVal = formData.consignee_email.trim().toUpperCase();
      const gmailRegex = /^[A-Z0-9._%+-]+@GMAIL\.COM$/;
      if (!gmailRegex.test(emailVal)) {
        alert("Consignee Email must be a valid @GMAIL.COM address.");
        return;
      }
    }
    
    let customerIdToUse = selectedCustomerId;
    let currentCustomers = [...customers];

    if (formData.shipper_save) {
        if (!formData.shipper_name || !formData.shipper_phone) {
            alert("Please provide Shipper Name and Phone to save as a new customer.");
            return;
        }

        const isCredit = (formData.payment_mode || 'Cash').toLowerCase() === 'credit';
        const generatedCode = generateCustomerCode(currentCustomers, isCredit);
        
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
                const updatedCustomers = await api.getCustomers();
                currentCustomers = updatedCustomers;
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

    if (formData.shipper_update && selectedCustomerId) {
        const existingShipper = currentCustomers.find(c => c.id.toString() === selectedCustomerId.toString());
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

    if (formData.consignee_save) {
        if (!formData.consignee_name || !formData.consignee_phone) {
            alert("Please provide Consignee Name and Phone to save as a new customer.");
            return;
        }

        const isCredit = (formData.payment_mode || 'Cash').toLowerCase() === 'credit';
        const generatedCode = generateCustomerCode(currentCustomers, isCredit);
        
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
                const updatedCustomers = await api.getCustomers();
                currentCustomers = updatedCustomers;
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

    if (formData.consignee_update && selectedConsigneeId) {
        const existingConsignee = currentCustomers.find(c => c.id.toString() === selectedConsigneeId.toString());
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
        destination: (shipmentType === 'domestic' ? formData.consignee_city : formData.consignee_country) || 'N/A',
        customer_id: customerIdToUse, 
        user_id: 1, 
        type: shipmentType,
        bill_amount: parseFloat(formData.freight_ch) || 0,
        fuel_amount: parseFloat(formData.fuel_surcharge) || 0,
        gst_amount: (parseFloat(formData.cgst_ch) || 0) + (parseFloat(formData.sgst_ch) || 0),
        total_charges: parseFloat(formData.grand_total) || 0
    };
    
    try {
      let data;
      if (editingShipmentId) {
        data = await api.updateShipment(editingShipmentId, payload);
      } else {
        data = await api.createShipment(payload);
      }

      if (data.success) {
        if (editingShipmentId) {
          alert(`${shipmentType.toUpperCase()} AWB Updated Successfully! AWB: ${formData.airway_no}`);
        } else {
          alert(`${shipmentType.toUpperCase()} AWB Created Successfully! AWB: ${formData.airway_no}`);
        }
        window.location.reload();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save shipment. Please check the backend.');
    }
  };

  const filteredShipperCustomers = customers.filter(cust => {
      const currentPayMode = formData.payment_mode || 'CASH';
      const custPayMode = cust.payment_type || 'Credit';
      
      const matchPayMode = custPayMode.toLowerCase() === currentPayMode.toLowerCase();
      if (!matchPayMode) return false;

      if (!shipperSearch) return true;
      const q = shipperSearch.toLowerCase();
      return (
          (cust.name && cust.name.toLowerCase().includes(q)) || 
          (cust.code && cust.code.toLowerCase().includes(q)) ||
          (cust.parent_company && cust.parent_company.toLowerCase().includes(q))
      );
  });

  const filteredConsigneeCustomers = customers.filter(cust => {
      if (!consigneeSearch) return true;
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
          bill_type: custPayMode,
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
          shipper_kyc_no: customer.gst_no || ''
      }));
  };

  const handleSelectConsignee = (customer) => {
      if (!customer) return;
      setSelectedConsigneeId(customer.id);
      setConsigneeSearch(customer.name || customer.parent_company || '');
      setFormData(prev => {
          const isDomestic = isDomesticCountry(prev.consignee_country);
          return {
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
              destination: (isDomestic ? customer.city : prev.consignee_country) || ''
          };
      });
  };

  const selectedCompany = companies.find(c => c.company_name === formData.booking_company);
  const filteredBranches = selectedCompany 
    ? masters.branches.filter(b => b.company_id === selectedCompany.id)
    : [];

  return {
    shipmentType, setShipmentType,
    customers, setCustomers,
    selectedCustomerId, setSelectedCustomerId,
    selectedConsigneeId, setSelectedConsigneeId,
    companies, setCompanies,
    shipperSearch, setShipperSearch,
    consigneeSearch, setConsigneeSearch,
    showShipperSuggestions, setShowShipperSuggestions,
    showConsigneeSuggestions, setShowConsigneeSuggestions,
    formData, setFormData,
    masters, setMasters,
    filteredBranches,
    filteredShipperCustomers,
    filteredConsigneeCustomers,
    handleChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleSelectShipper,
    handleSelectConsignee,
    handleSubmit
  };
}
