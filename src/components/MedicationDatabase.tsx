import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Search, 
  Plus, 
  Filter,
  Eye,
  Calendar,
  Clock,
  AlertTriangle 
} from "lucide-react";

const MedicationDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const medications = [
    {
      id: 1,
      name: "Paracetamol",
      strength: "500mg",
      form: "Tablet",
      manufacturer: "PharmaCorp",
      batchNumber: "PC-001234",
      expiryDate: "2025-06-15",
      status: "active",
      category: "Analgesic",
      price: 12.50,
      stock: 500
    },
    {
      id: 2,
      name: "Amoxicillin",
      strength: "250mg",
      form: "Capsule",
      manufacturer: "MediLab",
      batchNumber: "ML-567890",
      expiryDate: "2024-12-20",
      status: "low_stock",
      category: "Antibiotic",
      price: 28.75,
      stock: 15
    },
    {
      id: 3,
      name: "Insulin Pen",
      strength: "100 IU/ml",
      form: "Injection",
      manufacturer: "DiabetesCare",
      batchNumber: "DC-998877",
      expiryDate: "2025-03-10",
      status: "critical",
      category: "Antidiabetic",
      price: 85.00,
      stock: 8
    },
    {
      id: 4,
      name: "Vitamin D3",
      strength: "1000 IU",
      form: "Tablet",
      manufacturer: "HealthPlus",
      batchNumber: "HP-445566",
      expiryDate: "2026-01-30",
      status: "active",
      category: "Supplement",
      price: 15.25,
      stock: 320
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "low_stock": return "bg-warning text-warning-foreground";
      case "critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Medication Database</h2>
          <p className="text-muted-foreground">Comprehensive medication catalog and management</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications, manufacturers, or categories..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medication Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMedications.map((medication) => (
          <Card key={medication.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Pill className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{medication.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {medication.strength} • {medication.form}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(medication.status)}>
                  {medication.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Manufacturer</p>
                  <p className="font-medium text-foreground">{medication.manufacturer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">{medication.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock Level</p>
                  <p className={`font-medium ${
                    medication.stock < 20 ? 'text-destructive' : 
                    medication.stock < 50 ? 'text-warning' : 'text-success'
                  }`}>
                    {medication.stock} units
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium text-foreground">${medication.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Expires: {medication.expiryDate}</span>
                {new Date(medication.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                  <AlertTriangle className="h-4 w-4 text-warning ml-2" />
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Update Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No medications found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or add new medications to the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationDatabase;