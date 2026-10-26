import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Camera, Hazard, LatLng, MapType } from '@/domain/entities';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { alertTargetFor, isMinorRegionChange, nearestPoints, pointsInView } from '@/domain/usecases/drive/fixedPoints';
import { visibleOnMap } from '@/domain/usecases/drive/mapLayers';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { getDemoRoute } from '@/services/location';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import {
  hazardMeta,
  type HazardIconName,
  type HazardKind,
} from '@/theme/tokens';

export type MapFilterKey = 'all' | HazardKind;

// The road database covers all of Egypt; only the nearest points around the
// driver are drawn so the map stays responsive.
const MAX_FIXED_POINTS = 150;
const FIXED_POINT_RADIUS_M = 10_000;

export type MapFilterChipVm = {
  key: MapFilterKey;
  label: string;
  icon?: HazardIconName;
  selected: boolean;
};

const CHIPS: readonly { key: MapFilterKey; label: string; icon?: HazardIconName }[] = [
  { key: 'all', label: 'All' },
  { key: 'camera', label: 'Cameras', icon: hazardMeta.camera.icon },
  { key: 'police', label: 'Police', icon: hazardMeta.police.icon },
  { key: 'bump', label: 'Bumps', icon: hazardMeta.bump.icon },
  { key: 'accident', label: 'Accidents', icon: hazardMeta.accident.icon },
  { key: 'pothole', label: 'Potholes', icon: hazardMeta.pothole.icon },
  { key: 'checkpoint', label: 'Checkpoints', icon: hazardMeta.checkpoint.icon },
  { key: 'flooding', label: 'Flooding', icon: hazardMeta.flooding.icon },
];

const ALL: ReadonlySet<MapFilterKey> = new Set(['all']);

export type LiveMapViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  chips: MapFilterChipVm[];
  toggleFilter: (key: MapFilterKey) => void;
  resetFilters: () => void;
  visibleCameras: Camera[];
  visibleHazards: Hazard[];
  fitCoords: LatLng[];
  frame: MapFrame;
  hasMarkers: boolean;
  summaryLine: string;
  openReport: (id: string) => void;
  planRoute: () => void;
  mapType: MapType;
  showTraffic: boolean;
  // Viewport updates after the user pans or zooms; recentre discards it and
  // goes back to the alerts around the driver.
  onRegionChange: (region: MapFrame) => void;
  recentre: () => void;
};

function toKindKeys(kinds: ReadonlySet<MapFilterKey>): HazardKind[] {
  return Array.from(kinds).filter((key): key is HazardKind => key !== 'all');
}

export function useLiveMapViewModel(): LiveMapViewModel {
  const cameras = useHazardStore((s) => s.cameras);
  const hazards = useHazardStore((s) => s.hazards);
  const isLoading = useHazardStore((s) => s.isLoading);
  const error = useHazardStore((s) => s.error);
  const load = useHazardStore((s) => s.load);
  const mapType = useSettingsStore((s) => s.mapType);
  const showTraffic = useSettingsStore((s) => s.showTraffic);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const hiddenOnMap = useSettingsStore((s) => s.hiddenOnMap);
  const [selected, setSelected] = useState<ReadonlySet<MapFilterKey>>(ALL);
  // What the map has been showing since the user last moved it, or null before
  // the first pan (when the points still track the driver).
  const [viewport, setViewport] = useState<MapFrame | null>(null);

  const onRegionChange = useCallback(
    (region: MapFrame) => {
      // Skips the nudges of a routine pan/zoom that change nothing visibly.
      setViewport((prev) => (isMinorRegionChange(prev, region) ? prev : region));
    },
    [],
  );

  const recentre = useCallback(() => {
    // The driver is put back into view, so viewport tracking starts over.
    setViewport(null);
  }, []);

  useEffect(() => {
    const state = useHazardStore.getState();
    if (state.cameras.length === 0 && state.hazards.length === 0 && !state.isLoading) {
      void state.load();
    }
  }, [load]);

  const toggleFilter = useCallback((key: MapFilterKey) => {
    setSelected((prev) => {
      if (key === 'all') {
        return prev.has('all') ? prev : ALL;
      }
      const next = new Set(prev);
      next.delete('all');
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next.size === 0 ? ALL : next;
    });
  }, []);

  const resetFilters = useCallback(() => setSelected(ALL), []);

  const activeHazards = useMemo(
    () => visibleOnMap(hazards, hiddenOnMap).filter((hazard) => !isHazardExpired(hazard, new Date())),
    [hazards, hiddenOnMap],
  );

  // Memoised so marker lists (and the map re-fit they drive) only change with the filters.
  const kindKeys = useMemo(
    () => (selected.has('all') ? null : toKindKeys(selected)),
    [selected],
  );

  const shownCameras = useMemo(() => visibleOnMap(cameras, hiddenOnMap), [cameras, hiddenOnMap]);

  const nearbyCameras = useMemo(() => {
    // After a pan, the drawn points follow what the map is looking at.
    if (viewport !== null) return pointsInView(shownCameras, viewport, MAX_FIXED_POINTS);
    return nearestPoints(shownCameras, currentLocation ?? getDemoRoute()[0], MAX_FIXED_POINTS, FIXED_POINT_RADIUS_M);
  }, [shownCameras, viewport, currentLocation]);

  const visibleCameras = useMemo(
    () =>
      kindKeys === null
        ? nearbyCameras
        : nearbyCameras.filter((camera) => kindKeys.includes(alertTargetFor(camera.type))),
    [nearbyCameras, kindKeys],
  );

  const visibleHazards = useMemo(
    () =>
      kindKeys === null
        ? activeHazards
        : activeHazards.filter((hazard) => kindKeys.includes(hazard.type)),
    [activeHazards, kindKeys],
  );

  const fitCoords = useMemo<LatLng[]>(
    () => [
      ...visibleCameras.map((camera) => ({ lat: camera.lat, lng: camera.lng })),
      ...visibleHazards.map((hazard) => ({ lat: hazard.lat, lng: hazard.lng })),
    ],
    [visibleCameras, visibleHazards],
  );

  const chips: MapFilterChipVm[] = useMemo(
    () => CHIPS.map((chip) => ({ ...chip, selected: selected.has(chip.key) })),
    [selected],
  );

  const cameraCount = visibleCameras.length;
  const hazardCount = visibleHazards.length;
  const summaryLine =
    // Cameras, police posts and speed bumps together.
    `${cameraCount} road alert${cameraCount === 1 ? '' : 's'} · ` +
    `${hazardCount} hazard${hazardCount === 1 ? '' : 's'} nearby`;

  const openReport = useCallback((id: string) => {
    router.push(`/report/${id}`);
  }, []);

  const planRoute = useCallback(() => {
    router.push('/route-preview');
  }, []);

  const frame = useMemo(() => fitRouteRegion(fitCoords), [fitCoords]);

  return {
    isLoading,
    error,
    retry: load,
    chips,
    toggleFilter,
    resetFilters,
    visibleCameras,
    visibleHazards,
    fitCoords,
    frame,
    hasMarkers: cameraCount + hazardCount > 0,
    summaryLine,
    openReport,
    planRoute,
    mapType,
    showTraffic,
    onRegionChange,
    recentre,
  };
}
