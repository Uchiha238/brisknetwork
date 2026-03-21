import { useState } from "react"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { AddShipmentForm } from "./components/features/AddShipmentForm"
import { AdminDashboard } from "./components/features/AdminDashboard"
import { GstSetting } from "./components/features/GstSetting"
import { CustomerDetails } from "./components/features/CustomerDetails"
import { CourierMaster } from "./components/features/CourierMaster"
import { ModeMaster } from "./components/features/ModeMaster"
import { InternationalZone } from "./components/features/InternationalZone"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {currentPage === "dashboard" && <AdminDashboard />}
      {currentPage === "add-shipment" && <AddShipmentForm />}
      {currentPage === "gst-setting" && <GstSetting />}
      {currentPage === "view-customer" && <CustomerDetails />}
      {currentPage === "courier-master" && <CourierMaster />}
      {currentPage === "mode-master" && <ModeMaster />}
      {currentPage === "int-zone" && <InternationalZone />}
    </DashboardLayout>
  )
}

export default App
