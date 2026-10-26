import type { ExpoConfig } from 'expo/config';

const { expo } = require('./app.json') as { expo: ExpoConfig };

const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

// Android draws Google Maps: the react-native-maps plugin writes the key into
// the Android manifest. iPhone uses Apple Maps (no key). Web reads the same
// EXPO_PUBLIC_ key at runtime for the Maps JavaScript API.
const config: ExpoConfig = {
  ...expo,
  plugins: [
    ...(expo.plugins ?? []),
    [
      'react-native-maps',
      googleMapsKey.length > 0
        ? { androidGoogleMapsApiKey: googleMapsKey }
        : {},
    ],
  ],
};

export default config;
