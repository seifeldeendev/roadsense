import {
  MockCameraRepository,
  MockHazardRepository,
  MockSettingsRepository,
  MockTripRepository,
} from './mock/repositories';
import { MockAuthRepository } from './mock/MockAuthRepository';
import { MockRouteRepository } from './mock/routes';

export const repositories = {
  auth: new MockAuthRepository(),
  cameras: new MockCameraRepository(),
  hazards: new MockHazardRepository(),
  trips: new MockTripRepository(),
  settings: new MockSettingsRepository(),
  routes: new MockRouteRepository(),
} as const;
