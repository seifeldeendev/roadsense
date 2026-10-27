import type { Camera, LatLng } from '../../entities';
import { haversineDistanceM } from '../drive/geo';
import { WORKING_SET_CONSUMER_RADII_M } from './cameraRadii';

// The set is fetched again once the followed position is this far from its centre.
// It is also the "fresh enough to start a drive on" rule.
export const REFETCH_DISTANCE_M = 2_000;
export const MAX_CONSUMER_RADIUS_M = Math.max(...Object.values(WORKING_SET_CONSUMER_RADII_M));
// The set must cover every consumer at maximum drift (the refetch distance).
export const WORKING_SET_RADIUS_M = REFETCH_DISTANCE_M + MAX_CONSUMER_RADIUS_M;

// A reader of the set, by its name in WORKING_SET_CONSUMER_RADII_M.
export type WorkingSetConsumer = keyof typeof WORKING_SET_CONSUMER_RADII_M;

// A circle of the map whose cameras are all known.
export type CameraArea = { centre: LatLng; radiusM: number };

// The cameras within WORKING_SET_RADIUS_M of `centre`. The list itself is
// private, so the set cannot be read with a radius it was never sized for:
// - forConsumer: a registered consumer gets the cameras within its own radius;
//   an unregistered one does not compile.
// - inArea: any circle, but null unless the set covers all of it (the maps then
//   query the area instead).
export class WorkingSet {
  constructor(
    readonly centre: LatLng,
    private readonly cameras: Camera[],
  ) {}

  get size(): number {
    return this.cameras.length;
  }

  // The cameras within the consumer's registered radius of `at`, in database
  // order. Away from the centre they are the ones the set holds; whether that
  // is all of them is driveCoverage's question.
  forConsumer(consumer: WorkingSetConsumer, at: LatLng): Camera[] {
    // The type already rules out an unknown name; a cast past it fails loudly
    // instead of quietly reading nothing.
    const radii: Readonly<Record<string, number | undefined>> = WORKING_SET_CONSUMER_RADII_M;
    const radiusM = radii[consumer];
    if (radiusM === undefined) throw new Error(`"${consumer}" is not a registered working-set consumer`);
    return this.cameras.filter((camera) => haversineDistanceM(at, camera) <= radiusM);
  }

  // Every camera within radiusM of centre (and the rest of the set around it,
  // the same list each time) when the set covers that circle; otherwise null.
  inArea(centre: LatLng, radiusM: number): Camera[] | null {
    return coversArea(workingSetArea(this), centre, radiusM) ? this.cameras : null;
  }
}

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

// What a drive can rely on at the car's position: "covered" when the set holds
// every camera the drive's alert lookups can reach. Otherwise the alerts may be
// missing right now: "refreshing" while a request for the car's area is
// outstanding (bounded by the query timeout), "unavailable" once it failed or
// timed out (retrying).
export type DriveCoverage = 'covered' | 'refreshing' | 'unavailable';

export function driveCoverage(
  set: WorkingSet | null,
  carPosition: LatLng,
  fetchFailed: boolean,
  lookupRadiusM: number,
): DriveCoverage {
  if (set !== null && coversArea(workingSetArea(set), carPosition, lookupRadiusM)) return 'covered';
  return fetchFailed ? 'unavailable' : 'refreshing';
}
