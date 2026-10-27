import type { Destination, LatLng } from '../entities';

export type PlaceLabel = { name: string; area: string };

// Turns text into places and coordinates into labels (the phone's geocoder).
export interface Geocoder {
  // Places matching free text; empty when offline or unsupported.
  search(query: string): Promise<Destination[]>;
  // A label for a coordinate; null when unknown.
  describe(position: LatLng): Promise<PlaceLabel | null>;
}
