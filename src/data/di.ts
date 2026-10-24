import {
  MockCameraRepository,
  MockHazardRepository,
  MockSettingsRepository,
  MockTripRepository,
} from './mock/repositories';
import { MockAuthRepository } from './mock/MockAuthRepository';

export const repositories = {
  auth: new MockAuthRepository(),
  cameras: new MockCameraRepository(),
  hazards: new MockHazardRepository(),
  trips: new MockTripRepository(),
  settings: new MockSettingsRepository(),
} as const;
