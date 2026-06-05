import React from 'react';
import { User } from "lucide-react";
import { AwbInfoSection } from './awb/AwbInfoSection';
import { ShipperInfoSection } from './awb/ShipperInfoSection';
import { ConsigneeInfoSection } from './awb/ConsigneeInfoSection';
import { WeightsDimensionsSection } from './awb/WeightsDimensionsSection';
import { InvoiceSection } from './awb/InvoiceSection';
import { ChargesSection } from './awb/ChargesSection';
import { FinalChargeSection } from './awb/FinalChargeSection';
import { InvoiceItemsTable } from './awb/InvoiceItemsTable';
import { useUnifiedShipmentForm } from '../../hooks/useUnifiedShipmentForm';

export function AddUnifiedShipmentForm({ initialType = 'domestic' }) {
  const {
    shipmentType, setShipmentType,
    companies,
    shipperSearch, setShipperSearch,
    consigneeSearch, setConsigneeSearch,
    showShipperSuggestions, setShowShipperSuggestions,
    showConsigneeSuggestions, setShowConsigneeSuggestions,
    formData, setFormData,
    masters,
    filteredBranches,
    filteredShipperCustomers,
    filteredConsigneeCustomers,
    handleChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleSelectShipper,
    handleSelectConsignee,
    handleSubmit
  } = useUnifiedShipmentForm(initialType);

  return (
    <div className="bg-white min-h-full p-1 font-sans selection:bg-blue-100">
      <datalist id="countries-list">
        {masters.countries.map(c => <option key={c.id} value={c.name} />)}
      </datalist>

      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-green-800 p-1 mb-1">
         <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-tighter">AWB Details</span>
         </div>
         <div className="flex gap-1">
            <button 
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded shadow-sm transition-colors uppercase"
            >
               Create AWB and Print Label
            </button>
         </div>
      </div>

      <div className="mb-1">
         <h2 className="text-[14px] font-bold text-slate-800 uppercase px-1 pb-1">Add AWB</h2>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-3 gap-0 border border-slate-300 divide-x divide-slate-300">
        <AwbInfoSection
          formData={formData}
          handleChange={handleChange}
          companies={companies}
          filteredBranches={filteredBranches}
          shipmentType={shipmentType}
          setShipmentType={setShipmentType}
          setFormData={setFormData}
          masters={masters}
        />
        <ShipperInfoSection
          formData={formData}
          handleChange={handleChange}
          shipperSearch={shipperSearch}
          setShipperSearch={setShipperSearch}
          showShipperSuggestions={showShipperSuggestions}
          setShowShipperSuggestions={setShowShipperSuggestions}
          filteredShipperCustomers={filteredShipperCustomers}
          handleSelectShipper={handleSelectShipper}
        />
        <ConsigneeInfoSection
          formData={formData}
          handleChange={handleChange}
          consigneeSearch={consigneeSearch}
          setConsigneeSearch={setConsigneeSearch}
          showConsigneeSuggestions={showConsigneeSuggestions}
          setShowConsigneeSuggestions={setShowConsigneeSuggestions}
          filteredConsigneeCustomers={filteredConsigneeCustomers}
          handleSelectConsignee={handleSelectConsignee}
        />
      </div>

      <WeightsDimensionsSection
        formData={formData}
        handleChange={handleChange}
        handleArrayChange={handleArrayChange}
        shipmentType={shipmentType}
      />

      <InvoiceSection
        formData={formData}
        handleChange={handleChange}
      />

      {/* Invoice Items Table */}
      <InvoiceItemsTable
        formData={formData}
        handleArrayChange={handleArrayChange}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />

      {/* Charges & Billing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        <ChargesSection
          formData={formData}
          handleChange={handleChange}
        />
        <FinalChargeSection
          formData={formData}
          handleChange={handleChange}
          masters={masters}
          handleSubmit={handleSubmit}
        />
      </div>

    </div>
  );
}

export default AddUnifiedShipmentForm;
