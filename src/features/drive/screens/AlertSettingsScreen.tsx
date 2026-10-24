import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  Screen,
  SectionHeader,
  SegmentedControl,
  ToggleRow,
} from '@/components/ui';
import { ALERT_DISTANCE_OPTIONS, AMBER_OPTIONS } from '@/shared/constants';
import { spacing } from '@/theme/tokens';
import { AlertTypeList } from '../components/AlertTypeList';
import { ValidationNote } from '../components/ValidationNote';
import { useAlertSettingsViewModel } from '../viewmodels/useAlertSettingsViewModel';

const DISTANCE_SEGMENTS = ALERT_DISTANCE_OPTIONS.map((value) => ({
  label: `${value} m`,
  value,
}));

const AMBER_SEGMENTS = AMBER_OPTIONS.map((value) => ({
  label: `${value}%`,
  value,
}));

const APPEARANCE_SEGMENTS = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

export default function AlertSettingsScreen() {
  const vm = useAlertSettingsViewModel();

  return (
    <Screen scroll>
      <View style={styles.container}>
        <AppText variant="bodyMd" color="body">
          Camera and hazard warnings for the demo route.
        </AppText>

        <View style={styles.section}>
          <SectionHeader title="Appearance" />
          <SegmentedControl
            options={APPEARANCE_SEGMENTS}
            value={vm.themePreference}
            onChange={vm.setThemePreference}
          />
          <AppText variant="bodySm" color="body">
            System follows your phone&apos;s setting
          </AppText>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Alert distance" />
          <SegmentedControl
            options={DISTANCE_SEGMENTS}
            value={vm.alertDistanceM}
            onChange={vm.setAlertDistance}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Alert types" />
          {vm.message !== null && <ValidationNote message={vm.message} />}
          <AlertTypeList enabledTypes={vm.enabledTypes} onToggle={vm.toggleType} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Sound and voice" />
          <View style={styles.stack}>
            <ToggleRow
              label="Voice alerts"
              value={vm.voiceEnabled}
              onValueChange={vm.setVoiceEnabled}
            />
            <ToggleRow
              label="Alert sound"
              value={vm.soundEnabled}
              onValueChange={vm.setSoundEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Amber warning" />
          <View style={styles.stack}>
            <SegmentedControl
              options={AMBER_SEGMENTS}
              value={vm.amberThresholdPct}
              onChange={vm.setAmberThreshold}
            />
            <AppText variant="bodySm" color="body">
              Speed turns amber at {vm.amberThresholdPct}% of the limit
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          {vm.canTestVoice ? null : (
            <AppText variant="bodySm" color="body" style={styles.helper}>
              Voice alerts are off — turn them on to test
            </AppText>
          )}
          <AppButton
            title="Preview alert"
            onPress={vm.previewAlert}
            accessibilityLabel="Preview alert"
          />
          <AppButton
            title="Test voice"
            variant="subtle"
            onPress={vm.testVoice}
            disabled={!vm.canTestVoice}
            accessibilityLabel="Test voice"
          />
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
  container: {
    gap: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  helper: {
    textAlign: 'center',
  },
});
