import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matrutva.app',
  appName: 'matrutva-little-buds',
  webDir: 'dist/school-management-ui/browser',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
