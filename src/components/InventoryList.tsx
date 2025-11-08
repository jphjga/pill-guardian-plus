import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Eye, AlertTriangle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddMedicationDialog from "./AddMedicationDialog";
import ImportMedicationsDialog from "./ImportMedicationsDialog";
import EditStockDialog from "./EditStockDialog";
import ViewMedicationDialog from "./ViewMedicationDialog";
import AIRecommendations from "./AIRecommendations";

const InventoryList = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          medications (
            name,
            brand_name,
            category,
            price,
            expiry_date
          )
        `);

      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading inventory',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, minimum: number) => {
    if (stock <= minimum * 0.3) return "Critical";
    if (stock <= minimum) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical": return "destructive";
      case "Low Stock": return "outline";
      case "In Stock": return "secondary";
      default: return "outline";
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.medications?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === "all" || item.medications?.category === filterCategory)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your medication stock and inventory</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import from XML
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>
      </div>

      <AddMedicationDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchInventory}
      />

      <ImportMedicationsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={fetchInventory}
      />

      <EditStockDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchInventory}
        inventoryItem={selectedItem}
      />

      <ViewMedicationDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        inventoryItem={selectedItem}
      />

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                <SelectItem value="Diabetes">Diabetes</SelectItem>
                <SelectItem value="Vitamins">Vitamins</SelectItem>
                <SelectItem value="Medical Devices">Medical Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Medication Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-8 bg-muted animate-pulse rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{item.medications?.name || 'Unknown Medication'}</div>
                        <div className="text-sm text-muted-foreground">{item.medications?.brand_name || 'Generic'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.medications?.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{item.current_stock} units</div>
                        <div className="text-xs text-muted-foreground">
                          Min: {item.minimum_stock}
                        </div>
                        {item.current_stock <= item.minimum_stock && (
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      ${item.medications?.price ? Number(item.medications.price).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {item.medications?.expiry_date ? new Date(item.medications.expiry_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(getStockStatus(item.current_stock, item.minimum_stock))}>
                        {getStockStatus(item.current_stock, item.minimum_stock)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">No inventory items found</div>
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

export default InventoryList;