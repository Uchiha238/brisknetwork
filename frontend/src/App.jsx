import { useState, useEffect } from "react"
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


function App() {
  const [user, setUser] = useState({ name: 'Admin', role: 'admin' })
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editingShipmentId, setEditingShipmentId] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('om-courier-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('om-courier-user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('om-courier-user');
  };

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
    return <PrintInvoice invoiceId={printInvoiceId} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
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
