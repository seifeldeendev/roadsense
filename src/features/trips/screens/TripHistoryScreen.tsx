import { EmptyState, Screen } from '@/components/ui';

export default function TripHistoryScreen() {
  return (
    <Screen scroll>
      <EmptyState
        icon="🧭"
        title="Trip history"
        message="Coming soon"
      />
    </Screen>
  );
}
