import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  inventoryItem: any;
}

const EditStockDialog = ({ open, onOpenChange, onSuccess, inventoryItem }: EditStockDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState({
    current_stock: inventoryItem?.current_stock || 0,
    minimum_stock: inventoryItem?.minimum_stock || 20,
    maximum_stock: inventoryItem?.maximum_stock || 1000,
    supplier: inventoryItem?.supplier || '',
    location: inventoryItem?.location || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          current_stock: parseInt(stockData.current_stock.toString()) || 0,
          minimum_stock: parseInt(stockData.minimum_stock.toString()) || 20,
          maximum_stock: parseInt(stockData.maximum_stock.toString()) || 1000,
          supplier: stockData.supplier || null,
          location: stockData.location || null,
          last_restocked: new Date().toISOString().split('T')[0]
        })
        .eq('id', inventoryItem?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stock updated successfully',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!inventoryItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" aria-describedby="edit-stock-description">
        <DialogHeader>
          <DialogTitle>Update Stock - {inventoryItem.medications?.name}</DialogTitle>
        </DialogHeader>
        <p id="edit-stock-description" className="sr-only">
          Form to update current stock levels, minimum and maximum stock thresholds, supplier information, and storage location.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current_stock">Current Stock</Label>
            <Input
              id="current_stock"
              type="number"
              value={stockData.current_stock}
              onChange={(e) => setStockData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum_stock">Minimum Stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                value={stockData.minimum_stock}
                onChange={(e) => setStockData(prev => ({ ...prev, minimum_stock: parseInt(e.target.value) || 20 }))}
              />
            </div>
            <div>
              <Label htmlFor="maximum_stock">Maximum Stock</Label>
              <Input
                id="maximum_stock"
                type="number"
                value={stockData.maximum_stock}
                onChange={(e) => setStockData(prev => ({ ...prev, maximum_stock: parseInt(e.target.value) || 1000 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={stockData.supplier}
              onChange={(e) => setStockData(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Supplier name"
            />
          </div>

          <div>
            <Label htmlFor="location">Storage Location</Label>
            <Input
              id="location"
              value={stockData.location}
              onChange={(e) => setStockData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Aisle A - Shelf 1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockDialog;