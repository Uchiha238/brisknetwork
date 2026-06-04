import React from 'react';
import { RotateCcw } from 'lucide-react';
import { FormField } from './FormField';

export function ShipperInfoSection({
  formData,
  handleChange,
  shipperSearch,
  setShipperSearch,
  showShipperSuggestions,
  setShowShipperSuggestions,
  filteredShipperCustomers,
  handleSelectShipper
}) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [shipperSearch, showShipperSuggestions]);

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
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
          <div className="relative w-full h-full">
            <input
              type="text"
              value={shipperSearch}
              onChange={(e) => {
                setShipperSearch(e.target.value);
                setShowShipperSuggestions(true);
              }}
              onFocus={() => setShowShipperSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowShipperSuggestions(false), 200);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedIndex(prev => 
                    prev < filteredShipperCustomers.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                } else if (e.key === 'Enter') {
                  if (highlightedIndex >= 0 && highlightedIndex < filteredShipperCustomers.length) {
                    e.preventDefault();
                    handleSelectShipper(filteredShipperCustomers[highlightedIndex]);
                    setShowShipperSuggestions(false);
                  }
                } else if (e.key === 'Escape') {
                  setShowShipperSuggestions(false);
                }
              }}
              placeholder="TYPE INITIALS OF COMPANY..."
              className="w-full h-[22px] px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none focus:border-blue-500"
            />
            {showShipperSuggestions && (
              <div ref={listRef} className="absolute left-0 right-0 top-full mt-0.5 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto z-[9999] text-[9px] text-slate-800 font-bold uppercase">
                {filteredShipperCustomers.length > 0 ? (
                  filteredShipperCustomers.map((cust, idx) => (
                    <div
                      key={cust.id}
                      className={`p-1 cursor-pointer border-b border-slate-100 text-left ${
                        idx === highlightedIndex ? 'bg-blue-100 text-blue-900 font-black' : 'hover:bg-blue-50'
                      }`}
                      onMouseDown={() => {
                        handleSelectShipper(cust);
                      }}
                    >
                      {cust.code} - {cust.name} ({cust.parent_company || 'NO PARENT'}) - {cust.payment_type || 'CREDIT'}
                    </div>
                  ))
                ) : (
                  <div className="p-1 text-slate-400 text-center">NO MATCHING CUSTOMERS</div>
                )}
              </div>
            )}
          </div>
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
          <button type="button" className="bg-yellow-500 hover:bg-yellow-600 text-[8px] font-bold text-white uppercase h-5">Search</button>
        </div>

        <FormField onChange={handleChange} label="City" name="shipper_city" labelWidth="95px" value={formData.shipper_city} />
        <div className="grid grid-cols-[1fr_80px] gap-1">
          <FormField onChange={handleChange} label="State / County" name="shipper_state" isRed labelWidth="95px" value={formData.shipper_state} />
          <FormField onChange={handleChange} label="Zone" name="shipper_zone" labelWidth="35px" value={formData.shipper_zone} />
        </div>

        <FormField onChange={handleChange} label="Country" name="shipper_country" isRed labelWidth="95px">
          <input list="countries-list" name="shipper_country" value={formData.shipper_country} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none" />
        </FormField>

        {/* Cleaned up Phone Number Input */}
        <FormField onChange={handleChange} label="Phone Number" name="shipper_phone" isRed labelWidth="95px" value={formData.shipper_phone} />

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
  );
}
