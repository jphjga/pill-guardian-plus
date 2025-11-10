import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill, Building2, Plus, Shield, Users, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    organization: '',
    role: '',
    isNewOrganization: false,
    agreedToTerms: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [existingOrganizations, setExistingOrganizations] = useState<string[]>([]);
  const [showCustomOrganization, setShowCustomOrganization] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('organization');
      
      if (!error && data) {
        const orgs = [...new Set(
          data
            .map(item => item.organization)
            .filter(org => org && org.trim() !== '')
        )];
        setExistingOrganizations(orgs);
      }
    };
    
    fetchOrganizations();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.agreedToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the Terms and Conditions to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.fullName, 
      signUpData.organization,
      signUpData.role || (signUpData.isNewOrganization ? 'administrator' : 'pharmacist')
    );
    
    if (error) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
    }
    
    setLoading(false);
  };

  const handleOrganizationChange = (value: string) => {
    if (value === 'new-organization') {
      setShowCustomOrganization(true);
      setSignUpData({ 
        ...signUpData, 
        organization: '',
        isNewOrganization: true,
        role: 'administrator'
      });
    } else {
      setShowCustomOrganization(false);
      setSignUpData({ 
        ...signUpData, 
        organization: value,
        isNewOrganization: false,
        role: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Welcome Message */}
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
                Welcome to the Future of Pharmacy Management
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Streamline your pharmacy operations with our comprehensive inventory management system.
              </p>
            </div>

            <div className="space-y-6 mt-12">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg">
                  <Activity className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-foreground mb-1">Real-time Inventory Tracking</h3>
                  <p className="text-primary-foreground/80">Monitor stock levels and receive alerts for low inventory automatically.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-foreground mb-1">Patient Management</h3>
                  <p className="text-primary-foreground/80">Maintain comprehensive patient records and order history in one place.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-foreground mb-1">AI-Powered Insights</h3>
                  <p className="text-primary-foreground/80">Get intelligent recommendations for stock optimization and sales trends.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-foreground mb-1">Secure & Compliant</h3>
                  <p className="text-primary-foreground/80">Built with security and regulatory compliance at its core.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-primary-foreground/70 text-sm">
          <p>© 2025 PharmaCare. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Pill className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">PharmaCare</h1>
            <p className="text-muted-foreground">Pharmacy Inventory Management System</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your organization email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Select onValueChange={handleOrganizationChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select or create organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingOrganizations.map((org) => (
                            <SelectItem key={org} value={org}>
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2" />
                                {org}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="new-organization">
                            <div className="flex items-center">
                              <Plus className="h-4 w-4 mr-2" />
                              Create New Organization
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {showCustomOrganization && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-organization">New Organization Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-organization"
                            type="text"
                            placeholder="Enter your pharmacy name"
                            className="pl-10"
                            value={signUpData.organization}
                            onChange={(e) => setSignUpData({ ...signUpData, organization: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Role</Label>
                      {signUpData.isNewOrganization ? (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">
                            As the creator of a new organization, you will be assigned the Administrator role.
                          </p>
                        </div>
                      ) : (
                        <Select 
                          value={signUpData.role} 
                          onValueChange={(value) => setSignUpData({ ...signUpData, role: value })}
                          disabled={!signUpData.organization || signUpData.isNewOrganization}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pharmacist">Pharmacist</SelectItem>
                            <SelectItem value="technician">Pharmacy Technician</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your organization email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={signUpData.agreedToTerms}
                        onCheckedChange={(checked) => 
                          setSignUpData({ ...signUpData, agreedToTerms: checked as boolean })
                        }
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:underline" target="_blank">
                          Terms and Conditions
                        </Link>
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !signUpData.organization || (!signUpData.isNewOrganization && !signUpData.role) || !signUpData.agreedToTerms}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
