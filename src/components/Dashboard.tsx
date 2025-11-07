import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle,
  RefreshCw,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard = ({ onPageChange }: DashboardProps) => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalMedications: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    totalSales: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total medications
      const { count: medicationCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true });

      // Fetch low stock items with medication details
      // Fetch inventory and compute low stock client-side (PostgREST can't compare two columns)
      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('medication_id, current_stock, minimum_stock');

      if (invError) throw invError;
      const low = (invData || []).filter((i: any) => i.current_stock < i.minimum_stock).slice(0, 4);

      // Fetch medication names for these items
      let lowStockData = low.map((i: any) => ({ ...i, medications: { name: 'Unknown Medication' } }));
      const ids = low.map((i: any) => i.medication_id).filter(Boolean);
      if (ids.length) {
        const { data: meds } = await supabase
          .from('medications')
          .select('id, name')
          .in('id', ids as string[]);
        const map = new Map((meds || []).map((m: any) => [m.id, m.name]));
        lowStockData = low.map((i: any) => ({ ...i, medications: { name: map.get(i.medication_id) || 'Unknown Medication' } }));
      }

      // Fetch total customers
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch total sales
      const { count: salesCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true });

      // Fetch recent alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      setStats({
        totalMedications: medicationCount || 0,
        lowStockItems: lowStockData?.length || 0,
        totalCustomers: customerCount || 0,
        totalSales: salesCount || 0,
      });

      setRecentAlerts(alertsData || []);
      setLowStockItems(lowStockData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading dashboard data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: "Total Medications",
      value: stats.totalMedications.toString(),
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      title: "Total Patients",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "text-secondary"
    },
    {
      title: "Total Sales",
      value: stats.totalSales.toString(),
      icon: DollarSign,
      color: "text-success"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's what's happening with your pharmacy.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading} className="flex-1 sm:flex-none">
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Quick Action</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {loading ? (
                    <div className="h-6 md:h-8 w-12 md:w-16 bg-muted animate-pulse rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card className="shadow-card">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.map((item, index) => {
                  const percentage = (item.current_stock / item.minimum_stock) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {item.medications?.name || 'Unknown Medication'}
                        </span>
                        <Badge variant="outline" className="text-warning border-warning">
                          {item.current_stock}/{item.minimum_stock}
                        </Badge>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-muted-foreground">All items are well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="shadow-card">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${
                      alert.severity === "critical" ? "bg-red-500" :
                      alert.severity === "high" ? "bg-orange-500" :
                      alert.severity === "medium" ? "bg-yellow-500" :
                      "bg-blue-500"
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-muted-foreground">No recent alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <div 
              onClick={() => onPageChange('inventory')}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-lg border p-3 md:p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <Package className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground text-sm md:text-base">Add Medication</p>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Add new stock</p>
              </div>
            </div>
            <div 
              onClick={() => onPageChange('reports')}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-lg border p-3 md:p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-secondary group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground text-sm md:text-base">Generate Report</p>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">View analytics</p>
              </div>
            </div>
            <div 
              onClick={() => onPageChange('customers')}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-lg border p-3 md:p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <Users className="h-6 w-6 md:h-8 md:w-8 text-success group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground text-sm md:text-base">Manage Patients</p>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Patient database</p>
              </div>
            </div>
            <div 
              onClick={() => onPageChange('checkout')}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-lg border p-3 md:p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-medical-green group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground text-sm md:text-base">Process Sale</p>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">New checkout</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;