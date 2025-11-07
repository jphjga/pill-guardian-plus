import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.pillguardianplus',
  appName: 'pill-guardian-plus',
  webDir: 'dist',
  server: {
    url: 'https://388177bf-de6e-424d-9006-e0f8ce7e9950.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      // Enable camera permission
    }
  }
};

export default config;
