import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Mail, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000/api/mail-config';

export function MailConfig() {
  const [form, setForm]       = useState({ port_no: '', host: '', username: '', password: '' });
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [saved, setSaved]     = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [existingId, setExistingId] = useState(null);

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setExistingId(data.id);
          setForm({ port_no: data.port_no || '', host: data.host || '', username: data.username || '', password: data.password || '' });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const f = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.host.trim()) { setErr('Host is required.'); return; }
    setSaving(true); setErr(''); setSaved(false);
    try {
      const url    = existingId ? `${API}/${existingId}` : API;
      const method = existingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      if (!existingId && data.id) setExistingId(data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e2) { setErr(e2.message); }
    finally { setSaving(false); }
  };

  const fields = [
    { label: 'Port No',  key: 'port_no',  placeholder: 'PORT NUMBER', type: 'number' },
    { label: 'Host',     key: 'host',     placeholder: 'HOST',        type: 'text'   },
    { label: 'Username', key: 'username', placeholder: 'USERNAME',    type: 'text'   },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] bg-slate-50/30 p-4 md:p-8 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-4 w-4 text-[#1e3a8a]" />
        <h1 className="text-[15px] font-black text-slate-700 uppercase tracking-tight">Mail Config (SMTP)</h1>
      </div>

      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        {/* Card title */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-wide">Add SMTP</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400 font-bold text-[12px]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5">

            {err && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-3 py-2 rounded">
                <AlertCircle className="h-4 w-4 shrink-0" />{err}
              </div>
            )}

            {saved && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-2 rounded">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> SMTP settings saved successfully!
              </div>
            )}

            {/* Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              {fields.map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input
                    id={`smtp-${key}`}
                    type={type}
                    value={form[key]}
                    onChange={f(key)}
                    placeholder={placeholder}
                    className="w-full h-9 px-3 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              ))}

              {/* Password with show/hide */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="smtp-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={f('password')}
                    placeholder="PASSWORD"
                    className="w-full h-9 px-3 pr-9 border border-slate-300 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={saving}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-black uppercase text-[11px] tracking-widest px-8 py-2.5 rounded shadow-sm transition-all active:scale-95 flex items-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving...' : 'Submit'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100 opacity-80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL{' '}
          <span className="text-red-500">+91-9022062666</span>
        </p>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">
          FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE, COLLEGE ADMISSION SOFTWARE CALL 9022062666
        </p>
      </div>
    </div>
  );
}
