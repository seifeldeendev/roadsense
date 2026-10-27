import type { Camera, CameraType } from '../../domain/entities';
import type { CameraRepository } from '../../domain/repositories';
import { openRadarDatabase, type RadarDatabase } from './openRadarDatabase';

type CameraRow = {
  id: string;
  lat: number;
  lng: number;
  speedLimitKmh: number;
  roadName: string;
  type: CameraType;
};

// Rows keep the order of the source export, matching what the JSON feed produced.
const SELECT_CAMERAS =
  'SELECT id, lat, lng, speed_limit_kmh AS speedLimitKmh, road_name AS roadName, type FROM cameras ORDER BY rowid';

// The Egypt road database (radars, police, speed bumps) from the seeded SQLite copy.
export class SqliteRadarCameraRepository implements CameraRepository {
  private cache: Camera[] | null = null;
  private database: Promise<RadarDatabase> | null = null;

  constructor(private readonly open: () => Promise<RadarDatabase> = openRadarDatabase) {}

  async getAll(): Promise<Camera[]> {
    if (this.cache !== null) return this.cache;
    // Concurrent first calls share one open (and one copy); a failed open can be retried.
    this.database ??= this.open().catch((err: unknown) => {
      this.database = null;
      throw err;
    });
    const rows = await (await this.database).getAllAsync<CameraRow>(SELECT_CAMERAS);
    this.cache = rows.map((row) => ({ ...row, heading: null }));
    return this.cache;
  }
}
