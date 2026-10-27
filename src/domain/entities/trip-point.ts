import type { LatLng } from './latlng';

export interface TripPoint extends LatLng {
  ts: number;
  speedKmh: number;
  heading: number;
  limitKmh: number;
}
