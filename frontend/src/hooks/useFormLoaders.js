/**
 * useFormLoaders.js — All API calls that run when the form opens.
 *
 * Handles: initial master data fetching (states, countries, modes, branches,
 * customers, companies), editing shipment hydration, city lookups by state,
 * international zone/rate lookups, fuel price lookups, and country calling
 * code auto-prefixing.
 */
import { useEffect } from 'react';
import { api, getCompanies, getStates, getCountries, getModes, getBranches } from '../services/api';
import { isDomesticCountry, calcVolumetricWt, calcChargeableWt } from '../utils/weight';
import { getCountryCallingCode } from '../components/shared/FormField';

/**
 * Loads initial master data (customers, companies, states, countries, modes, branches).
 */
export function useInitialLoaders({ setCustomers, setCompanies, setFormData, setMasters }) {
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
}

/**
 * Keeps the AWB prefix in sync with the shipment type (DOM/INT).
 */
export function useAwbPrefixSync({ shipmentType, editingShipmentId, setFormData }) {
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
}

/**
 * Hydrates the form from an existing shipment record when editing.
 */
export function useEditShipmentLoader({ editingShipmentId, customers, setShipmentType, setSelectedCustomerId, setShipperSearch, setConsigneeSearch, setFormData }) {
  useEffect(() => {
    if (!editingShipmentId) return;

    api.getShipment(editingShipmentId)
      .then(res => {
        if (res && res.success && res.shipment) {
          const s = res.shipment;
          
          setShipmentType(s.type || 'domestic');
          
          let cust = null;
          if (s.customer_id) {
            setSelectedCustomerId(s.customer_id.toString());
            cust = customers.find(c => c.id.toString() === s.customer_id.toString());
            if (cust) {
              setShipperSearch(cust.name || cust.parent_company || '');
            } else {
              setShipperSearch(s.shipper_name || '');
            }
          }
          
          setConsigneeSearch(s.consignee_name || '');
          
          setFormData(prev => {
            const customerCft = cust ? (cust.cft || '10') : '10';
            const updatedPackages = s.packages && s.packages.length > 0 
              ? s.packages.map(p => {
                  const l = p.length || 0;
                  const b = p.breadth || 0;
                  const h = p.height || 0;
                  const act = p.actual_wt || 0;
                  const volWt = calcVolumetricWt(l, b, h, s.mode || '', customerCft);
                  return {
                    box_no: p.box_no || '1',
                    actual_wt: act,
                    length: l,
                    breadth: b,
                    height: h,
                    vol_wt: volWt,
                    chargeable_wt: calcChargeableWt(act, volWt)
                  };
                })
              : [{ box_no: '1', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 }];

            return {
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
              cft: customerCft,
              packages: updatedPackages,
              
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
            
            branch: s.branch || ''
          };
        });
      }
      })
      .catch(err => console.error("Error loading shipment details:", err));
  }, [editingShipmentId, customers]);
}

/**
 * Fetches cities when shipper or consignee state changes.
 */
export function useCityLoaders({ formData, masters, setMasters }) {
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
}

/**
 * Auto-looks up the international zone when consignee country / service / mode changes.
 */
export function useInternationalZoneLookup({ formData, setFormData }) {
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
      const bookingDate = formData.booking_date || '';
      
      if (country && courier) {
        fetch(`/api/international-zone?country=${encodeURIComponent(country)}&courier=${encodeURIComponent(courier)}&type=${encodeURIComponent(mode)}&booking_date=${encodeURIComponent(bookingDate)}`)
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
  }, [formData.consignee_country, formData.service, formData.mode, formData.booking_date]);
}

/**
 * Auto-prefixes shipper/consignee phone numbers with the country calling code.
 */
export function useCallingCodeSync({ formData, setFormData }) {
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
}

/**
 * Auto-fetches international freight rate when zone/weight/service/mode changes.
 */
export function useInternationalRateLookup({ formData, setFormData, lastFetchedRateKey, setLastFetchedRateKey }) {
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
      const product = formData.product || 'DOCUMENTS';
      const bookingDate = formData.booking_date || '';
      const currentKey = `${courier}-${zone}-${weight}-${mode}-${product}-${bookingDate}`;
      if (currentKey === lastFetchedRateKey) return;
      
      fetch(`/api/international-rate?courier=${encodeURIComponent(courier)}&zone=${encodeURIComponent(zone)}&weight=${encodeURIComponent(weight)}&product=${encodeURIComponent(product)}&mode=${encodeURIComponent(mode)}&booking_date=${encodeURIComponent(bookingDate)}`)
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
  }, [formData.consignee_zone, formData.chargeable_weight, formData.service, formData.mode, formData.product, formData.booking_date, lastFetchedRateKey]);
}

/**
 * Looks up fuel price percentage from the backend based on customer, service, and date.
 */
export function useFuelPriceLookup({ selectedCustomerId, formData, shipmentType, customers, lastFetchedFuelKey, setLastFetchedFuelKey, setFuelPricePct }) {
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
}
