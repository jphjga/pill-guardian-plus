import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Medications",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      title: "Orders Today",
      value: "156",
      change: "+8%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-secondary"
    },
    {
      title: "Revenue",
      value: "$12,890",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-success"
    }
  ];

  const recentActivities = [
    { action: "Stock updated", item: "Paracetamol 500mg", time: "2 min ago", status: "success" },
    { action: "Low stock alert", item: "Amoxicillin 250mg", time: "15 min ago", status: "warning" },
    { action: "Order fulfilled", item: "Insulin Pen", time: "1 hour ago", status: "success" },
    { action: "New medication added", item: "Vitamin D3", time: "2 hours ago", status: "info" },
  ];

  const lowStockItems = [
    { name: "Amoxicillin 250mg", current: 15, minimum: 50, percentage: 30 },
    { name: "Insulin Pen", current: 8, minimum: 25, percentage: 32 },
    { name: "Blood Pressure Monitor", current: 3, minimum: 10, percentage: 30 },
    { name: "Cough Syrup", current: 12, minimum: 30, percentage: 40 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your pharmacy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>
                    {stat.change}
                  </span>
                  {" "}from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <Badge variant="outline" className="text-warning border-warning">
                    {item.current}/{item.minimum}
                  </Badge>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  activity.status === "success" ? "bg-success" :
                  activity.status === "warning" ? "bg-warning" :
                  "bg-primary"
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.action}</span>
                    {" "}• {activity.item}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Add Medication</p>
                <p className="text-sm text-muted-foreground">Add new stock</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <div>
                <p className="font-medium text-foreground">Generate Report</p>
                <p className="text-sm text-muted-foreground">View analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium text-foreground">Manage Customers</p>
                <p className="text-sm text-muted-foreground">Customer database</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <CheckCircle className="h-8 w-8 text-medical-green" />
              <div>
                <p className="font-medium text-foreground">Process Orders</p>
                <p className="text-sm text-muted-foreground">Fulfill orders</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;