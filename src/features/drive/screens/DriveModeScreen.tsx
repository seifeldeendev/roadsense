import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ActiveAlertsSheet, ReportSheet } from '../components/DriveActionSheets';
import { DriveBottomBar } from '../components/DriveBottomBar';
import { DriveMap } from '../components/DriveMap';
import { MapOptionsSheet, SoundSheet } from '../components/DriveSettingsSheets';
import { DriveTopOverlay } from '../components/DriveTopOverlay';
import { MapFab } from '../components/MapFab';
import { PinPickerOverlay } from '../components/PinPickerOverlay';
import { PlannerSearchPanel } from '../components/PlannerSearchPanel';
import { ReportBanner } from '../components/ReportBanner';
import { RouteSummaryCard } from '../components/RouteSummaryCard';
import { SpeedReadout } from '../components/SpeedReadout';
import { useDriveControlsViewModel } from '../viewmodels/useDriveControlsViewModel';
import { useDriveMapViewModel } from '../viewmodels/useDriveMapViewModel';
import { useDriveModeViewModel } from '../viewmodels/useDriveModeViewModel';
import { useTripPlannerViewModel } from '../viewmodels/useTripPlannerViewModel';

export default function DriveModeScreen() {
  const vm = useDriveModeViewModel();
  const map = useDriveMapViewModel();
  const controls = useDriveControlsViewModel();
  const planner = useTripPlannerViewModel();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (vm.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading cameras and hazards…" />
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

  // Planning happens on this screen, over the same map, like a ride-hailing home screen.
  const showsRouteCard = planner.mode === 'route' && planner.destination !== null && !vm.isDriving;
  const showsDriveControls = planner.mode === 'idle' || planner.mode === 'route';

  return (
    <View style={[styles.fill, { backgroundColor: colors.canvas }]}>
      <DriveMap
        {...map}
        hazards={map.activeHazards}
        recentreSignal={controls.recentreSignal}
        onOpenHazard={controls.openHazard}
        onCenterChange={planner.mode === 'pin' ? planner.onPinMove : undefined}
      />

      {showsDriveControls ? (
        <>
          <DriveTopOverlay
            topInset={insets.top}
            showSearch={!showsRouteCard}
            limitKmh={vm.hasLimit ? vm.limitKmh : null}
            over={vm.status === 'over'}
            soundMode={controls.soundMode}
            onGoTo={planner.openSearch}
            onOpenSettings={vm.openSettings}
            onSound={() => controls.openSheet('sound')}
            onOptions={() => controls.openSheet('options')}
            onRecentre={controls.recentre}
          />
          <View pointerEvents="box-none" style={styles.bottom}>
            <View pointerEvents="box-none" style={styles.bottomRow}>
              <SpeedReadout speedKmh={vm.speedKmh} status={vm.status} />
              {/* Black only while driving, so the idle screen keeps a single black CTA. */}
              <MapFab icon="plus" accessibilityLabel="New alert" primary={vm.isDriving} onPress={() => controls.openSheet('report')} />
            </View>
            <ReportBanner message={vm.feedback} />
            {showsRouteCard && planner.destination !== null ? (
              <RouteSummaryCard
                destinationName={planner.destination.name}
                isRouting={planner.isRouting}
                error={planner.routeError}
                durationLabel={planner.durationLabel}
                detailLabel={planner.detailLabel}
                alerts={planner.alerts}
                onStart={vm.start}
                onClose={planner.close}
              />
            ) : (
              <DriveBottomBar
                roadName={controls.roadName}
                alertsAhead={controls.activeAlerts.length}
                isDriving={vm.isDriving}
                onOpenAlerts={() => controls.openSheet('alerts')}
                onStart={vm.start}
                onStop={vm.stop}
              />
            )}
          </View>
        </>
      ) : null}

      {planner.mode === 'pin' ? (
        <PinPickerOverlay topInset={insets.top} label={planner.pinLabel} onBack={planner.back} onConfirm={planner.confirmPin} />
      ) : null}
      {planner.mode === 'search' ? (
        <PlannerSearchPanel
          topInset={insets.top}
          originLabel={planner.originLabel}
          query={planner.query}
          sections={planner.sections}
          onQueryChange={planner.setQuery}
          onChoose={planner.choose}
          onSetOnMap={planner.openPin}
          onBack={planner.back}
        />
      ) : null}

      <SoundSheet visible={controls.sheet === 'sound'} soundMode={controls.soundMode} onChoose={controls.chooseSoundMode} onClose={controls.closeSheet} />
      <MapOptionsSheet
        visible={controls.sheet === 'options'}
        satellite={controls.satellite}
        showTraffic={controls.showTraffic}
        northUp={controls.northUp}
        onSatellite={controls.setSatellite}
        onTraffic={controls.setShowTraffic}
        onNorthUp={controls.setNorthUp}
        onOpenAppearance={controls.openAppearance}
        onClose={controls.closeSheet}
      />
      <ReportSheet
        visible={controls.sheet === 'report'}
        reportTypes={vm.reportTypes}
        onReport={(type) => {
          controls.closeSheet();
          vm.onReport(type);
        }}
        onClose={controls.closeSheet}
      />
      <ActiveAlertsSheet visible={controls.sheet === 'alerts'} alerts={controls.activeAlerts} onOpenAlert={controls.openAlert} onClose={controls.closeSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bottom: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg, gap: spacing.md },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
});
