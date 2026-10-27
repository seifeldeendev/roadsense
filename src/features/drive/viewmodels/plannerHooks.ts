import { useEffect, useState } from 'react';
import type { Destination, LatLng } from '@/domain/entities';
import { useDependencies } from '@/stores/DependenciesProvider';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

// Live geocoder results for the search box, debounced so typing doesn't flood it.
export function usePlaceSearch(query: string): Destination[] {
  const { geocoder } = useDependencies();
  const [results, setResults] = useState<Destination[]>([]);
  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const timer = setTimeout(() => {
      if (q.length < MIN_QUERY_LENGTH) {
        setResults([]);
        return;
      }
      void geocoder.search(q).then((found) => {
        if (!cancelled) setResults(found);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, geocoder]);
  return results;
}

// "Street · Area" label for the dropped pin, refreshed after the map settles.
export function usePinLabel(center: LatLng | null): string {
  const { geocoder } = useDependencies();
  const [label, setLabel] = useState('Dropped pin');
  useEffect(() => {
    if (center === null) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void geocoder.describe(center).then((place) => {
        if (cancelled) return;
        setLabel(place === null ? 'Dropped pin' : [place.name, place.area].filter(Boolean).join(' · '));
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [center, geocoder]);
  return label;
}
