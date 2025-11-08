import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface SaleData {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  notes?: string;
  customer?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  items: Array<{
    medication_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  organization: string;
}

export const useReceiptPrinter = () => {
  const fetchSaleData = async (saleId: string): Promise<SaleData | null> => {
    try {
      // Fetch sale details
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          payment_method,
          notes,
          organization,
          customer_id,
          customers (
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', saleId)
        .single();

      if (saleError) throw saleError;

      // Fetch sale items with medication details
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          medications (
            name
          )
        `)
        .eq('sale_id', saleId);

      if (itemsError) throw itemsError;

      return {
        id: sale.id,
        created_at: sale.created_at,
        total_amount: sale.total_amount,
        payment_method: sale.payment_method,
        notes: sale.notes,
        customer: sale.customers ? {
          first_name: sale.customers.first_name,
          last_name: sale.customers.last_name,
          email: sale.customers.email,
        } : undefined,
        items: items.map(item => ({
          medication_name: item.medications.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
        organization: sale.organization,
      };
    } catch (error) {
      console.error('Error fetching sale data:', error);
      return null;
    }
  };

  const generateReceipt = async (saleId: string) => {
    const saleData = await fetchSaleData(saleId);
    
    if (!saleData) {
      throw new Error('Failed to fetch sale data');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(saleData.organization, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(16);
    doc.text('Sales Receipt', pageWidth / 2, yPos, { align: 'center' });
    
    // Receipt details
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${saleData.id.slice(0, 8).toUpperCase()}`, 20, yPos);
    
    yPos += 6;
    doc.text(`Date: ${new Date(saleData.created_at).toLocaleString()}`, 20, yPos);
    
    yPos += 6;
    doc.text(`Payment: ${saleData.payment_method.charAt(0).toUpperCase() + saleData.payment_method.slice(1)}`, 20, yPos);

    // Customer info
    if (saleData.customer) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Customer:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`${saleData.customer.first_name} ${saleData.customer.last_name}`, 20, yPos);
      if (saleData.customer.email) {
        yPos += 6;
        doc.text(saleData.customer.email, 20, yPos);
      }
    }

    // Line separator
    yPos += 10;
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    // Items header
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, yPos);
    doc.text('Qty', 120, yPos, { align: 'center' });
    doc.text('Price', 150, yPos, { align: 'right' });
    doc.text('Total', pageWidth - 20, yPos, { align: 'right' });
    
    // Items
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    saleData.items.forEach((item) => {
      yPos += 6;
      
      // Handle long medication names
      const maxWidth = 90;
      const lines = doc.splitTextToSize(item.medication_name, maxWidth);
      doc.text(lines[0], 20, yPos);
      
      doc.text(item.quantity.toString(), 120, yPos, { align: 'center' });
      doc.text(`$${item.unit_price.toFixed(2)}`, 150, yPos, { align: 'right' });
      doc.text(`$${item.total_price.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    });

    // Line separator
    yPos += 8;
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    // Total
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 150, yPos, { align: 'right' });
    doc.text(`$${saleData.total_amount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });

    // Notes
    if (saleData.notes) {
      yPos += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      const noteLines = doc.splitTextToSize(saleData.notes, pageWidth - 40);
      doc.text(noteLines, 20, yPos);
    }

    // Footer
    yPos = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });

    return doc;
  };

  const printReceipt = async (saleId: string) => {
    const doc = await generateReceipt(saleId);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const downloadReceipt = async (saleId: string) => {
    const doc = await generateReceipt(saleId);
    doc.save(`receipt-${saleId.slice(0, 8)}.pdf`);
  };

  return {
    printReceipt,
    downloadReceipt,
  };
};
