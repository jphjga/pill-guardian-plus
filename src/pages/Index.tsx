import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import InventoryList from "@/components/InventoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryList />;
      case "medications":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Medications</h2>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Medication Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Comprehensive medication management coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "alerts":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Alerts & Notifications</h2>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Alert Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Alert configuration and management coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "customers":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Customer Management</h2>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Customer Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customer management system coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Settings</h2>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">System configuration options coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
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