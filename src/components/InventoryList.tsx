import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Eye, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const InventoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const medications = [
    {
      id: "MED001",
      name: "Paracetamol 500mg",
      category: "Pain Relief",
      brand: "Generic",
      stock: 150,
      minimumStock: 50,
      price: 12.99,
      expiryDate: "2025-12-15",
      batchNumber: "PAR001",
      status: "In Stock"
    },
    {
      id: "MED002",
      name: "Amoxicillin 250mg",
      category: "Antibiotics",
      brand: "Amoxil",
      stock: 15,
      minimumStock: 50,
      price: 24.50,
      expiryDate: "2024-08-20",
      batchNumber: "AMX002",
      status: "Low Stock"
    },
    {
      id: "MED003",
      name: "Insulin Pen",
      category: "Diabetes",
      brand: "NovoRapid",
      stock: 8,
      minimumStock: 25,
      price: 89.99,
      expiryDate: "2024-06-30",
      batchNumber: "INS003",
      status: "Critical"
    },
    {
      id: "MED004",
      name: "Vitamin D3 1000IU",
      category: "Vitamins",
      brand: "Nature's Own",
      stock: 200,
      minimumStock: 30,
      price: 18.75,
      expiryDate: "2026-03-10",
      batchNumber: "VIT004",
      status: "In Stock"
    },
    {
      id: "MED005",
      name: "Blood Pressure Monitor",
      category: "Medical Devices",
      brand: "Omron",
      stock: 3,
      minimumStock: 10,
      price: 125.00,
      expiryDate: "N/A",
      batchNumber: "BPM005",
      status: "Critical"
    }
  ];

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

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === "all" || med.category === filterCategory)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your medication stock and inventory</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Medication Name</Label>
                  <Input id="name" placeholder="Enter medication name" />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" placeholder="Enter brand name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pain-relief">Pain Relief</SelectItem>
                      <SelectItem value="antibiotics">Antibiotics</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="vitamins">Vitamins</SelectItem>
                      <SelectItem value="medical-devices">Medical Devices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Unit Price ($)</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="minimum">Minimum Stock</Label>
                  <Input id="minimum" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="batch">Batch Number</Label>
                <Input id="batch" placeholder="Enter batch number" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter medication description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-primary">
                Add Medication
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
              {filteredMedications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{medication.name}</div>
                      <div className="text-sm text-muted-foreground">{medication.brand}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{medication.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{medication.stock} units</div>
                      <div className="text-xs text-muted-foreground">
                        Min: {medication.minimumStock}
                      </div>
                      {medication.stock <= medication.minimumStock && (
                        <div className="flex items-center gap-1 text-xs text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    ${medication.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-foreground">{medication.expiryDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(getStockStatus(medication.stock, medication.minimumStock))}>
                      {getStockStatus(medication.stock, medication.minimumStock)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryList;