import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarSpace } from '@/components/navigation';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { ActiveAlertsSheet, ReportSheet } from '../components/DriveActionSheets';
import { DriveBottomBar } from '../components/DriveBottomBar';
import { DriveMap } from '../components/DriveMap';
import { MapOptionsSheet, SoundSheet } from '../components/DriveSettingsSheets';
import { DriveTopOverlay } from '../components/DriveTopOverlay';
import { MapFab } from '../components/MapFab';
import { PinPickerOverlay } from '../components/PinPickerOverlay';
import { PlannerDropdown } from '../components/PlannerDropdown';
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
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  if (vm.isLoading || map.isLoading) {
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
    <View className="flex-1 bg-canvas">
      <DriveMap
        {...map}
        hazards={map.activeHazards}
        recentreSignal={controls.recentreSignal}
        onOpenHazard={controls.openHazard}
        onCenterChange={planner.mode === 'pin' ? planner.onPinMove : undefined}
        onRegionChange={map.onRegionChange}
      />

      {showsDriveControls ? (
        <>
          <DriveTopOverlay
            topInset={insets.top}
            showSearch={!showsRouteCard}
            quickPlaces={vm.isDriving ? [] : planner.quickPlaces}
            onChoosePlace={planner.choose}
            showLimitSign={controls.showLimitSign}
            limitKmh={vm.hasLimit ? vm.limitKmh : null}
            over={vm.status === 'over'}
            soundMode={controls.soundMode}
            onGoTo={planner.openSearch}
            onSound={() => controls.openSheet('sound')}
            onOptions={() => controls.openSheet('options')}
            onRecentre={controls.recentre}
          />
          <View pointerEvents="box-none" className="absolute left-lg right-lg gap-md" style={{ bottom: tabBarSpace + spacing.md }}>
            <View pointerEvents="box-none" className="flex-row items-end justify-between">
              {controls.showSpeedometer ? <SpeedReadout speedKmh={vm.speedKmh} status={vm.status} /> : <View />}
              {/* Black only while driving, so the idle screen keeps a single black CTA. */}
              <MapFab icon="plus" accessibilityLabel="New alert" primary={vm.isDriving} onPress={() => controls.openSheet('report')} />
            </View>
            <ReportBanner message={vm.cameraWarning} />
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
                alertsAhead={controls.showAlertsAhead ? controls.activeAlerts.length : null}
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
        <PinPickerOverlay topInset={insets.top} bottomInset={tabBarSpace} label={planner.pinLabel} onBack={planner.back} onConfirm={planner.confirmPin} />
      ) : null}
      {planner.mode === 'search' ? (
        <PlannerDropdown
          topInset={insets.top}
          originLabel={planner.originLabel}
          query={planner.query}
          sections={planner.sections}
          onQueryChange={planner.setQuery}
          onChoose={planner.choose}
          onSetOnMap={planner.openPin}
          onClose={planner.back}
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
