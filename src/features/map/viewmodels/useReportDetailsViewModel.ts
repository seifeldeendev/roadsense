import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Camera, Hazard } from '@/domain/entities';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { haversineDistanceM } from '@/domain/usecases/drive/geo';
import { formatTimeAgo } from '@/shared/format';
import { useHazardStore } from '@/stores/useHazardStore';

const NEARBY_CAMERA_M = 300;

export type ReportFactRow = { label: string; value: string };

export type ReportDetailsViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  notFound: boolean;
  hazard: Hazard | null;
  statusLabel: 'Active' | 'Expired';
  isExpired: boolean;
  facts: ReportFactRow[];
  confirmations: number;
  denials: number;
  mapFrame: MapFrame | null;
  hasVoted: boolean;
  onVote: (stillThere: boolean) => void;
  goBack: () => void;
};

function formatRemaining(iso: string, now: Date): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  if (hours === 0) return `in ${minutes} min`;
  if (hours < 24) return `in ${hours} h ${String(minutes % 60).padStart(2, '0')} min`;
  const days = Math.floor(hours / 24);
  return `in ${days} d ${hours % 24} h`;
}

function locate(hazard: Hazard, cameras: Camera[]): string {
  let nearest: { roadName: string; distanceM: number } | null = null;
  for (const camera of cameras) {
    const distanceM = haversineDistanceM(hazard, camera);
    if (nearest === null || distanceM < nearest.distanceM) {
      nearest = { roadName: camera.roadName, distanceM };
    }
  }
  if (nearest !== null && nearest.distanceM <= NEARBY_CAMERA_M) {
    return nearest.roadName;
  }
  return `${hazard.lat.toFixed(4)}, ${hazard.lng.toFixed(4)}`;
}

export function useReportDetailsViewModel(id: string): ReportDetailsViewModel {
  const hazards = useHazardStore((s) => s.hazards);
  const cameras = useHazardStore((s) => s.cameras);
  const isLoading = useHazardStore((s) => s.isLoading);
  const error = useHazardStore((s) => s.error);
  const load = useHazardStore((s) => s.load);

  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const state = useHazardStore.getState();
    if (state.hazards.length === 0 && !state.isLoading) {
      void state.load();
    }
  }, [load]);

  const hazard = useMemo<Hazard | null>(
    () => hazards.find((item) => item.id === id) ?? null,
    [hazards, id],
  );

  const isExpired = hazard !== null && isHazardExpired(hazard, new Date());

  const onVote = useCallback(
    (stillThere: boolean) => {
      if (hazard === null || hasVoted || isVoting) return;
      setIsVoting(true);
      setHasVoted(true);
      useHazardStore
        .getState()
        .vote(hazard.id, stillThere)
        .catch(() => setHasVoted(false))
        .finally(() => setIsVoting(false));
    },
    [hazard, hasVoted, isVoting],
  );

  const goBack = useCallback(() => router.back(), []);

  const facts = useMemo<ReportFactRow[]>(() => {
    if (hazard === null) return [];
    return [
      { label: 'Reported', value: formatTimeAgo(hazard.createdAt, new Date()) },
      {
        label: 'Expires',
        value: isExpired ? 'Expired' : formatRemaining(hazard.expiresAt, new Date()),
      },
      { label: 'Location', value: locate(hazard, cameras) },
      { label: 'Confirmations', value: String(hazard.confirmations) },
      { label: 'Denials', value: String(hazard.denials) },
    ];
  }, [hazard, isExpired, cameras]);

  return {
    isLoading,
    error,
    retry: load,
    notFound: !isLoading && error === null && hazards.length > 0 && hazard === null,
    hazard,
    statusLabel: isExpired ? 'Expired' : 'Active',
    isExpired,
    facts,
    confirmations: hazard?.confirmations ?? 0,
    denials: hazard?.denials ?? 0,
    mapFrame: hazard === null ? null : fitRouteRegion([hazard]),
    hasVoted,
    onVote,
    goBack,
  };
}
