import { EmptyState, Screen } from '@/components/ui';

export default function AlertOverlayScreen() {
  return (
    <Screen>
      <EmptyState
        icon="🚦"
        title="Alert overlay"
        message="Coming soon"
      />
    </Screen>
  );
}
