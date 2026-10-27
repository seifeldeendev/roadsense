import { useEffect, useState } from 'react';
import type { Destination, LatLng } from '@/domain/entities';
// eslint-disable-next-line import/no-restricted-paths -- TODO(gps-di): inject via Dependencies
import { describePlace, searchPlaces } from '@/services/geocoding';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

// Live geocoder results for the search box, debounced so typing doesn't flood it.
export function usePlaceSearch(query: string): Destination[] {
  const [results, setResults] = useState<Destination[]>([]);
  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const timer = setTimeout(() => {
      if (q.length < MIN_QUERY_LENGTH) {
        setResults([]);
        return;
      }
      void searchPlaces(q).then((found) => {
        if (!cancelled) setResults(found);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);
  return results;
}

// "Street · Area" label for the dropped pin, refreshed after the map settles.
export function usePinLabel(center: LatLng | null): string {
  const [label, setLabel] = useState('Dropped pin');
  useEffect(() => {
    if (center === null) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void describePlace(center).then((place) => {
        if (cancelled) return;
        setLabel(place === null ? 'Dropped pin' : [place.name, place.area].filter(Boolean).join(' · '));
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [center]);
  return label;
}
