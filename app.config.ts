import type { ExpoConfig } from 'expo/config';

const { expo } = require('./app.json') as { expo: ExpoConfig };

const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;

const config: ExpoConfig = {
  ...expo,
};

// Native Google Maps key for standalone builds. Expo Go renders Google Maps on
// Android without one, so the app only grows the key when the env var exists.
if (googleMapsKey !== undefined && googleMapsKey.length > 0) {
  const android = config.android ?? {};
  const androidConfig = android.config ?? {};
  config.android = {
    ...android,
    config: {
      ...androidConfig,
      googleMaps: { ...androidConfig.googleMaps, apiKey: googleMapsKey },
    },
  };
  const ios = config.ios ?? {};
  const iosConfig = ios.config ?? {};
  config.ios = {
    ...ios,
    config: { ...iosConfig, googleMapsApiKey: googleMapsKey },
  };
}

export default config;
