import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface MedicationForm {
  name: string;
  brand_name: string;
  generic_name: string;
  category: string;
  dosage: string;
  form: string;
  manufacturer: string;
  price: string;
  cost: string;
  description: string;
  expiry_date: string;
  current_stock: string;
  minimum_stock: string;
  maximum_stock: string;
  supplier: string;
  location: string;
  barcode: string;
}

const AddMedicationDialog = ({ open, onOpenChange, onSuccess }: AddMedicationDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MedicationForm>({
    name: '',
    brand_name: '',
    generic_name: '',
    category: '',
    dosage: '',
    form: 'Tablet',
    manufacturer: '',
    price: '',
    cost: '',
    description: '',
    expiry_date: '',
    current_stock: '',
    minimum_stock: '20',
    maximum_stock: '1000',
    supplier: '',
    location: '',
    barcode: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      brand_name: '',
      generic_name: '',
      category: '',
      dosage: '',
      form: 'Tablet',
      manufacturer: '',
      price: '',
      cost: '',
      description: '',
      expiry_date: '',
      current_stock: '',
      minimum_stock: '20',
      maximum_stock: '1000',
      supplier: '',
      location: '',
      barcode: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, create the medication
      const { data: medication, error: medicationError } = await supabase
        .from('medications')
        .insert({
          name: formData.name,
          brand_name: formData.brand_name || null,
          generic_name: formData.generic_name || formData.name,
          category: formData.category,
          dosage: formData.dosage || null,
          form: formData.form,
          manufacturer: formData.manufacturer || null,
          price: formData.price ? parseFloat(formData.price) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          description: formData.description || null,
          expiry_date: formData.expiry_date || null,
          barcode: formData.barcode || null
        })
        .select()
        .single();

      if (medicationError) throw medicationError;

      // Then, create the inventory entry
      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          medication_id: medication.id,
          current_stock: parseInt(formData.current_stock) || 0,
          minimum_stock: parseInt(formData.minimum_stock) || 20,
          maximum_stock: parseInt(formData.maximum_stock) || 1000,
          supplier: formData.supplier || null,
          location: formData.location || 'General Storage'
        });

      if (inventoryError) throw inventoryError;

      toast({
        title: 'Success',
        description: 'Medication added successfully',
      });

      resetForm();
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

  const handleInputChange = (field: keyof MedicationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby="add-medication-description">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
        </DialogHeader>
        <p id="add-medication-description" className="sr-only">
          Form to add a new medication to the inventory with details like name, category, stock levels, and pricing information.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Medication Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter medication name"
                required
              />
            </div>
            <div>
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="generic_name">Generic Name</Label>
              <Input
                id="generic_name"
                value={formData.generic_name}
                onChange={(e) => handleInputChange('generic_name', e.target.value)}
                placeholder="Enter generic name"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Enter barcode"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                  <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="Diabetes">Diabetes</SelectItem>
                  <SelectItem value="Vitamins">Vitamins</SelectItem>
                  <SelectItem value="Medical Devices">Medical Devices</SelectItem>
                  <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <Label htmlFor="form">Form</Label>
              <Select value={formData.form} onValueChange={(value) => handleInputChange('form', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Capsule">Capsule</SelectItem>
                  <SelectItem value="Injection">Injection</SelectItem>
                  <SelectItem value="Syrup">Syrup</SelectItem>
                  <SelectItem value="Cream">Cream</SelectItem>
                  <SelectItem value="Device">Device</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Manufacturer name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Unit Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current_stock">Current Stock *</Label>
              <Input
                id="current_stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="minimum_stock">Minimum Stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
                placeholder="20"
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Aisle A - Shelf 1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter medication description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationDialog;