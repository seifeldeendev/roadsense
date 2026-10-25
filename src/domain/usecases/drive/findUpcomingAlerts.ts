import type { Camera, Hazard, HazardType, Settings, UpcomingAlert } from '../../entities';
import { HEADING_CONE_DEG } from '../../../shared/constants';
import { angleDiffDeg, bearingDeg, haversineDistanceM } from './geo';

const HAZARD_TITLES: Record<HazardType, string> = {
  accident: 'Accident',
  pothole: 'Pothole',
  checkpoint: 'Checkpoint',
  flooding: 'Flooding',
};

export function findUpcomingAlerts(
  position: { lat: number; lng: number },
  headingDeg: number,
  cameras: Camera[],
  hazards: Hazard[],
  settings: Settings,
  // Wider look-ahead for lists of what is coming; alerts themselves use the setting.
  maxDistanceM: number = settings.alertDistanceM,
): UpcomingAlert[] {
  const results: UpcomingAlert[] = [];

  if (settings.enabledTypes.includes('camera')) {
    for (const camera of cameras) {
      const distanceM = haversineDistanceM(position, camera);
      if (distanceM > maxDistanceM) continue;
      if (angleDiffDeg(headingDeg, bearingDeg(position, camera)) > HEADING_CONE_DEG) {
        continue;
      }
      results.push({
        kind: 'camera',
        refId: camera.id,
        title: 'Speed camera ahead',
        roadName: camera.roadName,
        distanceM,
        speedLimitKmh: camera.speedLimitKmh,
        camera,
      });
    }
  }

  for (const hazard of hazards) {
    if (hazard.status !== 'active') continue;
    if (!settings.enabledTypes.includes(hazard.type)) continue;
    const distanceM = haversineDistanceM(position, hazard);
    if (distanceM > maxDistanceM) continue;
    if (angleDiffDeg(headingDeg, bearingDeg(position, hazard)) > HEADING_CONE_DEG) {
      continue;
    }
    results.push({
      kind: 'hazard',
      refId: hazard.id,
      title: `${HAZARD_TITLES[hazard.type]} ahead`,
      distanceM,
      hazard,
    });
  }

  return results.sort((a, b) => a.distanceM - b.distanceM);
}
