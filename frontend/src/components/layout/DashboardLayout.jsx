import { useState } from "react"
import logo from "@/assets/logo.png"
import { 
  Home, Settings, LayoutGrid, Globe, Truck, 
  CreditCard, MapPin, FileCode, FileText, BarChart3, 
  User, ChevronDown, Package, Search, Menu, X, LogOut, Bell
} from "lucide-react"

export function DashboardLayout({ children, currentPage, setCurrentPage, user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    {
      id: 'setting',
      label: 'Setting',
      icon: Settings,
      dropdownItems: [
        { label: 'Company Setting', id: 'company-setting' },
        { label: 'Mail Config',     id: 'mail-config'     },
      ]
    },
    { 
      id: 'master', 
      label: 'Master', 
      icon: LayoutGrid,
      dropdownItems: [
        { label: 'Gst Setting',        id: 'gst-setting'     },
        { label: 'View Customer',      id: 'view-customer'   },
        { label: 'Courier Master',     id: 'courier-master'  },
        { label: 'Mode Master',        id: 'mode-master'     },
        { label: 'Coloader Master',    id: 'coloader-master' },
        { label: 'Fuel Group',         id: 'fuel-group'      },
        { label: 'Domestic Zone',      id: 'dom-zone'        },
        { label: 'Domestic Rate',      id: 'dom-rate'        },
        { label: 'International Zone', id: 'int-zone'        },
        { label: 'International Rate', id: 'int-rate'        },
      ]
    },
    { 
      id: 'shipments', 
      label: 'Shipments', 
      icon: Package,
      dropdownItems: [
        { label: 'Add Shipment', id: 'add-shipment' },
        { label: 'List Shipments', id: 'list-shipments' },
        { label: 'Unbill Shipment', id: 'unbill-shipment' },
        { label: 'Pending Forwarder', id: 'pending-forwarder' },
        { label: 'Freight Invoice', id: 'freight-invoice' },
        { label: 'Export Invoice', id: 'export-invoice' },
        { label: 'Export Final invoice', id: 'export-final-invoice' },
        { label: 'Import Invoice', id: 'import-invoice' },
        { label: 'Import Final invoice', id: 'import-final-invoice' },
        { label: 'Label Print', id: 'label-print' },
        { label: 'Manage Delivery Status', id: 'manage-status' }
      ]
    },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'cms', label: 'CMS Management', icon: FileCode },
    { id: 'manifest', label: 'Manifest', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  // Flat list of all searchable routes/pages
  const searchablePages = [];
  navItems.forEach(item => {
    if (item.dropdownItems) {
      item.dropdownItems.forEach(sub => {
        searchablePages.push({
          label: sub.label,
          id: sub.id,
          category: item.label,
          icon: item.icon
        });
      });
    } else {
      searchablePages.push({
        label: item.label,
        id: item.id,
        category: 'Navigation',
        icon: item.icon
      });
    }
  });

  const filteredSearchPages = searchQuery.trim()
    ? searchablePages.filter(p => 
        p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleKeyDown = (e) => {
    if (!filteredSearchPages.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredSearchPages.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredSearchPages.length) % filteredSearchPages.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSearchPages.length) {
        e.preventDefault();
        const selectedPage = filteredSearchPages[highlightedIndex];
        setCurrentPage(selectedPage.id);
        setSearchQuery('');
        setShowSearchSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSearchSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm px-4 md:px-8 h-[70px] flex items-center justify-between">
        
        {/* Left Side: Logo & Branidng */}
        <div className="flex items-center gap-8">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
            <img 
              src={logo} 
              alt="OM Courier Logo" 
              className="h-[68px] w-auto object-contain py-0.5"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSubItemActive = item.dropdownItems?.some(sub => sub.id === currentPage);
              const isActive = currentPage === item.id || isSubItemActive;
              const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;
              
              return (
                <div 
                  key={item.id} 
                  className="relative h-[70px] flex items-center"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => {
                        if (hasDropdown) {
                            if (item.id === 'shipments') setCurrentPage('add-shipment');
                            if (item.id === 'master') setCurrentPage('view-customer');
                        } else {
                            setCurrentPage(item.id);
                        }
                        setActiveDropdown(null);
                    }}
                    className={`h-[70px] relative flex flex-col items-center justify-center gap-1.5 px-4 transition-all group ${
                      isActive 
                      ? 'text-blue-700 font-black border-b-4 border-blue-600 bg-blue-50/20' 
                      : 'text-slate-700 hover:text-blue-700 font-bold border-b-4 border-transparent hover:border-blue-100 hover:bg-slate-50/30'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-blue-700 stroke-[2.5px]' : 'text-slate-500 group-hover:text-blue-600 stroke-[2px]'}`} />
                    <span className={`text-[11px] uppercase tracking-wider text-center ${item.id === 'cms' ? 'leading-[1] max-w-[80px]' : 'whitespace-nowrap'}`}>
                      {item.id === 'cms' ? (
                        <>CMS<br />Management</>
                      ) : (
                        item.label
                      )}
                    </span>
                    {hasDropdown && (
                      <ChevronDown className={`h-3 w-3 absolute right-0.5 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
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
                          className={`w-full text-left px-5 py-2 text-xs font-bold transition-colors ${
                            currentPage === subItem.id 
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-extrabold' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700 hover:bg-blue-50/40'
                          }`}
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
        <div className="flex items-center gap-4 shrink-0">
          
          <div 
            className="hidden md:flex flex-col relative"
            onFocus={() => setShowSearchSuggestions(true)}
            onBlur={(e) => {
              // Delay to let click events trigger before closing suggestions
              setTimeout(() => {
                setShowSearchSuggestions(false);
              }, 200);
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/50 rounded-lg border border-transparent focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200 mr-4">
              <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none text-xs w-36 focus:w-48 transition-all duration-300 outline-none font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            
            {showSearchSuggestions && filteredSearchPages.length > 0 && (
              <div className="absolute top-[40px] left-0 w-64 bg-white border border-slate-150 shadow-2xl rounded-xl py-2 z-[999] max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                  Matching Pages & Forms ({filteredSearchPages.length})
                </div>
                {filteredSearchPages.map((page, idx) => {
                  const PageIcon = page.icon;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        setCurrentPage(page.id);
                        setSearchQuery('');
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors group/item cursor-pointer ${
                        isHighlighted 
                        ? 'bg-blue-50 text-blue-700 font-extrabold border-l-4 border-blue-600 pl-3' 
                        : 'hover:bg-blue-50/50 hover:text-blue-700'
                      }`}
                    >
                      <PageIcon className={`h-3.5 w-3.5 shrink-0 ${isHighlighted ? 'text-blue-600' : 'text-slate-400 group-hover/item:text-blue-600'}`} />
                      <div className="flex flex-col">
                        <span className={`text-xs leading-tight ${isHighlighted ? 'text-blue-700 font-black' : 'font-bold text-slate-800 group-hover/item:text-blue-700'}`}>{page.label}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-tight leading-none mt-0.5 ${isHighlighted ? 'text-blue-500' : 'text-slate-400'}`}>{page.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-100 shrink-0">
            <div className="flex flex-col items-end hidden sm:flex shrink-0">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest whitespace-nowrap">{user?.username || 'Guest'}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight whitespace-nowrap">{user?.role === 'admin' ? 'Admin Controller' : 'Staff Member'}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-50 border-2 border-blue-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                 <User className="h-5 w-5 text-blue-600" />
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
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
