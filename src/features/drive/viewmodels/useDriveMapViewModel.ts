import { useMemo } from 'react';
import type { Camera, Hazard, LatLng } from '@/domain/entities';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { nearestRouteIndex } from '@/domain/usecases/drive/nearestRouteIndex';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { getDemoRoute } from '@/services/location';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';

export type DriveMapViewModel = {
  routePoints: LatLng[];
  routeFrame: MapFrame;
  cameras: Camera[];
  activeHazards: Hazard[];
  position: LatLng | null;
  heading: number;
  isDriving: boolean;
  travelledIndex: number;
};

export function useDriveMapViewModel(): DriveMapViewModel {
  const isDriving = useDriveStore((s) => s.isDriving);
  const position = useDriveStore((s) => s.position);
  const heading = useDriveStore((s) => s.heading);
  const cameras = useHazardStore((s) => s.cameras);
  const hazards = useHazardStore((s) => s.hazards);

  const routePoints = getDemoRoute();
  const routeFrame = useMemo(() => fitRouteRegion(routePoints), [routePoints]);
  // Re-evaluated whenever the hazard list changes (e.g. a vote expires one).
  const activeHazards = useMemo(
    () => hazards.filter((hazard) => !isHazardExpired(hazard, new Date())),
    [hazards],
  );
  const travelledIndex = useMemo(
    () => (position === null ? -1 : nearestRouteIndex(routePoints, position)),
    [routePoints, position],
  );

  return {
    routePoints,
    routeFrame,
    cameras,
    activeHazards,
    position,
    heading,
    isDriving,
    travelledIndex,
  };
}
