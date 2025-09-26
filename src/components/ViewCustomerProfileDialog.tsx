import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ViewCustomerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
}

const ViewCustomerProfileDialog = ({ open, onOpenChange, customer }: ViewCustomerProfileDialogProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="customer-profile-description">
        <DialogHeader>
          <DialogTitle>Customer Profile - {customer.name}</DialogTitle>
        </DialogHeader>
        <div id="customer-profile-description" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{customer.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Status</p>
                      <Badge className={
                        customer.status === 'premium' ? 'bg-gradient-primary text-primary-foreground' :
                        customer.status === 'active' ? 'bg-success text-success-foreground' :
                        'bg-muted text-muted-foreground'
                      }>
                        {customer.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{customer.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="font-medium">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="font-medium">${customer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Order</p>
                      <p className="font-medium">{customer.lastOrder}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Medical Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Provider</p>
                    <p className="font-medium">{customer.insurance_provider || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Number</p>
                    <p className="font-medium">{customer.insurance_number || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Allergies</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.allergies && customer.allergies.length > 0 ? (
                        customer.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <p className="font-medium text-muted-foreground">None reported</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Medical Conditions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.medical_conditions && customer.medical_conditions.length > 0 ? (
                        customer.medical_conditions.map((condition: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-warning/10 text-warning border-warning">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <p className="font-medium text-muted-foreground">None reported</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerProfileDialog;