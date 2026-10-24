import type { LatLng } from '../../domain/entities';

export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

// Timestamp for a drive N days before the anchor time, at a time of day.
export function startedOn(
  anchorMs: number,
  daysAgo: number,
  hour: number,
  minute: number,
): number {
  const anchor = new Date(anchorMs);
  return (
    new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), hour, minute).getTime() -
    daysAgo * DAY_MS
  );
}

export type SpeedPlateau = {
  untilS: number;
  speedKmh: number;
};

// A speed profile made of flat stretches; speeds stay until the next plateau.
export function plateauProfile(plateaus: SpeedPlateau[]): (tS: number) => number {
  return (tS) => {
    for (const plateau of plateaus) {
      if (tS < plateau.untilS) return plateau.speedKmh;
    }
    return plateaus[plateaus.length - 1].speedKmh;
  };
}

export type RoadTripSpec = {
  id: string;
  waypoints: LatLng[];
  limitKmh: number;
  stepMs: number;
  durationS: number;
  startedAgo: { days: number; hour: number; minute: number };
  speedAt: (tS: number) => number;
  alerts: AlertSpec[];
};

export type AlertSpec = {
  kind: 'camera' | 'hazard';
  refId: string;
  distanceM: number;
  afterS: number;
};

// --- Ring Road -----------------------------------------------------------------

const RING_ROAD_WAYPOINTS: LatLng[] = [
  { lat: 29.996, lng: 31.252 },
  { lat: 30.002, lng: 31.278 },
  { lat: 30.006, lng: 31.29 },
  { lat: 30.012, lng: 31.314 },
  { lat: 30.018, lng: 31.332 },
  { lat: 30.024, lng: 31.35 },
];

export const RING_ROAD_TRIP: RoadTripSpec = {
  id: 'trip-ring-road-commute',
  waypoints: RING_ROAD_WAYPOINTS,
  limitKmh: 100,
  stepMs: 5000,
  durationS: 620,
  startedAgo: { days: 1, hour: 18, minute: 20 },
  speedAt: plateauProfile([
    { untilS: 20, speedKmh: 40 },
    { untilS: 80, speedKmh: 84 },
    { untilS: 260, speedKmh: 106 },
    { untilS: 320, speedKmh: 88 },
    { untilS: 360, speedKmh: 104 },
    { untilS: 420, speedKmh: 72 },
    { untilS: 480, speedKmh: 60 },
    { untilS: 540, speedKmh: 40 },
    { untilS: 640, speedKmh: 20 },
  ]),
  alerts: [
    { kind: 'camera', refId: 'cam-ring-01', distanceM: 150, afterS: 90 },
    { kind: 'hazard', refId: 'hz-ring-checkpoint', distanceM: 260, afterS: 300 },
  ],
};

// --- 26th of July Corridor -----------------------------------------------------

const JULY_26_WAYPOINTS: LatLng[] = [
  { lat: 30.018, lng: 31.204 },
  { lat: 30.023, lng: 31.21 },
  { lat: 30.032, lng: 31.215 },
  { lat: 30.043, lng: 31.222 },
];

export const JULY_26_TRIP: RoadTripSpec = {
  id: 'trip-26july-corridor-morning',
  waypoints: JULY_26_WAYPOINTS,
  limitKmh: 100,
  stepMs: 3000,
  durationS: 250,
  startedAgo: { days: 2, hour: 9, minute: 5 },
  speedAt: plateauProfile([
    { untilS: 15, speedKmh: 30 },
    { untilS: 70, speedKmh: 62 },
    { untilS: 160, speedKmh: 86 },
    { untilS: 220, speedKmh: 58 },
    { untilS: 260, speedKmh: 25 },
  ]),
  alerts: [],
};

// --- Autostrad -----------------------------------------------------------------

const AUTOSTRAD_WAYPOINTS: LatLng[] = [
  { lat: 30.037, lng: 31.336 },
  { lat: 30.042, lng: 31.34 },
  { lat: 30.048, lng: 31.346 },
  { lat: 30.054, lng: 31.352 },
  { lat: 30.058, lng: 31.355 },
];

export const AUTOSTRAD_TRIP: RoadTripSpec = {
  id: 'trip-autostrad-night',
  waypoints: AUTOSTRAD_WAYPOINTS,
  limitKmh: 100,
  stepMs: 2000,
  durationS: 220,
  startedAgo: { days: 4, hour: 21, minute: 40 },
  speedAt: plateauProfile([
    { untilS: 10, speedKmh: 45 },
    { untilS: 30, speedKmh: 95 },
    { untilS: 70, speedKmh: 104 },
    { untilS: 120, speedKmh: 72 },
    { untilS: 180, speedKmh: 98 },
    { untilS: 225, speedKmh: 40 },
  ]),
  alerts: [
    { kind: 'camera', refId: 'cam-autostrad-01', distanceM: 180, afterS: 60 },
    { kind: 'hazard', refId: 'hz-autostrad-pothole', distanceM: 90, afterS: 110 },
  ],
};

// --- 90th Street, New Cairo ----------------------------------------------------

const NINTH_STREET_WAYPOINTS: LatLng[] = [
  { lat: 30.019, lng: 31.479 },
  { lat: 30.024, lng: 31.474 },
  { lat: 30.029, lng: 31.471 },
  { lat: 30.034, lng: 31.468 },
];

export const NINTH_STREET_TRIP: RoadTripSpec = {
  id: 'trip-90th-street-school-run',
  waypoints: NINTH_STREET_WAYPOINTS,
  limitKmh: 90,
  stepMs: 3000,
  durationS: 160,
  startedAgo: { days: 6, hour: 7, minute: 45 },
  speedAt: plateauProfile([
    { untilS: 8, speedKmh: 30 },
    { untilS: 40, speedKmh: 62 },
    { untilS: 70, speedKmh: 74 },
    { untilS: 100, speedKmh: 68 },
    { untilS: 130, speedKmh: 40 },
    { untilS: 165, speedKmh: 20 },
  ]),
  alerts: [
    { kind: 'camera', refId: 'cam-90th-02', distanceM: 80, afterS: 45 },
    { kind: 'hazard', refId: 'hz-90th-pothole', distanceM: 60, afterS: 80 },
  ],
};

// --- Suez Road -----------------------------------------------------------------

const SUEZ_ROAD_WAYPOINTS: LatLng[] = [
  { lat: 30.086, lng: 31.396 },
  { lat: 30.094, lng: 31.404 },
  { lat: 30.102, lng: 31.414 },
  { lat: 30.11, lng: 31.424 },
  { lat: 30.118, lng: 31.433 },
];

export const SUEZ_ROAD_TRIP: RoadTripSpec = {
  id: 'trip-suez-road-wardrive',
  waypoints: SUEZ_ROAD_WAYPOINTS,
  limitKmh: 100,
  stepMs: 5000,
  durationS: 320,
  startedAgo: { days: 9, hour: 15, minute: 15 },
  speedAt: plateauProfile([
    { untilS: 15, speedKmh: 45 },
    { untilS: 60, speedKmh: 92 },
    { untilS: 150, speedKmh: 112 },
    { untilS: 230, speedKmh: 96 },
    { untilS: 260, speedKmh: 68 },
    { untilS: 325, speedKmh: 30 },
  ]),
  alerts: [
    { kind: 'hazard', refId: 'hz-suez-road-checkpoint', distanceM: 220, afterS: 180 },
    { kind: 'camera', refId: 'cam-suez-road-01', distanceM: 260, afterS: 200 },
  ],
};

// --- Mehwar Moneeb -------------------------------------------------------------

const MEHWAR_MONEEB_WAYPOINTS: LatLng[] = [
  { lat: 29.976, lng: 31.158 },
  { lat: 29.982, lng: 31.166 },
  { lat: 29.987, lng: 31.172 },
  { lat: 29.992, lng: 31.179 },
];

export const MEHWAR_TRIP: RoadTripSpec = {
  id: 'trip-mehwar-moneeb-climb',
  waypoints: MEHWAR_MONEEB_WAYPOINTS,
  limitKmh: 90,
  stepMs: 2000,
  durationS: 140,
  startedAgo: { days: 13, hour: 11, minute: 30 },
  speedAt: plateauProfile([
    { untilS: 12, speedKmh: 35 },
    { untilS: 36, speedKmh: 78 },
    { untilS: 66, speedKmh: 96 },
    { untilS: 96, speedKmh: 70 },
    { untilS: 120, speedKmh: 42 },
    { untilS: 145, speedKmh: 22 },
  ]),
  alerts: [
    { kind: 'camera', refId: 'cam-mehwar-moneeb-01', distanceM: 120, afterS: 40 },
    { kind: 'hazard', refId: 'hz-mehwar-flooding', distanceM: 180, afterS: 70 },
  ],
};

export const ROAD_TRIP_SPECS: RoadTripSpec[] = [
  RING_ROAD_TRIP,
  JULY_26_TRIP,
  AUTOSTRAD_TRIP,
  NINTH_STREET_TRIP,
  SUEZ_ROAD_TRIP,
  MEHWAR_TRIP,
];
