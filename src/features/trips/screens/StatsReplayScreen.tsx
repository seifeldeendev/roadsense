import { useTabBarSpace } from '@/components/navigation';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useTheme';
import { useStatsReplayViewModel } from '../viewmodels/useStatsReplayViewModel';
import { WeekSelector } from '../components/WeekSelector';
import { WeekBarChart } from '../components/WeekBarChart';
import { ReplayCard } from '../components/ReplayCard';
import { StatTiles } from '../components/StatTiles';

export default function StatsReplayScreen() {
  const { replay: replayParam } = useLocalSearchParams<{ replay?: string }>();
  const vm = useStatsReplayViewModel(
    typeof replayParam === 'string' ? replayParam : undefined,
  );
  const tabBarSpace = useTabBarSpace();
  const styles = useThemedStyles(statsStyles, undefined);

  if (vm.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading stats…" />
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

  if (!vm.hasTrips) {
    return (
      <Screen>
        <EmptyState
          icon="chart-bar"
          title="No drives yet"
          message="Run a drive to see weekly stats and replays."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll bottomInset={tabBarSpace}>
      <View style={styles.container}>
        <View style={styles.section}>
          <SectionHeader title="Weekly stats" size="md" />
          <WeekSelector
            label={vm.weekLabel}
            canGoNext={vm.canGoNext}
            onPrev={vm.goPrevWeek}
            onNext={vm.goNextWeek}
          />
          <WeekBarChart bars={vm.bars} />
          <StatTiles tiles={vm.tiles} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Replay a trip"
            subtitle="Pick a drive, then scrub or change speed"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {vm.chips.map((chip) => (
                <Chip
                  key={chip.id}
                  label={chip.label}
                  selected={vm.selectedTripId === chip.id}
                  onPress={() => vm.selectTrip(chip.id)}
                />
              ))}
            </View>
          </ScrollView>
          <ReplayCard controls={vm.controls} />
        </View>
      </View>
    </Screen>
  );
}

function statsStyles() {
  return StyleSheet.create({
    container: {
      gap: spacing.xxxl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    section: {
      gap: spacing.md,
    },
    chipRow: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingHorizontal: spacing.xxs,
    },
  });
}
