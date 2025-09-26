import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerOrderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
}

const CustomerOrderHistoryDialog = ({ open, onOpenChange, customer }: CustomerOrderHistoryDialogProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customer) {
      fetchOrders();
    }
  }, [open, customer]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            medications (name, dosage, form)
          )
        `)
        .eq('customer_id', customer.id)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'processing': return 'bg-primary text-primary-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="order-history-description">
        <DialogHeader>
          <DialogTitle>Order History - {customer.name}</DialogTitle>
        </DialogHeader>
        <div id="order-history-description" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid gap-2 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-medium">${order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prescription #</p>
                          <p className="font-medium">{order.prescription_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor</p>
                          <p className="font-medium">{order.doctor_name || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {order.order_items && order.order_items.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Medications</p>
                          <div className="space-y-2">
                            {order.order_items.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <div>
                                  <p className="font-medium">{item.medications?.name || 'Unknown Medication'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.medications?.dosage} • {item.medications?.form}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">Qty: {item.quantity}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ${item.unit_price ? Number(item.unit_price).toFixed(2) : '0.00'} each
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {order.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="font-medium">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-semibold mb-2">No Orders Found</p>
                <p className="text-muted-foreground">This customer hasn't placed any orders yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerOrderHistoryDialog;