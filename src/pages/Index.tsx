import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import InventoryList from "@/components/InventoryList";
import MedicationDatabase from "@/components/MedicationDatabase";
import AlertsManager from "@/components/AlertsManager";
import CustomerManagement from "@/components/CustomerManagement";
import SystemSettings from "@/components/SystemSettings";
import OrdersManager from "@/components/OrdersManager";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onPageChange={setCurrentPage} />;
      case "inventory":
        return <InventoryList />;
      case "medications":
        return <MedicationDatabase />;
      case "alerts":
        return <AlertsManager />;
      case "customers":
        return <CustomerManagement />;
      case "orders":
        return <OrdersManager />;
      case "settings":
        return <SystemSettings />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;