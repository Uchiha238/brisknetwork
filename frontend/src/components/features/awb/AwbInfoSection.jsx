import React from 'react';
import { FormField } from '../../shared/FormField';


export function AwbInfoSection({
  formData,
  handleChange,
  companies,
  filteredBranches,
  shipmentType,
  setShipmentType,
  setFormData,
  masters
}) {
  const [isAwbEditable, setIsAwbEditable] = React.useState(false);

  return (
    <div className="flex flex-col">
      <div className="px-2 py-1 border-b border-slate-300 bg-slate-50">
        <h3 className="text-[10px] font-bold text-blue-800 uppercase">Air Waybill Information</h3>
      </div>
      <div className="p-1.5 space-y-0.5">
        <div className="grid grid-cols-2 gap-1">
          <FormField onChange={handleChange} label="DATE" name="booking_date" isRed labelWidth="40px" type="date" value={formData.booking_date} tabIndex={-1} />
          <FormField onChange={handleChange} label="TIME" name="booking_time" labelWidth="40px" value={formData.booking_time} disabled tabIndex={-1} />
        </div>

        <FormField onChange={handleChange} label="Company" isRed labelWidth="85px">
          <div className="flex gap-1 w-full h-full">
            <select
              name="booking_company"
              value={formData.booking_company}
              onChange={handleChange}
              className="flex-[2] h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold outline-none"
            >
              <option value="">SELECT...</option>
              {companies.map(c => <option key={c.id} value={c.company_name}>{c.company_name}</option>)}
            </select>
            <select name="branch" value={formData.branch} onChange={handleChange} className="flex-1 h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold outline-none">
              {filteredBranches.length > 0 && <option value="">SELECT...</option>}
              {filteredBranches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
            </select>
          </div>
        </FormField>

        <FormField onChange={handleChange} label="PAY MODE" name="payment_mode" isRed labelWidth="85px">
          <select
            name="payment_mode"
            value={(formData.payment_mode || 'CASH').toUpperCase()}
            onChange={handleChange}
            className="flex-1 h-full px-1 bg-slate-50 border border-slate-300 text-[10px] font-bold outline-none"
          >
            <option value="CASH">CASH</option>
            <option value="CREDIT">CREDIT</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-1">
          <FormField onChange={handleChange} label="Type" name="shipment_type_field" isRed labelWidth="85px">
            <select name="shipment_type_field" value={shipmentType} onChange={(e) => {
              const type = e.target.value;
              setShipmentType(type);
              handleChange(e);
              if (type === 'domestic') {
                setFormData(prev => ({ ...prev, consignee_country: 'INDIA' }));
              }
            }} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
              <option value="domestic">DOMESTIC</option>
              <option value="international">INTERNATIONAL</option>
            </select>
          </FormField>
          <FormField onChange={handleChange} label="Mode" name="mode" isRed labelWidth="40px">
            <select name="mode" value={formData.mode} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
              <option value="">SELECT...</option>
              {masters.modes
                .filter(m => !m.type || m.type === 'Both' || m.type.toLowerCase() === shipmentType)
                .map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </FormField>
        </div>

        <FormField onChange={handleChange} label="Product" name="product" isRed labelWidth="85px">
          <select name="product" value={formData.product} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
            <option>SELECT..</option>
            {masters.products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </FormField>

        <FormField onChange={handleChange} label="AWB Number" name="airway_no" isRed labelWidth="85px">
          <div className="flex gap-1 w-full h-full">
            <input
              name="airway_no"
              value={formData.airway_no}
              onChange={handleChange}
              readOnly={!isAwbEditable}
              tabIndex={isAwbEditable ? undefined : -1}
              className={`flex-1 h-full px-1 border border-slate-300 text-[10px] font-bold outline-none ${!isAwbEditable ? 'bg-slate-100 cursor-not-allowed pointer-events-none' : 'bg-white'}`}
            />
            <button
              type="button"
              onClick={() => setIsAwbEditable(prev => !prev)}
              className={`text-white text-[8px] font-bold px-2 h-full uppercase transition-colors ${isAwbEditable ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 hover:bg-slate-500'}`}
            >
              {isAwbEditable ? 'Save' : 'Edit'}
            </button>
          </div>
        </FormField>

        <FormField onChange={handleChange} label="FWD NO" name="forward_no" labelWidth="85px" value={formData.forward_no} />

        {shipmentType === 'domestic' ? (
          <div className="grid grid-cols-[150px_1fr_70px] gap-1">
            <FormField onChange={handleChange} label="PIN" name="consignee_zip" isRed labelWidth="85px" value={formData.consignee_zip} />
            <FormField onChange={handleChange} label="Destination" name="consignee_city" isRed labelWidth="65px">
              <input name="consignee_city" value={formData.consignee_city || ''} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none" />
            </FormField>
            <FormField onChange={handleChange} label="Zone" name="consignee_zone" labelWidth="30px" value={formData.consignee_zone} />
          </div>
        ) : (
          <FormField onChange={handleChange} label="Destination" name="consignee_country" isRed labelWidth="85px">
            <input list="countries-list" name="consignee_country" value={formData.consignee_country} onChange={handleChange} placeholder="SELECT..." className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none" />
          </FormField>
        )}

        <FormField onChange={handleChange} label="Service" name="service" isRed labelWidth="85px">
          <select name="service" value={formData.service} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
            <option value="">SELECT...</option>
            {(() => {
              const saved = localStorage.getItem('om-courier-couriers');
              let activeCouriers = [];
              if (saved) {
                try {
                  activeCouriers = JSON.parse(saved);
                } catch (e) {
                  // Fallback
                }
              }
              if (activeCouriers.length === 0) {
                activeCouriers = [
                  { name: 'Aramex', type: 'International' },
                  { name: 'DHL', type: 'International' },
                  { name: 'Fedex', type: 'International' },
                  { name: 'TNT', type: 'International' },
                  { name: 'TRACKON', type: 'Domestic' },
                  { name: 'SHREE ANJANI', type: 'Domestic' },
                  { name: 'Delhivery', type: 'Domestic' },
                  { name: 'UPS', type: 'International' },
                  { name: 'OM COURIER', type: 'International' },
                  { name: 'BLUEDART', type: 'Domestic' },
                  { name: 'SHREE MARUTI', type: 'Domestic' },
                  { name: 'TIRUPATI', type: 'Domestic' },
                  { name: 'DTDC', type: 'Domestic' },
                  { name: 'AIRWING', type: 'International' },
                  { name: 'OM COURIER', type: 'Domestic' },
                  { name: 'E COM', type: 'International' },
                  { name: 'SELF', type: 'International' },
                  { name: 'XPRESS BEES', type: 'Domestic' },
                  { name: 'BLUE DART SFC', type: 'Domestic' },
                  { name: 'BLUE DART APEX', type: 'Domestic' },
                  { name: 'REG EXPRESS', type: 'International' },
                  { name: 'SHYPMAX', type: 'International' },
                  { name: 'ECOM', type: 'Domestic' },
                  { name: 'PACE EXPRESS', type: 'International' },
                  { name: 'i way', type: 'Domestic' },
                  { name: 'BOMBINO', type: 'International' },
                  { name: 'ATLANTIC', type: 'International' }
                ];
              }

              // Filter couriers based on current shipmentType (domestic or international)
              const filteredCouriers = activeCouriers.filter(c => {
                const cType = c.type?.toLowerCase();
                const sType = shipmentType?.toLowerCase();
                return !cType || cType === 'both' || cType === sType;
              });

              // Special mapped services
              const specialServices = [
                { value: 'DOMESTIC EXPRESS', label: 'DOMESTIC EXPRESS - DOMESTIC EXPRESS', courier: 'OM COURIER' },
                { value: 'DOMESTIC ECONOMY', label: 'DOMESTIC ECONOMY - DOMESTIC ECONOMY', courier: 'OM COURIER' },
                { value: 'DHL EXP', label: 'DHL EXP - DHL EXP', courier: 'DHL' },
                { value: 'FEDEX IP', label: 'FEDEX IP - FEDEX IP', courier: 'FEDEX' },
                { value: 'UPS EXP SAVER', label: 'UPS EXP SAVER - UPS EXP SAVER', courier: 'UPS' },
                { value: 'BOMBINO SELF PREMIUM', label: 'BOMBINO SELF - BOMBINO SELF PREMIUM', courier: 'BOMBINO' },
                { value: 'BOMBINO SELF SERVICE', label: 'BOMBINO SELF SERVICE - BOMBINO SELF SERVICE', courier: 'BOMBINO' }
              ];

              const finalOptions = [];
              const processedCouriers = new Set();

              // Add special services if the courier exists in filtered list
              specialServices.forEach(srv => {
                const isCourierActive = filteredCouriers.some(c => c.name.toUpperCase() === srv.courier.toUpperCase());
                if (isCourierActive) {
                  finalOptions.push(srv);
                  processedCouriers.add(srv.courier.toUpperCase());
                }
              });

              // For any other filtered couriers, add a generic service name
              filteredCouriers.forEach(c => {
                const nameUpper = c.name.toUpperCase();
                if (!processedCouriers.has(nameUpper)) {
                  finalOptions.push({
                    value: nameUpper,
                    label: `${nameUpper} - ${nameUpper}`,
                    courier: nameUpper
                  });
                  processedCouriers.add(nameUpper);
                }
              });

              return finalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ));
            })()}
          </select>
        </FormField>

        {shipmentType === 'international' && (
          <FormField onChange={handleChange} label="Duty" name="duty" isRed labelWidth="85px">
            <select name="duty" value={formData.duty} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
              <option>SELECT...</option>
              <option>DDP</option>
              <option>DDU</option>
            </select>
          </FormField>
        )}

        <FormField onChange={handleChange} label="REF NO" name="ref_no" labelWidth="85px" value={formData.ref_no} />

        {formData.product?.toUpperCase() !== 'DOCUMENTS' && (
          <>
            <div className="grid grid-cols-2 gap-1">
              <FormField onChange={handleChange} label="VALUE" name="shipment_value" labelWidth="85px" value={formData.shipment_value} />
              <FormField onChange={handleChange} label="Currency" name="currency" labelWidth="45px">
                <select name="currency" value={formData.currency} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold">
                  <option>SELECT..</option>
                  <option>INR</option>
                  <option>USD</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <FormField onChange={handleChange} label="INV DATE" name="invoice_date" isRed labelWidth="85px" type="date" value={formData.invoice_date} tabIndex={-1} />
              <FormField onChange={handleChange} label="INV NO" name="invoice_no" labelWidth="85px" value={formData.invoice_no} />
            </div>

            <FormField onChange={handleChange} label="EWB NO" name="eway_bill_no" labelWidth="85px" value={formData.eway_bill_no} />
            <FormField onChange={handleChange} label="Content" name="content" labelWidth="85px" value={formData.content} />
          </>
        )}
      </div>
    </div>
  );
}
