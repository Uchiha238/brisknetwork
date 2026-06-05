import React from 'react';

export const SectionHeader = ({ title, className = "", isWhite = false }) => (
  <div className={`flex items-center justify-between px-2 py-1.5 ${isWhite ? "bg-white border-t border-slate-300" : "bg-green-800 text-white"} text-[10px] font-black border-b border-slate-200 ${className}`}>
    <span className="uppercase tracking-widest">{title}</span>
  </div>
);

export const FormField = ({ label, name, type = "text", value, placeholder, required = false, children, className = "", labelWidth = "100px", isRed = false, inputMaxWidth = "none", onChange, readOnly = false, disabled = false, tabIndex }) => (
  <div className={`grid items-center gap-1 leading-none ${className}`} style={{ gridTemplateColumns: `${labelWidth} 1fr` }}>
    <label className={`text-[10px] font-black uppercase truncate ${isRed || required ? "text-red-600" : "text-slate-700"}`}>
      {label}
    </label>
    <div className="relative flex items-center h-[22px]" style={{ maxWidth: inputMaxWidth }}>
      {children ? children : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={readOnly || disabled ? undefined : onChange}
          readOnly={readOnly}
          disabled={disabled}
          tabIndex={tabIndex !== undefined ? tabIndex : (readOnly || disabled ? -1 : undefined)}
          placeholder={placeholder}
          className={`w-full h-full px-2 border border-slate-300 text-[12px] font-bold text-slate-900 outline-none transition-colors placeholder:text-slate-300 placeholder:font-normal ${readOnly || disabled ? 'bg-slate-100 cursor-not-allowed pointer-events-none' : 'bg-[#fcfcfc] focus:bg-white'}`}
        />
      )}
    </div>
  </div>
);
export const getCountryCallingCode = (countryName) => {
  if (!countryName) return '+91'; // default fallback to India
  const upper = countryName.trim().toUpperCase();
  if (upper === 'INDIA' || upper === 'IN') return '+91';
  if (upper === 'UNITED STATES' || upper === 'UNITED STATES OF AMERICA' || upper === 'USA' || upper === 'US') return '+1';
  if (upper === 'UNITED KINGDOM' || upper === 'UK' || upper === 'GB') return '+44';
  if (upper === 'UNITED ARAB EMIRATES' || upper === 'UAE' || upper === 'AE') return '+971';
  if (upper === 'CANADA' || upper === 'CA') return '+1';
  if (upper === 'AUSTRALIA' || upper === 'AU') return '+61';
  if (upper === 'GERMANY' || upper === 'DE') return '+49';
  if (upper === 'FRANCE' || upper === 'FR') return '+33';
  if (upper === 'JAPAN' || upper === 'JP') return '+81';
  if (upper === 'SINGAPORE' || upper === 'SG') return '+65';
  if (upper === 'CHINA' || upper === 'CN') return '+86';
  if (upper === 'MALAYSIA' || upper === 'MY') return '+60';
  if (upper === 'HONG KONG' || upper === 'HK') return '+852';
  if (upper === 'OMAN' || upper === 'OM') return '+968';
  if (upper === 'QATAR' || upper === 'QA') return '+974';
  if (upper === 'SAUDI ARABIA' || upper === 'SA') return '+966';
  if (upper === 'KUWAIT' || upper === 'KW') return '+965';
  if (upper === 'BAHRAIN' || upper === 'BH') return '+973';
  if (upper === 'SOUTH AFRICA' || upper === 'ZA') return '+27';
  return '+1'; // international fallback
};

