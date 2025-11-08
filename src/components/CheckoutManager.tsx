import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Scan, Plus, Minus, Trash2, DollarSign, Search, Camera, Printer, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useReceiptPrinter } from '@/hooks/useReceiptPrinter';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Medication {
  id: string;
  name: string;
  generic_name: string;
  brand_name: string;
  price: number;
  barcode: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CartItem {
  medication: Medication;
  quantity: number;
}

const CheckoutManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isScanning, startScan } = useBarcodeScanner();
  const { printReceipt, downloadReceipt } = useReceiptPrinter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedications();
    fetchCustomers();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('id, name, generic_name, brand_name, price, barcode')
        .order('name');

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading medications',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email')
        .order('last_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading customers',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBarcodeSearch = (barcode?: string) => {
    const searchBarcode = barcode || barcodeInput.trim();
    if (!searchBarcode) return;

    const medication = medications.find(m => m.barcode === searchBarcode);
    
    if (medication) {
      addToCart(medication);
      setBarcodeInput('');
      toast({
        title: 'Medication found',
        description: `${medication.name} added to cart`,
      });
    } else {
      toast({
        title: 'Not found',
        description: 'No medication found with this barcode',
        variant: 'destructive',
      });
    }
  };

  const handleCameraScan = async () => {
    await startScan((barcode) => {
      handleBarcodeSearch(barcode);
    });
  };

  const addToCart = (medication: Medication) => {
    const existingItem = cart.find(item => item.medication.id === medication.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.medication.id === medication.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medication, quantity: 1 }]);
    }
  };

  const updateQuantity = (medicationId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.medication.id === medicationId) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    }));
  };

  const removeFromCart = (medicationId: string) => {
    setCart(cart.filter(item => item.medication.id !== medicationId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.medication.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Please add items to cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

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

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          organization: profile.organization,
          customer_id: selectedCustomer && selectedCustomer !== 'walk-in' ? selectedCustomer : null,
          total_amount: calculateTotal(),
          payment_method: paymentMethod,
          notes: notes.trim() || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        medication_id: item.medication.id,
        quantity: item.quantity,
        unit_price: item.medication.price,
        total_price: item.medication.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update inventory
      for (const item of cart) {
        const { data: inventory } = await supabase
          .from('inventory')
          .select('current_stock')
          .eq('medication_id', item.medication.id)
          .single();

        if (inventory) {
          await supabase
            .from('inventory')
            .update({ current_stock: inventory.current_stock - item.quantity })
            .eq('medication_id', item.medication.id);
        }
      }

      toast({
        title: 'Checkout successful',
        description: `Sale completed. Total: $${calculateTotal().toFixed(2)}`,
      });

      // Show receipt dialog
      setCompletedSaleId(sale.id);

      // Reset form
      setCart([]);
      setSelectedCustomer('');
      setPaymentMethod('cash');
      setNotes('');
    } catch (error: any) {
      toast({
        title: 'Checkout error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintReceipt = async () => {
    if (!completedSaleId) return;
    try {
      await printReceipt(completedSaleId);
    } catch (error: any) {
      toast({
        title: 'Print error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReceipt = async () => {
    if (!completedSaleId) return;
    try {
      await downloadReceipt(completedSaleId);
      toast({
        title: 'Receipt downloaded',
        description: 'PDF receipt has been saved',
      });
    } catch (error: any) {
      toast({
        title: 'Download error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
          <h2 className="text-xl md:text-2xl font-bold">Checkout</h2>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left side - Medication selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Scan or Search Medication</CardTitle>
              <CardDescription className="text-sm">Use barcode scanner or search by name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 pt-0">
              <div className="space-y-2">
                <Label className="text-sm">Barcode Scanner</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    ref={barcodeInputRef}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleBarcodeSearch();
                      }
                    }}
                    placeholder="Scan or enter barcode"
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleBarcodeSearch()} variant="outline" className="flex-1 sm:flex-none">
                      <Scan className="h-4 w-4 sm:mr-2" />
                      <span className="sm:inline">Search</span>
                    </Button>
                    <Button 
                      onClick={handleCameraScan} 
                      disabled={isScanning}
                      variant="default"
                      className="flex-1 sm:flex-none"
                    >
                      <Camera className="h-4 w-4 sm:mr-2" />
                      <span className="sm:inline">{isScanning ? 'Scanning...' : 'Camera'}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Label>Search by Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medications..."
                    className="pl-10"
                  />
                </div>
              </div>

              {searchTerm && (
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {filteredMedications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No medications found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredMedications.slice(0, 10).map(medication => (
                        <div
                          key={medication.id}
                          className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            addToCart(medication);
                            setSearchTerm('');
                          }}
                        >
                          <div>
                            <div className="font-medium">{medication.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {medication.generic_name} • ${medication.price.toFixed(2)}
                            </div>
                          </div>
                          <Plus className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Cart ({cart.length} items)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {cart.map(item => (
                      <div key={item.medication.id} className="border rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <div className="font-medium text-sm">{item.medication.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.medication.generic_name}
                            </div>
                            <div className="text-sm font-medium mt-1">
                              ${item.medication.price.toFixed(2)} × {item.quantity} = ${(item.medication.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => removeFromCart(item.medication.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.medication.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.medication.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map(item => (
                          <TableRow key={item.medication.id}>
                            <TableCell>
                              <div className="font-medium">{item.medication.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.medication.generic_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.medication.id, -1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.medication.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ${item.medication.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${(item.medication.price * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.medication.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Checkout details */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Checkout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 pt-0">
              <div className="space-y-2">
                <Label>Customer (Optional)</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this sale..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing || cart.length === 0}
                className="w-full"
                size="lg"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                {processing ? 'Processing...' : 'Complete Sale'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* Receipt Dialog */}
      <AlertDialog open={!!completedSaleId} onOpenChange={(open) => !open && setCompletedSaleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sale Completed!</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to print or download a receipt for this sale?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadReceipt}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              className="w-full sm:w-auto"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <AlertDialogAction className="w-full sm:w-auto">
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CheckoutManager;
