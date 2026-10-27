import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';

const FEEDBACK_MS = 3000;

export function clockHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function statusMessage(
  status: SpeedStatus,
  speedKmh: number,
  limitKmh: number,
): string {
  if (status === 'over') {
    return `Over limit by ${Math.max(1, Math.round(speedKmh - limitKmh))} km/h`;
  }
  if (status === 'near') {
    return 'Near limit';
  }
  return 'Within limit';
}

export function useTransientFeedback(): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((next: string) => {
    if (timer.current !== null) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), FEEDBACK_MS);
  }, []);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  return [message, show];
}
