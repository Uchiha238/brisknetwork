import React from 'react';
import { RotateCcw } from 'lucide-react';
import { FormField } from './FormField';

export function ConsigneeInfoSection({
  formData,
  handleChange,
  consigneeSearch,
  setConsigneeSearch,
  showConsigneeSuggestions,
  setShowConsigneeSuggestions,
  filteredConsigneeCustomers,
  handleSelectConsignee
}) {
  return (
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
        <FormField label="Search Address Book" labelWidth="105px" inputMaxWidth="320px">
          <div className="relative w-full h-full">
            <input
              type="text"
              value={consigneeSearch}
              onChange={(e) => {
                setConsigneeSearch(e.target.value);
                setShowConsigneeSuggestions(true);
              }}
              onFocus={() => setShowConsigneeSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowConsigneeSuggestions(false), 200);
              }}
              placeholder="TYPE INITIALS OF COMPANY..."
              className="w-full h-[22px] px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none focus:border-blue-500"
            />
            {showConsigneeSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-0.5 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto z-[9999] text-[9px] text-slate-800 font-bold uppercase">
                {filteredConsigneeCustomers.length > 0 ? (
                  filteredConsigneeCustomers.map(cust => (
                    <div
                      key={cust.id}
                      className="p-1 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-left"
                      onMouseDown={() => {
                        handleSelectConsignee(cust);
                      }}
                    >
                      {cust.code} - {cust.name} ({cust.parent_company || 'NO PARENT'})
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
          <button type="button" className="bg-slate-300 text-[8px] font-bold text-white uppercase h-[22px] cursor-not-allowed" disabled>Search</button>
        </div>

        <FormField onChange={handleChange} label="City" name="consignee_city" isRed labelWidth="105px" value={formData.consignee_city} inputMaxWidth="320px" readOnly />
        <div className="grid grid-cols-[1fr_80px] gap-1 max-w-[425px]">
          <FormField onChange={handleChange} label="State / County" name="consignee_state" labelWidth="105px" value={formData.consignee_state} inputMaxWidth="320px" readOnly />
          <FormField onChange={handleChange} label="Zone" name="consignee_zone" labelWidth="35px" value={formData.consignee_zone} readOnly />
        </div>

        <FormField onChange={handleChange} label="Country" name="consignee_country" isRed labelWidth="105px" inputMaxWidth="320px" readOnly>
          <input name="consignee_country" value={formData.consignee_country} readOnly className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none bg-slate-100 cursor-not-allowed" />
        </FormField>

        {/* Bound Phone Number Input */}
        <FormField onChange={handleChange} label="Phone Number" name="consignee_phone" isRed labelWidth="105px" value={formData.consignee_phone} inputMaxWidth="320px" />

        <FormField onChange={handleChange} label="Email Address" name="consignee_email" labelWidth="105px" value={formData.consignee_email} inputMaxWidth="320px" />
      </div>
    </div>
  );
}
