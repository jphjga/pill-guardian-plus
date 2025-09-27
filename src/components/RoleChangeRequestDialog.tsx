import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCheck } from 'lucide-react';

interface RoleChangeRequestDialogProps {
  currentRole: string;
  organization: string;
  userProfile: any;
}

const RoleChangeRequestDialog = ({ currentRole, organization, userProfile }: RoleChangeRequestDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [requestedRole, setRequestedRole] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'pharmacy_tech', label: 'Pharmacy Technician' },
    { value: 'manager', label: 'Manager' }
  ];

  const availableRoles = roles.filter(role => role.value !== currentRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('role_change_requests')
        .insert({
          user_id: user?.id,
          organization,
          from_role: currentRole,
          to_role: requestedRole,
          requested_by_name: userProfile?.full_name || '',
          requested_by_email: userProfile?.email || user?.email || '',
          reason: reason.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Request submitted',
        description: 'Your role change request has been sent to administrators for approval.',
      });

      setOpen(false);
      setRequestedRole('');
      setReason('');
    } catch (error: any) {
      toast({
        title: 'Error submitting request',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="h-4 w-4 mr-2" />
          Request Role Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Role Change</DialogTitle>
          <DialogDescription>
            Submit a request to change your role. This will require administrator approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="p-2 bg-muted rounded-md text-sm">
              {roles.find(r => r.value === currentRole)?.label || currentRole}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested-role">Requested Role</Label>
            <Select value={requestedRole} onValueChange={setRequestedRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need this role change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !requestedRole}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleChangeRequestDialog;