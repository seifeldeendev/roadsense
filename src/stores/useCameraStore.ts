import { create } from 'zustand';
import type { Camera, GeoBounds } from '../domain/entities';
import type { Dependencies } from '../data/dependencies';

// One-off camera lookups for view models; nothing is kept between calls.
export interface CameraState {
  findInBounds(bounds: GeoBounds): Promise<Camera[]>;
  findByIds(ids: readonly string[]): Promise<Camera[]>;
  findFirstSpeedCamera(): Promise<Camera | null>;
}

export function createCameraStore(deps: Pick<Dependencies, 'cameras'>) {
  return create<CameraState>()(() => ({
    findInBounds: (bounds) => deps.cameras.getInBounds(bounds),
    findByIds: (ids) => deps.cameras.getByIds(ids),
    findFirstSpeedCamera: () => deps.cameras.getFirstSpeedCamera(),
  }));
}
