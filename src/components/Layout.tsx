import { Pill, Package, AlertTriangle, TrendingUp, Users, Bell, User, ShoppingCart, Menu, X, HelpCircle, FileText, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout = ({ children, currentPage, onPageChange }: LayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setUserRole(data?.role || null);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to notification changes
    const channel = supabase
      .channel('notification-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const mainNavigationItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "checkout", label: "Checkout", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "medications", label: "Medications", icon: Pill },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "customers", label: "Patients", icon: Users },
  ];

  // Add staff management for administrators
  const adminNavigationItems = userRole === 'administrator' ? [
    { id: "staff", label: "Staff Management", icon: UserCog },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <button 
              onClick={() => onPageChange('dashboard')}
              className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <Pill className="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div className="text-left hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-foreground">PharmaCare</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Inventory Management System</p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div 
              className="relative cursor-pointer"
              onClick={() => onPageChange('notifications')}
            >
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <ThemeToggle />
            <div 
              className="h-7 w-7 md:h-8 md:w-8 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <User className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-52 lg:w-56 border-r bg-card shadow-card fixed left-0 top-14 md:top-16 bottom-0 overflow-y-auto">
          <nav className="flex flex-col h-full">
            <div className="flex-1 space-y-2 p-3 lg:p-4">
              {mainNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base",
                      currentPage === item.id 
                        ? "bg-gradient-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => onPageChange(item.id)}
                  >
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                    {item.label}
                  </Button>
                );
              })}

              {/* Admin Navigation Items */}
              {adminNavigationItems.length > 0 && (
                <>
                  <div className="border-t my-2" />
                  {adminNavigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base",
                          currentPage === item.id 
                            ? "bg-gradient-primary text-primary-foreground shadow-sm" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => onPageChange(item.id)}
                      >
                        <Icon className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                        {item.label}
                      </Button>
                    );
                  })}
                </>
              )}
            </div>
            
            {/* Bottom Navigation */}
            <div className="border-t p-3 lg:p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base hover:bg-muted"
                onClick={() => navigate('/help')}
              >
                <HelpCircle className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                Help
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base hover:bg-muted"
                onClick={() => navigate('/about')}
              >
                <FileText className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                About
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base hover:bg-muted"
                onClick={() => navigate('/terms')}
              >
                <Shield className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                Terms
              </Button>
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-14 bottom-0 w-64 border-r bg-card shadow-card flex flex-col">
              <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
                {mainNavigationItems.map((item) => {
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
                      onClick={() => {
                        onPageChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}

                {/* Admin Navigation Items - Mobile */}
                {adminNavigationItems.length > 0 && (
                  <>
                    <div className="border-t my-2" />
                    {adminNavigationItems.map((item) => {
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
                          onClick={() => {
                            onPageChange(item.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </>
                )}
              </nav>
              
              {/* Bottom Navigation */}
              <div className="border-t p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 hover:bg-muted"
                  onClick={() => {
                    navigate('/help');
                    setMobileMenuOpen(false);
                  }}
                >
                  <HelpCircle className="h-5 w-5" />
                  Help
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 hover:bg-muted"
                  onClick={() => {
                    navigate('/about');
                    setMobileMenuOpen(false);
                  }}
                >
                  <FileText className="h-5 w-5" />
                  About
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 hover:bg-muted"
                  onClick={() => {
                    navigate('/terms');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Shield className="h-5 w-5" />
                  Terms
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 max-w-full overflow-x-hidden md:ml-52 lg:ml-56">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
