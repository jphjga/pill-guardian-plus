import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  Eye,
  Edit,
  ShoppingBag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ViewCustomerProfileDialog from "./ViewCustomerProfileDialog";
import EditCustomerDialog from "./EditCustomerDialog";
import CustomerOrderHistoryDialog from "./CustomerOrderHistoryDialog";

const CustomerManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showOrderHistoryDialog, setShowOrderHistoryDialog] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (
            id,
            total_amount,
            created_at
          )
        `);

      if (error) throw error;
      
      // Calculate customer statistics
      const customersWithStats = (data || []).map(customer => {
        const orders = customer.orders || [];
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum: number, order: any) => sum + (Number(order.total_amount) || 0), 0);
        const lastOrder = orders.length > 0 ? orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : null;
        
        return {
          ...customer,
          name: `${customer.first_name} ${customer.last_name}`,
          joinDate: new Date(customer.created_at).toLocaleDateString(),
          totalOrders,
          totalSpent,
          lastOrder: lastOrder ? new Date(lastOrder).toLocaleDateString() : 'Never',
          status: totalOrders > 20 ? 'premium' : totalOrders > 0 ? 'active' : 'inactive'
        };
      });
      
      setCustomers(customersWithStats);
    } catch (error: any) {
      toast({
        title: 'Error loading customers',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "premium": return "bg-gradient-primary text-primary-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Customer Management</h2>
          <p className="text-muted-foreground">Manage customer information and order history</p>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {customers.filter(c => c.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {customers.filter(c => c.status === "premium").length}
                </p>
                <p className="text-sm text-muted-foreground">Premium Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/10">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {customers.reduce((acc, c) => acc + c.totalOrders, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
          <Card key={customer.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">Customer since {customer.joinDate}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>
              </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{customer.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{customer.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground truncate">{customer.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Born {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-lg font-semibold text-foreground">{customer.totalOrders}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold text-foreground">${customer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Order</p>
                  <p className="text-lg font-semibold text-foreground">{customer.lastOrder}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowProfileDialog(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowOrderHistoryDialog(true);
                  }}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Order History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No customers found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or add new customers to the system.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredCustomers.length === 0 && !loading && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or add new customers to the system.</p>
          </CardContent>
        </Card>
      )}

      <ViewCustomerProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        customer={selectedCustomer}
      />

      <EditCustomerDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />

      <CustomerOrderHistoryDialog
        open={showOrderHistoryDialog}
        onOpenChange={setShowOrderHistoryDialog}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomerManagement;