import * as Location from 'expo-location';
import type { LatLng } from '../domain/entities';

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch {
    return false;
  }
}

// Fast last-known fix first, then a fresh one; null when unavailable or not permitted.
export async function getCurrentLocation(): Promise<LatLng | null> {
  try {
    const last = await Location.getLastKnownPositionAsync();
    const fix = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: fix.coords.latitude, lng: fix.coords.longitude };
  } catch {
    return null;
  }
}
