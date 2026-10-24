import { EmptyState, Screen } from '@/components/ui';

export default function TripHistoryScreen() {
  return (
    <Screen>
      <EmptyState
        icon="history"
        title="Trip history"
        message="Coming soon"
      />
    </Screen>
  );
}
