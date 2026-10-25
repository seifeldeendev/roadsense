import * as Location from 'expo-location';
import type { Destination, LatLng } from '../domain/entities';

const MAX_RESULTS = 5;

type AddressParts = Pick<
  Location.LocationGeocodedAddress,
  'name' | 'street' | 'streetNumber' | 'district' | 'city' | 'subregion' | 'region'
>;

function title(address: AddressParts | undefined, fallback: string): string {
  if (address === undefined) return fallback;
  const street = [address.street, address.streetNumber].filter(Boolean).join(' ');
  return address.name ?? (street.length > 0 ? street : fallback);
}

function area(address: AddressParts | undefined): string {
  if (address === undefined) return '';
  return [address.district, address.city ?? address.subregion ?? address.region].filter(Boolean).join(', ');
}

// Human label for a coordinate, e.g. for "Current location" or a dropped pin.
export async function describePlace(position: LatLng): Promise<{ name: string; area: string } | null> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude: position.lat, longitude: position.lng });
    return address === undefined ? null : { name: title(address, 'Dropped pin'), area: area(address) };
  } catch {
    return null;
  }
}

// Free-text search through the phone's geocoder (no API key). Empty on web or offline.
export async function searchPlaces(query: string): Promise<Destination[]> {
  try {
    const hits = (await Location.geocodeAsync(query)).slice(0, MAX_RESULTS);
    return await Promise.all(
      hits.map(async (hit, index) => {
        const label = await describePlace({ lat: hit.latitude, lng: hit.longitude });
        return {
          id: `geo-${hit.latitude.toFixed(5)},${hit.longitude.toFixed(5)}-${index}`,
          name: label?.name ?? query,
          area: label?.area ?? '',
          lat: hit.latitude,
          lng: hit.longitude,
        };
      }),
    );
  } catch {
    return [];
  }
}
