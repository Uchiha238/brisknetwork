import React from 'react';
import { FormField } from './FormField';

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
  return (
    <div className="flex flex-col">
      <div className="px-2 py-1 border-b border-slate-300 bg-slate-50">
        <h3 className="text-[10px] font-bold text-blue-800 uppercase">Air Waybill Information</h3>
      </div>
      <div className="p-1.5 space-y-0.5">
        <div className="grid grid-cols-2 gap-1">
          <FormField onChange={handleChange} label="DATE" name="booking_date" isRed labelWidth="40px" type="date" value={formData.booking_date} tabIndex={-1} />
          <FormField onChange={handleChange} label="TIME" name="booking_time" labelWidth="40px" value={formData.booking_time} />
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
            <input name="airway_no" value={formData.airway_no} onChange={handleChange} className="flex-1 h-full px-1 bg-slate-100 border border-slate-300 text-[10px] font-bold outline-none" />
            <button type="button" className="bg-slate-400 text-white text-[8px] font-bold px-2 h-full uppercase">Edit</button>
          </div>
        </FormField>

        <FormField onChange={handleChange} label="FWD NO" name="forward_no" labelWidth="85px" value={formData.forward_no} />

        {shipmentType === 'domestic' ? (
          <div className="grid grid-cols-[1fr_95px_70px] gap-1">
            <FormField onChange={handleChange} label="Destination" name="consignee_country" isRed labelWidth="85px">
              <input name="consignee_country" value="INDIA" readOnly tabIndex={-1} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none bg-slate-100" />
            </FormField>
            <FormField onChange={handleChange} label="PIN" name="consignee_zip" isRed labelWidth="25px" value={formData.consignee_zip} />
            <FormField onChange={handleChange} label="Zone" name="consignee_zone" labelWidth="35px" value={formData.consignee_zone} />
          </div>
        ) : (
          <FormField onChange={handleChange} label="Destination" name="consignee_country" isRed labelWidth="85px">
            <input list="countries-list" name="consignee_country" value={formData.consignee_country} onChange={handleChange} placeholder="SELECT..." className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none" />
          </FormField>
        )}

        <FormField onChange={handleChange} label="Service" name="service" isRed labelWidth="85px">
          <select name="service" value={formData.service} onChange={handleChange} className="w-full h-full px-1 border border-slate-300 text-[10px] font-bold outline-none">
            <option value="">SELECT...</option>
            <option value="DOMESTIC EXPRESS">DOMESTIC EXPRESS - DOMESTIC EXPRESS</option>
            <option value="DOMESTIC ECONOMY">DOMESTIC ECONOMY - DOMESTIC ECONOMY</option>
            <option value="DHL EXP">DHL EXP - DHL EXP</option>
            <option value="FEDEX IP">FEDEX IP - FEDEX IP</option>
            <option value="UPS EXP SAVER">UPS EXP SAVER - UPS EXP SAVER</option>
            <option value="BOMBINO SELF PREMIUM">BOMBINO SELF - BOMBINO SELF PREMIUM</option>
            <option value="BOMBINO SELF SERVICE">BOMBINO SELF SERVICE - BOMBINO SELF SERVICE</option>
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
      </div>
    </div>
  );
}
