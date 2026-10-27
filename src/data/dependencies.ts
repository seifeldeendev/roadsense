import type {
  AppLifecycle,
  AuthRepository,
  CameraRepository,
  Geocoder,
  HazardRepository,
  KeyValueStorage,
  LocationSources,
  RouteRepository,
  SettingsRepository,
  TripRepository,
} from '../domain/repositories';
import { createDemoLocationSource, DEMO_ROUTE, ExpoLocationSource } from './location';
import { MockAuthRepository } from './mock/MockAuthRepository';
import { MockHazardRepository, MockSettingsRepository, MockTripRepository } from './mock/repositories';
import { MockRouteRepository } from './mock/routes';
import { OsrmRouteRepository } from './osrm/OsrmRouteRepository';
import { RadarCameraRepository } from './radars';
import { subscribeToAppActivity } from '../services/appLifecycle';
import { deviceStorage } from '../services/keyValueStorage';
import { describePlace, searchPlaces } from '../services/geocoding';
import { getCurrentLocation, requestLocationPermission } from '../services/gps';

// Everything the stores and viewmodels need from the outside world, as interfaces.
export type Dependencies = {
  auth: AuthRepository;
  cameras: CameraRepository;
  hazards: HazardRepository;
  trips: TripRepository;
  settings: SettingsRepository;
  routes: RouteRepository;
  location: LocationSources;
  geocoder: Geocoder;
  lifecycle: AppLifecycle;
  // Saved app state (session, settings, theme, recent routes).
  storage: KeyValueStorage;
};

// The production wiring; tests pass fakes for the parts they exercise.
export function createDependencies(overrides: Partial<Dependencies> = {}): Dependencies {
  return {
    auth: overrides.auth ?? new MockAuthRepository(),
    cameras: overrides.cameras ?? new RadarCameraRepository(),
    hazards: overrides.hazards ?? new MockHazardRepository(),
    trips: overrides.trips ?? new MockTripRepository(),
    settings: overrides.settings ?? new MockSettingsRepository(),
    routes: overrides.routes ?? new OsrmRouteRepository(new MockRouteRepository()),
    location: overrides.location ?? {
      demoRoute: DEMO_ROUTE,
      requestPermission: requestLocationPermission,
      currentPosition: getCurrentLocation,
      device: (limitFor) => new ExpoLocationSource(limitFor),
      demo: (playback, limitFor) => createDemoLocationSource(playback, limitFor),
    },
    geocoder: overrides.geocoder ?? { search: searchPlaces, describe: describePlace },
    lifecycle: overrides.lifecycle ?? { subscribe: subscribeToAppActivity },
    storage: overrides.storage ?? deviceStorage,
  };
}

export const productionDependencies = createDependencies();
