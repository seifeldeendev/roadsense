import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { hazardMeta, spacing } from '@/theme/tokens';
import { DriveStatusPanel } from '../components/DriveStatusPanel';
import { NextAlertCard } from '../components/NextAlertCard';
import { ReportBanner } from '../components/ReportBanner';
import { ReportButton } from '../components/ReportButton';
import { useDriveModeViewModel } from '../viewmodels/useDriveModeViewModel';
import { useDriveMapViewModel } from '../viewmodels/useDriveMapViewModel';
import { DriveMapCard } from '../components/DriveMapCard';

export default function DriveModeScreen() {
  const vm = useDriveModeViewModel();
  const mapVm = useDriveMapViewModel();

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
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="displayXl">Drive</AppText>
            <AppText variant="bodyMd" color="body" numberOfLines={1}>
              {vm.isDriving ? `Live · ${vm.statusLabel}` : 'Salah Salem demo route'}
            </AppText>
          </View>
          <IconButton
            icon="cog-outline"
            accessibilityLabel="Alert settings"
            onPress={vm.openSettings}
          />
        </View>

        <DriveStatusPanel
          isDriving={vm.isDriving}
          speedKmh={vm.speedKmh}
          status={vm.status}
          statusLabel={vm.statusLabel}
          hasLimit={vm.hasLimit}
          limitKmh={vm.limitKmh}
        />

        <DriveMapCard
          routePoints={mapVm.routePoints}
          routeFrame={mapVm.routeFrame}
          cameras={mapVm.cameras}
          hazards={mapVm.activeHazards}
          position={mapVm.position}
          heading={mapVm.heading}
          isDriving={mapVm.isDriving}
          travelledIndex={mapVm.travelledIndex}
        />

        <NextAlertCard alert={vm.nextAlert} />

        <View style={styles.reportSection}>
          <SectionHeader
            title="Report a hazard"
            subtitle="One tap — location and time are added for you"
          />
          <View style={styles.grid}>
            {vm.reportTypes.map((type) => (
              <ReportButton
                key={type}
                icon={hazardMeta[type].icon}
                label={hazardMeta[type].label}
                onPress={() => vm.onReport(type)}
              />
            ))}
          </View>
        </View>

        <ReportBanner message={vm.feedback} />

        <AppButton
          title={vm.isDriving ? 'Stop drive' : 'Start drive'}
          variant={vm.isDriving ? 'secondary' : 'large'}
          onPress={vm.isDriving ? vm.stop : vm.start}
          accessibilityLabel={vm.isDriving ? 'Stop drive' : 'Start drive'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xxs,
  },
  reportSection: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
