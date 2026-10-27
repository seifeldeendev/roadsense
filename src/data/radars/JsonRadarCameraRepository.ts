import type { Camera, GeoBounds } from '../../domain/entities';
import type { CameraRepository } from '../../domain/repositories';
import { isSpeedCamera } from '../../domain/usecases/drive/fixedPoints';
import { isInBounds } from '../../domain/usecases/geo/bounds';
import { parseRadarFeed, type RadarFeed } from './parseRadarFeed';

// Web has no seeded SQLite (it would need wasm and cross-origin isolation
// headers), so it bundles the export, parses it once and filters in memory.
const feed = require('../../../assets/data/radars_eg.json') as RadarFeed;

export class JsonRadarCameraRepository implements CameraRepository {
  private cache: Camera[] | null = null;

  private all(): Camera[] {
    this.cache ??= parseRadarFeed(feed);
    return this.cache;
  }

  async getInBounds(bounds: GeoBounds): Promise<Camera[]> {
    return this.all().filter((camera) => isInBounds(camera, bounds));
  }

  async getByIds(ids: readonly string[]): Promise<Camera[]> {
    const wanted = new Set(ids);
    return this.all().filter((camera) => wanted.has(camera.id));
  }

  async getFirstSpeedCamera(): Promise<Camera | null> {
    return this.all().find(isSpeedCamera) ?? null;
  }
}
