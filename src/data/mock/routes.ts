import type { Destination, LatLng, PlannedRoute } from '../../domain/entities';
import type { RouteRepository } from '../../domain/repositories';
import { haversineDistanceM } from '../../domain/usecases/drive/geo';
import { estimateRoute } from '../../domain/usecases/routes/estimateRoute';

const ROUTE_DELAY_MS = 400;
const DEFAULT_SPEED_KMH = 45;
const MIN_POINT_SPACING_M = 35;
const MAX_POINT_SPACING_M = 650;
const TARGET_POINT_COUNT = 90;

// The Salah Salem demo trip starts here; the hand-made routes depart from it.
export const DEMO_START: LatLng = { lat: 30.072, lng: 31.335 };
const START = DEMO_START;
// Close enough to the demo start to reuse the hand-made road-following routes.
const HAND_MADE_ROUTE_RADIUS_M = 1500;

export const MOCK_DESTINATIONS: Destination[] = [
  { id: 'dest-city-stars', name: 'City Stars', area: 'Nasr City', lat: 30.0732, lng: 31.3482 },
  { id: 'dest-cfc', name: 'Cairo Festival City', area: 'New Cairo', lat: 30.023, lng: 31.4055 },
  { id: 'dest-tahrir', name: 'Tahrir Square', area: 'Downtown', lat: 30.0444, lng: 31.2357 },
  { id: 'dest-airport', name: 'Cairo Airport Terminal 3', area: 'Heliopolis', lat: 30.1115, lng: 31.4078 },
  { id: 'dest-bue', name: 'BUE El Shorouk', area: 'El Shorouk City', lat: 30.5877, lng: 31.7129 },
  { id: 'dest-mall-of-egypt', name: 'Mall of Egypt', area: '6th of October City', lat: 29.9727, lng: 31.0166 },
  { id: 'dest-zamalek', name: 'Cairo Tower', area: 'Zamalek', lat: 30.0459, lng: 31.2243 },
  { id: 'dest-maadi', name: 'Road 9', area: 'Maadi', lat: 29.9602, lng: 31.2569 },
  { id: 'dest-giza', name: 'Giza Pyramids', area: 'Al Haram, Giza', lat: 29.9792, lng: 31.1342 },
  { id: 'dest-cairo-uni', name: 'Cairo University', area: 'Giza', lat: 30.0276, lng: 31.2101 },
];

// Hand-picked real-road waypoints: the City Stars leg rides Salah Salem past
// cam-salah-salem-01 and the reported accident, the Festival City leg passes
// the Salah Salem red-light camera and the Autostrad pothole, and the airport
// leg crosses the Suez Road average-speed camera.
const ROUTE_WAYPOINTS: Record<string, LatLng[]> = {
  'dest-city-stars': [
    START,
    { lat: 30.078, lng: 31.338 },
    { lat: 30.0838, lng: 31.3409 },
    { lat: 30.0855, lng: 31.3442 },
    { lat: 30.08, lng: 31.3462 },
    { lat: 30.0732, lng: 31.3482 },
  ],
  'dest-cfc': [
    START,
    { lat: 30.065, lng: 31.3325 },
    { lat: 30.056, lng: 31.327 },
    { lat: 30.053, lng: 31.337 },
    { lat: 30.05, lng: 31.348 },
    { lat: 30.045, lng: 31.36 },
    { lat: 30.033, lng: 31.382 },
    { lat: 30.023, lng: 31.4055 },
  ],
  'dest-tahrir': [
    START,
    { lat: 30.0655, lng: 31.332 },
    { lat: 30.054, lng: 31.3222 },
    { lat: 30.048, lng: 31.312 },
    { lat: 30.0455, lng: 31.29 },
    { lat: 30.044, lng: 31.268 },
    { lat: 30.0425, lng: 31.25 },
    { lat: 30.0444, lng: 31.2357 },
  ],
  'dest-airport': [
    START,
    { lat: 30.09, lng: 31.344 },
    { lat: 30.102, lng: 31.375 },
    { lat: 30.105, lng: 31.42 },
    { lat: 30.11, lng: 31.415 },
    { lat: 30.108, lng: 31.4085 },
    { lat: 30.1115, lng: 31.4078 },
  ],
  'dest-bue': [
    START,
    { lat: 30.09, lng: 31.344 },
    { lat: 30.105, lng: 31.42 },
    { lat: 30.115, lng: 31.45 },
    { lat: 30.2, lng: 31.52 },
    { lat: 30.35, lng: 31.6 },
    { lat: 30.5, lng: 31.66 },
    { lat: 30.5877, lng: 31.7129 },
  ],
};

function densify(waypoints: readonly LatLng[], spacingM: number): LatLng[] {
  const points: LatLng[] = [{ lat: waypoints[0].lat, lng: waypoints[0].lng }];
  for (let i = 1; i < waypoints.length; i += 1) {
    const a = waypoints[i - 1];
    const b = waypoints[i];
    const steps = Math.max(1, Math.round(haversineDistanceM(a, b) / spacingM));
    for (let j = 1; j <= steps; j += 1) {
      const f = j / steps;
      points.push({ lat: a.lat + f * (b.lat - a.lat), lng: a.lng + f * (b.lng - a.lng) });
    }
  }
  return points;
}

function buildRoute(destinationId: string, waypoints: readonly LatLng[]): PlannedRoute {
  let distanceM = 0;
  for (let i = 1; i < waypoints.length; i += 1) {
    distanceM += haversineDistanceM(waypoints[i - 1], waypoints[i]);
  }
  const spacingM = Math.min(
    Math.max(distanceM / TARGET_POINT_COUNT, MIN_POINT_SPACING_M),
    MAX_POINT_SPACING_M,
  );
  const points = densify(waypoints, spacingM);
  return {
    destinationId,
    points,
    distanceM: Math.round(distanceM),
    durationS: Math.round(distanceM / (DEFAULT_SPEED_KMH / 3.6)),
  };
}

export const MOCK_ROUTES: Record<string, PlannedRoute> = Object.fromEntries(
  Object.entries(ROUTE_WAYPOINTS).map(([id, waypoints]) => [id, buildRoute(id, waypoints)]),
);

const delay = (): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ROUTE_DELAY_MS));

export class MockRouteRepository implements RouteRepository {
  async getDestinations(): Promise<Destination[]> {
    await delay();
    return MOCK_DESTINATIONS.map((destination) => ({ ...destination }));
  }

  async getRoute(destination: Destination, from: LatLng): Promise<PlannedRoute> {
    await delay();
    const handMade = MOCK_ROUTES[destination.id];
    if (handMade !== undefined && haversineDistanceM(from, START) <= HAND_MADE_ROUTE_RADIUS_M) {
      return { ...handMade, points: handMade.points.map((point) => ({ ...point })) };
    }
    return estimateRoute(destination.id, from, destination);
  }
}
