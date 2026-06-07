/**
 * useUnifiedShipmentForm.js — Thin orchestrator.
 *
 * Composes four focused modules:
 *   useFormData.js          → default state
 *   useFormLoaders.js       → API calls & data hydration
 *   useFormCalculations.js  → derived values & field handlers
 *   useFormSubmit.js         → submit handler & customer selection
 *
 * The public API returned to AddUnifiedShipmentForm.jsx is unchanged.
 */
import { useState } from 'react';
import { createDefaultFormData, createDefaultMasters } from './useFormData';
import {
  useInitialLoaders,
  useAwbPrefixSync,
  useEditShipmentLoader,
  useCityLoaders,
  useInternationalZoneLookup,
  useCallingCodeSync,
  useInternationalRateLookup,
  useFuelPriceLookup
} from './useFormLoaders';
import {
  useFuelSurchargeCalc,
  useWeightRollup,
  useChargesTotal,
  useGstCalc,
  createFieldHandlers
} from './useFormCalculations';
import { createSubmitHandler, createShipperConsigneeHandlers } from './useFormSubmit';

export function useUnifiedShipmentForm(initialType = 'domestic', editingShipmentId = null) {
  // ── Core state ──
  const [shipmentType, setShipmentType] = useState(initialType);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedConsigneeId, setSelectedConsigneeId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [shipperSearch, setShipperSearch] = useState('');
  const [consigneeSearch, setConsigneeSearch] = useState('');
  const [showShipperSuggestions, setShowShipperSuggestions] = useState(false);
  const [showConsigneeSuggestions, setShowConsigneeSuggestions] = useState(false);
  const [lastFetchedRateKey, setLastFetchedRateKey] = useState('');
  const [lastFetchedFuelKey, setLastFetchedFuelKey] = useState('');
  const [fuelPricePct, setFuelPricePct] = useState(0);
  const [formData, setFormData] = useState(createDefaultFormData(initialType));
  const [masters, setMasters] = useState(createDefaultMasters());

  // ── Data loaders ──
  useInitialLoaders({ setCustomers, setCompanies, setFormData, setMasters });
  useAwbPrefixSync({ shipmentType, editingShipmentId, setFormData });
  useEditShipmentLoader({ editingShipmentId, customers, setShipmentType, setSelectedCustomerId, setShipperSearch, setConsigneeSearch, setFormData });
  useCityLoaders({ formData, masters, setMasters });
  useInternationalZoneLookup({ formData, setFormData });
  useCallingCodeSync({ formData, setFormData });
  useInternationalRateLookup({ formData, setFormData, lastFetchedRateKey, setLastFetchedRateKey });
  useFuelPriceLookup({ selectedCustomerId, formData, shipmentType, customers, lastFetchedFuelKey, setLastFetchedFuelKey, setFuelPricePct });

  // ── Calculations ──
  useFuelSurchargeCalc({ formData, fuelPricePct, setFormData });
  useWeightRollup({ formData, setFormData });
  useChargesTotal({ formData, setFormData });
  useGstCalc({ formData, selectedCustomerId, customers, setFormData });

  // ── Field handlers ──
  const { handleChange, handleArrayChange, addArrayItem, removeArrayItem } =
    createFieldHandlers({ setFormData, setSelectedCustomerId, setShipperSearch, setShipmentType });

  // ── Submit ──
  const handleSubmit = createSubmitHandler({
    formData, shipmentType, selectedCustomerId, selectedConsigneeId,
    customers, editingShipmentId,
    setCustomers, setSelectedCustomerId
  });

  // ── Shipper / Consignee selection ──
  const { filteredShipperCustomers, filteredConsigneeCustomers, handleSelectShipper, handleSelectConsignee } =
    createShipperConsigneeHandlers({
      customers, formData,
      setSelectedCustomerId, setSelectedConsigneeId,
      setShipperSearch, setConsigneeSearch, setFormData,
      shipperSearch, consigneeSearch
    });

  // ── Derived data ──
  const selectedCompany = companies.find(c => c.company_name === formData.booking_company);
  const filteredBranches = selectedCompany 
    ? masters.branches.filter(b => b.company_id === selectedCompany.id)
    : [];

  // ── Public API (unchanged) ──
  return {
    shipmentType, setShipmentType,
    customers, setCustomers,
    selectedCustomerId, setSelectedCustomerId,
    selectedConsigneeId, setSelectedConsigneeId,
    companies, setCompanies,
    shipperSearch, setShipperSearch,
    consigneeSearch, setConsigneeSearch,
    showShipperSuggestions, setShowShipperSuggestions,
    showConsigneeSuggestions, setShowConsigneeSuggestions,
    formData, setFormData,
    masters, setMasters,
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
  };
}
