import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OrdersManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading orders',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.customers?.first_name} ${order.customers?.last_name}`.toLowerCase();
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
                         order.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Orders Management</h2>
          <p className="text-muted-foreground">Manage and process customer orders</p>
        </div>
        
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or prescription number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Prescription #</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-muted animate-pulse rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-mono text-sm">#{order.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {order.customers?.first_name} {order.customers?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{order.customers?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.prescription_number || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">{order.doctor_name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                          >
                            Process
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">No orders found</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManager;