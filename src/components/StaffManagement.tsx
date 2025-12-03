import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Search, AlertCircle, Shield, Mail } from 'lucide-react';

interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface OrganizationInfo {
  name: string;
  max_accounts: number;
  current_account_count: number;
}

const StaffManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'pharmacist',
  });

  useEffect(() => {
    if (user) {
      fetchStaffAndOrganization();
    }
  }, [user]);

  const fetchStaffAndOrganization = async () => {
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.organization) return;

      // Fetch organization info
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, max_accounts, current_account_count')
        .eq('name', profile.organization)
        .maybeSingle();

      if (orgData) {
        setOrganization(orgData);
      }

      // Fetch all staff in organization
      const { data: staffData, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, role, created_at')
        .eq('organization', profile.organization)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(staffData || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaff.fullName || !newStaff.email || !newStaff.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newStaff.password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    // Check account limit
    if (organization && staff.length >= organization.max_accounts) {
      toast({
        title: 'Account Limit Reached',
        description: `Your organization can have maximum ${organization.max_accounts} accounts.`,
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.organization) {
        throw new Error('Organization not found');
      }

      const redirectUrl = `${window.location.origin}/`;
      
      // Create the new user
      const { error: signUpError } = await supabase.auth.signUp({
        email: newStaff.email,
        password: newStaff.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: newStaff.fullName,
            organization: profile.organization,
            role: newStaff.role,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Update organization account count
      await supabase.rpc('increment_organization_account_count', { 
        org_name: profile.organization 
      });

      toast({
        title: 'Staff Account Created',
        description: `An invitation email has been sent to ${newStaff.email}.`,
      });

      setIsDialogOpen(false);
      setNewStaff({ fullName: '', email: '', password: '', role: 'pharmacist' });
      
      // Refresh staff list
      fetchStaffAndOrganization();
    } catch (error: any) {
      console.error('Error creating staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create staff account.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredStaff = staff.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'pharmacist':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff accounts in your organization</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new account for a staff member in your organization.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input
                  id="staff-name"
                  placeholder="Enter full name"
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-email">Email Address *</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-password">Temporary Password *</Label>
                <Input
                  id="staff-password"
                  type="password"
                  placeholder="Create a temporary password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Staff member can change this after first login.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={newStaff.role}
                  onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleCreateStaff}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Staff Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account Limit Card */}
      {organization && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Staff Accounts</p>
                  <p className="text-sm text-muted-foreground">
                    {staff.length} of {organization.max_accounts} accounts used
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {staff.length}/{organization.max_accounts}
                </div>
                {staff.length >= organization.max_accounts && (
                  <div className="flex items-center text-destructive text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Limit reached
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Staff Members</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {member.role === 'administrator' && (
                            <Shield className="h-4 w-4 text-primary" />
                          )}
                          <span>{member.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
