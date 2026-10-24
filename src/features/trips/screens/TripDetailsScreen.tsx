import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useTheme';
import { useTripDetailsViewModel } from '../viewmodels/useTripDetailsViewModel';
import { StatTiles } from '../components/StatTiles';
import { TripMapCard, TripMapLegend } from '../components/TripMapCard';
import { TripTimeline } from '../components/TripTimeline';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useTripDetailsViewModel(id);
  const styles = useThemedStyles(detailsStyles, undefined);

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
      <View style={styles.container}>
        <View style={styles.mapStack}>
          <TripMapCard
            trip={vm.trip}
            segments={vm.segments}
            alertMarkers={vm.alertMarkers}
            frame={vm.frame}
          />
          <TripMapLegend />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Your drive" size="md" />
          <StatTiles tiles={vm.tiles} />
        </View>

        <View style={styles.section}>
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

function detailsStyles() {
  return StyleSheet.create({
    container: {
      gap: spacing.xxxl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    mapStack: {
      gap: spacing.sm,
    },
    section: {
      gap: spacing.md,
    },
  });
}
