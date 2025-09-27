import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, User, Building2, UserCog } from 'lucide-react';
import { format } from 'date-fns';

interface RoleChangeRequest {
  id: string;
  user_id: string;
  organization: string;
  from_role: string;
  to_role: string;
  status: string;
  requested_by_name: string;
  requested_by_email: string;
  reason: string | null;
  admin_response: string | null;
  created_at: string;
  processed_at: string | null;
}

const AdminRoleRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RoleChangeRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      // First get the user's profile to check if they're an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization')
        .eq('user_id', user?.id)
        .single();

      if (profile?.role !== 'administrator') {
        setLoading(false);
        return;
      }

      // Fetch requests for the admin's organization
      const { data, error } = await supabase
        .from('role_change_requests')
        .select('*')
        .eq('organization', profile.organization)
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

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessingRequest(requestId);

    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('role_change_requests')
        .update({
          status: action,
          admin_response: adminResponse,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update the user's role in profiles table
      if (action === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: selectedRequest.to_role })
          .eq('user_id', selectedRequest.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: `Request ${action}`,
        description: `The role change request has been ${action}.`,
      });

      // Refresh the requests list
      fetchRequests();
      setSelectedRequest(null);
      setAdminResponse('');
    } catch (error: any) {
      toast({
        title: 'Error processing request',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'pharmacy_tech':
        return 'Pharmacy Technician';
      case 'pharmacist':
        return 'Pharmacist';
      case 'manager':
        return 'Manager';
      case 'administrator':
        return 'Administrator';
      default:
        return role;
    }
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Role Change Requests
          </CardTitle>
          <CardDescription>
            Review and manage role change requests from organization members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No role change requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requestor</TableHead>
                  <TableHead>From Role</TableHead>
                  <TableHead>To Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.requested_by_name}</div>
                        <div className="text-sm text-muted-foreground">{request.requested_by_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatRoleName(request.from_role)}</TableCell>
                    <TableCell>{formatRoleName(request.to_role)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{format(new Date(request.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Review
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {request.processed_at ? format(new Date(request.processed_at), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Role Change Request</DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this role change request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Requestor</Label>
                  <p className="text-sm">{selectedRequest.requested_by_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.requested_by_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <p className="text-sm flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {selectedRequest.organization}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Role</Label>
                  <p className="text-sm">{formatRoleName(selectedRequest.from_role)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requested Role</Label>
                  <p className="text-sm">{formatRoleName(selectedRequest.to_role)}</p>
                </div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.reason}</p>
                </div>
              )}

              <div>
                <Label htmlFor="admin-response">Admin Response (Optional)</Label>
                <Textarea
                  id="admin-response"
                  placeholder="Add a note about your decision..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleRequestAction(selectedRequest.id, 'approved')}
                  disabled={processingRequest === selectedRequest.id}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRequestAction(selectedRequest.id, 'rejected')}
                  disabled={processingRequest === selectedRequest.id}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminRoleRequests;