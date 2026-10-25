import type { LatLng } from './latlng';

export interface Destination {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export interface PlannedRoute {
  destinationId: string;
  points: LatLng[];
  distanceM: number;
  durationS: number;
  // True when no road routing was available and the line is an approximation.
  estimated?: boolean;
}
