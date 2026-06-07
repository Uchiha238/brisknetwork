import React, { useRef } from 'react';

export const emptyCompanyForm = {
  company_name: '', logo: '', gst_no: '', email: '', address: '', pan: '',
  export_invoice_series: '', import_invoice_series: '', domestic_invoice_series: '',
  contact_no: '', website: '', branch_wise_invoice: false, invoice_terms: '',
  account_name: '', account_number: '', ifsc: '', branch_name: '', bank_name: '', bank_terms: '',
};

const TOOLBAR = [
  { cmd: 'bold',                label: 'B',      style: 'font-bold'  },
  { cmd: 'italic',              label: 'I',      style: 'italic'     },
  { cmd: 'underline',           label: 'U',      style: 'underline'  },
  { cmd: 'insertUnorderedList', label: '• List', style: ''           },
  { cmd: 'insertOrderedList',   label: '1. List',style: ''           },
  { cmd: 'justifyLeft',         label: '◁',     style: ''           },
  { cmd: 'justifyCenter',       label: '▷◁',    style: ''           },
  { cmd: 'justifyRight',        label: '▷',     style: ''           },
];

export function RichEditor({ value, onChange }) {
  const ref = useRef();
  const exec = cmd => { ref.current.focus(); document.execCommand(cmd, false, null); onChange(ref.current.innerHTML); };
  return (
    <div className="border-2 border-slate-200 rounded-lg overflow-hidden focus-within:border-[#1e3a8a] transition-colors">
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
        {TOOLBAR.map(t => (
          <button key={t.cmd} type="button" onMouseDown={e => { e.preventDefault(); exec(t.cmd); }}
            className={`px-2 py-1 text-[11px] ${t.style} text-slate-700 hover:bg-slate-200 rounded transition-colors border border-slate-200`}>{t.label}</button>
        ))}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[140px] p-3 text-[12px] text-slate-700 outline-none" style={{ lineHeight: '1.6' }} />
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-3 py-2.5 px-4 border-b border-slate-100">
      <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide pt-2 leading-tight">{label}</label>
      <div>{children}</div>
    </div>
  );
}

export function TInput({ id, value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`h-8 w-full max-w-sm px-2.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal
        ${readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50'}`} />
  );
}
