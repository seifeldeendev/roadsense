import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  AppText,
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { hazardMeta } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ReportFactsList } from '../components/ReportFactsList';
import { ReportMapCard } from '../components/ReportMapCard';
import { StillThereCard } from '../components/StillThereCard';
import { VoteBar } from '../components/VoteBar';
import { useReportDetailsViewModel } from '../viewmodels/useReportDetailsViewModel';

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useReportDetailsViewModel(id ?? '');
  const { colors } = useTheme();

  if (vm.isLoading && vm.hazard === null) {
    return (
      <Screen>
        <LoadingState label="Loading report…" />
      </Screen>
    );
  }

  if (vm.error !== null) {
    return (
      <Screen>
        <ErrorState message={vm.error} onRetry={vm.retry} />
      </Screen>
    );
  }

  if (vm.notFound || vm.hazard === null || vm.mapFrame === null) {
    return (
      <Screen scroll>
        <EmptyState
          icon="map-marker-off"
          title="Report not found"
          message="This report no longer exists"
          action={
            <AppButton
              title="Back"
              variant="secondary"
              onPress={vm.goBack}
              accessibilityLabel="Go back"
            />
          }
        />
      </Screen>
    );
  }

  const hazard = vm.hazard;

  return (
    <Screen scroll>
      <View className="gap-xxxl pb-xl">
        <ReportMapCard hazard={hazard} frame={vm.mapFrame} />

        <View className="flex-row items-center gap-md">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-canvas-soft">
            <MaterialCommunityIcons
              name={hazardMeta[hazard.type].icon}
              size={26}
              color={colors.ink}
            />
          </View>
          <AppText variant="displayMd" className="flex-1">
            {hazardMeta[hazard.type].label}
          </AppText>
          <Badge text={vm.statusLabel} variant={vm.isExpired ? 'soft' : 'ink'} />
        </View>

        <ReportFactsList facts={vm.facts} />

        <VoteBar confirmations={vm.confirmations} denials={vm.denials} />

        <StillThereCard
          isExpired={vm.isExpired}
          hasVoted={vm.hasVoted}
          onVote={vm.onVote}
        />
      </View>
    </Screen>
  );
}
