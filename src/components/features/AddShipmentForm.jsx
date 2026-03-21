import { Button } from "@/components/ui/button"
import { Save, CheckCircle, RotateCcw } from "lucide-react"

export function AddShipmentForm() {
  const inputClass = "flex h-11 w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-500"
  const selectClass = inputClass
  const labelClass = "text-[11px] font-extrabold text-slate-600 uppercase tracking-widest leading-tight"
  const requiredLabelClass = "text-[11px] font-extrabold text-red-600 uppercase tracking-widest leading-tight"

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">ADD AWB</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-md">
            CREATE AWB AND PRINT LABEL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr] gap-6 items-start">
        
        {/* AWB Information */}
        <div className="col-span-1 border-2 border-slate-900 bg-white shadow-md overflow-hidden" style={{ borderRadius: '10px' }}>
          <div className="px-4 py-3 bg-slate-900 text-white flex justify-between items-center">
            <h4 className="text-[14px] font-bold tracking-widest uppercase">AIR WAYBILL INFORMATION</h4>
          </div>
          <div className="p-5 space-y-5 bg-slate-50">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={requiredLabelClass}>AWB NUMBER</label>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className="w-4 h-4 rounded text-blue-600 cursor-pointer" id="editAWB" />
                   <label htmlFor="editAWB" className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer">EDIT</label>
                </div>
              </div>
              <input className={`${inputClass} bg-slate-200 uppercase text-slate-600 text-lg`} value="AUTO-GENERATED" disabled />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>CUSTOMER</label>
              <div className="flex gap-2">
                <input className={`${inputClass} w-24 text-center`} defaultValue="71735" />
                <input className={`${inputClass} flex-1`} defaultValue="OM COURIER SERVICES" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>EMAIL</label>
              <input className={`${inputClass} uppercase`} defaultValue="OPSOMCOURIER@GMAIL.COM" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>CONTACT NO.</label>
              <input className={inputClass} defaultValue="9029200429" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ACCOUNT CODE</label>
              <input className={`${inputClass} uppercase border-dashed`} defaultValue="WCC9723" />
            </div>

            <div className="p-4 bg-white rounded-md border-2 border-slate-200 space-y-4 shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <label className={requiredLabelClass}>ORIGIN HUB</label>
                  <div className="flex gap-2 items-center">
                    <select className={`${selectClass} flex-1`}>
                      <option>MUMBAI</option>
                    </select>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">ZONE</span>
                    <input className={`${inputClass} w-16 text-center`} disabled />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={requiredLabelClass}>DESTINATION</label>
                  <div className="flex gap-2 items-center">
                    <input className={`${inputClass} flex-1`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">ZONE</span>
                    <input className={`${inputClass} w-16 text-center`} disabled />
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>PRODUCT</label>
              <select className={selectClass}>
                <option>SELECT...</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                 <label className={requiredLabelClass}>BOOKING DATE</label>
                 <input type="date" className={inputClass} defaultValue="2026-03-21" />
              </div>
              <div className="flex flex-col gap-1.5 w-32">
                 <label className={requiredLabelClass}>B. TIME</label>
                 <input type="time" className={inputClass} defaultValue="12:28" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>USPS NUMBER</label>
              <input className={`${inputClass} uppercase`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>SERVICE</label>
              <select className={selectClass}>
                <option>SELECT...</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>DUTY</label>
              <div className="flex gap-2">
                <select className={`${selectClass} flex-1`}>
                  <option>EXCLUDES TAXES...</option>
                </select>
                <select className={`${selectClass} w-32`}>
                  <option>SELECT...</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>REFERENCE NUMBER</label>
              <input className={`${inputClass} uppercase bg-amber-50`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>SHIPMENT VALUE</label>
              <div className="flex items-center gap-2">
                <input className={`${inputClass} flex-1`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">CUR</span>
                <select className={`${selectClass} w-24`}>
                  <option>INR</option>
                  <option>USD</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                 <label className={labelClass}>INVOICE DATE</label>
                 <input type="date" className={inputClass} defaultValue="2026-03-21" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                 <label className={labelClass}>INV. NUMBER</label>
                 <input className={inputClass} disabled />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editContent" className="h-4 w-4 cursor-pointer text-blue-600 rounded border-2 border-slate-300" />
                <label htmlFor="editContent" className="text-xs font-bold text-slate-700 uppercase cursor-pointer">EDIT CONTENT</label>
              </div>
              <textarea className={`${inputClass} h-24 py-3 bg-slate-100`} disabled></textarea>
            </div>
          </div>
        </div>

        {/* Shipper Information */}
        <div className="col-span-1 border-2 border-indigo-500 bg-white shadow-md overflow-hidden" style={{ borderRadius: '10px' }}>
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 text-white flex justify-between items-center gap-2">
             <h4 className="text-[13px] font-bold uppercase tracking-wide whitespace-nowrap shadow-sm">SHIPPER / CONSIGNOR / FROM</h4>
             <div className="flex items-center gap-3 shrink-0">
               <RotateCcw className="h-4 w-4 text-white/90 cursor-pointer hover:text-white hover:-rotate-180 transition-transform duration-300" />
               <label className="flex items-center gap-1.5 cursor-pointer bg-black/10 px-2.5 py-1.5 rounded-md shadow-inner transition-colors hover:bg-black/20">
                 <input type="checkbox" className="w-3.5 h-3.5 rounded-sm accent-white cursor-pointer" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white whitespace-nowrap">SAVE TO ADDRESS BOOK?</span>
               </label>
             </div>
          </div>
          
          <div className="p-5 space-y-5 bg-white">
            <input placeholder="SEARCH ADDRESS BOOK..." className={`${inputClass} border-indigo-200 bg-indigo-50/50 text-indigo-900 placeholder:text-indigo-300`} />

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 w-32">
                 <label className={labelClass}>CODE</label>
                 <input className={inputClass} disabled />
              </div>
              <label className="flex items-center gap-2 mt-5 cursor-pointer bg-slate-100 px-3 py-2 rounded-md border-2 border-slate-200">
                 <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">UPDATE ADDR BOOK</span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>COMPANY</label>
              <input className={inputClass} />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>PERSON NAME</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>ADDRESS 1</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ADDRESS 2</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ADDRESS 3</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>POST / ZIP CODE</label>
              <div className="flex gap-2">
                <input className={`${inputClass} flex-1`} />
                <Button className="h-11 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold uppercase tracking-widest px-6 rounded-md shadow-sm">SEARCH</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={requiredLabelClass}>CITY</label>
                <input className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={requiredLabelClass}>STATE / COUNTY</label>
                <input className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>COUNTRY</label>
              <div className="flex gap-2">
                 <input className={`${inputClass} w-20 text-center bg-slate-100`} value="IN" disabled />
                 <input className={`${inputClass} flex-1 bg-slate-100 uppercase`} value="INDIA" disabled />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>PHONE NUMBER</label>
              <div className="flex gap-2">
                 <input className={`${inputClass} w-20 text-center bg-slate-100`} value="+91" disabled />
                 <input className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>EMAIL ADDRESS</label>
              <input className={inputClass} />
            </div>
            
            <div className="border-t-4 border-slate-100 pt-5 mt-2 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>KYC TYPE</label>
                <select className={selectClass}>
                    <option>SELECT...</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>KYC NUMBER</label>
                <input className={`${inputClass} tracking-widest text-lg font-mono`} />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>UPLOAD KYC</label>
                <div className="flex items-center gap-3">
                   <Button variant="outline" className="h-10 border-2 font-bold uppercase text-xs">Choose File</Button>
                   <span className="text-slate-400 font-semibold text-xs">No file chosen</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>SHIPPER IMAGE</label>
                <div className="flex items-center gap-3">
                   <Button variant="outline" className="h-10 border-2 font-bold uppercase text-xs">Choose File</Button>
                   <span className="text-slate-400 font-semibold text-xs">No file chosen</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Consignee Information */}
        <div className="col-span-1 border-2 border-[#009b60] bg-white shadow-md overflow-hidden" style={{ borderRadius: '10px' }}>
          <div className="px-4 py-3 bg-[#009b60] text-white flex justify-between items-center gap-2">
             <h4 className="text-[13px] font-bold uppercase tracking-wide whitespace-nowrap shadow-sm">CONSIGNEE / RECEIVER / TO</h4>
             <div className="flex items-center gap-3 shrink-0">
               <RotateCcw className="h-4 w-4 text-white/90 cursor-pointer hover:text-white hover:-rotate-180 transition-transform duration-300" />
               <label className="flex items-center gap-1.5 cursor-pointer bg-black/10 px-2.5 py-1.5 rounded-md shadow-inner transition-colors hover:bg-black/20">
                 <input type="checkbox" className="w-3.5 h-3.5 rounded-sm accent-white cursor-pointer" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white whitespace-nowrap">SAVE TO ADDRESS BOOK?</span>
               </label>
             </div>
          </div>
          
          <div className="p-5 space-y-5 bg-white">
             <input placeholder="SEARCH ADDRESS BOOK..." className={`${inputClass} border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-300`} />

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 w-32">
                 <label className={labelClass}>CODE</label>
                 <input className={inputClass} disabled />
              </div>
              <label className="flex items-center gap-2 mt-5 cursor-pointer bg-slate-100 px-3 py-2 rounded-md border-2 border-slate-200">
                 <input type="checkbox" className="w-4 h-4 rounded text-emerald-600" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">UPDATE ADDR BOOK</span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>COMPANY</label>
              <input className={inputClass} />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>PERSON NAME</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>ADDRESS 1</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>APARTMENT# / FLOOR#</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ADDRESS 3</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>POST / ZIP CODE</label>
              <div className="flex gap-2">
                <input className={`${inputClass} flex-1`} />
                <Button className="h-11 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold uppercase tracking-widest px-6 rounded-md shadow-sm">SEARCH</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={requiredLabelClass}>CITY</label>
                <input className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={requiredLabelClass}>STATE / COUNTY</label>
                <input className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>COUNTRY</label>
              <input className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={requiredLabelClass}>PHONE NUMBER</label>
              <div className="flex gap-2">
                 <input className={`${inputClass} w-24 text-center disabled:bg-white`} placeholder="Code" />
                 <input className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>EMAIL ADDRESS</label>
              <input className={inputClass} />
            </div>
            
          </div>
        </div>
      </div>

      {/* Weights and Dimensions */}
      <div className="rounded-lg border-2 border-blue-500 bg-white mt-6 shadow-md w-full overflow-hidden">
         <div className="p-4 bg-blue-500 text-white uppercase text-sm tracking-wider font-bold">
            WEIGHTS AND DIMENSIONS
         </div>
         <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-8 items-start bg-white">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Pieces (PCS)</label>
              <input className="flex h-12 w-full rounded-md border-2 border-slate-300 bg-white px-4 py-2 text-xl font-bold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none transition-colors" defaultValue="1" type="number" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest leading-tight">Actual Weight</label>
              <div className="relative">
                 <input className="flex h-12 w-full rounded-md border-2 border-blue-400 bg-blue-50 px-4 py-2 text-xl font-bold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none transition-colors pr-10" defaultValue="0" type="number" step="0.01" />
                 <span className="absolute right-4 top-3 text-sm text-slate-400 font-bold">KG</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Volumetric Wt.</label>
              <div className="relative">
                 <input className="flex h-12 w-full rounded-md border-2 border-slate-200 bg-slate-100 px-4 py-2 text-xl font-bold text-slate-500 shadow-inner outline-none pr-10" defaultValue="0.00" disabled />
                 <span className="absolute right-4 top-3 text-sm text-slate-400 font-bold">KG</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest leading-tight">Chargeable Wt.</label>
              <div className="relative">
                 <input className="flex h-12 w-full rounded-md border-2 border-emerald-400 bg-emerald-50 px-4 py-2 text-2xl font-black text-emerald-700 shadow-sm outline-none pr-10" defaultValue="0" disabled />
                 <span className="absolute right-4 top-3 text-sm text-emerald-500/60 font-bold">KG</span>
              </div>
            </div>
         </div>
      </div>
      
    </div>
  )
}
