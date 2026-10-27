import type { Camera, LatLng } from '../../entities';
import { haversineDistanceM } from '../drive/geo';
import { WORKING_SET_CONSUMER_RADII_M } from './cameraRadii';

// The set is fetched again once the followed position is this far from its centre.
// It is also the "fresh enough to start a drive on" rule.
export const REFETCH_DISTANCE_M = 2_000;
export const MAX_CONSUMER_RADIUS_M = Math.max(...Object.values(WORKING_SET_CONSUMER_RADII_M));
// The set must cover every consumer at maximum drift (the refetch distance).
export const WORKING_SET_RADIUS_M = REFETCH_DISTANCE_M + MAX_CONSUMER_RADIUS_M;

// The cameras within WORKING_SET_RADIUS_M of `centre`.
export type WorkingSet = { centre: LatLng; cameras: Camera[] };

// A circle of the map whose cameras are all known.
export type CameraArea = { centre: LatLng; radiusM: number };

// True when every camera within radiusM of centre lies inside the area.
export function coversArea(area: CameraArea, centre: LatLng, radiusM: number): boolean {
  return haversineDistanceM(area.centre, centre) + radiusM <= area.radiusM;
}

export function workingSetArea(set: WorkingSet): CameraArea {
  return { centre: set.centre, radiusM: WORKING_SET_RADIUS_M };
}

// Centred close enough to position that no refetch is due (and a drive may start on it).
export function isFreshFor(set: WorkingSet, position: LatLng): boolean {
  return haversineDistanceM(set.centre, position) <= REFETCH_DISTANCE_M;
}

// Where the set is centred: the car while driving, else the phone's last fix,
// else the start of the demo drive.
export function followedPosition(
  drivingAt: LatLng | null,
  currentLocation: LatLng | null,
  demoStart: LatLng | undefined,
): LatLng | null {
  return drivingAt ?? currentLocation ?? demoStart ?? null;
}

// What a drive can rely on: "covered" when the set holds every camera the
// drive's alert lookups can reach; otherwise loading, or unavailable after a
// failed fetch (retrying).
export type DriveCoverage = 'covered' | 'loading' | 'unavailable';

export function driveCoverage(
  set: WorkingSet | null,
  followed: LatLng | null,
  fetchFailed: boolean,
  lookupRadiusM: number,
): DriveCoverage {
  if (followed !== null && set !== null && coversArea(workingSetArea(set), followed, lookupRadiusM)) return 'covered';
  return fetchFailed ? 'unavailable' : 'loading';
}
