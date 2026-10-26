import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { useTripDetailsViewModel } from '../viewmodels/useTripDetailsViewModel';
import { StatTiles } from '../components/StatTiles';
import { TripMapCard, TripMapLegend } from '../components/TripMapCard';
import { TripTimeline } from '../components/TripTimeline';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useTripDetailsViewModel(id);

  if (vm.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading trip…" />
      </Screen>
    );
  }

  if (vm.error !== null) {
    return (
      <Screen>
        <ErrorState message={vm.error} onRetry={() => void vm.retry()} />
      </Screen>
    );
  }

  if (vm.trip === null) {
    return (
      <Screen scroll>
        <EmptyState
          icon="map-marker-question"
          title="Trip not found"
          message={`No trip with id ${id ?? '—'}`}
          action={
            <AppButton
              title="Back"
              variant="secondary"
              onPress={vm.goBack}
              accessibilityLabel="Back"
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View className="gap-xxxl pb-xl pt-sm">
        <View className="gap-sm">
          <TripMapCard
            trip={vm.trip}
            segments={vm.segments}
            alertMarkers={vm.alertMarkers}
            frame={vm.frame}
          />
          <TripMapLegend />
        </View>

        <View className="gap-md">
          <SectionHeader title="Your drive" size="md" />
          <StatTiles tiles={vm.tiles} />
        </View>

        <View className="gap-md">
          <SectionHeader
            title="Timeline"
            subtitle="Over-limit stretches and alerts in order"
          />
          <TripTimeline lines={vm.eventLines} />
        </View>

        <AppButton
          title="Replay this trip"
          variant="large"
          onPress={vm.replayThisTrip}
          accessibilityLabel="Replay this trip"
        />
      </View>
    </Screen>
  );
}
