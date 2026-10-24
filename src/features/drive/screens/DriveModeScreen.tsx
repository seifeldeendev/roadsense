import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, ErrorState, LoadingState, Screen } from '@/components/ui';
import { colors, hazardMeta, spacing, typography } from '@/theme/tokens';
import { DriveStatusPanel } from '../components/DriveStatusPanel';
import { NextAlertCard } from '../components/NextAlertCard';
import { ReportBanner } from '../components/ReportBanner';
import { ReportButton } from '../components/ReportButton';
import { useDriveModeViewModel } from '../viewmodels/useDriveModeViewModel';

export default function DriveModeScreen() {
  const vm = useDriveModeViewModel();

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
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Drive</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alert settings"
            onPress={vm.openSettings}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>

        <DriveStatusPanel
          isDriving={vm.isDriving}
          speedKmh={vm.speedKmh}
          status={vm.status}
          statusLabel={vm.statusLabel}
          hasLimit={vm.hasLimit}
          limitKmh={vm.limitKmh}
        />

        <NextAlertCard alert={vm.nextAlert} />

        <View style={styles.grid}>
          {vm.reportTypes.map((type) => (
            <ReportButton
              key={type}
              icon={hazardMeta[type].icon}
              label={hazardMeta[type].label}
              color={hazardMeta[type].color}
              onPress={() => vm.onReport(type)}
            />
          ))}
        </View>

        <ReportBanner message={vm.feedback} />

        <AppButton
          title={vm.isDriving ? 'Stop drive' : 'Start drive'}
          size="lg"
          variant={vm.isDriving ? 'danger' : 'primary'}
          onPress={vm.isDriving ? vm.stop : vm.start}
          accessibilityLabel={vm.isDriving ? 'Stop drive' : 'Start drive'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: '700',
    color: colors.text,
  },
  settingsButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  settingsIcon: {
    fontSize: 24,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
