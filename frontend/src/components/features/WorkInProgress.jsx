import React from 'react';
import { Truck, Globe2, ShieldCheck, Clock, Mail, Phone, MapPin, ArrowRight, Lock, Sparkles, Box, BarChart3 } from 'lucide-react';
import logo from '../../assets/logo.png';

export function WorkInProgress({ onEnterAdmin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 p-1.5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg shadow-blue-950/50">
            <img src={logo} alt="OM Courier Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-none">
              OM COURIER
            </span>
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              Logistics & Express Network
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md shadow-inner shadow-blue-500/20 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Work in Progress • Digital Portal Launching Soon</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl">
          Next-Gen <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Courier & Freight</span> Solutions.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
          We are currently engineering our all-new enterprise logistics suite. Real-time multi-carrier tracking, instant automated airway billing, and seamless domestic & international shipping are on their way.
        </p>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-sm transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Global & Domestic</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Express door-to-door network across India and 220+ international destinations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-sm transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Live GPS Tracking</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Continuous shipment updates, electronic Proof of Delivery (e-POD), and instant notifications.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-sm transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Automated Billing</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Integrated GST invoicing, smart tariff calculators, and automated MIS reporting.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-sm transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Secure Freight</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Full cargo security, dedicated corporate manager support, and insured parcel transit.
            </p>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-12 w-full p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-around gap-6 text-slate-300">
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Contact Number</p>
              <p className="font-semibold text-slate-200">+91 90220 62666</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Support & Inquiries</p>
              <p className="font-semibold text-slate-200">info@brisknetwork.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Headquarters</p>
              <p className="font-semibold text-slate-200">Thane / Mumbai, Maharashtra</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} OM Courier & Logistics Network. All rights reserved.</p>
        <p className="text-slate-600 font-medium">Enterprise Freight & Express Solutions</p>
      </footer>
    </div>
  );
}
