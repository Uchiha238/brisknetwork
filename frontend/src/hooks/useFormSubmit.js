/**
 * useFormSubmit.js — Submit handler and shipper/consignee selection.
 *
 * Handles: email validation, shipper save/update, consignee save/update,
 * customer code generation, payload construction, and the actual
 * createShipment / updateShipment API call.
 * Also: handleSelectShipper, handleSelectConsignee, and customer filtering.
 */
import { api } from '../services/api';
import { isDomesticCountry } from '../utils/weight';

// ── Customer code generation ──

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

// ── Submit handler factory ──

export function createSubmitHandler({
  formData, shipmentType, selectedCustomerId, selectedConsigneeId,
  customers, editingShipmentId,
  setCustomers, setSelectedCustomerId
}) {

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

  return handleSubmit;
}

// ── Shipper / Consignee selection handlers ──

export function createShipperConsigneeHandlers({
  customers, formData,
  setSelectedCustomerId, setSelectedConsigneeId,
  setShipperSearch, setConsigneeSearch, setFormData,
  shipperSearch, consigneeSearch
}) {

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

  return {
    filteredShipperCustomers,
    filteredConsigneeCustomers,
    handleSelectShipper,
    handleSelectConsignee
  };
}
