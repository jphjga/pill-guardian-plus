import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminRoleRequestsManager from '@/components/AdminRoleRequestsManager';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Lock,
  Eye,
  Mail,
  UserCog
} from "lucide-react";
import DataExportManager from './DataExportManager';

const SystemSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const isAdmin = userProfile?.role === 'administrator';
  
  const handleSettingChange = (categoryId: string, settingName: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [`${categoryId}_${settingName}`]: value
    }));
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'All settings have been saved successfully.',
    });
  };

  const handleResetSettings = () => {
    setSettings({});
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to defaults.',
    });
  };

  const handleDataAction = (action: string) => {
    toast({
      title: `${action} Started`,
      description: `${action} operation has been initiated.`,
    });
  };

  const settingsCategories = [
    {
      id: "general",
      title: "General Settings",
      icon: Settings,
      settings: [
        {
          name: "Pharmacy Name",
          description: "Display name for your pharmacy",
          type: "text",
          value: "PharmaCare Pharmacy",
          enabled: true
        },
        {
          name: "Business Hours",
          description: "Operating hours display",
          type: "text",
          value: "Mon-Fri: 8AM-8PM, Sat: 9AM-6PM",
          enabled: true
        },
        {
          name: "Automatic Backups",
          description: "Enable daily automatic data backups",
          type: "toggle",
          value: true,
          enabled: true
        },
        {
          name: "Low Stock Threshold",
          description: "Default minimum stock level",
          type: "number",
          value: "20",
          enabled: true
        }
      ]
    },
    {
      id: "notifications",
      title: "Notification Settings",
      icon: Bell,
      settings: [
        {
          name: "Email Notifications",
          description: "Receive alerts via email",
          type: "toggle",
          value: true,
          enabled: true
        },
        {
          name: "Stock Alerts",
          description: "Notify when items are low in stock",
          type: "toggle",
          value: true,
          enabled: true
        },
        {
          name: "Expiry Warnings",
          description: "Alert for medications nearing expiry",
          type: "toggle",
          value: true,
          enabled: true
        },
        {
          name: "Order Notifications",
          description: "Updates on order status changes",
          type: "toggle",
          value: false,
          enabled: true
        }
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      settings: [
        {
          name: "Two-Factor Authentication",
          description: "Require 2FA for all users",
          type: "toggle",
          value: false,
          enabled: true
        },
        {
          name: "Session Timeout",
          description: "Auto-logout after inactivity (minutes)",
          type: "number",
          value: "30",
          enabled: true
        },
        {
          name: "Password Policy",
          description: "Enforce strong password requirements",
          type: "toggle",
          value: true,
          enabled: true
        },
        {
          name: "Activity Logging",
          description: "Track all user actions",
          type: "toggle",
          value: true,
          enabled: true
        }
      ]
    },
    {
      id: "users",
      title: "User Management",
      icon: User,
      settings: [
        {
          name: "Default User Role",
          description: "Role assigned to new users",
          type: "select",
          value: "Pharmacist",
          enabled: true
        },
        {
          name: "User Registration",
          description: "Allow new user self-registration",
          type: "toggle",
          value: false,
          enabled: true
        },
        {
          name: "Max Active Sessions",
          description: "Maximum concurrent logins per user",
          type: "number",
          value: "3",
          enabled: true
        }
      ]
    }
  ];

  const systemInfo = {
    version: "2.1.4",
    lastBackup: "2024-01-15 02:00:00",
    totalUsers: 8,
    storageUsed: "2.4 GB",
    uptime: "99.8%"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">System Settings</h2>
          <p className="text-muted-foreground">Configure system preferences and security</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'system' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('system')}
        >
          <Settings className="h-4 w-4 mr-2" />
          System
        </Button>
        <Button
          variant={activeTab === 'data-export' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('data-export')}
        >
          <Download className="h-4 w-4 mr-2" />
          Data Export
        </Button>
      </div>

      {activeTab === 'system' && (
        <>
          {/* System Info */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-semibold text-foreground">{systemInfo.version}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Backup</p>
                  <p className="font-semibold text-foreground text-xs">{systemInfo.lastBackup}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="font-semibold text-foreground">{systemInfo.totalUsers}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="font-semibold text-foreground">{systemInfo.storageUsed}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-semibold text-success">{systemInfo.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Categories */}
          <div className="grid gap-6">
            {settingsCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.settings.map((setting, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="space-y-1">
                            <h4 className="font-medium text-foreground">{setting.name}</h4>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {setting.type === "toggle" && (
                              <Switch 
                                checked={settings[`${category.id}_${setting.name}`] ?? setting.value as boolean}
                                onCheckedChange={(value) => handleSettingChange(category.id, setting.name, value)}
                              />
                            )}
                            {setting.type === "text" && (
                              <Input
                                value={settings[`${category.id}_${setting.name}`] ?? setting.value as string}
                                className="w-48"
                                onChange={(e) => handleSettingChange(category.id, setting.name, e.target.value)}
                              />
                            )}
                            {setting.type === "number" && (
                              <Input
                                type="number"
                                value={settings[`${category.id}_${setting.name}`] ?? setting.value as string}
                                className="w-24"
                                onChange={(e) => handleSettingChange(category.id, setting.name, e.target.value)}
                              />
                            )}
                            {setting.type === "select" && (
                              <Badge variant="outline" className="min-w-20 justify-center">
                                {settings[`${category.id}_${setting.name}`] ?? setting.value as string}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Data Management */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleDataAction('Export')}>
                  <Download className="h-6 w-6" />
                  Export Data
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleDataAction('Import')}>
                  <Upload className="h-6 w-6" />
                  Import Data
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleDataAction('Backup')}>
                  <RefreshCw className="h-6 w-6" />
                  Create Backup
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDataAction('Clear Cache')}>
                  <Trash2 className="h-6 w-6" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-warning" />
                Advanced Settings
                <Badge variant="outline" className="text-warning border-warning">
                  Admin Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-warning/20 bg-warning/5">
                  <div>
                    <h4 className="font-medium text-foreground">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">Enable to perform system updates</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-foreground">Debug Logging</h4>
                    <p className="text-sm text-muted-foreground">Enable detailed system logs</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-foreground">API Access</h4>
                    <p className="text-sm text-muted-foreground">Allow external API connections</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Keys
                    </Button>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'data-export' && (
        <DataExportManager />
      )}
    </div>
  );
};

export default SystemSettings;