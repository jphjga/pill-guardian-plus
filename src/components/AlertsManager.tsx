import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  Calendar,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";

const AlertsManager = () => {
  const alerts = [
    {
      id: 1,
      type: "low_stock",
      title: "Low Stock Alert",
      message: "Amoxicillin 250mg is running low (15 units remaining)",
      priority: "high",
      timestamp: "2024-01-15 14:30",
      status: "active",
      medication: "Amoxicillin 250mg"
    },
    {
      id: 2,
      type: "expiry",
      title: "Expiry Warning",
      message: "5 medications expiring within 30 days",
      priority: "medium",
      timestamp: "2024-01-15 09:15",
      status: "active",
      medication: "Multiple items"
    },
    {
      id: 3,
      type: "order",
      title: "Order Fulfilled",
      message: "Order #12345 has been successfully processed",
      priority: "low",
      timestamp: "2024-01-15 08:45",
      status: "resolved",
      medication: "Insulin Pen"
    },
    {
      id: 4,
      type: "system",
      title: "System Backup",
      message: "Daily backup completed successfully",
      priority: "low",
      timestamp: "2024-01-15 02:00",
      status: "resolved",
      medication: "N/A"
    }
  ];

  const alertRules = [
    {
      id: 1,
      name: "Low Stock Threshold",
      description: "Alert when stock falls below minimum level",
      type: "stock",
      enabled: true,
      threshold: "20 units"
    },
    {
      id: 2,
      name: "Expiry Notifications",
      description: "Warn about medications expiring soon",
      type: "expiry",
      enabled: true,
      threshold: "30 days"
    },
    {
      id: 3,
      name: "Order Status Updates",
      description: "Notify when orders are processed",
      type: "orders",
      enabled: false,
      threshold: "Immediately"
    },
    {
      id: 4,
      name: "System Health Checks",
      description: "Monitor system performance and backups",
      type: "system",
      enabled: true,
      threshold: "Daily"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_stock": return Package;
      case "expiry": return Calendar;
      case "order": return CheckCircle;
      case "system": return Settings;
      default: return AlertTriangle;
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === "active");
  const resolvedAlerts = alerts.filter(alert => alert.status === "resolved");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Alerts & Notifications</h2>
          <p className="text-muted-foreground">Monitor and manage system alerts</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Create Alert Rule
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{resolvedAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{alertRules.filter(r => r.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Icon className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{alert.title}</h4>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp}
                      </span>
                      <span>{alert.medication}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-muted-foreground">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Rules */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Alert Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">{rule.name}</h4>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                  <p className="text-xs text-muted-foreground">Threshold: {rule.threshold}</p>
                </div>
                <Switch checked={rule.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Alert Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className="flex items-center gap-3 py-2">
                  <div className={`p-1 rounded-full ${
                    alert.status === "resolved" ? "bg-success/20" : "bg-warning/20"
                  }`}>
                    <Icon className={`h-3 w-3 ${
                      alert.status === "resolved" ? "text-success" : "text-warning"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                  </div>
                  <Badge variant="outline" className={
                    alert.status === "resolved" ? "text-success border-success" : "text-warning border-warning"
                  }>
                    {alert.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsManager;