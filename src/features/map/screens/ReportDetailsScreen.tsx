import { useLocalSearchParams } from 'expo-router';
import { EmptyState, Screen } from '@/components/ui';

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen scroll>
      <EmptyState
        icon="📍"
        title="Report details"
        message={`Report ${id ?? '—'} — coming soon`}
      />
    </Screen>
  );
}
