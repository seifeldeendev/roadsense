import {
  MockCameraRepository,
  MockHazardRepository,
  MockSettingsRepository,
  MockTripRepository,
} from './mock/repositories';

export const repositories = {
  cameras: new MockCameraRepository(),
  hazards: new MockHazardRepository(),
  trips: new MockTripRepository(),
  settings: new MockSettingsRepository(),
} as const;
