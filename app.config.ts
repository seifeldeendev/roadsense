import type { ExpoConfig } from 'expo/config';

const { expo } = require('./app.json') as { expo: ExpoConfig };

const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

// Google Maps on every platform. The react-native-maps plugin writes the key
// into the Android manifest and adds the Google Maps SDK to the iOS build
// (iOS uses the Google Maps SDK, so it needs a development or store build;
// Expo Go on iOS cannot show the map). Web reads
// the same EXPO_PUBLIC_ key at runtime for the Maps JavaScript API.
const config: ExpoConfig = {
  ...expo,
  plugins: [
    ...(expo.plugins ?? []),
    [
      'react-native-maps',
      googleMapsKey.length > 0
        ? { iosGoogleMapsApiKey: googleMapsKey, androidGoogleMapsApiKey: googleMapsKey }
        : {},
    ],
  ],
};

export default config;
