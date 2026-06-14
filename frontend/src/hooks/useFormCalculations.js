/**
 * useFormCalculations.js — All derived-value computations.
 *
 * Handles: fuel surcharge from freight×percentage, weight rollups from
 * packages, sub-total / grand-total summation, GST calculation,
 * handleChange (field change with side effects), handleArrayChange,
 * addArrayItem, removeArrayItem.
 */
import { useEffect } from 'react';
import { calcVolumetricWt, calcChargeableWt, roundToHalfKg, isDomesticCountry } from '../utils/weight';

// ── GST helpers (module-private) ──

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

// ── Reactive calculation hooks ──

/**
 * Recalculates fuel surcharge whenever freight charge or fuel % changes.
 */
export function useFuelSurchargeCalc({ formData, fuelPricePct, setFormData }) {
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
}

/**
 * Rolls up per-package weights into the top-level totals.
 */
export function useWeightRollup({ formData, setFormData }) {
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
}

/**
 * Sums all charge fields into sub_total and grand_total.
 */
export function useChargesTotal({ formData, setFormData }) {
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
}

/**
 * Recalculates GST (CGST + SGST) from sub_total and active GST rates.
 */
export function useGstCalc({ formData, selectedCustomerId, customers, setFormData }) {
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
}

// ── Field-change handlers ──

/**
 * Returns the core field-change handlers: handleChange, handleArrayChange,
 * addArrayItem, removeArrayItem.
 */
export function createFieldHandlers({ setFormData, setSelectedCustomerId, setShipperSearch, setShipmentType }) {

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const isSelect = e.target.tagName === 'SELECT';
    
    setFormData(prev => {
        let newData = {
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' || isSelect ? value : value.toUpperCase())
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

        if (name === 'product' && value.toUpperCase() === 'DOCUMENTS') {
            newData.shipment_value = '';
            newData.invoice_date = '';
            newData.invoice_no = '';
            newData.eway_bill_no = '';
            newData.content = '';
        }

        if (name === 'mode' || name === 'cft') {
            const currentMode = name === 'mode' ? value : prev.mode;
            const currentCft = name === 'cft' ? value : prev.cft;
            
            newData.packages = prev.packages.map(pkg => {
                const l = parseFloat(pkg.length) || 0;
                const b = parseFloat(pkg.breadth) || 0;
                const h = parseFloat(pkg.height) || 0;
                const act = parseFloat(pkg.actual_wt) || 0;
                const volWt = calcVolumetricWt(l, b, h, currentMode, currentCft);
                return {
                    ...pkg,
                    vol_wt: volWt,
                    chargeable_wt: calcChargeableWt(act, volWt)
                };
            });
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
                
                newArray[index].vol_wt = calcVolumetricWt(l, b, h, prev.mode, prev.cft);
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

  return { handleChange, handleArrayChange, addArrayItem, removeArrayItem };
}
