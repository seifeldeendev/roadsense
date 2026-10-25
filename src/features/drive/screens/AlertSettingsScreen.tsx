import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, Screen, SectionHeader, SegmentedControl } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { ALERT_DISTANCE_OPTIONS, AMBER_OPTIONS } from '@/shared/constants';
import { AlertTypeList } from '../components/AlertTypeList';
import { SpeedAlarmSection } from '../components/DisplaySettingsSections';
import { ValidationNote } from '../components/ValidationNote';
import { useAlertSettingsViewModel } from '../viewmodels/useAlertSettingsViewModel';
import { useDisplaySettingsViewModel } from '../viewmodels/useDisplaySettingsViewModel';

const DISTANCE_SEGMENTS = ALERT_DISTANCE_OPTIONS.map((value) => ({ label: `${value} m`, value }));
const AMBER_SEGMENTS = AMBER_OPTIONS.map((value) => ({ label: `${value}%`, value }));

// What warns you and when. Sound, map, screen and appearance live under Account.
export default function AlertSettingsScreen() {
  const vm = useAlertSettingsViewModel();
  const display = useDisplaySettingsViewModel();

  return (
    <Screen scroll>
      <View style={styles.container}>
        <AppText variant="bodyMd" color="body">
          Choose what RoadSense warns you about and how early.
        </AppText>

        <View style={styles.section}>
          <SectionHeader title="Alert distance" />
          <SegmentedControl options={DISTANCE_SEGMENTS} value={vm.alertDistanceM} onChange={vm.setAlertDistance} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Alert types" />
          {vm.message !== null && <ValidationNote message={vm.message} />}
          <AlertTypeList enabledTypes={vm.enabledTypes} onToggle={vm.toggleType} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Amber warning" />
          <SegmentedControl options={AMBER_SEGMENTS} value={vm.amberThresholdPct} onChange={vm.setAmberThreshold} />
          <AppText variant="bodySm" color="body">
            Speed turns amber at {vm.amberThresholdPct}% of the limit
          </AppText>
        </View>

        <SpeedAlarmSection vm={display} />

        <View style={styles.actions}>
          <AppButton title="Preview alert" onPress={vm.previewAlert} accessibilityLabel="Preview alert" />
          <AppButton
            title="Reset to defaults"
            variant="secondary"
            onPress={vm.reset}
            accessibilityLabel="Reset to defaults"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxxl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  section: { gap: spacing.sm },
  actions: { gap: spacing.md },
});
