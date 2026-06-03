import React from 'react';

export const SectionHeader = ({ title, className = "", isWhite = false }) => (
  <div className={`flex items-center justify-between px-2 py-1.5 ${isWhite ? "bg-white border-t border-slate-300" : "bg-green-800 text-white"} text-[10px] font-black border-b border-slate-200 ${className}`}>
    <span className="uppercase tracking-widest">{title}</span>
  </div>
);

export const FormField = ({ label, name, type = "text", value, placeholder, required = false, children, className = "", labelWidth = "100px", isRed = false, inputMaxWidth = "none", onChange, readOnly = false }) => (
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
          onChange={readOnly ? undefined : onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full h-full px-2 border border-slate-300 text-[12px] font-bold text-slate-900 outline-none transition-colors placeholder:text-slate-300 placeholder:font-normal ${readOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-[#fcfcfc] focus:bg-white'}`}
        />
      )}
    </div>
  </div>
);
