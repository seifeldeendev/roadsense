import type { Camera } from '../../domain/entities';
import type { CameraRepository } from '../../domain/repositories';
import { parseRadarFeed, type RadarFeed } from './parseRadarFeed';

// Bundled snapshot of the Egypt road database (radars, police, speed bumps).
const feed = require('./radars_eg.json') as RadarFeed;

export class RadarCameraRepository implements CameraRepository {
  private cache: Camera[] | null = null;

  async getAll(): Promise<Camera[]> {
    this.cache ??= parseRadarFeed(feed);
    return this.cache;
  }
}
