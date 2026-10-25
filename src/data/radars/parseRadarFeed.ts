import type { Camera, CameraType } from '../../domain/entities';

// Shape of the Egypt road database export (every value arrives as a string).
export type RadarFeed = {
  metadata?: string[];
  radars: {
    id: string;
    latitude: string;
    longitude: string;
    type: string;
    speed_limit: string;
    road_name: string;
  }[];
};

// Feed codes the app understands; other codes in the feed are skipped.
const TYPE_CODES: Record<string, CameraType> = {
  F: 'fixed',
  C: 'police',
  R: 'speed_bump',
  SB: 'bump_zone',
};

export function parseRadarFeed(feed: RadarFeed): Camera[] {
  const cameras: Camera[] = [];
  for (const radar of feed.radars) {
    const type = TYPE_CODES[radar.type];
    const lat = Number(radar.latitude);
    const lng = Number(radar.longitude);
    if (type === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const limit = Number(radar.speed_limit);
    cameras.push({
      id: `eg-${radar.id}`,
      lat,
      lng,
      heading: null,
      speedLimitKmh: Number.isFinite(limit) && limit > 0 ? limit : 0,
      roadName: radar.road_name.trim(),
      type,
    });
  }
  return cameras;
}
