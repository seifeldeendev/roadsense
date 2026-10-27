import { useLocalSearchParams } from 'expo-router';
import { EmptyState, Screen } from '@/components/ui';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen scroll>
      <EmptyState
        icon="map-marker-path"
        title="Trip details"
        message={`Trip ${id ?? '—'} — coming soon`}
      />
    </Screen>
  );
}
