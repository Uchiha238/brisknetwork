import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { Footer } from "@/components/shared/Footer";

import { COURIERS, COMPANY_TYPES, CUSTOMERS, emptyForm, emptyGroup, FUEL_API, GROUP_API, formatDate, getStatus } from './fuel/FuelConstants';
import AddFuelGroupModal from './fuel/AddFuelGroupModal';
import FuelEntryForm from './fuel/FuelEntryForm';
import FuelDetailView from './fuel/FuelDetailView';

// ─────────────── Main Component ───────────────
export function FuelGroup() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'add-fuel'
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [fuelGroups, setFuelGroups] = useState([]);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupEntries, setGroupEntries] = useState([]);
  
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingGroupEntries, setLoadingGroupEntries] = useState(false);
  const [groupError, setGroupError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deletingGroupId, setDeletingGroupId] = useState(null);
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  // ── fetch helpers ──
  const fetchGroups = async () => {
    try { setLoadingGroups(true); setGroupError('');
      const res = await fetch(GROUP_API);
      setFuelGroups(await res.json());
    } catch (e) { setGroupError(e.message); }
    finally { setLoadingGroups(false); }
  };

  const fetchEntries = async () => {
    try { setLoadingEntries(true);
      const res = await fetch(FUEL_API);
      setFuelEntries(await res.json());
    } catch (_) {}
    finally { setLoadingEntries(false); }
  };

  const fetchGroupEntries = async (groupId) => {
    if (!groupId) return;
    try { setLoadingGroupEntries(true);
      const res = await fetch(`${FUEL_API}?fuel_group_id=${groupId}`);
      setGroupEntries(await res.json());
    } catch (_) {}
    finally { setLoadingGroupEntries(false); }
  };

  useEffect(() => { fetchGroups(); fetchEntries(); }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupEntries(selectedGroup.id);
    }
  }, [selectedGroup]);

  // ── slab helpers ──
  const updateSlab = (key, idx, field, val) => {
    setForm(f => {
      const slabs = [...f[key]];
      slabs[idx] = { ...slabs[idx], [field]: val };
      return { ...f, [key]: slabs };
    });
  };
  const addSlab = (key) => setForm(f => ({ ...f, [key]: [...f[key], { from: '', to: '', rate: '' }] }));
  const removeSlab = (key, idx) => setForm(f => {
    const slabs = f[key].filter((_, i) => i !== idx);
    return { ...f, [key]: slabs.length ? slabs : [{ from: '', to: '', rate: '' }] };
  });

  // ── open add fuel form ──
  const openAddFuel = () => {
    setEditingEntry(null);
    setForm({
      ...emptyForm,
      fuel_group_id: selectedGroup ? selectedGroup.id.toString() : '',
      company_type: selectedGroup ? (selectedGroup.type.toLowerCase() === 'international' ? 'International' : 'Domestic') : 'Domestic'
    });
    setFormError('');
    setView('add-fuel');
  };

  const openEditFuel = (entry) => {
    setEditingEntry(entry);
    const allSlabs = entry.rate_slabs || [];
    const half = Math.ceil(allSlabs.length / 2);
    setForm({
      ...emptyForm,
      fuel_group_id: entry.fuel_group_id ? entry.fuel_group_id.toString() : '',
      fuel_courier: entry.fuel_courier || 'All',
      fuel_price_pct: entry.fuel_price_pct ?? '',
      company_type: entry.company_type || 'Domestic',
      docket_charge: entry.docket_charge ?? '',
      customer: entry.customer || 'All',
      fov_min: entry.fov_min ?? '',
      fov_above: entry.fov_above ?? '',
      fov_below: entry.fov_below ?? '',
      fov_base: entry.fov_base ?? '',
      appointment_min: entry.appointment_min ?? '',
      appointment_per_kg: entry.appointment_per_kg ?? '',
      fuel_from_date: entry.fuel_from_date ?? '',
      fuel_to_date: entry.fuel_to_date ?? '',
      cft: entry.cft ?? '',
      air_cft: entry.air_cft ?? '',
      calculate_on: entry.calculate_on || 'Freight',
      cod_fixed: entry.cod_fixed ?? '',
      topay_fixed: entry.topay_fixed ?? '',
      rate_slabs: allSlabs.slice(0, half).length ? allSlabs.slice(0, half) : [{ from: '', to: '', rate: '' }],
      rate_slabs2: allSlabs.slice(half).length ? allSlabs.slice(half) : [{ from: '', to: '', rate: '' }],
    });
    setFormError('');
    setView('add-fuel');
  };

  // ── submit add/edit fuel ──
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const combined = [
        ...form.rate_slabs.filter(s => s.from || s.to || s.rate),
        ...form.rate_slabs2.filter(s => s.from || s.to || s.rate),
      ];
      let companyType = form.company_type || 'Domestic';
      if (form.fuel_group_id) {
        const matchingGroup = fuelGroups.find(g => g.id.toString() === form.fuel_group_id.toString());
        if (matchingGroup) {
          companyType = matchingGroup.type.toLowerCase() === 'international' ? 'International' : 'Domestic';
        }
      }
      
      const payload = { 
        ...form, 
        fuel_price_pct: parseFloat(form.fuel_price_pct) || 0,
        company_type: companyType,
        rate_slabs: combined, 
        fuel_group_id: form.fuel_group_id ? parseInt(form.fuel_group_id) : null 
      };
      delete payload.rate_slabs2;

      const url = editingEntry ? `${FUEL_API}/${editingEntry.id}` : FUEL_API;
      const method = editingEntry ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      
      if (selectedGroup) {
        await fetchGroupEntries(selectedGroup.id);
        setView('detail');
      } else {
        await fetchEntries();
        setView('list');
      }
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await fetch(`${GROUP_API}/${id}`, { method: 'DELETE' });
      setDeletingGroupId(null);
      await fetchGroups();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await fetch(`${FUEL_API}/${id}`, { method: 'DELETE' });
      setDeletingEntryId(null);
      if (selectedGroup) {
        await fetchGroupEntries(selectedGroup.id);
      } else {
        await fetchEntries();
      }
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setForm(prev => ({ ...prev, fuel_price_pct: val }));
    }
  };

  // ══════════════════════════════════════════════════════════
  //  ADD / EDIT FUEL FORM VIEW
  // ══════════════════════════════════════════════════════════
  if (view === 'add-fuel') {
    return (
      <FuelEntryForm
        form={form}
        setForm={setForm}
        fuelGroups={fuelGroups}
        selectedGroup={selectedGroup}
        editingEntry={editingEntry}
        formError={formError}
        saving={saving}
        onSubmit={handleFuelSubmit}
        onCancel={() => setView(selectedGroup ? 'detail' : 'list')}
        handlePriceChange={handlePriceChange}
      />
    );
  }

  // ══════════════════════════════════════════════════════════
  //  GROUP DASHBOARD / DETAIL VIEW
  // ══════════════════════════════════════════════════════════
  if (view === 'detail') {
    return (
      <FuelDetailView
        selectedGroup={selectedGroup}
        groupEntries={groupEntries}
        loadingGroupEntries={loadingGroupEntries}
        onBack={() => {
          setSelectedGroup(null);
          setView('list');
        }}
        onAddFuel={openAddFuel}
        onEditFuel={openEditFuel}
        deletingEntryId={deletingEntryId}
        setDeletingEntryId={setDeletingEntryId}
        onDeleteEntry={handleDeleteEntry}
      />
    );
  }

  // ══════════════════════════════════════════════════════════
  //  LIST VIEW
  // ══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">All Fuel Group List</h1>
        <div className="flex gap-2">
          <Button id="btn-add-fuel-group" onClick={() => setShowGroupModal(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Fuel Group
          </Button>
          <Button id="btn-add-fuel" onClick={openAddFuel}
            className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white border-none px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Fuel
          </Button>
        </div>
      </div>

      {groupError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-4 py-3 rounded">
          <AlertCircle className="h-4 w-4" />{groupError}
          <button onClick={fetchGroups} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Fuel Groups Table */}
      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-6 text-[11px]">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fuel Groups</span>
        </div>
        <div className="overflow-x-auto">
          {loadingGroups ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : fuelGroups.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 font-bold text-[12px]">No fuel groups yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                  <th className="px-4 py-3 border-r border-slate-100 w-16">ID</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel Group Name</th>
                  <th className="px-4 py-3 border-r border-slate-100">Type</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {fuelGroups.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-500 border-r border-slate-100">{row.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 border-r border-slate-100 uppercase">
                      <button
                        onClick={() => {
                          setSelectedGroup(row);
                          setView('detail');
                        }}
                        className="text-[#1e3a8a] hover:underline font-bold text-left uppercase"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${row.type.toLowerCase() === 'international' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{row.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedGroup(row);
                            setView('detail');
                          }} 
                          title="View Dashboard" 
                          className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white p-1 rounded shadow-sm flex items-center justify-center gap-1 px-2.5 h-[28px]"
                        >
                          <span className="text-[9px] font-black uppercase">Dashboard</span>
                        </button>
                        <button 
                          onClick={() => {
                            setEditingGroup(row);
                            setShowGroupModal(true);
                          }}
                          className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded shadow-sm"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeletingGroupId(row.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Fuel Entries Table */}
      <div className="bg-white border-2 border-slate-200 rounded overflow-hidden mb-10 text-[11px]">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Fuel Entries</span>
        </div>
        <div className="overflow-x-auto">
          {loadingEntries ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 font-bold text-[12px]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : fuelEntries.filter(row => !row.fuel_group_id).length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 font-bold text-[12px]">No global fuel entries yet. Click "Add Fuel" to create one.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200 text-slate-800 uppercase font-black">
                  <th className="px-4 py-3 border-r border-slate-100 w-12">ID</th>
                  <th className="px-4 py-3 border-r border-slate-100">Courier</th>
                  <th className="px-4 py-3 border-r border-slate-100">Type</th>
                  <th className="px-4 py-3 border-r border-slate-100">Customer</th>
                  <th className="px-4 py-3 border-r border-slate-100">Group</th>
                  <th className="px-4 py-3 border-r border-slate-100">Fuel %</th>
                  <th className="px-4 py-3 border-r border-slate-100">Date Range</th>
                  <th className="px-4 py-3 border-r border-slate-100">Calc On</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {fuelEntries.filter(row => !row.fuel_group_id).map(row => {
                  const matchingGroup = fuelGroups.find(g => g.id === row.fuel_group_id);
                  return (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-500 border-r border-slate-100">{row.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-700 border-r border-slate-100 uppercase">{row.fuel_courier}</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${row.company_type === 'International' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{row.company_type}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.customer}</td>
                      <td className="px-4 py-3 font-bold text-[#1e3a8a] border-r border-slate-100 uppercase">
                        {matchingGroup ? matchingGroup.name : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.fuel_price_pct ?? '—'}%</td>
                      <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{formatDate(row.fuel_from_date)} → {formatDate(row.fuel_to_date)}</td>
                      <td className="px-4 py-3 font-bold text-slate-600 border-r border-slate-100">{row.calculate_on}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditFuel(row)} className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-1.5 rounded shadow-sm"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeletingEntryId(row.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer theme="svp" />

      {/* Add Fuel Group Modal */}
      {showGroupModal && (
        <AddFuelGroupModal
          editingGroup={editingGroup}
          onClose={() => { setShowGroupModal(false); setEditingGroup(null); }}
          onSave={() => { setShowGroupModal(false); setEditingGroup(null); fetchGroups(); }}
        />
      )}

      {/* Delete Group Confirm */}
      {deletingGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteGroup(deletingGroupId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] py-2.5 rounded">Delete</button>
              <button onClick={() => setDeletingGroupId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] py-2.5 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entry Confirm */}
      {deletingEntryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <div>
                <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
                <p className="text-[11px] text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteEntry(deletingEntryId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] py-2.5 rounded">Delete</button>
              <button onClick={() => setDeletingEntryId(null)} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] py-2.5 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
