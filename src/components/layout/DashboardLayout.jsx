import { useState } from "react"
import { 
  Home, Settings, LayoutGrid, Globe, Truck, 
  CreditCard, MapPin, FileCode, FileText, BarChart3, 
  User, ChevronDown, Package, Search, Menu, X, LogOut, Bell
} from "lucide-react"

export function DashboardLayout({ children, currentPage, setCurrentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'setting', label: 'Setting', icon: Settings },
    { 
      id: 'master', 
      label: 'Master', 
      icon: LayoutGrid,
      dropdownItems: [
        { label: 'Gst Setting', id: 'gst-setting' },
        { label: 'View Customer', id: 'view-customer' },
        { label: 'Courier Master', id: 'courier-master' },
        { label: 'Mode Master', id: 'mode-master' }, 
        { label: 'International Zone', id: 'int-zone' },
        { label: 'International Rate', id: 'int-rate' },
        { label: 'Domestic zone', id: 'dom-zone' },
        { label: 'Domestic Rate', id: 'dom-rate' },
        { label: 'Coloader Master', id: 'coloader-master' },
        { label: 'View Branches', id: 'view-branches' },
        { label: 'list User', id: 'list-user' },
        { label: 'View Cnode', id: 'view-cnode' },
        { label: 'View Branch Wise Cnode', id: 'view-branch-cnode' },
        { label: 'Rate Group', id: 'rate-group' },
        { label: 'Fuel Group', id: 'fuel-group' }
      ]
    },
    { id: 'international', label: 'International', icon: Globe },
    { id: 'domestic', label: 'Domestic', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'cms', label: 'CMS Management', icon: FileCode },
    { id: 'add-shipment', label: 'Manifest', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm px-4 md:px-8 h-[70px] flex items-center justify-between">
        
        {/* Left Side: Logo & Branidng */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black text-slate-800 tracking-tighter">OM</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Courier</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;
              
              return (
                <div 
                  key={item.id} 
                  className="relative h-[70px] flex items-center"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => !hasDropdown && setCurrentPage(item.id)}
                    className={`h-[70px] relative flex flex-col items-center justify-center gap-1.5 px-4 transition-all group ${
                      isActive 
                      ? 'text-blue-700 font-black border-b-4 border-blue-600' 
                      : 'text-slate-500 hover:text-slate-800 border-b-4 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className={`text-[11px] uppercase tracking-wider text-center ${item.id === 'cms' ? 'leading-[1] max-w-[80px]' : 'whitespace-nowrap'}`}>
                      {item.id === 'cms' ? (
                        <>CMS<br />Management</>
                      ) : (
                        item.label
                      )}
                    </span>
                    {hasDropdown && (
                      <ChevronDown className={`h-3 w-3 absolute right-0.5 top-1/2 -translate-y-1/2 opacity-50 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {hasDropdown && activeDropdown === item.id && (
                    <div className="absolute top-[65px] left-0 w-64 bg-white border border-slate-100 shadow-xl rounded-xl py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.dropdownItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setCurrentPage(subItem.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Right Side: Profile & Actions */}
        <div className="flex items-center gap-4">
          
          <div className="hidden xl:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 mr-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="bg-transparent border-none text-xs focus:ring-0 w-32 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">RATNAKAR</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">Admin Account</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
               <User className="h-6 w-6 text-slate-400" />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 shadow-xl py-4 px-4 flex flex-col gap-2 z-40 fixed top-[70px] left-0 w-full animate-in slide-in-from-top duration-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold ${
                  currentPage === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-[#f8fafc]">
        {children}
      </main>

      {/* Mini Breadcrumb/Status Footer (Optional) */}
      <footer className="h-8 bg-white border-t border-slate-100 px-8 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <div className="flex gap-4">
          <span>OM COURIER SYSTEM v2.4</span>
          <span>BRANCH: MAIN HUB</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> SYSTEM ONLINE</span>
          <span>LAST SYNC: 20:41:22</span>
        </div>
      </footer>
    </div>
  )
}
