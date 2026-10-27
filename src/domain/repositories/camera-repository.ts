import type { Camera } from '../entities';

export interface CameraRepository {
  getAll(): Promise<Camera[]>;
}
