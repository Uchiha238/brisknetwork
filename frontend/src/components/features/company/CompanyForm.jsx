import React, { useState, useRef } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { RichEditor, Field, TInput, emptyCompanyForm } from './CompanyPrimitives';
import { Footer } from "@/components/shared/Footer";

const API = 'http://localhost:5000/api/company';

export function CompanyForm({ editData, onBack, onSave }) {
  const [form, setForm] = useState(editData ? {
    company_name: editData.company_name || '',
    logo: editData.logo || '',
    gst_no: editData.gst_no || '',
    email: editData.email || '',
    address: editData.address || '',
    pan: editData.pan || '',
    export_invoice_series: editData.export_invoice_series || '',
    import_invoice_series: editData.import_invoice_series || '',
    domestic_invoice_series: editData.domestic_invoice_series || '',
    contact_no: editData.contact_no || '',
    website: editData.website || '',
    branch_wise_invoice: !!editData.branch_wise_invoice,
    invoice_terms: editData.invoice_terms || '',
    account_name: editData.account_name || '',
    account_number: editData.account_number || '',
    ifsc: editData.ifsc || '',
    branch_name: editData.branch_name || '',
    bank_name: editData.bank_name || '',
    bank_terms: editData.bank_terms || '',
  } : emptyCompanyForm);

  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const [logoPreview, setLogoPreview] = useState(editData?.logo || '');
  const fileRef = useRef();

  const f = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setLogoPreview(reader.result); setForm(p => ({ ...p, logo: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.company_name.trim()) { setErr('Company Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const url    = editData ? `${API}/${editData.id}` : API;
      const method = editData ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      onSave();
    } catch (e2) { setErr(e2.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded transition-colors"><ArrowLeft className="h-4 w-4 text-slate-600"/></button>
        <h2 className="text-[13px] font-black text-[#1a2f4c] uppercase tracking-wide flex items-center gap-2">
          <Building2 className="h-4 w-4"/> {editData ? 'Edit Company' : 'Add Company'}
        </h2>
      </div>

      <form onSubmit={handleSave} className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-5xl mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-wide">{editData ? 'Edit Company' : 'Add Company'}</h3>
          </div>
          {err && (
            <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2 rounded">
              <AlertCircle className="h-4 w-4 shrink-0"/>{err}
            </div>
          )}
          <div className="divide-y divide-slate-100">
            <div className="py-2.5 px-4 border-b border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" checked={form.branch_wise_invoice}
                  onChange={e => setForm(p => ({ ...p, branch_wise_invoice: e.target.checked }))}
                  className="accent-[#1e3a8a] h-4 w-4"/>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Branch wise Invoice</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <Field label="Company Name"><TInput id="inp-company-name" value={form.company_name} onChange={f('company_name')} placeholder="COMPANY NAME"/></Field>
              <Field label="Company Logo">
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-300 file:text-[11px] file:font-bold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 transition-all"/>
                  {logoPreview && <img src={logoPreview} alt="logo" className="h-10 w-10 object-contain rounded ring-1 ring-slate-200"/>}
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <Field label="Gst No"><TInput id="inp-gst" value={form.gst_no} onChange={f('gst_no')} placeholder="ENTER GST NUMBER"/></Field>
              <Field label="Email Id"><TInput id="inp-email" type="email" value={form.email} onChange={f('email')} placeholder="EMAIL ID"/></Field>
              <Field label="Address">
                <textarea value={form.address} onChange={f('address')} placeholder="ENTER ADDRESS" rows={3}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all resize-none placeholder:text-slate-300 placeholder:font-normal"/>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <Field label="PAN"><TInput id="inp-pan" value={form.pan} onChange={f('pan')} placeholder="ENTER PAN ID"/></Field>
              <Field label="Export International Invoice Series"><TInput id="inp-export-series" value={form.export_invoice_series} onChange={f('export_invoice_series')} placeholder="ENTER INVOICE SERIES"/></Field>
              <Field label="Import International Invoice Series"><TInput id="inp-import-series" value={form.import_invoice_series} onChange={f('import_invoice_series')} placeholder="ENTER INVOICE SERIES"/></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <Field label="Domestic Invoice Series"><TInput id="inp-dom-series" value={form.domestic_invoice_series} onChange={f('domestic_invoice_series')} placeholder="ENTER INVOICE SERIES"/></Field>
              <Field label="Contact Number"><TInput id="inp-contact" value={form.contact_no} onChange={f('contact_no')} placeholder="CONTACT NUMBER"/></Field>
              <Field label="Website"><TInput id="inp-website" value={form.website} onChange={f('website')} placeholder="WEBSITE"/></Field>
            </div>
            <Field label="Invoice Terms & Condition">
              <RichEditor value={form.invoice_terms} onChange={val => setForm(p => ({ ...p, invoice_terms: val }))}/>
            </Field>
            <div className="px-4 py-3 bg-slate-100 border-t-2 border-slate-200">
              <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Bank Detail</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <Field label="Account Name"><TInput id="inp-account-name" value={form.account_name} onChange={f('account_name')} placeholder="ACCOUNT NAME"/></Field>
              <Field label="Account Number"><TInput id="inp-account-number" value={form.account_number} onChange={f('account_number')} placeholder="ACCOUNT NUMBER"/></Field>
              <Field label="IFSC"><TInput id="inp-ifsc" value={form.ifsc} onChange={f('ifsc')} placeholder="ENTER IFSC"/></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <Field label="Branch Name"><TInput id="inp-branch-name" value={form.branch_name} onChange={f('branch_name')} placeholder="ENTER BRANCH NAME"/></Field>
              <Field label="Bank Name"><TInput id="inp-bank-name" value={form.bank_name} onChange={f('bank_name')} placeholder="ENTER BANK NAME"/></Field>
            </div>
            <Field label="Terms & Condition">
              <RichEditor value={form.bank_terms} onChange={val => setForm(p => ({ ...p, bank_terms: val }))}/>
            </Field>
          </div>
          <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-black uppercase text-[11px] tracking-widest px-8 py-2.5 rounded shadow-md transition-all flex items-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin"/>}
              {saving ? 'Saving...' : editData ? 'Update Company' : 'Save Company'}
            </button>
            <button type="button" onClick={onBack}
              className="border border-slate-300 text-slate-600 font-black uppercase text-[11px] tracking-widest px-6 py-2.5 rounded transition-all hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      </form>
      <Footer theme="svp" />
    </div>
  );
}
