import { useState, useCallback } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { toast } from 'sonner';

export const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);

  const checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  };

  const requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  };

  const startScan = useCallback(async (onBarcodeDetected: (barcode: string) => void) => {
    try {
      // Check if supported
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        toast.error('Barcode scanning is not supported on this device');
        return;
      }

      // Check permissions
      let permission = await checkPermissions();
      if (permission === 'denied') {
        permission = await requestPermissions();
      }

      if (permission !== 'granted') {
        toast.error('Camera permission is required for barcode scanning');
        return;
      }

      setIsScanning(true);

      // Start scanning
      const result = await BarcodeScanner.scan();
      
      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0].rawValue;
        onBarcodeDetected(barcode);
        toast.success('Barcode scanned successfully');
      }
    } catch (error: any) {
      console.error('Barcode scanning error:', error);
      toast.error(error?.message || 'Failed to scan barcode');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(async () => {
    try {
      await BarcodeScanner.stopScan();
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }, []);

  return {
    isScanning,
    startScan,
    stopScan
  };
};
