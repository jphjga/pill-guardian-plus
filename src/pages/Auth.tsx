import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Shield, Users, TrendingUp, Activity, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Auth = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);

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

      {/* Right Side - Sign In Form */}
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
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
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

              <div className="mt-6 pt-6 border-t">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    New organization? Register your pharmacy to get started.
                  </p>
                  <Link to="/register-organization">
                    <Button variant="outline" className="w-full">
                      <Building2 className="h-4 w-4 mr-2" />
                      Register New Organization
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Staff accounts are created by your organization's administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
