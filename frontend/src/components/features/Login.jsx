import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection refused. Is the server running?');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-slate-200">
        <div className="flex justify-center mb-10">
          <img src={logo} alt="Logo" className="h-20 object-contain" />
        </div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">OM COURIER SYSTEM</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Logistics Management Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin" 
              className="h-12 border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-lg font-bold text-slate-700" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="h-12 border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-lg font-bold text-slate-700" 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded shadow-sm">
                <p className="text-red-600 text-[10px] font-black uppercase tracking-tight leading-none text-center">{error}</p>
            </div>
          )}
          
          <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.1em] text-sm shadow-lg shadow-blue-200 transition-all active:scale-95 rounded-xl">
            Sign In to Dashboard
          </Button>
        </form>
        
        <div className="mt-12 text-center">
          <div className="h-px bg-slate-100 w-full mb-6"></div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Developed by SVP INFOTECH © 2026
          </p>
          <p className="text-[8px] text-slate-300 font-medium uppercase tracking-tighter mt-1">
            Build v2.4.922 - Local Environment
          </p>
        </div>
      </div>
    </div>
  );
}
