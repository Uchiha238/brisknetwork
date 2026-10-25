import React from 'react';
import { SectionHeader } from '../../shared/FormField';

export function WeightsDimensionsSection({
  formData,
  setFormData,
  handleChange,
  handleArrayChange,
  shipmentType
}) {
  const [isCheckingRate, setIsCheckingRate] = React.useState(false);
  const [rateFeedback, setRateFeedback] = React.useState(null);

  const handleCheckRate = async () => {
    setRateFeedback(null);
    const weight = parseFloat(formData.chargeable_weight) || 0;
    if (weight <= 0) {
      setRateFeedback({ type: 'error', message: 'Enter package dimensions or weight first.' });
      return;
    }

    if (shipmentType === 'domestic') {
      setRateFeedback({ type: 'info', message: 'Domestic rates are contract-based. Enter the Bill Amount directly.' });
      const billInput = document.querySelector('input[name="freight_ch"]');
      if (billInput) billInput.focus();
      return;
    }

    // International rating
    let courier = 'DHL';
    const sUpper = (formData.service || '').toUpperCase();
    if (sUpper.includes('FEDEX')) courier = 'FEDEX';
    else if (sUpper.includes('UPS')) courier = 'UPS';
    else if (sUpper.includes('ARAMEX')) courier = 'ARAMEX';
    else if (sUpper.includes('DHL')) courier = 'DHL';
    else if (!formData.service) {
      setRateFeedback({ type: 'error', message: 'Please select a Service (e.g. DHL) in AWB Information.' });
      return;
    }

    const zone = (formData.consignee_zone || '').trim();
    if (!zone) {
      setRateFeedback({ 
        type: 'error', 
        message: formData.consignee_country 
          ? `Destination Zone not found for "${formData.consignee_country}". Please verify country.` 
          : 'Please select Consignee Country to resolve destination zone.' 
      });
      return;
    }

    setIsCheckingRate(true);
    try {
      const product = weight > 2.0 ? 'PARCEL' : (formData.product || 'DOCUMENTS');
      const mode = formData.mode || 'EXPORT';
      const bookingDate = formData.booking_date || new Date().toISOString().split('T')[0];

      const res = await fetch(`/api/international-rate?courier=${encodeURIComponent(courier)}&zone=${encodeURIComponent(zone)}&weight=${encodeURIComponent(weight)}&product=${encodeURIComponent(product)}&mode=${encodeURIComponent(mode)}&booking_date=${encodeURIComponent(bookingDate)}`);
      const data = await res.json();

      if (data && data.success && data.rate !== undefined) {
        if (setFormData) {
          setFormData(prev => ({
            ...prev,
            freight_ch: data.rate,
            product: product
          }));
        }
        setRateFeedback({ type: 'success', message: `${courier} Zone ${zone} Rate: ₹${data.rate}` });
      } else {
        setRateFeedback({ type: 'error', message: data.error || `No rate slab found for ${courier} Zone ${zone} (${weight} kg).` });
      }
    } catch (err) {
      setRateFeedback({ type: 'error', message: 'Rate check failed: ' + err.message });
    } finally {
      setIsCheckingRate(false);
    }
  };

  return (
    <div className="mt-1 border border-slate-300 bg-white">
      <SectionHeader title="Weights and Dimensions" isWhite />
      
      {/* Summary Row */}
      <div className="p-1 flex items-center gap-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase">PCS</label>
          <input type="number" name="pcs" value={formData.pcs} onChange={handleChange} className="w-16 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-white text-slate-900" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase">Actual Weight</label>
          <input type="number" value={formData.actual_weight} tabIndex={-1} className="w-20 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-slate-100 text-slate-900" readOnly />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase">Volumetric Weight</label>
          <input type="number" value={formData.volumetric_weight} tabIndex={-1} className="w-20 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-black text-white" readOnly />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase">Chargeable Weight</label>
          <input type="number" value={formData.chargeable_weight} tabIndex={-1} className="w-20 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-slate-100 text-slate-900" readOnly />
        </div>
      </div>

      {/* Parcel Detail Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-500 uppercase">
              <th className="px-2 py-1.5 border-r border-slate-200 w-24">Parcel No.</th>
              <th className="px-2 py-1.5 border-r border-slate-200 w-20">Box No</th>
              <th className="px-2 py-1.5 border-r border-slate-200 text-red-600">Actual Wt.(KG.)</th>
              <th className="px-2 py-1.5 border-r border-slate-200">L(CM)</th>
              <th className="px-2 py-1.5 border-r border-slate-200">B(CM)</th>
              <th className="px-2 py-1.5 border-r border-slate-200">H(CM)</th>
              <th className="px-2 py-1.5 border-r border-slate-200">Volumetric Wt.(KG.)</th>
              <th className="px-2 py-1.5">Chargeable Wt.(KG.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {formData.packages.map((pkg, idx) => (
              <tr key={idx} className="bg-white">
                <td className="px-2 py-1 border-r border-slate-200">
                  <input value={idx + 1} tabIndex={-1} className="w-full h-[22px] bg-slate-50 text-[11px] font-bold px-1 border-none focus:outline-none" readOnly />
                </td>
                <td className="px-2 py-1 border-r border-slate-200">
                  <input 
                    value={pkg.box_no} 
                    onChange={(e) => handleArrayChange('packages', idx, 'box_no', e.target.value)}
                    className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                  />
                </td>
                <td className="px-2 py-1 border-r border-slate-200">
                  <input 
                    type="number"
                    value={pkg.actual_wt} 
                    onChange={(e) => handleArrayChange('packages', idx, 'actual_wt', e.target.value)}
                    className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                  />
                </td>
                <td className="px-2 py-1 border-r border-slate-200">
                  <input 
                    type="number"
                    value={pkg.length} 
                    onChange={(e) => handleArrayChange('packages', idx, 'length', e.target.value)}
                    className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                  />
                </td>
                <td className="px-2 py-1 border-r border-slate-200">
                  <input 
                    type="number"
                    value={pkg.breadth} 
                    onChange={(e) => handleArrayChange('packages', idx, 'breadth', e.target.value)}
                    className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                  />
                </td>
                <td className="px-2 py-1 border-r border-slate-200">
                  <input 
                    type="number"
                    value={pkg.height} 
                    onChange={(e) => handleArrayChange('packages', idx, 'height', e.target.value)}
                    className="w-full h-[22px] text-[11px] font-bold px-1 border border-slate-200 focus:border-blue-500 outline-none" 
                  />
                </td>
                <td className="px-2 py-1 border-r border-slate-200">
                  <input value={pkg.vol_wt?.toFixed(2) || '0'} tabIndex={-1} className="w-full h-[22px] bg-slate-50 text-[11px] font-bold px-1 border-none focus:outline-none" readOnly />
                </td>
                <td className="px-2 py-1">
                  <input value={pkg.chargeable_wt?.toFixed(2) || '0'} tabIndex={-1} className="w-full h-[22px] bg-slate-50 text-[11px] font-bold px-1 border-none focus:outline-none" readOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Footer */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase">Bill Amount</label>
          <input type="number" name="freight_ch" value={formData.freight_ch} onChange={handleChange} className="w-24 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white text-slate-900" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase">Fuel Amount</label>
          <input type="number" name="fuel_surcharge" value={formData.fuel_surcharge} onChange={handleChange} className="w-24 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white text-slate-900" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase">Gst Amount</label>
          <input 
            type="number" 
            name="gst_amount" 
            value={((parseFloat(formData.cgst_ch) || 0) + (parseFloat(formData.sgst_ch) || 0)).toFixed(2)} 
            readOnly 
            tabIndex={-1} 
            className="w-24 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-slate-100 text-slate-900 cursor-not-allowed" 
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase">Total Amount</label>
          <input 
            type="number" 
            name="grand_total" 
            value={formData.grand_total} 
            onChange={handleChange}
            className="w-28 h-[22px] px-2 border border-slate-300 text-[12px] font-bold bg-white text-slate-900 focus:border-blue-500 outline-none" 
          />
        </div>

        {shipmentType === 'international' && (
          <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-slate-200 w-full">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black text-slate-500 uppercase">Dest. Ch</label>
              <input type="number" name="destination_ch" value={formData.destination_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black text-slate-500 uppercase">ESS</label>
              <input type="number" name="ess_ch" value={formData.ess_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black text-slate-500 uppercase">ODA</label>
              <input type="number" name="oda_ch" value={formData.oda_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black text-slate-500 uppercase">Clearance</label>
              <input type="number" name="clearance_ch" value={formData.clearance_ch} onChange={handleChange} className="w-20 h-[22px] px-2 border border-slate-300 text-[11px] font-bold bg-white" />
            </div>
          </div>
        )}

        {rateFeedback && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            rateFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            rateFeedback.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {rateFeedback.type === 'success' && '✓ '}
            {rateFeedback.type === 'error' && '⚠ '}
            {rateFeedback.type === 'info' && 'ℹ '}
            {rateFeedback.message}
          </span>
        )}

        <button 
          type="button" 
          onClick={handleCheckRate}
          disabled={isCheckingRate}
          className="ml-auto bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-slate-400 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded shadow-sm transition-all"
        >
          {isCheckingRate ? 'Checking...' : 'Check Rate'}
        </button>
      </div>
    </div>
  );
}
