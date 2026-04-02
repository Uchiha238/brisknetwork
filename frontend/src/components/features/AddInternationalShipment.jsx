import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Save, Plus, Trash2, ArrowLeft, FileText, User, Package, Calculator, Globe } from "lucide-react"

export function AddInternationalShipment({ onBack }) {
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        booking_date: new Date().toISOString().split('T')[0],
        type: 'Export',
        courier: '',
        airway_no: '',
        forward_no: '',
        forwarder: '',
        product: 'PARCEL',
        description: '',
        bill_type: 'PREPAID',
        
        // Consigner
        customer_id: '',
        consigner_name: '',
        consigner_address: '',
        consigner_pincode: '',
        consigner_state: '',
        consigner_city: '',
        consigner_phone: '',
        consigner_doc_type: 'GSTIN',
        consigner_doc_val: '',

        // Consignee
        consignee_id: '',
        consignee_save: false,
        consignee_name: '',
        consignee_company: '',
        consignee_address: '',
        consignee_city: '',
        consignee_zip: '',
        consignee_country: '',
        consignee_phone: '',
        consignee_email: '',

        // Charges
        freight: 0,
        destination_ch: 0,
        ess_ch: 0,
        oda_ch: 0,
        transport_ch: 0,
        clearance_ch: 0,
        other_ch: 0,
        ddp_ch: 0,
        fuel_ch: 0,
        charges_date: new Date().toISOString().split('T')[0],

        // Final Charge
        sub_total: 0,
        cgst_ch: 0,
        sgst_ch: 0,
        igst_ch: 0,
        grand_total: 0,
        
        packages: [{ id: Date.now(), box_no: '1', per_box_wt: 0, actual_wt: 0, l: 0, b: 0, h: 0, vol_wt: 0, chargeable_wt: 0 }]
    });

    const [masters, setMasters] = useState({
        states: [],
        cities: []
    });

    useEffect(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => setCustomers(data))
            .catch(err => console.error(err));

        fetch('/api/masters/states')
            .then(res => res.json())
            .then(data => setMasters(prev => ({ ...prev, states: data })))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (formData.consigner_state) {
            const stateObj = masters.states.find(s => s.name === formData.consigner_state);
            if (stateObj) {
                fetch(`/api/masters/cities?state_id=${stateObj.id}`)
                    .then(res => res.json())
                    .then(data => setMasters(prev => ({ ...prev, cities: data })))
                    .catch(err => console.error(err));
            }
        }
    }, [formData.consigner_state, masters.states]);

    useEffect(() => {
        const subTotal = [
            formData.freight, formData.destination_ch, formData.ess_ch, 
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
        formData.freight, formData.destination_ch, formData.ess_ch, formData.oda_ch,
        formData.transport_ch, formData.clearance_ch, formData.other_ch, formData.ddp_ch,
        formData.fuel_ch, formData.cgst_ch, formData.sgst_ch, formData.igst_ch
    ]);

    const fillMockData = () => {
        setFormData(prev => ({
            ...prev,
            courier: 'DHL',
            airway_no: 'BRK' + Math.floor(100000 + Math.random() * 900000),
            forward_no: 'DHL' + Math.floor(100000 + Math.random() * 900000),
            forwarder: 'DHL EXPRESS',
            description: 'ELECTRONIC COMPONENTS AND SPARE PARTS',
            consigner_name: 'BRISK GLOBAL LOGISTICS',
            consigner_address: 'Plot 12, SVP Square, Thane',
            consigner_pincode: '400604',
            consigner_state: 'MAHARASHTRA',
            consigner_city: 'THANE',
            consigner_phone: '9022062666',
            consigner_doc_val: '27AAAAA0000A1Z5',
            consignee_name: 'JOHN SMITH',
            consignee_company: 'GLOBAL TECH SOLUTIONS',
            consignee_address: '456 INNOVATION WAY, SILICON VALLEY, CA 94025',
            consignee_city: 'SAN JOSE',
            consignee_zip: '94025',
            consignee_country: 'USA',
            consignee_phone: '+1 650 555 0123',
            consignee_email: 'john.smith@techsolutions.com',
            freight: 4500,
            destination_ch: 500,
            ess_ch: 200,
            oda_ch: 0,
            transport_ch: 150,
            clearance_ch: 300,
            other_ch: 50,
            ddp_ch: 0,
            packages: [
                { id: Date.now(), box_no: '1', per_box_wt: 5.5, actual_wt: 5.5, l: 30, b: 20, h: 20, vol_wt: 2.4, chargeable_wt: 5.5 },
                { id: Date.now() + 1, box_no: '2', per_box_wt: 4.2, actual_wt: 4.2, l: 25, b: 25, h: 15, vol_wt: 1.875, chargeable_wt: 4.2 }
            ]
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePackageChange = (id, field, value) => {
        setFormData(prev => {
            const newPackages = prev.packages.map(p => {
                if (p.id === id) {
                    const updated = { ...p, [field]: value };
                    if (['l', 'b', 'h'].includes(field)) {
                        updated.vol_wt = (updated.l * updated.b * updated.h) / 5000;
                    }
                    updated.chargeable_wt = Math.max(updated.actual_wt, updated.vol_wt);
                    return updated;
                }
                return p;
            });
            return { ...prev, packages: newPackages };
        });
    };

    const addPackage = () => {
        setFormData(prev => ({
            ...prev,
            packages: [...prev.packages, { id: Date.now(), box_no: (prev.packages.length + 1).toString(), per_box_wt: 0, actual_wt: 0, l: 0, b: 0, h: 0, vol_wt: 0, chargeable_wt: 0 }]
        }));
    };

    const removePackage = (id) => {
        setFormData(prev => ({ ...prev, packages: prev.packages.filter(p => p.id !== id) }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, type: 'international' })
            });
            if (response.ok) {
                alert('Shipment Created Successfully!');
                if (onBack) onBack();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const customer = customers.find(c => c.id.toString() === customerId);
        
        if (customer) {
            setFormData(prev => ({
                ...prev,
                customer_id: customerId,
                consigner_name: customer.name || '',
                consigner_address: customer.address || '',
                consigner_pincode: customer.pincode || '',
                consigner_state: customer.state || '',
                consigner_city: customer.city || '',
                consigner_phone: customer.phone || '',
                consigner_doc_val: customer.gst_no || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, customer_id: customerId }));
        }
    };

    const InputField = ({ label, name, type = "text", value, placeholder, required, options, className = "", onChange }) => (
        <div className={`grid grid-cols-[100px_1fr] items-center gap-2 ${className}`}>
            <label className={`text-[10px] font-bold uppercase ${required ? 'text-red-600' : 'text-slate-500'}`}>{label}{required && '*'}</label>
            {type === 'select' ? (
                <select name={name} value={value} onChange={onChange || handleChange} className="h-7 px-2 border border-slate-300 rounded text-[11px] font-semibold bg-white outline-none focus:border-blue-500">
                    <option value="">{placeholder || '-Select-'}</option>
                    {options?.map(opt => <option key={opt.id || opt} value={opt.id || opt}>{opt.label || opt}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea name={name} value={value} onChange={onChange || handleChange} className="h-14 p-2 border border-slate-300 rounded text-[11px] font-semibold outline-none focus:border-blue-500 resize-none" />
            ) : (
                <input type={type} name={name} value={value} onChange={onChange || handleChange} className="h-7 px-2 border border-slate-300 rounded text-[11px] font-semibold outline-none focus:border-blue-500" />
            )}
        </div>
    );

    const totals = formData.packages.reduce((acc, p) => ({
        actual: acc.actual + (parseFloat(p.actual_wt) || 0),
        vol: acc.vol + (parseFloat(p.vol_wt) || 0),
        chargeable: acc.chargeable + (parseFloat(p.chargeable_wt) || 0)
    }), { actual: 0, vol: 0, chargeable: 0 });

    return (
        <div className="bg-[#f8fafc] min-h-screen p-4 flex flex-col gap-4">
            {/* Top Toolbar */}
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <h1 className="text-lg font-black text-[#1a2f4c] uppercase tracking-tight">ADD INTERNATIONAL AWB</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-[10px] font-bold uppercase h-9 px-6 border-slate-300">View International Shipment</Button>
                    <Button onClick={handleSubmit} className="bg-[#1a2f4c] hover:bg-[#253d63] text-white text-[10px] font-black uppercase h-9 px-8 tracking-widest">Create AWB and Print Label</Button>
                </div>
            </div>

            {/* Main Form Section - 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Shipment Info */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                    <div className="bg-[#1a2f4c] px-4 py-2 text-white text-[11px] font-bold uppercase rounded-t-lg">Shipment Info</div>
                    <div className="p-4 space-y-2 flex-1">
                        <InputField label="Date" name="booking_date" type="date" value={formData.booking_date} required />
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-[10px] font-bold uppercase text-red-600">Type*</label>
                            <div className="flex gap-4">
                                {['Export', 'Import'].map(t => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" value={t} checked={formData.type === t} onChange={handleChange} className="h-3 w-3" />
                                        <span className="text-[10px] font-bold text-slate-700 uppercase">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <InputField label="Courier" name="courier" type="select" options={['DHL', 'FEDEX', 'UPS', 'SELF']} value={formData.courier} required />
                        <InputField label="Airway No" name="airway_no" value={formData.airway_no} required />
                        <InputField label="ForwardNo" name="forward_no" value={formData.forward_no} />
                        <InputField label="Forwarder" name="forwarder" type="select" options={['DHL EXPRESS', 'FEDEX PRIORITY']} value={formData.forwarder} required />
                        <InputField label="Product" name="product" type="select" options={['DOCUMENTS', 'PARCEL']} value={formData.product} required />
                        <InputField label="Desc." name="description" type="textarea" placeholder="Shipment Contents..." value={formData.description} />
                        <InputField label="Bill Type" name="bill_type" type="select" options={['PREPAID', 'COD', 'TO PAY']} value={formData.bill_type} required />
                    </div>
                </div>

                {/* Consigner Details */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                    <div className="bg-[#1a2f4c] px-4 py-2 text-white text-[11px] font-bold uppercase rounded-t-lg">Consigner Details</div>
                    <div className="p-4 space-y-2 flex-1">
                        <InputField 
                            label="Customer" 
                            name="customer_id" 
                            type="select" 
                            options={customers.map(c => ({ id: c.id, label: `${c.code} - ${c.name}` }))} 
                            value={formData.customer_id}
                            onChange={handleCustomerChange}
                            required 
                        />
                        <InputField label="Name" name="consigner_name" value={formData.consigner_name} required />
                        <InputField label="Address" name="consigner_address" type="textarea" value={formData.consigner_address} required />
                        <InputField label="Pincode" name="consigner_pincode" value={formData.consigner_pincode} required />
                        <InputField label="State" name="consigner_state" type="select" options={masters.states.map(s => s.name)} value={formData.consigner_state} required />
                        <InputField label="City" name="consigner_city" type="select" options={[...new Set([...masters.cities.map(c => c.name), formData.consigner_city])].filter(Boolean)} value={formData.consigner_city} required />
                        <InputField label="ContactNo." name="consigner_phone" value={formData.consigner_phone} required />
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                             <select name="consigner_doc_type" value={formData.consigner_doc_type} onChange={handleChange} className="h-7 border border-slate-300 rounded text-[10px] font-bold bg-slate-50">
                                 <option>GSTIN</option>
                                 <option>PASSPORT</option>
                             </select>
                             <input name="consigner_doc_val" value={formData.consigner_doc_val} onChange={handleChange} className="h-7 px-2 border border-slate-300 rounded text-[11px] font-semibold" />
                        </div>
                    </div>
                </div>

                {/* Consignee Details */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                    <div className="bg-[#1a2f4c] px-4 py-2 text-white text-[11px] font-bold uppercase rounded-t-lg">Consignee Details</div>
                    <div className="p-4 space-y-2 flex-1">
                        <InputField label="Select Consignee" name="consignee_id" type="select" options={['-Address Book-']} />
                        <div className="flex items-center gap-2 pl-[108px] mb-1">
                            <input type="checkbox" name="consignee_save" checked={formData.consignee_save} onChange={handleChange} className="h-3 w-3" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Save To Address Book.</span>
                        </div>
                        <InputField label="Name" name="consignee_name" value={formData.consignee_name} required />
                        <InputField label="Company" name="consignee_company" value={formData.consignee_company} />
                        <InputField label="Address" name="consignee_address" type="textarea" value={formData.consignee_address} />
                        <InputField label="City" name="consignee_city" value={formData.consignee_city} required />
                        <InputField label="Zipcode" name="consignee_zip" value={formData.consignee_zip} required />
                        <InputField label="Country" name="consignee_country" type="select" options={['USA', 'UK', 'CANADA', 'UAE']} value={formData.consignee_country} required />
                        <InputField label="ContactNo." name="consignee_phone" value={formData.consignee_phone} required />
                        <InputField label="Email Id" name="consignee_email" type="email" value={formData.consignee_email} />
                    </div>
                </div>
            </div>

            {/* Measurement Units Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#1a2f4c] px-4 py-2 text-white text-[11px] font-bold uppercase">Measurement Units</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-400 w-12 text-center">PKT</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800">Per Box Weight</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800">Actual Weight</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800">Chargeable Weight</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800">Valumetric Weight</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800 w-24 text-center">L</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800 w-24 text-center">B</th>
                                <th className="p-2 text-[10px] font-black uppercase text-slate-800 w-24 text-center">H</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.packages.map((pkg, idx) => (
                                <tr key={pkg.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="p-2 text-center text-[11px] font-bold text-slate-400">{idx + 1}</td>
                                    <td className="p-2 px-4">
                                        <input type="number" value={pkg.per_box_wt} onChange={e => handlePackageChange(pkg.id, 'per_box_wt', parseFloat(e.target.value))} className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] font-semibold" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" value={pkg.actual_wt} onChange={e => handlePackageChange(pkg.id, 'actual_wt', parseFloat(e.target.value))} className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] font-semibold" />
                                    </td>
                                    <td className="p-2 text-[11px] font-black text-[#1a2f4c]">{pkg.chargeable_wt.toFixed(2)}</td>
                                    <td className="p-2 text-[11px] font-black text-slate-400">{pkg.vol_wt.toFixed(2)}</td>
                                    <td className="p-2">
                                        <input type="number" value={pkg.l} onChange={e => handlePackageChange(pkg.id, 'l', parseFloat(e.target.value))} className="w-full h-8 text-center border-x border-slate-100 bg-slate-50/30 text-[11px] font-semibold" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" value={pkg.b} onChange={e => handlePackageChange(pkg.id, 'b', parseFloat(e.target.value))} className="w-full h-8 text-center border-x border-slate-100 bg-slate-50/30 text-[11px] font-semibold" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" value={pkg.h} onChange={e => handlePackageChange(pkg.id, 'h', parseFloat(e.target.value))} className="w-full h-8 text-center border-l border-slate-100 bg-slate-50/30 text-[11px] font-semibold" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => removePackage(pkg.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 bg-slate-50 flex justify-between items-center text-[11px] font-bold uppercase text-slate-500">
                    <button onClick={addPackage} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                        <Plus className="h-4 w-4" /> Add Row
                    </button>
                    <div className="flex gap-10 pr-10">
                        <span>PCS: <span className="text-slate-900 ml-1">{formData.packages.length}</span></span>
                        <span>Total Actual Wt.: <span className="text-slate-900 ml-1">{totals.actual.toFixed(2)}</span></span>
                        <span>Total Chargeable Wt.: <span className="text-slate-900 ml-1 font-black underline">{totals.chargeable.toFixed(2)}</span></span>
                    </div>
                </div>
            </div>

            {/* Charges & Final Charge Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Charges */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="bg-[#1a2f4c] px-4 py-2 text-white flex justify-between items-center rounded-t-lg">
                        <span className="text-[11px] font-bold uppercase">Charges</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-300">Charges date :</span>
                            <input type="date" name="charges_date" value={formData.charges_date} onChange={handleChange} className="h-6 px-1 text-slate-900 text-[10px] font-bold rounded" />
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3">
                        <InputField label="Freight" name="freight" type="number" value={formData.freight} />
                        <InputField label="Transport" name="transport_ch" type="number" value={formData.transport_ch} />
                        
                        <InputField label="Destination" name="destination_ch" type="number" value={formData.destination_ch} />
                        <InputField label="Clearance" name="clearance_ch" type="number" value={formData.clearance_ch} />
                        
                        <InputField label="ESS" name="ess_ch" type="number" value={formData.ess_ch} />
                        <InputField label="OtherCh." name="other_ch" type="number" value={formData.other_ch} />
                        
                        <InputField label="ODA" name="oda_ch" type="number" value={formData.oda_ch} />
                        <InputField label="DDP." name="ddp_ch" type="number" value={formData.ddp_ch} />
                        
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                             <label className="text-[10px] font-bold uppercase text-slate-500">Total</label>
                             <div className="h-7 px-2 border border-slate-200 rounded text-[11px] font-black bg-slate-100 flex items-center">{formData.sub_total.toFixed(2)}</div>
                        </div>
                        <InputField label="Fuel Surcharge" name="fuel_ch" type="number" value={formData.fuel_ch} />
                    </div>
                </div>

                {/* Final Charge */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                    <div className="bg-slate-50 px-4 py-2 text-slate-800 text-[11px] font-black uppercase border-b border-slate-200 rounded-t-lg">Final Charge</div>
                    <div className="p-4 space-y-3 flex-1">
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <label className="text-[10px] font-bold uppercase text-slate-500">Sub Total</label>
                             <div className="h-9 px-3 border border-slate-200 rounded text-[14px] font-black bg-slate-100 flex items-center text-slate-700">{formData.sub_total.toFixed(2)}</div>
                        </div>

                        <InputField label="CGST Tax" name="cgst_ch" type="number" value={formData.cgst_ch} />
                        <InputField label="SGST Tax" name="sgst_ch" type="number" value={formData.sgst_ch} />
                        <InputField label="IGST Tax" name="igst_ch" type="number" value={formData.igst_ch} />

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <label className="text-[12px] font-black uppercase text-[#1a2f4c]">Grand Total</label>
                                <div className="h-10 px-4 border-2 border-[#1a2f4c] rounded text-[18px] font-black bg-[#f8fafc] flex items-center text-[#1a2f4c] shadow-sm tabular-nums">
                                    ₹ {formData.grand_total.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg flex justify-end gap-3">
                         <Button variant="outline" className="text-[10px] font-bold uppercase h-8 px-6">New</Button>
                         <Button onClick={handleSubmit} className="bg-[#1a2f4c] hover:bg-[#253d63] text-white text-[10px] font-black uppercase h-8 px-10 tracking-widest shadow-lg">Submit</Button>
                    </div>
                </div>
            </div>
            
            {/* Rebranded legacy footer */}
            <div className="py-6 text-center opacity-40">
                <p className="text-[10px] font-black text-[#1a2f4c] uppercase tracking-[0.3em]">Brisk Network Management System v2026</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">International Logistics Operations Control</p>
            </div>
        </div>
    );
}

export default AddInternationalShipment;
