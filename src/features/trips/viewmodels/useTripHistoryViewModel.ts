import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Trip } from '@/domain/entities';
import { groupTripsByDay, type TripDaySection } from '@/domain/usecases/trips/groupTripsByDay';
import { useTripStore } from '@/stores/useTripStore';

export type TripFilter = 'all' | 'over';

export type TripHistorySection = TripDaySection & { data: Trip[] };

export type TripHistoryViewModel = {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  totalCount: number;
  filter: TripFilter;
  setFilter: (filter: TripFilter) => void;
  sections: TripHistorySection[];
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  openTrip: (tripId: string) => void;
};

export function useTripHistoryViewModel(): TripHistoryViewModel {
  const trips = useTripStore((state) => state.trips);
  const isLoading = useTripStore((state) => state.isLoading);
  const error = useTripStore((state) => state.error);
  const load = useTripStore((state) => state.load);
  const [filter, setFilter] = useState<TripFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Captured once per mount; groups trips by calendar day as of "now".
  const [today] = useState(() => new Date());

  useEffect(() => {
    if (useTripStore.getState().trips.length === 0) void load();
  }, [load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  const retry = load;

  const sections = useMemo(() => {
    const visible =
      filter === 'all' ? trips : trips.filter((trip) => trip.overLimitCount > 0);
    return groupTripsByDay(visible, today).map((section) => ({
      ...section,
      data: section.trips,
    }));
  }, [trips, filter, today]);

  const openTrip = useCallback((tripId: string) => {
    router.push({ pathname: '/trip/[id]', params: { id: tripId } });
  }, []);

  return {
    isLoading,
    isRefreshing,
    error,
    totalCount: trips.length,
    filter,
    setFilter,
    sections,
    refresh,
    retry,
    openTrip,
  };
}
