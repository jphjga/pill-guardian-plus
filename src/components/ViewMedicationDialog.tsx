import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ViewMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem: any;
}

const ViewMedicationDialog = ({ open, onOpenChange, inventoryItem }: ViewMedicationDialogProps) => {
  if (!inventoryItem) return null;

  const medication = inventoryItem.medications;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="view-medication-description">
        <DialogHeader>
          <DialogTitle>{medication?.name || 'Medication Details'}</DialogTitle>
        </DialogHeader>
        <p id="view-medication-description" className="sr-only">
          Detailed view of medication information including brand name, category, stock levels, pricing, and storage details.
        </p>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Brand Name</p>
                  <p className="font-medium">{medication?.brand_name || 'Generic'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Generic Name</p>
                  <p className="font-medium">{medication?.generic_name || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">{medication?.category || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Form</p>
                  <p className="font-medium">{medication?.form || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dosage</p>
                  <p className="font-medium">{medication?.dosage || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{medication?.manufacturer || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="font-bold text-lg">{inventoryItem.current_stock} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Stock</p>
                  <p className="font-medium">{inventoryItem.minimum_stock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Stock</p>
                  <p className="font-medium">{inventoryItem.maximum_stock}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-medium text-green-600">
                    ${medication?.price ? Number(medication.price).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="font-medium">
                    ${medication?.cost ? Number(medication.cost).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{inventoryItem.supplier || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{inventoryItem.location || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-medium">
                  {medication?.expiry_date ? new Date(medication.expiry_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {medication?.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{medication.description}</p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{new Date(inventoryItem.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMedicationDialog;