import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill, Building2, MapPin, Phone, Mail, Users, Shield, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const steps = [
  { id: 1, name: 'Organization Details' },
  { id: 2, name: 'Account Setup' },
  { id: 3, name: 'Admin Account' },
  { id: 4, name: 'Review & Submit' },
];

const RegisterOrganization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: '',
    organizationType: '',
    location: '',
    address: '',
    phone: '',
    businessEmail: '',
    // Account Setup
    maxAccounts: '5',
    licenseNumber: '',
    // Admin Account
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.organizationName || !formData.organizationType || !formData.location) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in organization name, type, and location.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 2:
        return true; // Optional fields
      case 3:
        if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in all admin account details.',
            variant: 'destructive',
          });
          return false;
        }
        if (formData.adminPassword !== formData.confirmPassword) {
          toast({
            title: 'Password Mismatch',
            description: 'Passwords do not match.',
            variant: 'destructive',
          });
          return false;
        }
        if (formData.adminPassword.length < 6) {
          toast({
            title: 'Weak Password',
            description: 'Password must be at least 6 characters.',
            variant: 'destructive',
          });
          return false;
        }
        if (!formData.agreedToTerms) {
          toast({
            title: 'Terms Required',
            description: 'Please agree to the Terms and Conditions.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    
    try {
      // Step 1: Check if organization name already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', formData.organizationName)
        .maybeSingle();

      if (existingOrg) {
        toast({
          title: 'Organization Exists',
          description: 'An organization with this name already exists.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Step 2: Create the admin user account first
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.adminName,
            organization: formData.organizationName,
            role: 'administrator',
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if this was a repeated signup (user already exists)
      if (authData.user && !authData.user.identities?.length) {
        toast({
          title: 'Account Already Exists',
          description: 'An account with this email already exists. Please use a different email or sign in.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Step 3: Create the organization with admin_user_id
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organizationName,
          slug: generateSlug(formData.organizationName),
          type: formData.organizationType,
          location: formData.location,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.businessEmail || null,
          max_accounts: parseInt(formData.maxAccounts),
          license_number: formData.licenseNumber || null,
          admin_user_id: authData.user?.id,
        });

      if (orgError) {
        console.error('Organization creation error:', orgError);
        toast({
          title: 'Registration Failed',
          description: 'Failed to create organization. Please contact support.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Organization Created!',
        description: 'Please check your email to verify your account.',
      });

      navigate('/auth');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="org-name"
                  placeholder="Enter your pharmacy/hospital name"
                  className="pl-10"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Organization Type *</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) => setFormData({ ...formData, organizationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="chemist">Chemist</SelectItem>
                  <SelectItem value="drug_store">Drug Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location/City *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter city or location"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="Enter full address (optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-email">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="business-email"
                    type="email"
                    placeholder="Business email"
                    className="pl-10"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum Staff Accounts</Label>
              <Select
                value={formData.maxAccounts}
                onValueChange={(value) => setFormData({ ...formData, maxAccounts: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 accounts</SelectItem>
                  <SelectItem value="5">5 accounts</SelectItem>
                  <SelectItem value="10">10 accounts</SelectItem>
                  <SelectItem value="15">15 accounts</SelectItem>
                  <SelectItem value="20">20 accounts</SelectItem>
                  <SelectItem value="50">50 accounts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                You can increase this limit later from your settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License/Registration Number</Label>
              <Input
                id="license"
                placeholder="Enter license number (optional)"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Staff Account Management</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    As the administrator, you'll be able to create and manage staff accounts 
                    from your dashboard. Staff members won't be able to create their own accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">Administrator Account</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This account will have full administrative access to your organization.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input
                id="admin-name"
                placeholder="Enter your full name"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Enter your email address"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password *</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Create a password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreedToTerms: checked as boolean })
                }
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline" target="_blank">
                  Terms and Conditions
                </Link>
              </Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Organization Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{formData.organizationName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{formData.organizationType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{formData.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Accounts:</span>
                  <p className="font-medium">{formData.maxAccounts}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold text-lg">Administrator</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{formData.adminName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{formData.adminEmail}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                By clicking "Create Organization", your organization and admin account will be created. 
                You'll receive a verification email to confirm your account.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="p-3 bg-primary-foreground/10 backdrop-blur-sm rounded-full">
              <Pill className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground">PharmaCare</h1>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-primary-foreground mb-4">
                Register Your Organization
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Set up your pharmacy in minutes and start managing your inventory efficiently.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 mt-12">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.id 
                      ? 'bg-primary-foreground text-primary' 
                      : currentStep === step.id 
                        ? 'bg-primary-foreground/20 text-primary-foreground border-2 border-primary-foreground'
                        : 'bg-primary-foreground/10 text-primary-foreground/60'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-lg ${
                    currentStep >= step.id ? 'text-primary-foreground' : 'text-primary-foreground/60'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-primary-foreground/70 text-sm">
          <p>© 2025 PharmaCare. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Pill className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">PharmaCare</h1>
            <p className="text-muted-foreground">Register Your Organization</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{steps[currentStep - 1].name}</CardTitle>
                  <CardDescription>
                    Step {currentStep} of {steps.length}
                  </CardDescription>
                </div>
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {renderStep()}

              <div className="flex justify-between mt-6">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Organization'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganization;
