import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ActiveAlertsSheet, ReportSheet } from '../components/DriveActionSheets';
import { DriveBottomBar } from '../components/DriveBottomBar';
import { DriveMap } from '../components/DriveMap';
import { MapOptionsSheet, SoundSheet, soundModeIcon } from '../components/DriveSettingsSheets';
import { DriveTopBar } from '../components/DriveTopBar';
import { LimitBadge } from '../components/LimitBadge';
import { MapFab } from '../components/MapFab';
import { ReportBanner } from '../components/ReportBanner';
import { SpeedReadout } from '../components/SpeedReadout';
import { useDriveControlsViewModel } from '../viewmodels/useDriveControlsViewModel';
import { useDriveMapViewModel } from '../viewmodels/useDriveMapViewModel';
import { useDriveModeViewModel } from '../viewmodels/useDriveModeViewModel';

export default function DriveModeScreen() {
  const vm = useDriveModeViewModel();
  const map = useDriveMapViewModel();
  const controls = useDriveControlsViewModel();
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

  return (
    <View style={[styles.fill, { backgroundColor: colors.canvas }]}>
      <DriveMap
        routePoints={map.routePoints}
        routeFrame={map.routeFrame}
        cameras={map.cameras}
        hazards={map.activeHazards}
        position={map.position}
        heading={map.heading}
        isDriving={map.isDriving}
        travelledIndex={map.travelledIndex}
        mapType={map.mapType}
        showTraffic={map.showTraffic}
        northUp={map.northUp}
        recentreSignal={controls.recentreSignal}
        onOpenHazard={controls.openHazard}
      />

      <View pointerEvents="box-none" style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <DriveTopBar onGoTo={controls.goTo} onOpenSettings={vm.openSettings} />
        <View pointerEvents="box-none" style={styles.topRow}>
          <LimitBadge limitKmh={vm.hasLimit ? vm.limitKmh : null} size="sm" over={vm.status === 'over'} />
          <View style={styles.fabColumn}>
            <MapFab
              icon={soundModeIcon(controls.soundMode)}
              accessibilityLabel="Sound"
              onPress={() => controls.openSheet('sound')}
            />
            <MapFab icon="layers-outline" accessibilityLabel="Other options" onPress={() => controls.openSheet('options')} />
            <MapFab icon="crosshairs-gps" accessibilityLabel="Recentre map" onPress={controls.recentre} />
          </View>
        </View>
      </View>

      <View pointerEvents="box-none" style={styles.bottom}>
        <View pointerEvents="box-none" style={styles.bottomRow}>
          <SpeedReadout speedKmh={vm.speedKmh} status={vm.status} />
          {/* Black only while driving, so the idle screen keeps a single black CTA. */}
          <MapFab icon="plus" accessibilityLabel="New alert" primary={vm.isDriving} onPress={() => controls.openSheet('report')} />
        </View>
        <ReportBanner message={vm.feedback} />
        <DriveBottomBar
          roadName={controls.roadName}
          alertsAhead={controls.activeAlerts.length}
          isDriving={vm.isDriving}
          onOpenAlerts={() => controls.openSheet('alerts')}
          onStart={vm.start}
          onStop={vm.stop}
        />
      </View>

      <SoundSheet
        visible={controls.sheet === 'sound'}
        soundMode={controls.soundMode}
        onChoose={controls.chooseSoundMode}
        onClose={controls.closeSheet}
      />
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
      <ActiveAlertsSheet
        visible={controls.sheet === 'alerts'}
        alerts={controls.activeAlerts}
        onOpenAlert={controls.openAlert}
        onClose={controls.closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { position: 'absolute', top: 0, left: spacing.lg, right: spacing.lg, gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fabColumn: { gap: spacing.md },
  bottom: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg, gap: spacing.md },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
});
