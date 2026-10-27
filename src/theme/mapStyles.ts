import type { MapStyleElement } from 'react-native-maps';

// The Google map chrome is a separate palette from the app: both schemes stay
// monochrome. Light keeps canvas-grey separation on a white base; dark keeps
// it on the ink base. Maps cannot be reached through {colors.*} tokens because
// the style JSON is opaque to React Native, so the tones mirror the palettes.
export const lightMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'landscape', stylers: [{ color: '#f7f7f7' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e2e2' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c4c4c4' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#efefef' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#f3f3f3' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5e5e5e' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', stylers: [{ color: '#e8e8e8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#ececec' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#afafaf' }] },
  { featureType: 'landscape.natural', stylers: [{ color: '#f3f3f3' }] },
];

export const darkMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'landscape', stylers: [{ color: '#0d0d0d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#282828' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#161616' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#c4c4c4' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { featureType: 'water', stylers: [{ color: '#141414' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#333333' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#5e5e5e' }] },
  { featureType: 'landscape.natural', stylers: [{ color: '#161616' }] },
];
