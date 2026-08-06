import React, { useState, useEffect } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useConfirmDelete, ConfirmDeleteModal } from '@/hooks/useConfirmDelete';
import { Plus, Loader2, AlertCircle, Building2, GitBranch, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyForm } from './company/CompanyForm';
import { BranchForm, BranchList } from './company/BranchComponents';
import { Footer } from "@/components/shared/Footer";

import { API_BASE_URL } from '@/services/api';

const API = `${API_BASE_URL}/company`;

export function CompanySetting() {
  const [view,         setView]        = useState('list');
  const [editCompany,  setEditCompany] = useState(null);
  const [selCompany,   setSelCompany]  = useState(null);
  const [editBranch,   setEditBranch]  = useState(null);
  const [branchMenuId, setBranchMenuId] = useState(null);

  const { data: companies, loading, error, refetch: fetchCompanies } = useAsync(
    async () => {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  );

  useEffect(() => {
    const close = () => setBranchMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const { deletingId, requestDelete, cancelDelete, confirmDelete } = useConfirmDelete(async id => {
    try { await fetch(`${API}/${id}`, { method: 'DELETE' }); fetchCompanies(); }
    catch (e) { alert('Error: ' + e.message); }
  });

  // ── routing ──
  if (view === 'company-form')
    return <CompanyForm editData={editCompany} onBack={() => setView('list')} onSave={() => { setView('list'); fetchCompanies(); }}/>;

  if (view === 'branch-list')
    return <BranchList
      company={selCompany}
      onBack={() => setView('list')}
      onAddBranch={() => setView('branch-form-add')}
      onEditBranch={b => { setEditBranch(b); setView('branch-form-edit'); }}/>;

  if (view === 'branch-form-add')
    return <BranchForm company={selCompany} editData={null}
      onBack={() => setView('branch-list')}
      onSave={() => setView('branch-list')}/>;

  if (view === 'branch-form-edit')
    return <BranchForm company={selCompany} editData={editBranch}
      onBack={() => setView('branch-list')}
      onSave={() => setView('branch-list')}/>;

  /* ── LIST VIEW ── */
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[15px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#1e3a8a]"/> Company Details
        </h1>
        <Button id="btn-add-company" onClick={() => { setEditCompany(null); setView('company-form'); }}
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
              <button onClick={() => { setEditCompany(null); setView('company-form'); }} className="text-[#1e3a8a] font-black text-[11px] underline">+ Add Company Details</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 uppercase font-black">
                  {['Sr.No.','Company Name','Address','Contact No.','Email','Logo','Action'].map(h => (
                    <th key={h} className="px-4 py-3.5 border-r border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((row, idx) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-500 border-r border-slate-100">{idx + 1}</td>
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
                        <button onClick={() => { setEditCompany(row); setView('company-form'); }}
                          className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded transition-colors shadow-sm" title="Edit">
                          <Pencil className="h-3.5 w-3.5"/>
                        </button>
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setBranchMenuId(prev => prev === row.id ? null : row.id)}
                            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white p-1.5 rounded transition-colors shadow-sm flex items-center gap-1 px-2"
                            title="Branches">
                            <GitBranch className="h-3.5 w-3.5"/>
                            <span className="text-[9px] font-black uppercase tracking-wide">Branch</span>
                          </button>
                          {branchMenuId === row.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1">
                              <button onClick={() => { setSelCompany(row); setView('branch-list'); setBranchMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors uppercase tracking-wide">
                                <Eye className="h-3.5 w-3.5"/> View Branches
                              </button>
                              <button onClick={() => { setSelCompany(row); setEditBranch(null); setView('branch-form-add'); setBranchMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors uppercase tracking-wide">
                                <Plus className="h-3.5 w-3.5"/> Add Branch
                              </button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => requestDelete(row.id)}
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

      <Footer theme="svp" />

      {deletingId && (
        <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}
