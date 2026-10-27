import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { SoundMode, UpcomingAlert } from '@/domain/entities';
import { findUpcomingAlerts } from '@/domain/usecases/drive/findUpcomingAlerts';
import { nearestRoadName } from '@/domain/usecases/drive/nearestRoadName';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

// How far ahead the "Active alerts" list looks; the spoken alert distance stays a setting.
const ACTIVE_ALERTS_LOOKAHEAD_M = 2000;

export type DriveSheet = 'sound' | 'options' | 'report' | 'alerts';

export type DriveControlsViewModel = {
  sheet: DriveSheet | null;
  openSheet: (sheet: DriveSheet) => void;
  closeSheet: () => void;
  soundMode: SoundMode;
  chooseSoundMode: (mode: SoundMode) => void;
  satellite: boolean;
  setSatellite: (on: boolean) => void;
  showTraffic: boolean;
  setShowTraffic: (on: boolean) => void;
  northUp: boolean;
  setNorthUp: (on: boolean) => void;
  activeAlerts: UpcomingAlert[];
  roadName: string | null;
  showLimitSign: boolean;
  showSpeedometer: boolean;
  showAlertsAhead: boolean;
  recentreSignal: number;
  recentre: () => void;
  openAppearance: () => void;
  openAlert: (alert: UpcomingAlert) => void;
  openHazard: (hazardId: string) => void;
};

export function useDriveControlsViewModel(): DriveControlsViewModel {
  const [sheet, setSheet] = useState<DriveSheet | null>(null);
  const [recentreSignal, setRecentreSignal] = useState(0);
  const position = useDriveStore((s) => s.position);
  const heading = useDriveStore((s) => s.heading);
  const isDriving = useDriveStore((s) => s.isDriving);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const cameras = useHazardStore((s) => s.cameras);
  const hazards = useHazardStore((s) => s.hazards);
  const settings = useSettingsStore();
  const driveRoute = useNavigationStore((s) => s.driveRoute);

  const activeAlerts = useMemo(
    () =>
      isDriving && position !== null
        ? findUpcomingAlerts(position, heading, cameras, hazards, settings, ACTIVE_ALERTS_LOOKAHEAD_M)
        : [],
    [isDriving, position, heading, cameras, hazards, settings],
  );

  // Before a drive the road is the one the route starts on.
  const roadName = useMemo(
    () => {
      if (!settings.showRoadName) return null;
      const where = position ?? currentLocation ?? (settings.locationSource === 'demo' ? driveRoute[0] : null);
      return where === null ? null : nearestRoadName(where, cameras);
    },
    [settings.showRoadName, settings.locationSource, position, currentLocation, driveRoute, cameras],
  );

  const closeSheet = useCallback(() => setSheet(null), []);

  const chooseSoundMode = useCallback(
    (mode: SoundMode) => {
      settings.setSoundMode(mode);
      setSheet(null);
    },
    [settings],
  );

  const openHazard = useCallback((hazardId: string) => {
    setSheet(null);
    router.push(`/report/${hazardId}`);
  }, []);

  const openAlert = useCallback(
    (alert: UpcomingAlert) => {
      if (alert.kind === 'hazard') openHazard(alert.refId);
      else setSheet(null);
    },
    [openHazard],
  );

  return {
    sheet,
    openSheet: setSheet,
    closeSheet,
    soundMode: settings.soundMode,
    chooseSoundMode,
    satellite: settings.mapType === 'satellite',
    setSatellite: (on) => settings.setMapType(on ? 'satellite' : 'standard'),
    showTraffic: settings.showTraffic,
    setShowTraffic: settings.setShowTraffic,
    northUp: settings.northUp,
    setNorthUp: settings.setNorthUp,
    activeAlerts,
    roadName,
    showLimitSign: settings.showLimitSign,
    showSpeedometer: settings.showSpeedometer,
    showAlertsAhead: settings.showAlertsAhead,
    recentreSignal,
    recentre: () => setRecentreSignal((count) => count + 1),
    openAppearance: () => {
      setSheet(null);
      router.push('/settings/appearance');
    },
    openAlert,
    openHazard,
  };
}
