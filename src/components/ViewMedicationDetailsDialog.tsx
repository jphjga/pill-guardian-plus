import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ViewMedicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: any;
}

const ViewMedicationDetailsDialog = ({ open, onOpenChange, medication }: ViewMedicationDetailsDialogProps) => {
  if (!medication) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="medication-details-description">
        <DialogHeader>
          <DialogTitle>Medication Details</DialogTitle>
        </DialogHeader>
        <div id="medication-details-description" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Brand Name</p>
                      <p className="font-medium">{medication.brand_name || medication.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Generic Name</p>
                      <p className="font-medium">{medication.generic_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dosage</p>
                      <p className="font-medium">{medication.dosage || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Form</p>
                      <p className="font-medium">{medication.form || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{medication.category || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Stock & Pricing</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Stock</p>
                      <p className="font-medium">{medication.stock || 0} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={
                        medication.status === 'active' ? 'bg-success text-success-foreground' :
                        medication.status === 'low_stock' ? 'bg-warning text-warning-foreground' :
                        'bg-destructive text-destructive-foreground'
                      }>
                        {medication.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">${medication.price ? Number(medication.price).toFixed(2) : '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cost</p>
                      <p className="font-medium">${medication.cost ? Number(medication.cost).toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Additional Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="font-medium">{medication.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NDC Number</p>
                    <p className="font-medium">{medication.ndc_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lot Number</p>
                    <p className="font-medium">{medication.lot_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">
                      {medication.expiry_date ? new Date(medication.expiry_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {medication.description && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{medication.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMedicationDetailsDialog;