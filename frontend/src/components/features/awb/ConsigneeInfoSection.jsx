import React from 'react';
import { RotateCcw } from 'lucide-react';
import { FormField, getCountryCallingCode } from '../../shared/FormField';
import { isDomesticCountry } from '../../../utils/weight';
import { handleCountryKeyDown, handleCountryBlur } from '../../../utils/countryAutocomplete';
import { lookupPostalCode } from '../../../utils/postalLookup';

export function ConsigneeInfoSection({
  formData,
  handleChange,
  consigneeSearch,
  setConsigneeSearch,
  showConsigneeSuggestions,
  setShowConsigneeSuggestions,
  filteredConsigneeCustomers,
  handleSelectConsignee,
  shipmentType,
  masters
}) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [isSearchingZip, setIsSearchingZip] = React.useState(false);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [consigneeSearch, showConsigneeSuggestions]);

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const isDomestic = shipmentType ? shipmentType === 'domestic' : isDomesticCountry(formData.consignee_country);

  const callingCode = getCountryCallingCode(formData.consignee_country) || '+91';
  const fullPhone = formData.consignee_phone || '';
  const displayPhone = fullPhone.startsWith(callingCode) ? fullPhone.slice(callingCode.length) : fullPhone.replace(/^\+\d+/, '');

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, '');
    handleChange({
      target: {
        name: 'consignee_phone',
        value: callingCode + digits,
        type: 'text'
      }
    });
  };

  const handleZipSearch = async () => {
    if (!formData.consignee_zip || isDomestic) return;
    setIsSearchingZip(true);
    try {
      const res = await lookupPostalCode(formData.consignee_zip, formData.consignee_country);
      if (res && res.success) {
        const countryToUse = res.country || formData.consignee_country || 'SPAIN';

        // 1. Fetch international zone right away
        let zoneVal = '';
        try {
          let courier = 'DHL';
          const serviceUpper = (formData.service || '').toUpperCase();
          if (serviceUpper.includes('FEDEX')) courier = 'FEDEX';
          else if (serviceUpper.includes('UPS')) courier = 'UPS';
          else if (serviceUpper.includes('ARAMEX')) courier = 'ARAMEX';

          const mode = formData.mode || 'EXPORT';
          const bookingDate = formData.booking_date || '';

          const zRes = await fetch(`/api/international-zone?country=${encodeURIComponent(countryToUse)}&city=${encodeURIComponent(res.city || '')}&courier=${encodeURIComponent(courier)}&type=${encodeURIComponent(mode)}&booking_date=${encodeURIComponent(bookingDate)}`);
          if (zRes.ok) {
            const zData = await zRes.json();
            if (zData && zData.success && zData.zone) {
              zoneVal = zData.zone.toString();
            }
          }
        } catch (zErr) {
          console.warn('Zone fetch error in zip search:', zErr);
        }

        if (res.city) {
          handleChange({ target: { name: 'consignee_city', value: res.city, type: 'text' } });
        }
        if (res.state) {
          handleChange({ target: { name: 'consignee_state', value: res.state, type: 'text' } });
        }
        if (countryToUse && (!formData.consignee_country || formData.consignee_country === 'INDIA')) {
          handleChange({ target: { name: 'consignee_country', value: countryToUse, type: 'text' } });
        }
        if (zoneVal) {
          handleChange({ target: { name: 'consignee_zone', value: zoneVal, type: 'text' } });
        }
      }
    } catch (err) {
      console.error('Postal search error:', err);
    } finally {
      setIsSearchingZip(false);
    }
  };



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
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedIndex(prev => 
                    prev < filteredConsigneeCustomers.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                } else if (e.key === 'Enter') {
                  if (highlightedIndex >= 0 && highlightedIndex < filteredConsigneeCustomers.length) {
                    e.preventDefault();
                    handleSelectConsignee(filteredConsigneeCustomers[highlightedIndex]);
                    setShowConsigneeSuggestions(false);
                  }
                } else if (e.key === 'Tab') {
                  const targetCust = highlightedIndex >= 0 
                    ? filteredConsigneeCustomers[highlightedIndex] 
                    : (filteredConsigneeCustomers.length > 0 ? filteredConsigneeCustomers[0] : null);
                  if (targetCust) {
                    handleSelectConsignee(targetCust);
                    setShowConsigneeSuggestions(false);
                  }
                } else if (e.key === 'Escape') {
                  setShowConsigneeSuggestions(false);
                }
              }}
              placeholder="TYPE INITIALS OF COMPANY..."
              className="w-full h-[22px] px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none focus:border-blue-500"
            />
            {showConsigneeSuggestions && (
              <div ref={listRef} className="absolute left-0 right-0 top-full mt-0.5 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto z-[9999] text-[9px] text-slate-800 font-bold uppercase">
                {filteredConsigneeCustomers.length > 0 ? (
                  filteredConsigneeCustomers.map((cust, idx) => (
                    <div
                      key={cust.id}
                      className={`p-1 cursor-pointer border-b border-slate-100 text-left ${
                        idx === highlightedIndex ? 'bg-blue-100 text-blue-900 font-black' : 'hover:bg-blue-50'
                      }`}
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
          <FormField onChange={handleChange} label="Code" name="consignee_code" labelWidth="105px" value={formData.consignee_code} inputMaxWidth="320px" readOnly tabIndex={-1} />
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
          <FormField
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleZipSearch();
              }
            }}
            onBlur={handleZipSearch}
            label="Post / Zip Code"
            name="consignee_zip"
            isRed
            labelWidth="105px"
            value={formData.consignee_zip}
            inputMaxWidth="320px"
            readOnly={isDomestic}
          />
          <button
            type="button"
            onClick={handleZipSearch}
            disabled={isDomestic || isSearchingZip}
            title={isDomestic ? 'Domestic pincode is auto-filled' : 'Search city, state and zone from postal code'}
            className={`text-[8px] font-bold text-white uppercase h-[22px] transition-colors rounded-xs shadow-xs ${
              isDomestic
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-[#1a2f4c] hover:bg-[#253d63] cursor-pointer active:scale-95'
            }`}
          >
            {isSearchingZip ? '...' : 'Search'}
          </button>
        </div>

        <FormField onChange={handleChange} label="City" name="consignee_city" isRed labelWidth="105px" value={formData.consignee_city} inputMaxWidth="320px" readOnly={isDomestic} />
        <div className="grid grid-cols-[1fr_80px] gap-1 max-w-[425px]">
          <FormField onChange={handleChange} label="State / County" name="consignee_state" labelWidth="105px" value={formData.consignee_state} inputMaxWidth="320px" readOnly={isDomestic} />
          <FormField onChange={handleChange} label="Zone" name="consignee_zone" labelWidth="35px" value={formData.consignee_zone} readOnly={isDomestic} />
        </div>

        <FormField onChange={handleChange} label="Country" name="consignee_country" isRed labelWidth="105px" inputMaxWidth="320px">
          <input
            list="countries-list"
            name="consignee_country"
            value={formData.consignee_country || ''}
            onChange={handleChange}
            onKeyDown={(e) => handleCountryKeyDown(e, masters?.countries, handleChange)}
            onBlur={(e) => handleCountryBlur(e, masters?.countries, handleChange)}
            placeholder={isDomestic ? 'INDIA' : 'SELECT...'}
            className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none"
          />
        </FormField>

        {/* Bound Phone Number Input with Static Prefix */}
        <FormField label="Phone Number" isRed labelWidth="105px" inputMaxWidth="320px">
          <div className="flex w-full h-[22px] border border-slate-300 rounded overflow-hidden">
            <span className="bg-slate-100 px-1.5 flex items-center justify-center text-[10px] font-bold border-r border-slate-200 select-none text-slate-500 h-full">
              {callingCode}
            </span>
            <input
              type="text"
              name="consignee_phone"
              value={displayPhone}
              onChange={handlePhoneChange}
              placeholder="PHONE NUMBER"
              className="flex-1 h-full px-2 text-[11px] font-bold text-slate-900 outline-none uppercase bg-[#fcfcfc] focus:bg-white"
            />
          </div>
        </FormField>

        <FormField onChange={handleChange} label="Email Address" name="consignee_email" labelWidth="105px" value={formData.consignee_email || ''} inputMaxWidth="320px" placeholder="ENTER EMAIL ADDRESS" />
      </div>
    </div>
  );
}
