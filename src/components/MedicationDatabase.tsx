import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MedicationDatabase = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select(`
          *,
          inventory (
            current_stock,
            minimum_stock
          )
        `);

      if (error) throw error;
      
      // Map the data to include status based on stock levels
      const medicationsWithStatus = (data || []).map(med => ({
        ...med,
        stock: med.inventory?.[0]?.current_stock || 0,
        minimumStock: med.inventory?.[0]?.minimum_stock || 0,
        status: getStockStatus(med.inventory?.[0]?.current_stock || 0, med.inventory?.[0]?.minimum_stock || 0)
      }));
      
      setMedications(medicationsWithStatus);
    } catch (error: any) {
      toast({
        title: 'Error loading medications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, minimum: number) => {
    if (stock <= minimum * 0.3) return "critical";
    if (stock <= minimum) return "low_stock";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "low_stock": return "bg-warning text-warning-foreground";
      case "critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredMedications = medications.filter(med =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredMedications.map((medication) => (
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
                        {medication.dosage} • {medication.form}
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
                    <p className="font-medium text-foreground">{medication.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium text-foreground">{medication.category || 'N/A'}</p>
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
                    <p className="font-medium text-foreground">
                      ${medication.price ? Number(medication.price).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Expires: {medication.expiry_date ? new Date(medication.expiry_date).toLocaleDateString() : 'N/A'}</span>
                  {medication.expiry_date && new Date(medication.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
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
          ))
        )}
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