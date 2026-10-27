import { jest } from '@jest/globals';
import type { Camera, GeoBounds } from '../src/domain/entities';
import type { CameraRepository } from '../src/domain/repositories';
import { isSpeedCamera } from '../src/domain/usecases/drive/fixedPoints';
import { isInBounds } from '../src/domain/usecases/geo/bounds';

// An in-memory camera repository answering every query over `cameras`; tests
// override single methods (e.g. a slow getAll) where they need to.
export function fakeCameraRepository(cameras: Camera[], overrides: Partial<CameraRepository> = {}): CameraRepository {
  return {
    getAll: jest.fn(async () => cameras),
    getInBounds: jest.fn(async (bounds: GeoBounds) => cameras.filter((camera) => isInBounds(camera, bounds))),
    getByIds: jest.fn(async (ids: readonly string[]) => cameras.filter((camera) => ids.includes(camera.id))),
    getFirstSpeedCamera: jest.fn(async () => cameras.find(isSpeedCamera) ?? null),
    ...overrides,
  };
}
