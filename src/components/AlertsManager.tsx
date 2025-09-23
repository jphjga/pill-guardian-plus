import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AlertsManager = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          medications (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const alertsWithFormatting = (data || []).map(alert => ({
        ...alert,
        priority: alert.severity || 'medium',
        timestamp: new Date(alert.created_at).toLocaleString(),
        status: alert.is_read ? 'resolved' : 'active',
        medication: alert.medications?.name || 'N/A'
      }));
      
      setAlerts(alertsWithFormatting);
    } catch (error: any) {
      toast({
        title: 'Error loading alerts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved', is_read: true }
          : alert
      ));
      
      toast({
        title: 'Alert resolved',
        description: 'The alert has been marked as resolved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error resolving alert',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

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
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                </div>
              ))
            ) : activeAlerts.map((alert) => {
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
                      <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
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