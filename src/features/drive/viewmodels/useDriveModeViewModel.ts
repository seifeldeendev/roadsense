import { useCallback, useEffect, useRef, useState } from 'react';
import type { HazardType, LatLng, LocationSourceKind, UpcomingAlert } from '@/domain/entities';
import { DRIVE_LOOKUP_RADIUS_M } from '@/domain/usecases/cameras/cameraRadii';
import { driveCoverage } from '@/domain/usecases/cameras/workingSet';
import { alertFeedback } from '@/domain/usecases/drive/alertFeedback';
import { getSpeedStatus, type SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { driveLocationStatus, type LocationStatus } from '@/domain/usecases/drive/locationStatus';
import type { Unsubscribe } from '@/domain/repositories';
import { useDriveStore } from '@/stores/useDriveStore';
import { useDependencies, useStores } from '@/stores/DependenciesProvider';
import { hazardMeta } from '@/theme/tokens';
import { announce, clockHHMM, statusMessage, useTransientFeedback } from './driveModeHelpers';
import {
  createDrivePointHandler,
  createRouteSpeedLimitLookup,
  createSpeedLimitLookup,
  currentDrivePosition,
} from './drivePointHandler';

const REPORT_TYPES: HazardType[] = ['accident', 'pothole', 'checkpoint', 'flooding'];

// The one driver-facing warning banner, shown (and, except while cameras are
// being fetched, spoken) whenever a drive could be missing alerts. Location
// problems come first: without a live position no alert can fire at all.
export const LOCATION_FAILED_MESSAGE = 'Location unavailable — no alerts';
export const WAITING_FOR_GPS_MESSAGE = 'Waiting for GPS — no alerts yet';
export const GPS_LOST_MESSAGE = 'GPS signal lost — alerts paused';
export const CAMERAS_UNAVAILABLE_MESSAGE = 'Camera alerts unavailable — retrying';
export const CAMERAS_LOADING_MESSAGE = 'Loading cameras near you…';

const LOCATION_WARNINGS: Record<Exclude<LocationStatus, 'live'>, string> = {
  failed: LOCATION_FAILED_MESSAGE,
  waiting: WAITING_FOR_GPS_MESSAGE,
  lost: GPS_LOST_MESSAGE,
};

export type DriveModeViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  isDriving: boolean;
  // null while the position is not live, so a frozen reading is never shown as current.
  speedKmh: number | null;
  hasLimit: boolean;
  limitKmh: number;
  status: SpeedStatus;
  statusLabel: string;
  nextAlert: UpcomingAlert | null;
  reportTypes: HazardType[];
  feedback: string | null;
  // Set while a drive could be missing alerts: no live position, or no cameras
  // around the car (failed, timed out, or still being fetched).
  driverWarning: string | null;
  start: () => void;
  stop: () => void;
  onReport: (type: HazardType) => void;
};

export function useDriveModeViewModel(): DriveModeViewModel {
  const { useCameraStore, useHazardStore, useNavigationStore, useSettingsStore } = useStores();
  const { location } = useDependencies();
  const hazardsLoading = useHazardStore((s) => s.isLoading);
  const prepareDrive = useCameraStore((s) => s.prepareDrive);
  const findInBounds = useCameraStore((s) => s.findInBounds);
  // The Drive tab waits for the first working set, as it waited for every camera.
  const awaitingCameras = useCameraStore((s) => s.workingSet === null && !s.fetchFailed);
  const error = useHazardStore((s) => s.error);
  const load = useHazardStore((s) => s.load);
  const report = useHazardStore((s) => s.report);
  const isDriving = useDriveStore((s) => s.isDriving);
  // The car's last reading, or before it the drive's start.
  const carPosition = useDriveStore((s) => s.position ?? s.drivingFrom);
  const drivingSince = useDriveStore((s) => s.drivingSince);
  const lastReadingAt = useDriveStore((s) => s.lastReadingAt);
  const locationFailed = useDriveStore((s) => s.locationError !== null);
  const setLocationError = useDriveStore((s) => s.setLocationError);
  const coverage = useCameraStore((s) =>
    carPosition === null ? 'covered' : driveCoverage(s.workingSet, carPosition, s.fetchFailed, DRIVE_LOOKUP_RADIUS_M),
  );
  const speedKmhRaw = useDriveStore((s) => s.speedKmh);
  const limitKmhRaw = useDriveStore((s) => s.limitKmh);
  const startDrive = useDriveStore((s) => s.startDrive);
  const stopDrive = useDriveStore((s) => s.stopDrive);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const soundMode = useSettingsStore((s) => s.soundMode);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const amberThresholdPct = useSettingsStore((s) => s.amberThresholdPct);
  const hasQueuedReplay = useNavigationStore((s) => s.pendingRoutePoints !== null);
  const takeDemoPlayback = useNavigationStore((s) => s.takeDemoPlayback);
  const [nextAlert, setNextAlert] = useState<UpcomingAlert | null>(null);
  const [feedback, showFeedback] = useTransientFeedback();
  const unwatchRef = useRef<Unsubscribe | null>(null);
  // Start awaits the cameras around the start; a second tap meanwhile is ignored.
  const startingRef = useRef(false);

  useEffect(() => {
    void load();
    return () => {
      unwatchRef.current?.();
      unwatchRef.current = null;
    };
  }, [load]);

  // A feed that stops sends nothing, so staleness is checked on a clock while driving.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isDriving) return;
    const tick = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(tick);
  }, [isDriving]);
  const locationStatus: LocationStatus = isDriving
    ? driveLocationStatus(now, drivingSince ?? now, lastReadingAt, locationFailed)
    : 'live';
  const isLive = locationStatus === 'live';

  // Silent no-alerts is never an option: the driver is told when it happens.
  const driverWarning = !isDriving
    ? null
    : !isLive
      ? LOCATION_WARNINGS[locationStatus]
      : coverage === 'unavailable'
        ? CAMERAS_UNAVAILABLE_MESSAGE
        : coverage === 'refreshing'
          ? CAMERAS_LOADING_MESSAGE
          : null;
  const spokenWarning = driverWarning === CAMERAS_LOADING_MESSAGE ? null : driverWarning;
  useEffect(() => {
    if (spokenWarning !== null) announce(alertFeedback(soundMode, voiceEnabled, 'camera'), spokenWarning);
  }, [spokenWarning, soundMode, voiceEnabled]);

  const speedKmh = Math.round(speedKmhRaw);
  // Not live: no speed, limit or over-limit colour from a reading that may be minutes old.
  const status = isLive ? getSpeedStatus(speedKmh, limitKmhRaw, amberThresholdPct) : 'ok';

  const start = useCallback(() => {
    if (startingRef.current) return;
    startingRef.current = true;
    void (async () => {
      // A queued trip replay always plays through the demo source.
      let kind: LocationSourceKind = locationSource === 'gps' && !hasQueuedReplay ? 'gps' : 'demo';
      if (kind === 'gps' && !(await location.requestPermission())) {
        kind = 'demo';
        showFeedback('Location is off — playing the demo drive instead');
      }
      const playback = kind === 'demo' ? takeDemoPlayback() : null;
      const liveLimitFor = createSpeedLimitLookup(useCameraStore);
      const limitFor =
        playback?.kind === 'planned'
          ? await createRouteSpeedLimitLookup(findInBounds, playback.route, liveLimitFor)
          : liveLimitFor;
      const source = playback === null ? location.device(limitFor) : location.demo(playback, limitFor);
      // The cameras around the start are fetched before the drive starts (an idle
      // set centred within the refetch distance is reused). A GPS drive with no fix
      // yet starts from its first reading. prepareDrive never waits past the query
      // timeout: on failure or timeout the drive still starts and the driver sees
      // driverWarning while retries continue.
      const startAt: LatLng | null =
        kind === 'gps' ? currentLocation : await source.getCurrent();
      if (startAt !== null) await prepareDrive(startAt);
      startDrive(kind, startAt);
      unwatchRef.current = source.watch(
        createDrivePointHandler(
          { drive: useDriveStore, settings: useSettingsStore, hazards: useHazardStore, cameras: useCameraStore },
          setNextAlert,
        ),
        setLocationError,
      );
    })().finally(() => {
      startingRef.current = false;
    });
  }, [showFeedback, locationSource, hasQueuedReplay, startDrive, location, takeDemoPlayback, useHazardStore, useCameraStore, useSettingsStore, prepareDrive, findInBounds, currentLocation, setLocationError]);

  const stop = useCallback(() => {
    unwatchRef.current?.();
    unwatchRef.current = null;
    stopDrive();
    setNextAlert(null);
  }, [stopDrive]);

  const onReport = useCallback(
    (type: HazardType) => {
      const here = currentDrivePosition(useDriveStore);
      if (here === null) {
        showFeedback('Start a drive to report hazards');
        return;
      }
      report(type, here.position.lat, here.position.lng, here.heading)
        .then(() => {
          showFeedback(`${hazardMeta[type].label} reported at ${clockHHMM(new Date())}`);
        })
        .catch(() => {
          showFeedback("Couldn't send report — try again");
        });
    },
    [report, showFeedback],
  );

  return {
    isLoading: hazardsLoading || awaitingCameras,
    error,
    retry: load,
    isDriving,
    speedKmh: isLive ? speedKmh : null,
    hasLimit: isDriving && isLive && limitKmhRaw > 0,
    limitKmh: limitKmhRaw,
    status,
    statusLabel: isLive ? statusMessage(status, speedKmh, limitKmhRaw) : 'Speed unknown',
    nextAlert,
    reportTypes: REPORT_TYPES,
    feedback,
    driverWarning,
    start,
    stop,
    onReport,
  };
}
