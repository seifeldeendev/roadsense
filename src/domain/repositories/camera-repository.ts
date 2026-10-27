import type { Camera, GeoBounds } from '../entities';

export interface CameraRepository {
  // Cameras inside the box (edges included), in the road database's order.
  getInBounds(bounds: GeoBounds): Promise<Camera[]>;
  // The cameras with these ids that exist, in the road database's order.
  getByIds(ids: readonly string[]): Promise<Camera[]>;
  // The first speed camera in the road database; null when there is none.
  getFirstSpeedCamera(): Promise<Camera | null>;
}
