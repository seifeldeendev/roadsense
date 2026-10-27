import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import {
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SegmentedControl,
} from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTripHistoryViewModel } from '../viewmodels/useTripHistoryViewModel';
import { TripCard } from '../components/TripCard';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' as const },
  { label: 'With over-limit', value: 'over' as const },
];

export default function TripHistoryScreen() {
  const vm = useTripHistoryViewModel();
  const { colors } = useTheme();

  if (vm.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading trips…" />
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

  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="displayXl">Trips</AppText>
        <AppText variant="bodyMd" color="body">
          {`${vm.totalCount} drives in the last 14 days`}
        </AppText>
        <SegmentedControl options={FILTER_OPTIONS} value={vm.filter} onChange={vm.setFilter} />

        {vm.sections.length === 0 ? (
          <EmptyState
            icon={vm.totalCount === 0 ? 'history' : 'check-circle-outline'}
            title={vm.totalCount === 0 ? 'No drives yet' : 'Nothing over the limit'}
            message={
              vm.totalCount === 0
                ? 'Your recent drives will show up here.'
                : 'No trips over the limit — nice driving'
            }
          />
        ) : (
          <SectionList
            style={styles.list}
            sections={vm.sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <View style={styles.dayHeader}>
                <AppText variant="bodySmStrong" color="body">
                  {section.title}
                </AppText>
              </View>
            )}
            renderItem={({ item }) => <TripCard trip={item} onPress={() => vm.openTrip(item.id)} />}
            ItemSeparatorComponent={Separator}
            refreshControl={
              <RefreshControl
                refreshing={vm.isRefreshing}
                onRefresh={() => void vm.refresh()}
                tintColor={colors.ink}
                colors={[colors.ink]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Screen>
  );
}

function Separator() {
  return <View style={separatorStyles.gap} />;
}

const separatorStyles = StyleSheet.create({
  gap: { height: spacing.md },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  dayHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxs,
  },
});
