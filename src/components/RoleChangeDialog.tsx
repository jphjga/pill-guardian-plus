import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Send } from 'lucide-react';

interface RoleChangeDialogProps {
  currentRole: string;
  organization: string;
  userName: string;
  userEmail: string;
}

const RoleChangeDialog = ({ currentRole, organization, userName, userEmail }: RoleChangeDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedRole: '',
    reason: '',
  });

  const roles = [
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'pharmacy_tech', label: 'Pharmacy Technician' },
    { value: 'manager', label: 'Manager' },
  ];

  const availableRoles = roles.filter(role => role.value !== currentRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.requestedRole) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('role_change_requests')
        .insert({
          user_id: user.id,
          organization,
          from_role: currentRole,
          to_role: formData.requestedRole,
          requested_by_name: userName,
          requested_by_email: userEmail,
          reason: formData.reason,
        });

      if (error) throw error;

      toast({
        title: 'Role change request submitted',
        description: 'Your request has been sent to the administrator for approval.',
      });

      setOpen(false);
      setFormData({ requestedRole: '', reason: '' });
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
          <UserCog className="h-4 w-4 mr-2" />
          Request Role Change
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Role Change</DialogTitle>
          <DialogDescription>
            Submit a request to change your role within the organization. This requires administrator approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <Input value={currentRole} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested-role">Requested Role</Label>
            <Select value={formData.requestedRole} onValueChange={(value) => setFormData({ ...formData, requestedRole: value })}>
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
            <Label htmlFor="reason">Reason for Change (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need this role change..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !formData.requestedRole} className="flex-1">
              {loading ? 'Submitting...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleChangeDialog;