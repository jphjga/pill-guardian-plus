import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import InventoryList from "@/components/InventoryList";
import MedicationDatabase from "@/components/MedicationDatabase";
import AlertsManager from "@/components/AlertsManager";
import CustomerManagement from "@/components/CustomerManagement";
import SystemSettings from "@/components/SystemSettings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryList />;
      case "medications":
        return <MedicationDatabase />;
      case "alerts":
        return <AlertsManager />;
      case "customers":
        return <CustomerManagement />;
      case "settings":
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;