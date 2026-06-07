import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Building2, GitBranch, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BAPI = 'http://localhost:5000/api/branches';

export const emptyBranchForm = {
  branch_name: '', branch_code: '', email: '', contact_no: '',
  address: '', city: '', state: '', pincode: '', contact_person: '',
};

/* ─── BranchForm ─── */
export function BranchForm({ company, editData, onBack, onSave }) {
  const [form, setForm] = useState(editData ? { ...editData } : emptyBranchForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  useEffect(() => {
    if (!editData) {
      fetch(`${BAPI}/next-code`)
        .then(r => r.json())
        .then(d => setForm(p => ({ ...p, branch_code: d.code })))
        .catch(() => {});
    }
  }, [editData]);

  const f = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    if (!form.branch_name.trim()) { setErr('Branch Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const url    = editData ? `${BAPI}/${editData.id}` : BAPI;
      const method = editData ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company_id: company.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      onSave();
    } catch (e2) { setErr(e2.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50 font-sans">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Name',    key: 'branch_name', placeholder: 'ENTER NAME'    },
                { label: 'Email',   key: 'email',       placeholder: 'ENTER EMAIL'   },
                { label: 'Address', key: 'address',     placeholder: 'ENTER ADDRESS' },
                { label: 'State',   key: 'state',       placeholder: 'SELECT STATE'  },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                  <input value={form[key]} onChange={f(key)} placeholder={placeholder}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"/>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'City Name',      key: 'city',           placeholder: 'SELECT CITY'          },
                { label: 'Pincode',        key: 'pincode',        placeholder: 'ENTER PINCODE'        },
                { label: 'Contact No.',    key: 'contact_no',     placeholder: 'ENTER CONTACT NO'     },
                { label: 'Contact Person', key: 'contact_person', placeholder: 'ENTER CONTACT PERSON' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                  <input value={form[key]} onChange={f(key)} placeholder={placeholder}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"/>
                </div>
              ))}
            </div>
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

/* ─── BranchList ─── */
export function BranchList({ company, onBack, onAddBranch, onEditBranch }) {
  const [branches,   setBranches]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true); setError('');
      const res = await fetch(`${BAPI}?company_id=${company.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setBranches(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [company.id]);

  const handleDelete = async id => {
    try {
      await fetch(`${BAPI}/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
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
                  {['Sr.','Branch Name','Branch Code','Email','Contact No','Address','City','State','Pincode','Contact Person','Action'].map(h => (
                    <th key={h} className="px-3 py-3.5 border-r border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.map((b, i) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 font-bold text-slate-500 border-r border-slate-100">{i + 1}</td>
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
                        <button onClick={() => onEditBranch(b)}
                          className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded transition-colors shadow-sm">
                          <Pencil className="h-3 w-3"/>
                        </button>
                        <button onClick={() => setDeletingId(b.id)}
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

      <div className="mt-auto pt-6 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED.
        </p>
      </div>

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
              <button onClick={() => handleDelete(deletingId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Delete</button>
              <button onClick={() => setDeletingId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
