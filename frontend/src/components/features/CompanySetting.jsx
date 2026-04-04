import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ArrowLeft, Loader2, AlertCircle, Building2, GitBranch, Eye, X } from "lucide-react";

const API      = 'http://localhost:5000/api/company';
const BAPI     = 'http://localhost:5000/api/branches';

/* ─── helpers ─── */
const emptyCompanyForm = {
  company_name:'', logo:'', gst_no:'', email:'', address:'', pan:'',
  export_invoice_series:'', import_invoice_series:'', domestic_invoice_series:'',
  contact_no:'', website:'', branch_wise_invoice:false, invoice_terms:'',
  account_name:'', account_number:'', ifsc:'', branch_name:'', bank_name:'', bank_terms:'',
};

const emptyBranchForm = {
  branch_name:'', branch_code:'', email:'', contact_no:'',
  address:'', city:'', state:'', pincode:'', contact_person:'',
};

const TOOLBAR = [
  { cmd:'bold',              label:'B',     style:'font-bold'  },
  { cmd:'italic',            label:'I',     style:'italic'     },
  { cmd:'underline',         label:'U',     style:'underline'  },
  { cmd:'insertUnorderedList', label:'• List', style:''        },
  { cmd:'insertOrderedList',   label:'1. List',style:''        },
  { cmd:'justifyLeft',       label:'◁',    style:''           },
  { cmd:'justifyCenter',     label:'▷◁',   style:''           },
  { cmd:'justifyRight',      label:'▷',    style:''           },
];

function RichEditor({ value, onChange }) {
  const ref = useRef();
  const exec = cmd => { ref.current.focus(); document.execCommand(cmd, false, null); onChange(ref.current.innerHTML); };
  return (
    <div className="border-2 border-slate-200 rounded-lg overflow-hidden focus-within:border-[#1e3a8a] transition-colors">
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
        {TOOLBAR.map(t => (
          <button key={t.cmd} type="button" onMouseDown={e=>{e.preventDefault();exec(t.cmd);}}
            className={`px-2 py-1 text-[11px] ${t.style} text-slate-700 hover:bg-slate-200 rounded transition-colors border border-slate-200`}>{t.label}</button>
        ))}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={e=>onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{__html:value}}
        className="min-h-[140px] p-3 text-[12px] text-slate-700 outline-none" style={{lineHeight:'1.6'}} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-3 py-2.5 px-4 border-b border-slate-100">
      <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide pt-2 leading-tight">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function TInput({ id, value, onChange, placeholder, type='text', readOnly=false }) {
  return (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`h-8 w-full max-w-sm px-2.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal
        ${readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50'}`} />
  );
}

/* ══════════════════════════════════════════
   BRANCH FORM
══════════════════════════════════════════ */
function BranchForm({ company, editData, onBack, onSave }) {
  const [form, setForm] = useState(editData ? { ...editData } : emptyBranchForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  // auto-load next branch code for new branch
  useEffect(() => {
    if (!editData) {
      fetch(`${BAPI}/next-code`)
        .then(r=>r.json())
        .then(d=>setForm(p=>({...p, branch_code: d.code})))
        .catch(()=>{});
    }
  }, [editData]);

  const f = key => e => setForm(p=>({...p, [key]: e.target.value}));

  const handleSave = async e => {
    e.preventDefault();
    if (!form.branch_name.trim()) { setErr('Branch Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const url    = editData ? `${BAPI}/${editData.id}` : BAPI;
      const method = editData ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, company_id: company.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      onSave();
    } catch(e2) { setErr(e2.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <h2 className="text-[13px] font-black text-[#1a2f4c] uppercase tracking-wide flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> {editData ? 'Edit Branch' : 'Add Branch'}
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold">{company.company_name}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-5xl mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-wide">
              {editData ? 'Edit Branch' : 'Add Branch'}
            </h3>
          </div>

          {err && (
            <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2 rounded">
              <AlertCircle className="h-4 w-4 shrink-0"/>{err}
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Name',           key:'branch_name',    placeholder:'ENTER NAME'           },
                { label:'Email',          key:'email',          placeholder:'ENTER EMAIL'          },
                { label:'Address',        key:'address',        placeholder:'ENTER ADDRESS'        },
                { label:'State',          key:'state',          placeholder:'SELECT STATE'         },
              ].map(({label, key, placeholder}) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    value={form[key]} onChange={f(key)} placeholder={placeholder}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'City Name',      key:'city',           placeholder:'SELECT CITY'          },
                { label:'Pincode',        key:'pincode',        placeholder:'ENTER PINCODE'        },
                { label:'Contact No.',    key:'contact_no',     placeholder:'ENTER CONTACT NO'     },
                { label:'Contact Person', key:'contact_person', placeholder:'ENTER CONTACT PERSON' },
              ].map(({label, key, placeholder}) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    value={form[key]} onChange={f(key)} placeholder={placeholder}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              ))}
            </div>

            {/* Branch Code */}
            <div className="flex items-center gap-4 pt-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide w-28">Branch Code</label>
              <input value={form.branch_code} readOnly
                className="h-8 w-36 px-2.5 border border-slate-300 rounded text-[11px] font-black text-slate-500 bg-slate-100 cursor-not-allowed outline-none"/>
            </div>
          </div>

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-black uppercase text-[11px] tracking-widest px-8 py-2.5 rounded shadow-md transition-all flex items-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin"/>}
              {saving ? 'Saving...' : editData ? 'Update Branch' : 'Add Branch'}
            </button>
            <button type="button" onClick={onBack}
              className="border border-slate-300 text-slate-600 font-black uppercase text-[11px] tracking-widest px-6 py-2.5 rounded transition-all hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );

}

/* ══════════════════════════════════════════
   BRANCH LIST
══════════════════════════════════════════ */
function BranchList({ company, onBack, onAddBranch, onEditBranch }) {
  const [branches,    setBranches]  = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [error,       setError]     = useState('');
  const [deletingId,  setDeletingId]= useState(null);

  const load = async () => {
    try {
      setLoading(true); setError('');
      const res = await fetch(`${BAPI}?company_id=${company.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setBranches(await res.json());
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [company.id]);

  const handleDelete = async id => {
    try {
      await fetch(`${BAPI}/${id}`, { method:'DELETE' });
      setDeletingId(null);
      load();
    } catch(e) { alert('Error: '+e.message); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-600"/>
          </button>
          <div>
            <h1 className="text-[15px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-[#1e3a8a]"/> All Branches
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{company.company_name}</p>
          </div>
        </div>
        <Button onClick={onAddBranch}
          className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-5 py-2 rounded text-[11px] font-black uppercase tracking-wide transition-all shadow-sm flex items-center gap-2">
          <Plus className="h-3.5 w-3.5"/> Add Branch
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-4 py-3 rounded">
          <AlertCircle className="h-4 w-4"/>{error}
          <button onClick={load} className="ml-auto underline">Retry</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-10 text-[11px]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-5 w-5 animate-spin"/> Loading...
            </div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <GitBranch className="h-10 w-10 text-slate-200"/>
              <p className="font-bold text-[12px]">No branches found for this company.</p>
              <button onClick={onAddBranch} className="text-[#1e3a8a] font-black text-[11px] underline">+ Add Branch</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 uppercase font-black">
                  <th className="px-3 py-3.5 border-r border-slate-100 w-10">Sr.</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Branch Name</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Branch Code</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Email</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Contact No</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Address</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">City</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">State</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Pincode</th>
                  <th className="px-3 py-3.5 border-r border-slate-100">Contact Person</th>
                  <th className="px-3 py-3.5 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b, i) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 font-bold text-slate-500 border-r border-slate-100">{i+1}</td>
                    <td className="px-3 py-3 font-black text-slate-800 border-r border-slate-100 uppercase">{b.branch_name}</td>
                    <td className="px-3 py-3 font-bold text-blue-700 border-r border-slate-100">{b.branch_code}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100">{b.email}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100">{b.contact_no}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100 max-w-[160px] truncate" title={b.address}>{b.address}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100 uppercase">{b.city}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100 uppercase">{b.state}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100">{b.pincode}</td>
                    <td className="px-3 py-3 font-bold text-slate-600 border-r border-slate-100">{b.contact_person}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={()=>onEditBranch(b)}
                          className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded transition-colors shadow-sm">
                          <Pencil className="h-3 w-3"/>
                        </button>
                        <button onClick={()=>setDeletingId(b.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors shadow-sm">
                          <Trash2 className="h-3 w-3"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">
          FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE
        </p>
      </div>

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-full"><Trash2 className="h-5 w-5 text-red-600"/></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>handleDelete(deletingId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Delete</button>
              <button onClick={()=>setDeletingId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPANY FORM (Add / Edit)
══════════════════════════════════════════ */
function CompanyForm({ editData, onBack, onSave }) {
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
    reader.onloadend = () => { setLogoPreview(reader.result); setForm(p=>({...p, logo: reader.result})); };
    reader.readAsDataURL(file);
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.company_name.trim()) { setErr('Company Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const url    = editData ? `${API}/${editData.id}` : API;
      const method = editData ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      onSave();
    } catch(e2) { setErr(e2.message); }
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
                  onChange={e=>setForm(p=>({...p, branch_wise_invoice:e.target.checked}))}
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
              <RichEditor value={form.invoice_terms} onChange={val=>setForm(p=>({...p, invoice_terms:val}))}/>
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
              <RichEditor value={form.bank_terms} onChange={val=>setForm(p=>({...p, bank_terms:val}))}/>
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
      <div className="pb-4 text-center border-t border-slate-100 pt-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   BRANCH DROPDOWN (small popup)
══════════════════════════════════════════ */
function BranchDropdown({ onViewBranches, onAddBranch, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
      <button onClick={()=>{ onViewBranches(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors uppercase tracking-wide">
        <Eye className="h-3.5 w-3.5"/> View Branches
      </button>
      <button onClick={()=>{ onAddBranch(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors uppercase tracking-wide">
        <Plus className="h-3.5 w-3.5"/> Add Branch
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT: CompanySetting
══════════════════════════════════════════ */
export function CompanySetting() {
  const [view,          setView]         = useState('list');     // 'list' | 'company-form' | 'branch-list' | 'branch-form'
  const [editCompany,   setEditCompany]  = useState(null);
  const [selCompany,    setSelCompany]   = useState(null);       // company context for branch views
  const [editBranch,    setEditBranch]   = useState(null);
  const [companies,     setCompanies]    = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState('');
  const [deletingId,    setDeletingId]   = useState(null);
  const [branchMenuId,  setBranchMenuId] = useState(null);      // which row's dropdown is open

  const fetchCompanies = async () => {
    try { setLoading(true); setError('');
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to fetch');
      setCompanies(await res.json());
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchCompanies(); }, []);

  // Close dropdown when clicking outside
  useEffect(()=>{
    const close = ()=> setBranchMenuId(null);
    document.addEventListener('click', close);
    return ()=> document.removeEventListener('click', close);
  }, []);

  const handleDelete = async id => {
    try { await fetch(`${API}/${id}`, {method:'DELETE'}); setDeletingId(null); fetchCompanies(); }
    catch(e) { alert('Error: '+e.message); }
  };

  // ── routing ──
  if (view === 'company-form')
    return <CompanyForm editData={editCompany} onBack={()=>setView('list')} onSave={()=>{ setView('list'); fetchCompanies(); }}/>;

  if (view === 'branch-list')
    return <BranchList
      company={selCompany}
      onBack={()=>setView('list')}
      onAddBranch={()=>setView('branch-form-add')}
      onEditBranch={b=>{ setEditBranch(b); setView('branch-form-edit'); }}/>;

  if (view === 'branch-form-add')
    return <BranchForm company={selCompany} editData={null}
      onBack={()=>setView('branch-list')}
      onSave={()=>setView('branch-list')}/>;

  if (view === 'branch-form-edit')
    return <BranchForm company={selCompany} editData={editBranch}
      onBack={()=>setView('branch-list')}
      onSave={()=>setView('branch-list')}/>;

  /* ── LIST VIEW ── */
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[15px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#1e3a8a]"/> Company Details
        </h1>
        <Button id="btn-add-company" onClick={()=>{ setEditCompany(null); setView('company-form'); }}
          className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-5 py-2 rounded text-[11px] font-black uppercase tracking-wide transition-all shadow-sm flex items-center gap-2">
          <Plus className="h-3.5 w-3.5"/> Add Company Details
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-4 py-3 rounded">
          <AlertCircle className="h-4 w-4"/>{error}
          <button onClick={fetchCompanies} className="ml-auto underline">Retry</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-10 text-[11px]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-5 w-5 animate-spin"/> Loading...
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Building2 className="h-10 w-10 text-slate-200"/>
              <p className="font-bold text-[12px]">No company details found.</p>
              <button onClick={()=>{ setEditCompany(null); setView('company-form'); }} className="text-[#1e3a8a] font-black text-[11px] underline">+ Add Company Details</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 uppercase font-black">
                  <th className="px-4 py-3.5 border-r border-slate-100 w-14">Sr.No.</th>
                  <th className="px-4 py-3.5 border-r border-slate-100">Company Name</th>
                  <th className="px-4 py-3.5 border-r border-slate-100">Address</th>
                  <th className="px-4 py-3.5 border-r border-slate-100">Contact No.</th>
                  <th className="px-4 py-3.5 border-r border-slate-100">Email</th>
                  <th className="px-4 py-3.5 border-r border-slate-100 w-20 text-center">Logo</th>
                  <th className="px-4 py-3.5 w-40 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((row, idx) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-500 border-r border-slate-100">{idx+1}</td>
                    <td className="px-4 py-3.5 font-black text-slate-800 border-r border-slate-100 uppercase">{row.company_name}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-600 border-r border-slate-100 max-w-xs">{row.address}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-600 border-r border-slate-100">{row.contact_no}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-600 border-r border-slate-100">{row.email}</td>
                    <td className="px-4 py-3.5 border-r border-slate-100 text-center">
                      {row.logo
                        ? <img src={row.logo} alt="logo" className="h-9 w-9 object-contain rounded mx-auto ring-1 ring-slate-200"/>
                        : <div className="h-9 w-9 bg-slate-100 rounded mx-auto flex items-center justify-center"><Building2 className="h-4 w-4 text-slate-300"/></div>
                      }
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit */}
                        <button onClick={()=>{ setEditCompany(row); setView('company-form'); }}
                          className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded transition-colors shadow-sm" title="Edit">
                          <Pencil className="h-3.5 w-3.5"/>
                        </button>

                        {/* Branch — shows dropdown */}
                        <div className="relative" onClick={e=>e.stopPropagation()}>
                          <button
                            onClick={()=> setBranchMenuId(prev => prev === row.id ? null : row.id)}
                            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white p-1.5 rounded transition-colors shadow-sm flex items-center gap-1 px-2"
                            title="Branches">
                            <GitBranch className="h-3.5 w-3.5"/>
                            <span className="text-[9px] font-black uppercase tracking-wide">Branch</span>
                          </button>
                          {branchMenuId === row.id && (
                            <BranchDropdown
                              onViewBranches={()=>{ setSelCompany(row); setView('branch-list'); }}
                              onAddBranch={()=>{ setSelCompany(row); setEditBranch(null); setView('branch-form-add'); }}
                              onClose={()=>setBranchMenuId(null)}
                            />
                          )}
                        </div>

                        {/* Delete */}
                        <button onClick={()=>setDeletingId(row.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors shadow-sm" title="Delete">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
        </p>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">
          FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE
        </p>
      </div>

      {/* Delete Confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-full"><Trash2 className="h-5 w-5 text-red-600"/></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>handleDelete(deletingId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Delete</button>
              <button onClick={()=>setDeletingId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
