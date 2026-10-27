import type { Camera } from '../../domain/entities';
import type { CameraRepository } from '../../domain/repositories';
import { parseRadarFeed, type RadarFeed } from './parseRadarFeed';

// Web has no seeded SQLite (it would need wasm and cross-origin isolation
// headers), so it bundles the export and parses it once.
const feed = require('../../../assets/data/radars_eg.json') as RadarFeed;

export class JsonRadarCameraRepository implements CameraRepository {
  private cache: Camera[] | null = null;

  async getAll(): Promise<Camera[]> {
    this.cache ??= parseRadarFeed(feed);
    return this.cache;
  }
}
