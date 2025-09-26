import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
  onSuccess: () => void;
}

const EditCustomerDialog = ({ open, onOpenChange, customer, onSuccess }: EditCustomerDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    date_of_birth: customer?.date_of_birth || '',
    insurance_provider: customer?.insurance_provider || '',
    insurance_number: customer?.insurance_number || '',
    allergies: customer?.allergies?.join(', ') || '',
    medical_conditions: customer?.medical_conditions?.join(', ') || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          email: customerData.email || null,
          phone: customerData.phone || null,
          address: customerData.address || null,
          date_of_birth: customerData.date_of_birth || null,
          insurance_provider: customerData.insurance_provider || null,
          insurance_number: customerData.insurance_number || null,
          allergies: customerData.allergies ? customerData.allergies.split(',').map(a => a.trim()).filter(a => a) : null,
          medical_conditions: customerData.medical_conditions ? customerData.medical_conditions.split(',').map(c => c.trim()).filter(c => c) : null
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: 'Customer Updated',
        description: 'Customer information has been updated successfully.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error updating customer',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="edit-customer-description">
        <DialogHeader>
          <DialogTitle>Edit Customer - {customer?.name}</DialogTitle>
        </DialogHeader>
        <div id="edit-customer-description">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={customerData.first_name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={customerData.last_name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={customerData.address}
                onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
              />
            </div>
            
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={customerData.date_of_birth}
                onChange={(e) => setCustomerData(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  value={customerData.insurance_provider}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, insurance_provider: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="insurance_number">Insurance Number</Label>
                <Input
                  id="insurance_number"
                  value={customerData.insurance_number}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, insurance_number: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="allergies">Allergies (comma-separated)</Label>
              <Input
                id="allergies"
                value={customerData.allergies}
                onChange={(e) => setCustomerData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="e.g., Penicillin, Sulfa, Latex"
              />
            </div>
            
            <div>
              <Label htmlFor="medical_conditions">Medical Conditions (comma-separated)</Label>
              <Input
                id="medical_conditions"
                value={customerData.medical_conditions}
                onChange={(e) => setCustomerData(prev => ({ ...prev, medical_conditions: e.target.value }))}
                placeholder="e.g., Diabetes, Hypertension, Asthma"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Customer'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;