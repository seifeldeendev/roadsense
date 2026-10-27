import type { Settings } from '../../entities';
import { ROAD_MATCH_RADIUS_M } from '../drive/nearestRoadName';

// How far around the followed position each consumer of the camera working set
// reads. Defined here, beside the set they size, and imported by the screens.
export const LIVE_MAP_RADIUS_M = 10_000;
export const DRIVING_MAP_RADIUS_M = 4_000;
// How far ahead the "Active alerts" list looks; the spoken alert distance stays a setting.
export const ACTIVE_ALERTS_LOOKAHEAD_M = 2_000;
// The widest spoken alert distance a driver can choose.
const MAX_ALERT_DISTANCE_M: Settings['alertDistanceM'] = 800;

// Every radius read from the working set, named for the test that guards them.
export const WORKING_SET_CONSUMER_RADII_M = {
  liveMap: LIVE_MAP_RADIUS_M,
  drivingMap: DRIVING_MAP_RADIUS_M,
  activeAlerts: ACTIVE_ALERTS_LOOKAHEAD_M,
  spokenAlerts: MAX_ALERT_DISTANCE_M,
  roadMatch: ROAD_MATCH_RADIUS_M,
} as const;

// The alert lookups a drive makes from the set: the alerts list, spoken alerts,
// and the road name and speed limit.
export const DRIVE_LOOKUP_RADIUS_M = Math.max(ACTIVE_ALERTS_LOOKAHEAD_M, MAX_ALERT_DISTANCE_M, ROAD_MATCH_RADIUS_M);
