import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import type { Hazard, UpcomingAlert } from '@/domain/entities';
import { angleDiffDeg, bearingDeg, haversineDistanceM } from '@/domain/usecases/drive/geo';
import { formatDistance, formatTimeAgo } from '@/shared/format';
import { stopSpeaking } from '@/services/speech';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';

const AUTO_DISMISS_MS = 8000;
const BEHIND_THRESHOLD_DEG = 90;

export type AlertOverlayViewModel = {
  alert: UpcomingAlert | null;
  alertKind: 'camera' | 'hazard' | null;
  title: string;
  roadName: string | null;
  distanceLabel: string;
  cameraLimitKmh: number | null;
  hazard: Hazard | null;
  reportedLine: string | null;
  hasVoted: boolean;
  onVote: (stillThere: boolean) => void;
  onDismiss: () => void;
};

export function useAlertOverlayViewModel(): AlertOverlayViewModel {
  const activeAlert = useDriveStore((s) => s.activeAlert);
  const position = useDriveStore((s) => s.position);
  const heading = useDriveStore((s) => s.heading);
  const isDriving = useDriveStore((s) => s.isDriving);
  const hazards = useHazardStore((s) => s.hazards);
  const [votedRefId, setVotedRefId] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasVoted = activeAlert !== null && votedRefId === activeAlert.refId;

  const hazard = useMemo<Hazard | null>(() => {
    if (activeAlert === null || activeAlert.kind !== 'hazard') return null;
    return hazards.find((h) => h.id === activeAlert.refId) ?? null;
  }, [activeAlert, hazards]);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current !== null) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const onDismiss = useCallback(() => {
    const alert = useDriveStore.getState().activeAlert;
    clearDismissTimer();
    if (alert !== null) {
      useDriveStore.getState().dismissAlert(alert.refId);
    }
    stopSpeaking();
    router.back();
  }, [clearDismissTimer]);

  useEffect(() => {
    if (activeAlert === null) return undefined;
    dismissTimer.current = setTimeout(() => {
      dismissTimer.current = null;
      onDismiss();
    }, AUTO_DISMISS_MS);
    return clearDismissTimer;
  }, [activeAlert, clearDismissTimer, onDismiss]);

  useEffect(() => {
    if (activeAlert === null || position === null || !isDriving) return;
    const target = activeAlert.camera ?? activeAlert.hazard;
    if (!target) return;
    if (angleDiffDeg(heading, bearingDeg(position, target)) > BEHIND_THRESHOLD_DEG) {
      onDismiss();
    }
  }, [activeAlert, heading, isDriving, onDismiss, position]);

  const onVote = useCallback(
    (stillThere: boolean) => {
      const alert = useDriveStore.getState().activeAlert;
      if (alert === null || hasVoted) return;
      useHazardStore
        .getState()
        .vote(alert.refId, stillThere)
        .then(() => setVotedRefId(alert.refId))
        .catch(() => undefined);
    },
    [hasVoted],
  );

  const distanceM = useMemo(() => {
    if (activeAlert === null) return 0;
    const target = activeAlert.camera ?? activeAlert.hazard;
    if (position !== null && target) {
      return haversineDistanceM(position, target);
    }
    return activeAlert.distanceM;
  }, [activeAlert, position]);

  const reportedLine = useMemo(() => {
    if (hazard === null) return null;
    const denials = hazard.denials === 1 ? 'denial' : 'denials';
    return `Reported ${formatTimeAgo(hazard.createdAt, new Date())} · ${hazard.confirmations} confirmations · ${hazard.denials} ${denials}`;
  }, [hazard]);

  return {
    alert: activeAlert,
    alertKind: activeAlert?.kind ?? null,
    title: activeAlert?.title ?? '',
    roadName: activeAlert?.roadName ?? null,
    distanceLabel: activeAlert === null ? '' : formatDistance(distanceM),
    cameraLimitKmh: activeAlert?.speedLimitKmh ?? null,
    hazard,
    reportedLine,
    hasVoted,
    onVote,
    onDismiss,
  };
}
