import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Database } from 'lucide-react';

const DataExportManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

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
      // Get user's organization
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Export
        </CardTitle>
        <CardDescription>
          Export your organization's data in XML or JSON format
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
  );
};

export default DataExportManager;