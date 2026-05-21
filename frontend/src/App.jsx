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

function App() {
  const [user, setUser] = useState({ name: 'Admin', role: 'admin' })
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [editingCustomer, setEditingCustomer] = useState(null)

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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} onLogout={handleLogout}>
      {currentPage === "dashboard" && <AdminDashboard />}
      {currentPage === "add-shipment" && <AddUnifiedShipmentForm initialType="domestic" />}
      {currentPage === "gst-setting" && <GstSetting />}
      {currentPage === "view-customer" && <CustomerDetails setCurrentPage={setCurrentPage} setEditingCustomer={setEditingCustomer} />}
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

    </DashboardLayout>
  )
}

export default App
