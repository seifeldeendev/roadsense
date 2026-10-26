import { FlatList, View } from 'react-native';
import {
  AppButton,
  AppText,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { RouteAlertRow } from '../components/RouteAlertRow';
import { RouteMapCard } from '../components/RouteMapCard';
import { RouteSearchCard } from '../components/RouteSearchCard';
import { useRoutePreviewViewModel } from '../viewmodels/useRoutePreviewViewModel';

const EMPTY_ALERTS_MESSAGE = 'No cameras or hazards on this route';

export default function RoutePreviewScreen() {
  const vm = useRoutePreviewViewModel();

  if (vm.isLoading && vm.route === null && vm.selectedDestination === null) {
    return (
      <Screen>
        <LoadingState label="Loading destinations…" />
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

  return (
    <Screen padded={false}>
      <FlatList
        className="flex-1"
        data={vm.alerts}
        keyExtractor={(item) => item.refId}
        renderItem={({ item }) => <RouteAlertRow alert={item} />}
        contentContainerClassName="gap-xxxl p-lg pb-xl"
        ListHeaderComponent={
          <View className="gap-xxxl">
            <AppText variant="displayXl">Route preview</AppText>
            <AppText variant="bodyMd" color="body">
              Pick a destination to preview the drive with its cameras and hazards.
            </AppText>
            <RouteSearchCard
              toValue={vm.toValue}
              suggestions={vm.suggestions}
              onQueryChange={vm.onQueryChange}
              chooseDestination={vm.chooseDestination}
            />
            {vm.route !== null && vm.routeFrame !== null ? (
              <>
                <RouteMapCard
                  route={vm.route}
                  frame={vm.routeFrame}
                  startHeading={vm.startHeading}
                  destinationName={vm.selectedDestination?.name ?? 'Destination'}
                />
                <Card variant="content">
                  <AppText variant="displaySm">{vm.summaryLine}</AppText>
                  <AppText variant="bodySm" color="body">
                    {vm.countsLine}
                  </AppText>
                </Card>
                <SectionHeader title="Along the route" />
              </>
            ) : vm.selectedDestination !== null && vm.isLoading ? (
              <LoadingState label={`Finding a route to ${vm.selectedDestination.name}…`} />
            ) : undefined}
          </View>
        }
        ListEmptyComponent={
          vm.alertsEmpty ? (
            <AppText variant="bodySm" color="body">
              {EMPTY_ALERTS_MESSAGE}
            </AppText>
          ) : undefined
        }
        ListFooterComponent={
          vm.route !== null ? (
            <AppButton
              title="Start drive"
              variant="large"
              onPress={vm.startDrive}
              accessibilityLabel="Start drive"
            />
          ) : undefined
        }
      />
    </Screen>
  );
}
