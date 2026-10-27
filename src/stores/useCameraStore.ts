import { create } from 'zustand';
import type { Camera, GeoBounds, LatLng } from '../domain/entities';
import type { Dependencies } from '../data/dependencies';
import { haversineDistanceM } from '../domain/usecases/drive/geo';
import { boundsAround } from '../domain/usecases/geo/bounds';
import { isFreshFor, WORKING_SET_RADIUS_M, WorkingSet } from '../domain/usecases/cameras/workingSet';
import { withTimeout } from '../shared/withTimeout';

// A hang detector, not a latency budget: a camera query that never answers
// must terminate so the driver is told. Do not tune it toward measured query
// times. The first query of a fresh install copies the 549 KB database before
// it answers, and a cold copy on a slow phone takes far longer than any query;
// a tight limit would fail working drives. See AI-051.
export const CAMERA_QUERY_TIMEOUT_MS = 5_000;

// Retry delays after a failed working-set fetch: doubling from 1 s, capped at 30 s.
const FIRST_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

export function retryDelayMs(failures: number): number {
  return Math.min(MAX_RETRY_MS, FIRST_RETRY_MS * 2 ** Math.max(0, failures - 1));
}

export interface CameraState {
  // One-off lookups; nothing is kept between calls.
  findInBounds(bounds: GeoBounds): Promise<Camera[]>;
  findByIds(ids: readonly string[]): Promise<Camera[]>;
  findFirstSpeedCamera(): Promise<Camera | null>;

  // The cameras around the followed position (see domain workingSet.ts); null
  // until the first fetch lands. A set is only ever replaced by a newer one.
  workingSet: WorkingSet | null;
  // The position the set follows, as last reported; null after a resume until
  // a new position is reported, so an old one is never trusted.
  followed: LatLng | null;
  isFetching: boolean;
  // The latest fetch failed or timed out; a retry is scheduled.
  fetchFailed: boolean;
  // Reports where the set should be centred; fetches in the background once
  // the set is more than the refetch distance away.
  follow(position: LatLng): void;
  // Before a drive: true once a set fresh for `start` is held, reusing the
  // current one when it is already fresh; false when the fetch for it fails or
  // does not finish within the query timeout. It never waits longer than that
  // (retries carry on in the background).
  prepareDrive(start: LatLng): Promise<boolean>;
  // The app went to the background: stop following and retrying.
  suspend(): void;
  // Back in the foreground: follow again, from the next reported position.
  resume(): void;
}

export function createCameraStore(deps: Pick<Dependencies, 'cameras'>) {
  // A hung request is a failure, never a load still running.
  const query = <T>(request: Promise<T>): Promise<T> => withTimeout(request, CAMERA_QUERY_TIMEOUT_MS);
  return create<CameraState>()((set, get) => {
    // At most one fetch at a time; when it lands the followed position is checked again.
    let inFlight: Promise<void> | null = null;
    // Where the fetch in flight is centred.
    let inFlightCentre: LatLng | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    let suspended = false;

    const clearRetry = () => {
      if (retryTimer !== null) clearTimeout(retryTimer);
      retryTimer = null;
    };

    const needsFetch = (position: LatLng | null): position is LatLng => {
      const current = get().workingSet;
      return position !== null && (current === null || !isFreshFor(current, position));
    };

    const fetchAround = (centre: LatLng): Promise<void> => {
      set({ isFetching: true });
      const request = query(deps.cameras.getInBounds(boundsAround([centre], WORKING_SET_RADIUS_M)))
        .then(
          (cameras) => {
            failures = 0;
            set({
              workingSet: new WorkingSet(
                centre,
                cameras.filter((camera) => haversineDistanceM(centre, camera) <= WORKING_SET_RADIUS_M),
              ),
              isFetching: false,
              fetchFailed: false,
            });
          },
          () => {
            // The current set stays: a failure never empties it.
            failures += 1;
            set({ isFetching: false, fetchFailed: true });
            if (!suspended) retryTimer = setTimeout(retry, retryDelayMs(failures));
          },
        )
        .then(() => {
          inFlight = null;
          inFlightCentre = null;
          // The position may have moved on while this fetch ran.
          if (retryTimer === null) fetchIfDue();
        });
      inFlight = request;
      inFlightCentre = centre;
      return request;
    };

    const fetchIfDue = () => {
      if (suspended || inFlight !== null || retryTimer !== null) return;
      const position = get().followed;
      if (needsFetch(position)) void fetchAround(position);
    };

    const retry = () => {
      retryTimer = null;
      const position = get().followed;
      if (position !== null && !suspended && inFlight === null) void fetchAround(position);
    };

    return {
      findInBounds: (bounds) => query(deps.cameras.getInBounds(bounds)),
      findByIds: (ids) => query(deps.cameras.getByIds(ids)),
      findFirstSpeedCamera: () => query(deps.cameras.getFirstSpeedCamera()),

      workingSet: null,
      followed: null,
      isFetching: false,
      fetchFailed: false,
      follow: (position) => {
        if (suspended) return;
        const { followed } = get();
        if (followed === null || followed.lat !== position.lat || followed.lng !== position.lng) {
          set({ followed: position });
        }
        fetchIfDue();
      },
      prepareDrive: async (start) => {
        get().follow(start);
        // At most: wait out a fetch for an older position, then fetch for this one.
        const attempt = async (): Promise<boolean> => {
          for (let round = 0; round < 3; round += 1) {
            if (!needsFetch(start)) return true;
            if (inFlight === null) {
              // The drive cannot wait for a backoff: try now.
              clearRetry();
              void fetchAround(start);
            }
            const forStart = inFlightCentre?.lat === start.lat && inFlightCentre.lng === start.lng;
            await inFlight;
            // Only a failure of the fetch for this start ends the wait; one for
            // somewhere else is followed by a fetch for here.
            if (forStart && get().fetchFailed && needsFetch(start)) return false;
          }
          return !needsFetch(start);
        };
        // One deadline for the whole wait, so a drive start never waits on two timeouts.
        return withTimeout(attempt(), CAMERA_QUERY_TIMEOUT_MS).catch(() => false);
      },
      suspend: () => {
        suspended = true;
        clearRetry();
      },
      resume: () => {
        suspended = false;
        // Where the phone is now is unknown until a position is reported again.
        set({ followed: null });
        // A fetch that failed while away is retried at the next position, not on a timer.
        failures = 0;
      },
    };
  });
}
