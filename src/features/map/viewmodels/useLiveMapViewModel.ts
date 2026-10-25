import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Camera, Hazard, LatLng, MapType } from '@/domain/entities';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import {
  hazardMeta,
  type HazardIconName,
  type HazardKind,
} from '@/theme/tokens';

export type MapFilterKey = 'all' | 'camera' | Hazard['type'];

export type MapFilterChipVm = {
  key: MapFilterKey;
  label: string;
  icon?: HazardIconName;
  selected: boolean;
};

const CHIPS: readonly { key: MapFilterKey; label: string; icon?: HazardIconName }[] = [
  { key: 'all', label: 'All' },
  { key: 'camera', label: 'Cameras', icon: hazardMeta.camera.icon },
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
  const [selected, setSelected] = useState<ReadonlySet<MapFilterKey>>(ALL);

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
    () => hazards.filter((hazard) => !isHazardExpired(hazard, new Date())),
    [hazards],
  );

  // Memoised so marker lists (and the map re-fit they drive) only change with the filters.
  const kindKeys = useMemo(
    () => (selected.has('all') ? null : toKindKeys(selected)),
    [selected],
  );

  const visibleCameras = useMemo(
    () => (kindKeys === null ? cameras : kindKeys.includes('camera') ? cameras : []),
    [cameras, kindKeys],
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
    `${cameraCount} camera${cameraCount === 1 ? '' : 's'} · ` +
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
  };
}
