import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, UserCog } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RoleChangeRequest {
  id: string;
  user_id: string;
  organization: string;
  from_role: string;
  to_role: string;
  status: string;
  requested_by_name: string;
  requested_by_email: string;
  reason: string;
  admin_response: string;
  created_at: string;
  processed_at: string;
}

const AdminRoleRequestsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RoleChangeRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('role_change_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading requests',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected', response: string) => {
    setProcessing(true);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update the request status
      const { error: updateError } = await supabase
        .from('role_change_requests')
        .update({
          status: action,
          admin_response: response.trim() || null,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create notification for the user
      const notificationTitle = action === 'approved' 
        ? 'Role Change Approved' 
        : 'Role Change Rejected';
      
      const notificationMessage = action === 'approved'
        ? `Your role change request to ${getRoleLabel(request.to_role)} has been approved. Please accept the role change in your notifications.`
        : `Your role change request to ${getRoleLabel(request.to_role)} has been rejected.${response ? ` Admin response: ${response}` : ''}`;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          organization: request.organization,
          type: 'role_change_response',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            role_change_request_id: requestId,
            new_role: request.to_role,
            action: action,
            admin_response: response
          }
        });

      if (notificationError) throw notificationError;

      toast({
        title: `Request ${action}`,
        description: `Role change request has been ${action} and user has been notified.`,
      });

      setSelectedRequest(null);
      setAdminResponse('');
      fetchRequests();
    } catch (error: any) {
      toast({
        title: `Error ${action === 'approved' ? 'approving' : 'rejecting'} request`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'pharmacist': 'Pharmacist',
      'pharmacy_tech': 'Pharmacy Technician',
      'manager': 'Manager',
      'administrator': 'Administrator'
    };
    return roleLabels[role] || role;
  };

  if (loading) {
    return <div className="text-center py-4">Loading role change requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserCog className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Role Change Requests</h3>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No role change requests found.</p>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => setSelectedRequest(request)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{request.requested_by_name}</CardTitle>
                {getStatusBadge(request.status)}
              </div>
              <CardDescription>
                {request.requested_by_email} • {new Date(request.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Role Change:</span>
                  <span>{getRoleLabel(request.from_role)}</span>
                  <span>→</span>
                  <span className="font-medium">{getRoleLabel(request.to_role)}</span>
                </div>
                {request.reason && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Reason:</span> {request.reason}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Role Change Request</DialogTitle>
              <DialogDescription>
                Review and respond to {selectedRequest.requested_by_name}'s role change request.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Requested by:</span> {selectedRequest.requested_by_name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {selectedRequest.requested_by_email}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Role Change:</span> {getRoleLabel(selectedRequest.from_role)} → {getRoleLabel(selectedRequest.to_role)}
                </div>
                {selectedRequest.reason && (
                  <div className="text-sm">
                    <span className="font-medium">Reason:</span> {selectedRequest.reason}
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-response">Response (Optional)</Label>
                    <Textarea
                      id="admin-response"
                      placeholder="Add a message for the user..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRequestAction(selectedRequest.id, 'approved', adminResponse)}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {processing ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleRequestAction(selectedRequest.id, 'rejected', adminResponse)}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {processing ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedRequest.status)}
                  </div>
                  {selectedRequest.admin_response && (
                    <div className="text-sm">
                      <span className="font-medium">Admin Response:</span> {selectedRequest.admin_response}
                    </div>
                  )}
                  {selectedRequest.processed_at && (
                    <div className="text-sm text-muted-foreground">
                      Processed on {new Date(selectedRequest.processed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminRoleRequestsManager;