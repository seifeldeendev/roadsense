import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/ui';
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
    <Screen scroll>
      <View className="gap-xxxl pb-xl pt-sm">
        <View className="gap-md">
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

        <View className="gap-md">
          <SectionHeader
            title="Replay a trip"
            subtitle="Pick a drive, then scrub or change speed"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-md px-xxs">
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
