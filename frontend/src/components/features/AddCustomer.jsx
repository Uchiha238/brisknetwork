import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, User, MapPin, ShieldCheck, Mail, Phone, Lock, FileText, Settings, Pencil, Trash2, Search, Download } from "lucide-react"
import { api } from '../../services/api';

const InputGroup = ({ label, name, type = "text", value, placeholder, options, onChange, className = "", widthClass = "w-full" }) => (
    <div className={`flex flex-col gap-0.5 ${className} ${widthClass}`}>
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none">{label}</label>
        {type === 'select' ? (
            <select 
                name={name} 
                value={value} 
                onChange={onChange}
                className="w-full h-8 px-2 bg-white border border-slate-300 rounded-sm text-[11px] font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
                <option value="">SELECT...</option>
                {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : type === 'textarea' ? (
            <textarea 
                name={name} 
                value={value} 
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-14 p-1.5 border border-slate-300 rounded-sm text-[11px] font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
            />
        ) : (
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-8 px-2 bg-white border border-slate-300 rounded-sm text-[11px] font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
            />
        )}
    </div>
);

export function AddCustomer({ onBack, onSuccess, editingCustomer }) {
    const [formData, setFormData] = useState({
        parent_company: '',
        code: '',
        name: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        gst_no: '',
        phone: '',
        email: '',
        sac_code: '',
        gst_charges: '',
        customer_type: '',
        domestic_rate_group: '',
        domestic_fuel_group: '',
        international_rate_group: '',
        international_fuel_group: '',
        mis_emails: '',
        mis_format: '',
        payment_type: 'Credit',
        password: 'admin@brisk2026', // Hidden from specification but necessary for login
    });

    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [masters, setMasters] = useState({
        states: [],
        cities: [],
        domesticRateGroups: [],
        internationalRateGroups: [],
        domesticFuelGroups: [],
        internationalFuelGroups: []
    });

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

    const fetchCustomers = async () => {
        try {
            const data = await api.getCustomers();
            setCustomers(data);
            
            // Generate and pre-populate code if not editing an existing customer
            if (!isEditing) {
                const nextCode = generateCustomerCode(data);
                setFormData(prev => ({ ...prev, code: nextCode }));
            }
        } catch (err) {
            console.error('Fetch customers error:', err);
        }
    };

    useEffect(() => {
        fetchCustomers();
        // Fetch all masters except cities
        Promise.all([
            fetch('/api/masters/states').then(res => res.json()),
            fetch('/api/masters/rate-groups?type=domestic').then(res => res.json()),
            fetch('/api/masters/rate-groups?type=international').then(res => res.json()),
            fetch('/api/masters/fuel-groups?type=domestic').then(res => res.json()),
            fetch('/api/masters/fuel-groups?type=international').then(res => res.json()),
        ]).then(([states, drg, irg, dfg, ifg]) => {
            setMasters(prev => ({
                ...prev,
                states,
                domesticRateGroups: drg,
                internationalRateGroups: irg,
                domesticFuelGroups: dfg,
                internationalFuelGroups: ifg
            }));
        }).catch(err => console.error('Error fetching masters:', err));
    }, []);

    useEffect(() => {
        if (editingCustomer) {
            setIsEditing(true);
            setFormData({
                ...editingCustomer,
                gst_charges: editingCustomer.gst_charges ? 'Yes' : 'No',
                payment_type: editingCustomer.payment_type || 'Credit',
            });
            // Fetch cities for the customer's state so the dropdown is correctly populated!
            if (editingCustomer.state) {
                const stateObj = masters.states.find(s => s.name === editingCustomer.state || `${s.name} (${s.id || '27'})` === editingCustomer.state);
                if (stateObj) {
                    fetch(`/api/masters/cities?state_id=${stateObj.id}`)
                        .then(res => res.json())
                        .then(cities => {
                            // Ensure the customer's city is in the dropdown
                            if (editingCustomer.city && !cities.some(c => c.name.toUpperCase() === editingCustomer.city.toUpperCase())) {
                                cities.push({ id: 9999, name: editingCustomer.city.toUpperCase(), state_id: stateObj.id });
                            }
                            setMasters(prev => ({ ...prev, cities }));
                        })
                        .catch(err => console.error('Error fetching cities on edit init:', err));
                }
            }
        } else {
            setIsEditing(false);
            setFormData({
                parent_company: '',
                code: '',
                name: '',
                address: '',
                city: '',
                pincode: '',
                state: '',
                gst_no: '',
                phone: '',
                email: '',
                sac_code: '',
                gst_charges: '',
                customer_type: '',
                domestic_rate_group: '',
                domestic_fuel_group: '',
                international_rate_group: '',
                international_fuel_group: '',
                mis_emails: '',
                mis_format: '',
                payment_type: 'Credit',
                password: 'admin@brisk2026'
            });
        }
    }, [editingCustomer, masters.states]);

    useEffect(() => {
        if (formData.state) {
            const stateObj = masters.states.find(s => s.name === formData.state || `${s.name} (${s.id || '27'})` === formData.state);
            if (stateObj) {
                fetch(`/api/masters/cities?state_id=${stateObj.id}`)
                    .then(res => res.json())
                    .then(cities => setMasters(prev => ({ ...prev, cities })))
                    .catch(err => console.error('Error fetching cities:', err));
            }
        }
    }, [formData.state, masters.states]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'pincode' && /^\d{6}$/.test(value)) {
            fetch(`/api/pincode/${value}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.success) {
                        const pincodeState = data.data.state ? data.data.state.toUpperCase() : '';
                        
                        const areaToCityMap = {
                            'BOM': 'MUMBAI',
                            'DEL': 'DELHI',
                            'PNQ': 'PUNE',
                            'AMD': 'AHMEDABAD'
                        };
                        
                        let pincodeCity = data.data.city ? data.data.city.toUpperCase() : '';
                        if (areaToCityMap[pincodeCity]) {
                            pincodeCity = areaToCityMap[pincodeCity];
                        }
                        
                        const stateObj = masters.states.find(s => s.name.toUpperCase() === pincodeState);
                        if (stateObj) {
                            const formattedStateName = `${stateObj.name} (${stateObj.id || '27'})`;
                            
                            // Fetch cities for this state immediately
                            fetch(`/api/masters/cities?state_id=${stateObj.id}`)
                                .then(res => res.json())
                                .then(cities => {
                                    const hasCity = cities.some(c => c.name.toUpperCase() === pincodeCity.toUpperCase());
                                    if (pincodeCity && !hasCity) {
                                        cities.push({ id: 9999, name: pincodeCity, state_id: stateObj.id });
                                    }
                                    
                                    setMasters(prev => ({ ...prev, cities }));
                                    setFormData(current => ({
                                        ...current,
                                        state: formattedStateName,
                                        city: pincodeCity
                                    }));
                                })
                                .catch(err => console.error('Error fetching cities in pincode lookup:', err));
                        }
                    }
                })
                .catch(err => console.error("Error fetching pincode data:", err));
        }
    };

    const fillMockData = () => {
        setFormData({
            parent_company: 'OM COURIER',
            code: 'OMS0221',
            name: 'BRISK GLOBAL LOGISTICS PVT LTD',
            address: 'Plot No. 12, SVP Infotech Square, Thane (W), Maharashtra - 400604',
            city: 'THANE',
            pincode: '400604',
            state: 'MAHARASHTRA (27)',
            gst_no: '27AAAAA0000A1Z5',
            phone: '+91 90220 62666',
            email: 'info@brisknetwork.com',
            sac_code: '996812',
            gst_charges: 'Yes',
            customer_type: 'Both',
            domestic_rate_group: 'Domestic 1',
            domestic_fuel_group: 'Group A',
            international_rate_group: 'CO COURIER 1',
            international_fuel_group: 'Group A',
            mis_emails: 'reports@brisknetwork.com; billing@brisknetwork.com',
            mis_format: 'SR.No Date Consigner Consignee Destination Pincode Invoice',
            payment_type: 'Credit',
            password: 'admin@brisk2026'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `/api/customers/${formData.id}` : '/api/customers';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert(isEditing ? 'Customer Updated!' : 'Customer Added!');
                fetchCustomers();
                setIsEditing(false);
                setFormData({
                    parent_company: '',
                    code: '',
                    name: '',
                    address: '',
                    city: '',
                    pincode: '',
                    state: '',
                    gst_no: '',
                    phone: '',
                    email: '',
                    sac_code: '',
                    gst_charges: '',
                    customer_type: '',
                    domestic_rate_group: '',
                    domestic_fuel_group: '',
                    international_rate_group: '',
                    international_fuel_group: '',
                    mis_emails: '',
                    mis_format: '',
                    payment_type: 'Credit',
                    password: 'admin@brisk2026'
                });
            }
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm delete customer?')) return;
        try {
            await api.deleteCustomer(id);
            fetchCustomers();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const openEdit = (customer) => {
        setIsEditing(true);
        setFormData({ ...customer });
    };

    return (
        <div className="bg-[#f0f2f5] min-h-screen p-1 flex flex-col gap-1">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-4 py-1.5 rounded border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </button>
                    <h1 className="text-sm font-bold text-[#1a2f4c] uppercase">{isEditing ? 'Edit customer' : 'Add customer'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fillMockData} className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase text-[9px] h-7 px-3 tracking-wider">
                        FILL MOCK DATA
                    </Button>
                    <Button onClick={handleSubmit} className="bg-[#1a2f4c] hover:bg-[#2c4a7c] text-white font-bold uppercase text-[9px] h-7 px-4 tracking-widest">
                        SUBMIT
                    </Button>
                </div>
            </div>

            {/* Main Form Area: Zero-Scroll, Left-to-Right 3-Column Tab Order */}
            <div className="bg-white border-y border-slate-200 overflow-hidden flex-1 p-2 md:p-4">
                <form className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 max-w-[1400px] mx-auto" onSubmit={handleSubmit}>
                    
                    {/* Row 1: 1-Company, 2-Code, 3-Name */}
                    <InputGroup label="1. Company Name" name="parent_company" value={formData.parent_company} placeholder="ENTER COMPANY NAME" onChange={handleChange} />
                    <InputGroup label="2. Cust Code" name="code" value={formData.code} onChange={handleChange} />
                    <InputGroup label="3. Cust Name" name="name" value={formData.name} placeholder="ENTER CUSTOMER NAME" onChange={handleChange} />

                    {/* Row 2: 4-Address (Span 2), 5-Pincode */}
                    <InputGroup label="4. Address" name="address" type="textarea" value={formData.address} placeholder="ENTER COMPLETE ADDRESS" className="md:col-span-2 h-14" onChange={handleChange} />
                    <InputGroup label="5. Pincode" name="pincode" value={formData.pincode} placeholder="400XXX" onChange={handleChange} />

                    {/* Row 3: 6-City, 7-State, 8-GST No */}
                    <InputGroup label="6. City" name="city" type="select" value={formData.city} options={masters.cities.map(c => c.name)} onChange={handleChange} />
                    <InputGroup label="7. State (with code)" name="state" type="select" value={formData.state} options={masters.states.map(s => `${s.name} (${s.id || '27'})`)} onChange={handleChange} />
                    <InputGroup label="8. GST No" name="gst_no" value={formData.gst_no} placeholder="27AAAAA..." onChange={handleChange} />

                    {/* Row 4: 9-Contact, 10-Mail, 11-SAC Code */}
                    <InputGroup label="9. Contact No" name="phone" value={formData.phone} placeholder="+91 XXXXX XXXXX" onChange={handleChange} />
                    <InputGroup label="10. Mail Id" name="email" value={formData.email} placeholder="example@mail.com" onChange={handleChange} />
                    <InputGroup label="11. SAC Code" name="sac_code" value={formData.sac_code} onChange={handleChange} />

                    {/* Row 5: 12-GST Charges, 13-Type */}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-black text-slate-700 uppercase leading-none">12. GST Charges</label>
                        <div className="flex gap-4 items-center h-8 px-2 bg-slate-50 rounded border border-slate-200">
                            {['Yes', 'No'].map(val => (
                                <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="radio" name="gst_charges" value={val} checked={formData.gst_charges === val} onChange={handleChange} className="h-3 w-3 accent-blue-600" />
                                    <span className="text-[10px] font-black text-slate-600 uppercase">{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-black text-slate-700 uppercase leading-none">13. Type</label>
                        <div className="flex gap-4 items-center h-8 px-2 bg-slate-50 rounded border border-slate-200">
                            {['Domestic', 'International', 'Both'].map(val => (
                                <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="radio" name="customer_type" value={val} checked={formData.customer_type === val} onChange={handleChange} className="h-3 w-3 accent-blue-600" />
                                    <span className="text-[10px] font-black text-slate-600 uppercase whitespace-nowrap">{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-black text-slate-700 uppercase leading-none">14. Payment Type</label>
                        <div className="flex gap-4 items-center h-8 px-2 bg-slate-50 rounded border border-slate-200">
                            {['Credit', 'Cash'].map(val => (
                                <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="radio" name="payment_type" value={val} checked={formData.payment_type === val} onChange={handleChange} className="h-3 w-3 accent-blue-600" />
                                    <span className="text-[10px] font-black text-slate-600 uppercase">{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Row 6: All Rate Groups in a single line (14, 15, 16, 17) */}
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-blue-50/30 border border-blue-100 rounded-sm">
                        <InputGroup label="14. Domestic Rate Group" name="domestic_rate_group" type="select" value={formData.domestic_rate_group} options={masters.domesticRateGroups.map(g => g.name)} onChange={handleChange} />
                        <InputGroup label="15. Domestic Fuel Group" name="domestic_fuel_group" type="select" value={formData.domestic_fuel_group} options={masters.domesticFuelGroups.map(g => g.name)} onChange={handleChange} />
                        <InputGroup label="16. International Rate" name="international_rate_group" type="select" value={formData.international_rate_group} options={masters.internationalRateGroups.map(g => g.name)} onChange={handleChange} />
                        <InputGroup label="17. International Fuel" name="international_fuel_group" type="select" value={formData.international_fuel_group} options={masters.internationalFuelGroups.map(g => g.name)} onChange={handleChange} />
                    </div>

                    {/* Row 7: 18-MIS Email ID (Span 2), 19-MIS Format */}
                    <InputGroup label="18. MIS Email ID" name="mis_emails" value={formData.mis_emails} placeholder="REPORTS@MAIL.COM; ACCOUNTS@MAIL.COM" className="md:col-span-2" onChange={handleChange} />
                    
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-black text-slate-700 uppercase leading-none">19. MIS Format Selection</label>
                        <select 
                            name="mis_format" 
                            value={formData.mis_format} 
                            onChange={handleChange}
                            className="w-full h-8 px-2 bg-white border border-slate-300 rounded-sm text-[10px] font-bold outline-none focus:border-blue-600 transition-all cursor-pointer"
                        >
                            <option value="">SELECT...</option>
                            <option value="SR.No Date Consigner Consignee Destination Pincode Invoice">Format 1: Standard</option>
                            <option value="SR.No Date Consigner Pincode Pickup From Consignee Pincode">Format 2: Consignor/Consignee Pincode</option>
                            <option value="SR.No Date Consigner Pincode Pickup From">Format 3: Dispatch Details</option>
                        </select>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddCustomer;
