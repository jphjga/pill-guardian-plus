import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UpdateStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: any;
  onSuccess: () => void;
}

const UpdateStockDialog = ({ open, onOpenChange, medication, onSuccess }: UpdateStockDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState({
    current_stock: medication?.stock || 0,
    minimum_stock: medication?.minimumStock || 10,
    maximum_stock: 1000,
    supplier: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if inventory record exists
      const { data: existingInventory } = await supabase
        .from('inventory')
        .select('id')
        .eq('medication_id', medication.id)
        .single();

      if (existingInventory) {
        // Update existing inventory
        const { error } = await supabase
          .from('inventory')
          .update({
            current_stock: parseInt(stockData.current_stock.toString()),
            minimum_stock: parseInt(stockData.minimum_stock.toString()),
            maximum_stock: parseInt(stockData.maximum_stock.toString()),
            supplier: stockData.supplier || null,
            location: stockData.location || null,
            last_restocked: new Date().toISOString().split('T')[0]
          })
          .eq('medication_id', medication.id);

        if (error) throw error;
      } else {
        // Create new inventory record
        const { error } = await supabase
          .from('inventory')
          .insert({
            medication_id: medication.id,
            current_stock: parseInt(stockData.current_stock.toString()),
            minimum_stock: parseInt(stockData.minimum_stock.toString()),
            maximum_stock: parseInt(stockData.maximum_stock.toString()),
            supplier: stockData.supplier || null,
            location: stockData.location || null,
            last_restocked: new Date().toISOString().split('T')[0]
          });

        if (error) throw error;
      }

      toast({
        title: 'Stock Updated',
        description: 'Medication stock has been updated successfully.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error updating stock',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="update-stock-description">
        <DialogHeader>
          <DialogTitle>Update Stock - {medication?.name}</DialogTitle>
        </DialogHeader>
        <div id="update-stock-description">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_stock">Current Stock</Label>
                <Input
                  id="current_stock"
                  type="number"
                  min="0"
                  value={stockData.current_stock}
                  onChange={(e) => setStockData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Minimum Stock</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  min="1"
                  value={stockData.minimum_stock}
                  onChange={(e) => setStockData(prev => ({ ...prev, minimum_stock: parseInt(e.target.value) || 10 }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="maximum_stock">Maximum Stock</Label>
              <Input
                id="maximum_stock"
                type="number"
                min="1"
                value={stockData.maximum_stock}
                onChange={(e) => setStockData(prev => ({ ...prev, maximum_stock: parseInt(e.target.value) || 1000 }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Input
                id="supplier"
                type="text"
                value={stockData.supplier}
                onChange={(e) => setStockData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                type="text"
                value={stockData.location}
                onChange={(e) => setStockData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter storage location"
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
                {loading ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockDialog;