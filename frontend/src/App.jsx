import { useState, useEffect } from "react"
import { WorkInProgress } from "./components/features/WorkInProgress"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { AddUnifiedShipmentForm } from "./components/features/AddUnifiedShipmentForm"
import { AdminDashboard } from "./components/features/AdminDashboard"
import { GstSetting } from "./components/features/GstSetting"
import { CustomerDetails } from "./components/features/CustomerDetails"
import { CourierMaster } from "./components/features/CourierMaster"
import { ModeMaster } from "./components/features/ModeMaster"
import { InternationalZone } from "./components/features/InternationalZone"
import { DomesticZone } from "./components/features/DomesticZone"
import { DomesticRate } from "./components/features/DomesticRate"
import { ColoaderMaster } from "./components/features/ColoaderMaster"
import { ViewBranches } from "./components/features/ViewBranches"
import { ListUser } from "./components/features/ListUser"
import { ViewCnode } from "./components/features/ViewCnode"
import { BranchWiseCnode } from "./components/features/BranchWiseCnode"
import { RateGroup } from "./components/features/RateGroup"
import { FuelGroup } from "./components/features/FuelGroup"
import { AddCustomer } from "./components/features/AddCustomer"
import { InternationalRate } from "./components/features/InternationalRate"
import { Login } from "./components/features/Login"
import { CompanySetting } from "./components/features/CompanySetting"
import { MailConfig } from "./components/features/MailConfig"
import { ListShipments } from "./components/features/ListShipments"
import { InvoiceManager } from "./components/features/InvoiceManager"
import { PrintInvoice } from "./components/features/PrintInvoice"

function checkIsAdminPath() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  return path.startsWith('/admin') || path.startsWith('/login') || path.startsWith('/app') || path.startsWith('/dashboard') || search.includes('admin') || search.includes('print-invoice');
}

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminPath)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('om-courier-user');
      const savedToken = localStorage.getItem('om-courier-token');
      return savedUser && savedToken ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  })
  const [isValidatingAuth, setIsValidatingAuth] = useState(() => {
    return Boolean(localStorage.getItem('om-courier-token') && localStorage.getItem('om-courier-user'));
  });
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editingShipmentId, setEditingShipmentId] = useState(null)

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(checkIsAdminPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleEnterAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
  };

  const handleExitToLanding = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    localStorage.setItem('om-courier-user', JSON.stringify(userData));
    if (tokenData) {
      localStorage.setItem('om-courier-token', tokenData);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('om-courier-user');
    localStorage.removeItem('om-courier-token');
    handleExitToLanding();
  };

  // Verify stored token with backend on startup
  useEffect(() => {
    const token = localStorage.getItem('om-courier-token');
    if (!token) {
      setUser(null);
      localStorage.removeItem('om-courier-user');
      setIsValidatingAuth(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('om-courier-user', JSON.stringify(data.user));
        } else {
          handleLogout();
        }
      })
      .catch((err) => {
        if (err.message === 'Session invalid') {
          handleLogout();
        }
      })
      .finally(() => {
        setIsValidatingAuth(false);
      });
  }, []);

  // Listen for global auth expired events triggered by 401 API responses
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem('om-courier-user');
      localStorage.removeItem('om-courier-token');
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handlePageChange = (page) => {
    setEditingShipmentId(null);
    setCurrentPage(page);
  };

  const handleEditShipment = (id) => {
    setEditingShipmentId(id);
    setCurrentPage("add-shipment");
  };

  const urlParams = new URLSearchParams(window.location.search);
  const printInvoiceId = urlParams.get('print-invoice');

  if (printInvoiceId) {
    if (!user) {
      return <Login onLogin={handleLogin} onBack={handleExitToLanding} />;
    }
    return <PrintInvoice invoiceId={printInvoiceId} />;
  }

  // If visitor is on the public root domain (omcouriers.com / omcourier.com)
  if (!isAdminRoute) {
    return <WorkInProgress onEnterAdmin={handleEnterAdmin} />;
  }

  // Brief session validation check
  if (isValidatingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} onBack={handleExitToLanding} />;
  }


  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={handlePageChange} user={user} onLogout={handleLogout}>
      {currentPage === "dashboard" && <AdminDashboard />}
      {currentPage === "add-shipment" && <AddUnifiedShipmentForm initialType="domestic" editingShipmentId={editingShipmentId} />}
      {currentPage === "gst-setting" && <GstSetting />}
      {currentPage === "view-customer" && <CustomerDetails setCurrentPage={handlePageChange} setEditingCustomer={setEditingCustomer} />}
      {currentPage === "courier-master" && <CourierMaster />}
      {currentPage === "mode-master" && <ModeMaster />}
      {currentPage === "int-zone" && <InternationalZone />}
      {currentPage === "dom-zone" && <DomesticZone />}
      {currentPage === "dom-rate" && <DomesticRate />}
      {currentPage === "int-rate" && <InternationalRate />}
      {currentPage === "coloader-master" && <ColoaderMaster />}
      {currentPage === "view-branches" && <ViewBranches />}
      {currentPage === "list-user" && <ListUser />}
      {currentPage === "view-cnode" && <ViewCnode />}
      {currentPage === "view-branch-cnode" && <BranchWiseCnode />}
      {currentPage === "rate-group" && <RateGroup />}
      {currentPage === "fuel-group" && <FuelGroup />}
      {currentPage === "add-customer" && (
        <AddCustomer 
          editingCustomer={editingCustomer} 
          onBack={() => {
            setEditingCustomer(null);
            setCurrentPage('view-customer');
          }} 
          onSuccess={() => {
            setEditingCustomer(null);
            setCurrentPage('view-customer');
          }} 
        />
      )}
      {currentPage === "company-setting" && <CompanySetting />}
      {currentPage === "mail-config" && <MailConfig />}
      {currentPage === "list-shipments" && <ListShipments onEditShipment={handleEditShipment} />}
      {currentPage === "export-invoice" && (
        <InvoiceManager mode="generate" type="Export" setCurrentPage={handlePageChange} />
      )}
      {currentPage === "export-final-invoice" && (
        <InvoiceManager mode="list" type="Export" setCurrentPage={handlePageChange} />
      )}
      {currentPage === "import-invoice" && (
        <InvoiceManager mode="generate" type="Import" setCurrentPage={handlePageChange} />
      )}
      {currentPage === "import-final-invoice" && (
        <InvoiceManager mode="list" type="Import" setCurrentPage={handlePageChange} />
      )}
      {currentPage === "freight-invoice" && (
        <InvoiceManager mode="list" type="Domestic" setCurrentPage={handlePageChange} />
      )}


    </DashboardLayout>
  )
}

export default App
