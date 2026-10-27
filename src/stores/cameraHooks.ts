import { useEffect, useState } from 'react';
import type { Camera, LatLng } from '../domain/entities';
import {
  coversArea,
  followedPosition,
  isFreshFor,
  WORKING_SET_RADIUS_M,
  REFETCH_DISTANCE_M,
  type CameraArea,
} from '../domain/usecases/cameras/workingSet';
import { boundsAround } from '../domain/usecases/geo/bounds';
import { useAsyncResult } from '../shared/useAsyncResult';
import { useDependencies, useStores } from './DependenciesProvider';
import { useDriveStore } from './useDriveStore';

// Keeps the camera working set centred on the car while driving, else the
// phone's last fix, else the demo drive's start, while anything reads it.
// In the background it stops; on return it follows again from the next
// position reported (the car's next reading, or the idle position right away).
function useFollowTarget(): LatLng | null {
  const { useNavigationStore } = useStores();
  const isDriving = useDriveStore((s) => s.isDriving);
  const position = useDriveStore((s) => s.position);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const demoStart = useNavigationStore((s) => s.demoRoute[0]);
  return followedPosition(isDriving ? position : null, currentLocation, demoStart);
}

function useFollowWorkingSet(): void {
  const { useCameraStore, useNavigationStore } = useStores();
  const { lifecycle } = useDependencies();
  const follow = useCameraStore((s) => s.follow);
  const suspend = useCameraStore((s) => s.suspend);
  const resume = useCameraStore((s) => s.resume);
  const demoStart = useNavigationStore((s) => s.demoRoute[0]);
  const followed = useFollowTarget();
  const lat = followed?.lat;
  const lng = followed?.lng;

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) follow({ lat, lng });
  }, [lat, lng, follow]);

  useEffect(() => {
    return lifecycle.subscribe((state) => {
      if (state === 'background') {
        suspend();
      } else if (state === 'active') {
        resume();
        // A drive's last position is an hour old; wait for its next reading.
        const drive = useDriveStore.getState();
        if (!drive.isDriving) {
          const idle = followedPosition(null, drive.currentLocation, demoStart);
          if (idle !== null) follow(idle);
        }
      }
    });
  }, [lifecycle, follow, suspend, resume, demoStart]);
}

export type CamerasAround = {
  // Every camera within the radius of the centre (and possibly more around
  // it), or null while they are being looked up.
  cameras: Camera[] | null;
  // The lookup for this area failed; the caller shows its empty or stale state.
  failed: boolean;
};

// The cameras within radiusM of centre: from the working set when it covers
// them, otherwise from a query of that area (a panned or route-framed map). A
// query reaches REFETCH_DISTANCE_M further, so small moves reuse it.
export function useCamerasAround(centre: LatLng | null, radiusM: number): CamerasAround {
  useFollowWorkingSet();
  const { useCameraStore } = useStores();
  const workingSet = useCameraStore((s) => s.workingSet);
  const fetchFailed = useCameraStore((s) => s.fetchFailed);
  const target = useFollowTarget();
  const findInBounds = useCameraStore((s) => s.findInBounds);

  const setCameras = centre === null || workingSet === null ? null : workingSet.inArea(centre, radiusM);
  const fromSet = setCameras !== null;
  // A set for the followed position is due or on its way and will cover this
  // area: wait for it rather than query twice.
  const awaitingSet =
    centre !== null &&
    !fromSet &&
    !fetchFailed &&
    target !== null &&
    (workingSet === null || !isFreshFor(workingSet, target)) &&
    coversArea({ centre: target, radiusM: WORKING_SET_RADIUS_M }, centre, radiusM);
  const needsQuery = centre !== null && !fromSet && !awaitingSet;

  // The area last queried; replaced (during render, as React documents for
  // derived state) only when the wanted one is not inside it.
  const [area, setArea] = useState<CameraArea | null>(null);
  if (needsQuery && (area === null || !coversArea(area, centre, radiusM))) {
    setArea({ centre: { lat: centre.lat, lng: centre.lng }, radiusM: radiusM + REFETCH_DISTANCE_M });
  }

  const queried = useAsyncResult(area, (current) =>
    findInBounds(boundsAround([current.centre], current.radiusM)).catch(() => null),
  );

  if (centre === null) return { cameras: null, failed: false };
  if (setCameras !== null) return { cameras: setCameras, failed: false };
  const queryCovers = area !== null && coversArea(area, centre, radiusM) && !queried.pending;
  if (needsQuery && queryCovers) {
    return queried.value === null ? { cameras: null, failed: true } : { cameras: queried.value, failed: false };
  }
  return { cameras: null, failed: false };
}
