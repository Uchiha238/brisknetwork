import React from 'react';

export function Footer({ theme = 'svp' }) {
  if (theme === 'brisk') {
    return (
      <div className="mt-8 border-t border-slate-100 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-2 py-6">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            COPYRIGHT © 2026 BRISK NETWORK. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter leading-relaxed">
            PREMIUM LOGISTICS SOLUTIONS & MANAGEMENT SYSTEMS
          </p>
        </div>
      </div>
    );
  }

  // Default: svp
  return (
    <div className="mt-auto pt-8 pb-4 text-center border-t border-slate-100 opacity-80">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
        COPYRIGHT © 2026 LOGISTICS SOFTWARE SVP INFOTECH. ALL RIGHTS RESERVED. FOR SUPPORT CALL <span className="text-red-500">+91-9022062666</span>
      </p>
      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">
        FOR LOGISTICS SOFTWARE, MOBILE APPS, WEBSITE DESIGNING, CUSTOM SOFTWARE, ECOMMERCE WEBSITE, MLM SOFTWARE, COLLEGE ADMISSION SOFTWARE CALL 9022062666 EMAIL: INFO@SVPINFOTECH.COM , SVPINFOTECH@GMAIL.COM
      </p>
    </div>
  );
}
