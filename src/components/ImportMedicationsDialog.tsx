import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportMedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface ColumnMapping {
  [xmlColumn: string]: string;
}

const dbColumns = [
  { value: "skip", label: "Skip this column" },
  { value: "name", label: "Medication Name *" },
  { value: "brand_name", label: "Brand Name" },
  { value: "generic_name", label: "Generic Name" },
  { value: "category", label: "Category *" },
  { value: "dosage", label: "Dosage" },
  { value: "form", label: "Form" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "price", label: "Price" },
  { value: "cost", label: "Cost" },
  { value: "description", label: "Description" },
  { value: "expiry_date", label: "Expiry Date" },
  { value: "current_stock", label: "Current Stock *" },
  { value: "minimum_stock", label: "Minimum Stock" },
  { value: "maximum_stock", label: "Maximum Stock" },
  { value: "supplier", label: "Supplier" },
  { value: "location", label: "Storage Location" },
  { value: "barcode", label: "Barcode" },
];

const ImportMedicationsDialog = ({ open, onOpenChange, onSuccess }: ImportMedicationsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  const parseXML = (xmlString: string): ParsedData | null => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML format");
      }

      // Find all medication nodes (try common tag names)
      const medicationNodes = xmlDoc.querySelectorAll("medication, item, record, row");
      
      if (medicationNodes.length === 0) {
        throw new Error("No medication records found in XML. Please ensure the XML contains <medication>, <item>, <record>, or <row> tags.");
      }

      // Extract headers from first node
      const firstNode = medicationNodes[0];
      const headers: string[] = [];
      const childNodes = firstNode.children;
      
      for (let i = 0; i < childNodes.length; i++) {
        headers.push(childNodes[i].tagName);
      }

      // Extract all rows
      const rows: Record<string, string>[] = [];
      medicationNodes.forEach((node) => {
        const row: Record<string, string> = {};
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          row[child.tagName] = child.textContent || "";
        }
        rows.push(row);
      });

      return { headers, rows };
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      toast({
        title: "Invalid File",
        description: "Please upload an XML file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseXML(text);
      
      if (parsed) {
        setParsedData(parsed);
        
        // Auto-map columns with matching names
        const autoMapping: ColumnMapping = {};
        parsed.headers.forEach(header => {
          const lowerHeader = header.toLowerCase().replace(/[_\s]/g, '');
          const matchingDbColumn = dbColumns.find(col => 
            col.value !== 'skip' && col.value.toLowerCase().replace(/[_\s]/g, '') === lowerHeader
          );
          if (matchingDbColumn) {
            autoMapping[header] = matchingDbColumn.value;
          } else {
            autoMapping[header] = 'skip';
          }
        });
        
        setColumnMapping(autoMapping);
        setStep('map');
        
        toast({
          title: "File Uploaded",
          description: `Found ${parsed.rows.length} records with ${parsed.headers.length} columns`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const row of parsedData.rows) {
        try {
          // Map XML data to medication data
          const medicationData: any = {};
          const inventoryData: any = {};

          Object.entries(columnMapping).forEach(([xmlCol, dbCol]) => {
            if (dbCol === 'skip') return;
            
            const value = row[xmlCol];
            
            // Split between medication and inventory fields
            if (['current_stock', 'minimum_stock', 'maximum_stock', 'supplier', 'location'].includes(dbCol)) {
              inventoryData[dbCol] = value;
            } else {
              medicationData[dbCol] = value;
            }
          });

          // Validate required fields
          if (!medicationData.name || !medicationData.category) {
            errorCount++;
            continue;
          }

          // Set defaults
          medicationData.generic_name = medicationData.generic_name || medicationData.name;
          medicationData.form = medicationData.form || 'Tablet';
          
          // Convert numeric fields
          if (medicationData.price) medicationData.price = parseFloat(medicationData.price);
          if (medicationData.cost) medicationData.cost = parseFloat(medicationData.cost);

          // Insert medication
          const { data: medication, error: medicationError } = await supabase
            .from('medications')
            .insert(medicationData)
            .select()
            .single();

          if (medicationError) {
            errorCount++;
            continue;
          }

          // Prepare inventory data
          inventoryData.medication_id = medication.id;
          inventoryData.current_stock = parseInt(inventoryData.current_stock || '0');
          inventoryData.minimum_stock = parseInt(inventoryData.minimum_stock || '20');
          inventoryData.maximum_stock = parseInt(inventoryData.maximum_stock || '1000');
          inventoryData.location = inventoryData.location || 'General Storage';

          // Insert inventory
          const { error: inventoryError } = await supabase
            .from('inventory')
            .insert(inventoryData);

          if (inventoryError) {
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} medications. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`,
      });

      onOpenChange(false);
      onSuccess();
      resetDialog();
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('upload');
    setParsedData(null);
    setColumnMapping({});
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]" aria-describedby="import-medications-description">
        <DialogHeader>
          <DialogTitle>Import Medications from XML</DialogTitle>
        </DialogHeader>
        <p id="import-medications-description" className="sr-only">
          Import multiple medications from an XML file by uploading the file, mapping columns, and previewing the data before import.
        </p>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <Label htmlFor="xml-upload" className="cursor-pointer">
                <div className="text-lg font-medium text-foreground mb-2">
                  Upload XML File
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Click to select an XML file containing medication data
                </div>
                <Button type="button" variant="secondary">
                  Choose File
                </Button>
              </Label>
              <input
                id="xml-upload"
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="font-medium text-foreground mb-2">Expected XML Format:</div>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
{`<?xml version="1.0"?>
<medications>
  <medication>
    <name>Aspirin</name>
    <category>Pain Relief</category>
    <current_stock>100</current_stock>
    ...
  </medication>
</medications>`}
              </pre>
            </div>
          </div>
        )}

        {step === 'map' && parsedData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Map XML columns to database fields</span>
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>XML Column</TableHead>
                    <TableHead>Sample Data</TableHead>
                    <TableHead>Maps to Database Field</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.headers.map((header) => (
                    <TableRow key={header}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {parsedData.rows[0]?.[header] || '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={columnMapping[header]}
                          onValueChange={(value) => 
                            setColumnMapping(prev => ({ ...prev, [header]: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dbColumns.map((col) => (
                              <SelectItem key={col.value} value={col.value}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setStep('preview')}>
                  Preview Data
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && parsedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Preview: {parsedData.rows.length} records will be imported
              </div>
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.entries(columnMapping)
                      .filter(([_, dbCol]) => dbCol !== 'skip')
                      .map(([xmlCol, dbCol]) => (
                        <TableHead key={xmlCol}>
                          {dbColumns.find(c => c.value === dbCol)?.label}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.rows.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.entries(columnMapping)
                        .filter(([_, dbCol]) => dbCol !== 'skip')
                        .map(([xmlCol]) => (
                          <TableCell key={xmlCol}>
                            {row[xmlCol] || '-'}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.rows.length > 10 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  ... and {parsedData.rows.length - 10} more records
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('map')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? 'Importing...' : `Import ${parsedData.rows.length} Medications`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportMedicationsDialog;