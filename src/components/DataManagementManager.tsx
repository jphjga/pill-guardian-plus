import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, Database, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportData {
  [key: string]: any;
}

const DataManagementManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportData[]>([]);
  const [importType, setImportType] = useState<'medications' | 'inventory' | 'customers' | null>(null);
  const [editedData, setEditedData] = useState<ImportData[]>([]);

  const exportToXML = (data: any[], rootElement: string, itemElement: string) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;
    
    data.forEach(item => {
      xml += `  <${itemElement}>\n`;
      Object.entries(item).forEach(([key, value]) => {
        const safeValue = String(value || '').replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
            default: return c;
          }
        });
        xml += `    <${key}>${safeValue}</${key}>\n`;
      });
      xml += `  </${itemElement}>\n`;
    });
    
    xml += `</${rootElement}>`;
    return xml;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: 'medications' | 'inventory' | 'customers', format: 'xml' | 'json') => {
    setExporting(type);
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.organization) {
        throw new Error('Organization not found');
      }

      let data: any[] = [];
      let filename = '';
      
      switch (type) {
        case 'medications':
          const { data: meds, error: medsError } = await supabase
            .from('medications')
            .select('*')
            .eq('organization', profile.organization);
          
          if (medsError) throw medsError;
          data = meds || [];
          filename = `medications_${Date.now()}`;
          break;

        case 'inventory':
          const { data: inv, error: invError } = await supabase
            .from('inventory')
            .select(`
              *,
              medications (
                name,
                generic_name,
                brand_name
              )
            `)
            .eq('organization', profile.organization);
          
          if (invError) throw invError;
          data = inv || [];
          filename = `inventory_${Date.now()}`;
          break;

        case 'customers':
          const { data: customers, error: customersError } = await supabase
            .from('customers')
            .select('*')
            .eq('organization', profile.organization);
          
          if (customersError) throw customersError;
          data = customers || [];
          filename = `patients_${Date.now()}`;
          break;
      }

      if (data.length === 0) {
        toast({
          title: 'No data to export',
          description: `No ${type} found in your organization.`,
          variant: 'destructive',
        });
        return;
      }

      if (format === 'xml') {
        const xml = exportToXML(data, `${type}_data`, type.slice(0, -1));
        downloadFile(xml, `${filename}.xml`, 'application/xml');
      } else {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `${filename}.json`, 'application/json');
      }

      toast({
        title: 'Export successful',
        description: `${data.length} ${type} exported to ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'medications' | 'inventory' | 'customers') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportType(type);

    try {
      const text = await file.text();
      let parsedData: ImportData[] = [];

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      } else if (file.name.endsWith('.xml')) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const items = xmlDoc.getElementsByTagName(type.slice(0, -1));
        
        parsedData = Array.from(items).map(item => {
          const obj: ImportData = {};
          Array.from(item.children).forEach(child => {
            obj[child.tagName] = child.textContent || '';
          });
          return obj;
        });
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const obj: ImportData = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim() || '';
          });
          return obj;
        });
      }

      if (parsedData.length === 0) {
        throw new Error('No data found in file');
      }

      setPreviewData(parsedData);
      setEditedData(JSON.parse(JSON.stringify(parsedData)));

      toast({
        title: 'File loaded',
        description: `${parsedData.length} records ready for import. Review and edit before importing.`,
      });
    } catch (error: any) {
      toast({
        title: 'Import error',
        description: error.message,
        variant: 'destructive',
      });
      setPreviewData([]);
      setImportType(null);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex][field] = value;
    setEditedData(newData);
  };

  const handleImport = async () => {
    if (!importType || editedData.length === 0) return;

    setImporting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.organization) {
        throw new Error('Organization not found');
      }

      // Add organization to all records and remove any id fields
      const dataToInsert = editedData.map(item => {
        const { id, ...rest } = item;
        return {
          ...rest,
          organization: profile.organization,
        };
      });

      const { error } = await supabase
        .from(importType)
        .insert(dataToInsert as any);

      if (error) throw error;

      toast({
        title: 'Import successful',
        description: `${editedData.length} records imported successfully.`,
      });

      setPreviewData([]);
      setEditedData([]);
      setImportType(null);
    } catch (error: any) {
      toast({
        title: 'Import error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const cancelImport = () => {
    setPreviewData([]);
    setEditedData([]);
    setImportType(null);
  };

  return (
    <Tabs defaultValue="export" className="w-full">
      <TabsList>
        <TabsTrigger value="export">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </TabsTrigger>
        <TabsTrigger value="import">
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="export" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export
            </CardTitle>
            <CardDescription>
              Export your organization's data in XML, JSON, or CSV format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Medications Export */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Medications Database
                  </h4>
                  <p className="text-sm text-muted-foreground">Export all medication records</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('medications', 'xml')}
                  disabled={!!exporting}
                >
                  {exporting === 'medications' ? 'Exporting...' : 'Export XML'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('medications', 'json')}
                  disabled={!!exporting}
                >
                  {exporting === 'medications' ? 'Exporting...' : 'Export JSON'}
                </Button>
              </div>
            </div>

            {/* Inventory Export */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Inventory Data
                  </h4>
                  <p className="text-sm text-muted-foreground">Export all inventory records with stock levels</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('inventory', 'xml')}
                  disabled={!!exporting}
                >
                  {exporting === 'inventory' ? 'Exporting...' : 'Export XML'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('inventory', 'json')}
                  disabled={!!exporting}
                >
                  {exporting === 'inventory' ? 'Exporting...' : 'Export JSON'}
                </Button>
              </div>
            </div>

            {/* Customers Export */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Patient Records
                  </h4>
                  <p className="text-sm text-muted-foreground">Export all patient/customer data</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('customers', 'xml')}
                  disabled={!!exporting}
                >
                  {exporting === 'customers' ? 'Exporting...' : 'Export XML'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('customers', 'json')}
                  disabled={!!exporting}
                >
                  {exporting === 'customers' ? 'Exporting...' : 'Export JSON'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="import" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Data Import
            </CardTitle>
            <CardDescription>
              Import data from XML, JSON, or CSV files. Review and edit before finalizing import.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!importType && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Choose a file type to import. Supported formats: XML, JSON, CSV
                  </AlertDescription>
                </Alert>

                {/* Medications Import */}
                <div className="border rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Import Medications
                    </h4>
                    <p className="text-sm text-muted-foreground">Upload medication database file</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="medications-upload"
                      type="file"
                      accept=".xml,.json,.csv"
                      onChange={(e) => handleFileUpload(e, 'medications')}
                      disabled={importing}
                      className="max-w-xs"
                    />
                  </div>
                </div>

                {/* Inventory Import */}
                <div className="border rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Import Inventory
                    </h4>
                    <p className="text-sm text-muted-foreground">Upload inventory data file</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="inventory-upload"
                      type="file"
                      accept=".xml,.json,.csv"
                      onChange={(e) => handleFileUpload(e, 'inventory')}
                      disabled={importing}
                      className="max-w-xs"
                    />
                  </div>
                </div>

                {/* Customers Import */}
                <div className="border rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Import Patients
                    </h4>
                    <p className="text-sm text-muted-foreground">Upload patient records file</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="customers-upload"
                      type="file"
                      accept=".xml,.json,.csv"
                      onChange={(e) => handleFileUpload(e, 'customers')}
                      disabled={importing}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {importType && previewData.length > 0 && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Review and edit the data below. You can modify any field before importing.
                    {editedData.length} records ready to import.
                  </AlertDescription>
                </Alert>

                <div className="border rounded-lg overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(editedData[0] || {}).map(key => (
                          <TableHead key={key} className="min-w-32">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.entries(row).map(([key, value]) => (
                            <TableCell key={`${rowIndex}-${key}`}>
                              <Input
                                value={value as string}
                                onChange={(e) => handleCellEdit(rowIndex, key, e.target.value)}
                                className="min-w-24"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={cancelImport}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing...' : `Import ${editedData.length} Records`}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DataManagementManager;
