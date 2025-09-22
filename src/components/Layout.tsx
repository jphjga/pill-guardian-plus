import { Pill, Package, AlertTriangle, TrendingUp, Users, Settings, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout = ({ children, currentPage, onPageChange }: LayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "medications", label: "Medications", icon: Pill },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PharmaCare</h1>
              <p className="text-sm text-muted-foreground">Inventory Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <div 
              className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card shadow-card">
          <nav className="space-y-2 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    currentPage === item.id 
                      ? "bg-gradient-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;