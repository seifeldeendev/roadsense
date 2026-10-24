import { StyleSheet, View } from 'react-native';
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
import { hazardMeta, rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { ReportFactsList } from '../components/ReportFactsList';
import { ReportMapCard } from '../components/ReportMapCard';
import { StillThereCard } from '../components/StillThereCard';
import { VoteBar } from '../components/VoteBar';
import { useReportDetailsViewModel } from '../viewmodels/useReportDetailsViewModel';

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useReportDetailsViewModel(id ?? '');
  const { colors } = useTheme();
  const styles = useThemedStyles(screenStyles, undefined);

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
      <View style={styles.container}>
        <ReportMapCard hazard={hazard} frame={vm.mapFrame} />

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={hazardMeta[hazard.type].icon}
              size={26}
              color={colors.ink}
            />
          </View>
          <AppText variant="displayMd" style={styles.headline}>
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

function screenStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    container: {
      gap: spacing.xxxl,
      paddingBottom: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: rounded.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.canvasSoft,
    },
    headline: {
      flex: 1,
    },
  });
}
