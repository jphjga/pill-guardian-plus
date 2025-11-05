import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Check, MessageSquare, Radio, Send, CheckCheck, UserCog } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminRoleRequestsManager from './AdminRoleRequestsManager';

interface Notification {
  id: string;
  user_id: string;
  organization: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
  sender_id?: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

const NotificationsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [userOrg, setUserOrg] = useState<string>('');
  
  // Direct message state
  const [dmOpen, setDmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [dmTitle, setDmTitle] = useState('');
  
  // Broadcast state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastType, setBroadcastType] = useState<'all' | 'custom'>('all');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchNotifications();
      fetchProfiles();
      const cleanup = setupRealtimeSubscription();
      return () => {
        cleanup && cleanup();
      };
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, organization')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || '');
      setUserOrg(data?.organization || '');
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      let org = userOrg;

      if (!org) {
        const { data: profile, error: orgError } = await supabase
          .from('profiles')
          .select('organization')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (orgError && orgError.code !== 'PGRST116') throw orgError;
        org = profile?.organization || '';
        if (org && !userOrg) setUserOrg(org);
        if (!org) return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role')
        .eq('organization', org)
        .neq('user_id', user?.id);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading notifications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      fetchNotifications();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const acceptRoleChange = async (notification: Notification) => {
    try {
      const newRole = notification.data?.new_role;
      if (!newRole) throw new Error('Role information not found');

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', user?.id);

      if (error) throw error;

      await markAsRead(notification.id);

      toast({
        title: 'Role updated',
        description: `Your role has been changed to ${newRole}`,
      });

      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: 'Error accepting role change',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const sendDirectMessage = async () => {
    if (!selectedUser || !dmTitle || !dmMessage) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedUser,
          sender_id: user?.id,
          organization: userOrg,
          type: 'direct_message',
          title: dmTitle,
          message: dmMessage,
        });

      if (error) throw error;

      toast({
        title: 'Message sent',
        description: 'Direct message has been sent successfully',
      });

      setDmOpen(false);
      setSelectedUser('');
      setDmTitle('');
      setDmMessage('');
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (broadcastType === 'custom' && selectedStaff.length === 0) {
      toast({
        title: 'No recipients selected',
        description: 'Please select at least one staff member',
        variant: 'destructive',
      });
      return;
    }

    try {
      const recipientList = broadcastType === 'all' 
        ? profiles 
        : profiles.filter(p => selectedStaff.includes(p.user_id));

      const notificationsToInsert = recipientList.map(profile => ({
        user_id: profile.user_id,
        sender_id: user?.id,
        organization: userOrg,
        type: 'broadcast',
        title: broadcastTitle,
        message: broadcastMessage,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (error) throw error;

      toast({
        title: 'Broadcast sent',
        description: `Message sent to ${recipientList.length} staff member${recipientList.length > 1 ? 's' : ''}`,
      });

      setBroadcastOpen(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastType('all');
      setSelectedStaff([]);
    } catch (error: any) {
      toast({
        title: 'Error sending broadcast',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleStaffSelection = (userId: string) => {
    setSelectedStaff(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'role_change_response':
        return <Check className="h-4 w-4" />;
      case 'direct_message':
        return <MessageSquare className="h-4 w-4" />;
      case 'broadcast':
        return <Radio className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Group direct messages by conversation
  const groupedDirectMessages = notifications
    .filter(n => n.type === 'direct_message')
    .reduce((groups: { [key: string]: Notification[] }, notification) => {
      const partnerId = notification.sender_id === user?.id ? notification.user_id : notification.sender_id || 'unknown';
      if (!groups[partnerId]) {
        groups[partnerId] = [];
      }
      groups[partnerId].push(notification);
      return groups;
    }, {});

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="text-center py-4">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {(userRole === 'administrator' || userRole === 'manager') && (
            <>
              <Dialog open={dmOpen} onOpenChange={setDmOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Direct Message</DialogTitle>
                    <DialogDescription>Send a message to a specific staff member</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Recipient</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.length === 0 ? (
                            <SelectItem value="none" disabled>No staff members found</SelectItem>
                          ) : (
                            profiles.map(profile => (
                              <SelectItem key={profile.user_id} value={profile.user_id}>
                                {profile.full_name || profile.email} - {profile.role}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={dmTitle}
                        onChange={(e) => setDmTitle(e.target.value)}
                        placeholder="Message title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={dmMessage}
                        onChange={(e) => setDmMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={sendDirectMessage} className="w-full" disabled={!selectedUser || !dmTitle || !dmMessage || !userOrg}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Radio className="h-4 w-4 mr-2" />
                    Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Broadcast Message</DialogTitle>
                    <DialogDescription>
                      Send a message to staff members in your organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Recipients</Label>
                      <RadioGroup value={broadcastType} onValueChange={(val) => setBroadcastType(val as 'all' | 'custom')}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all-staff" />
                          <Label htmlFor="all-staff" className="font-normal cursor-pointer">
                            All staff members ({profiles.length} recipients)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom-staff" />
                          <Label htmlFor="custom-staff" className="font-normal cursor-pointer">
                            Select specific staff members
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {broadcastType === 'custom' && (
                      <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                        <Label className="text-sm text-muted-foreground">Select Recipients:</Label>
                        {profiles.map(profile => (
                          <div key={profile.user_id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={profile.user_id}
                              checked={selectedStaff.includes(profile.user_id)}
                              onCheckedChange={() => toggleStaffSelection(profile.user_id)}
                            />
                            <Label
                              htmlFor={profile.user_id}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {profile.full_name || profile.email} 
                              <span className="text-muted-foreground ml-2">({profile.role})</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Broadcast title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your broadcast message..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={sendBroadcast} className="w-full" disabled={!userOrg || !broadcastTitle || !broadcastMessage || (broadcastType === 'custom' && selectedStaff.length === 0)}>
                      <Radio className="h-4 w-4 mr-2" />
                      Send Broadcast
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="role_changes">
            {userRole === 'administrator' ? 'Role Change Requests' : 'Role Changes'}
          </TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(notification => (
              <Card key={notification.id} className={notification.is_read ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                    </div>
                    {!notification.is_read && (
                      <Badge variant="default">New</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {new Date(notification.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{notification.message}</p>
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    {notification.type === 'role_change_response' && 
                     notification.data?.action === 'approved' && 
                     !notification.is_read && (
                      <Button 
                        size="sm"
                        onClick={() => acceptRoleChange(notification)}
                      >
                        Accept Role Change
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {notifications.filter(n => !n.is_read).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          ) : (
            notifications.filter(n => !n.is_read).map(notification => (
              <Card key={notification.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                    </div>
                    <Badge variant="default">New</Badge>
                  </div>
                  <CardDescription>
                    {new Date(notification.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{notification.message}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                    {notification.type === 'role_change_response' && 
                     notification.data?.action === 'approved' && (
                      <Button 
                        size="sm"
                        onClick={() => acceptRoleChange(notification)}
                      >
                        Accept Role Change
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="role_changes" className="space-y-3">
          {userRole === 'administrator' ? (
            <AdminRoleRequestsManager />
          ) : (
            <>
              {notifications.filter(n => n.type === 'role_change_response').length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No role change responses</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.filter(n => n.type === 'role_change_response').map(notification => (
                  <Card key={notification.id} className={notification.is_read ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className="text-base">{notification.title}</CardTitle>
                        </div>
                        {!notification.is_read && <Badge variant="default">New</Badge>}
                      </div>
                      <CardDescription>
                        {new Date(notification.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{notification.message}</p>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        {notification.data?.action === 'approved' && !notification.is_read && (
                          <Button 
                            size="sm"
                            onClick={() => acceptRoleChange(notification)}
                          >
                            Accept Role Change
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {/* Grouped Direct Messages */}
          {Object.keys(groupedDirectMessages).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Direct Messages
              </h3>
              {Object.entries(groupedDirectMessages).map(([partnerId, messages]) => {
                const partner = profiles.find(p => p.user_id === partnerId);
                const unreadInConversation = messages.filter(m => !m.is_read).length;
                const lastMessage = messages[0];
                
                return (
                  <Card key={partnerId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {partner ? (partner.full_name || partner.email) : 'Unknown User'}
                          </CardTitle>
                          <CardDescription>
                            {messages.length} message{messages.length > 1 ? 's' : ''}
                            {unreadInConversation > 0 && ` • ${unreadInConversation} unread`}
                          </CardDescription>
                        </div>
                        {unreadInConversation > 0 && (
                          <Badge variant="destructive">{unreadInConversation}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {messages.map(msg => (
                          <div key={msg.id} className={`p-3 rounded-lg ${msg.is_read ? 'bg-muted/50' : 'bg-primary/10'}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-semibold">
                                {msg.sender_id === user?.id ? 'You' : (partner?.full_name || partner?.email || 'Unknown')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">{msg.title}</p>
                            <p className="text-sm">{msg.message}</p>
                            {!msg.is_read && msg.sender_id !== user?.id && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="mt-2"
                                onClick={() => markAsRead(msg.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Broadcast Messages */}
          {notifications.filter(n => n.type === 'broadcast').length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Broadcast Messages
              </h3>
              {notifications.filter(n => n.type === 'broadcast').map(notification => {
                const sender = notification.sender_id ? profiles.find(p => p.user_id === notification.sender_id) : null;
                
                return (
                  <Card key={notification.id} className={notification.is_read ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-base">{notification.title}</CardTitle>
                            <CardDescription>
                              From: {sender ? (sender.full_name || sender.email) : 'System'} • {new Date(notification.created_at).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        {!notification.is_read && <Badge variant="default">New</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{notification.message}</p>
                      {!notification.is_read && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {Object.keys(groupedDirectMessages).length === 0 && 
           notifications.filter(n => n.type === 'broadcast').length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No messages</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsManager;
