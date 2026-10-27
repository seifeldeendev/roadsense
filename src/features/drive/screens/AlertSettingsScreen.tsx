import { StyleSheet, Text, View } from 'react-native';
import {
  AppButton,
  Screen,
  SectionHeader,
  SegmentedControl,
  ToggleRow,
} from '@/components/ui';
import type { AlertTarget } from '@/domain/entities';
import { ALERT_DISTANCE_OPTIONS, AMBER_OPTIONS } from '@/shared/constants';
import { colors, hazardMeta, spacing, typography } from '@/theme/tokens';
import { useAlertSettingsViewModel } from '../viewmodels/useAlertSettingsViewModel';

const DISTANCE_SEGMENTS = ALERT_DISTANCE_OPTIONS.map((value) => ({
  label: `${value} m`,
  value,
}));

const AMBER_SEGMENTS = AMBER_OPTIONS.map((value) => ({
  label: `${value}%`,
  value,
}));

const TYPE_ROWS: { type: AlertTarget; label: string }[] = [
  { type: 'camera', label: 'Speed cameras' },
  { type: 'accident', label: 'Accidents' },
  { type: 'pothole', label: 'Potholes' },
  { type: 'checkpoint', label: 'Checkpoints' },
  { type: 'flooding', label: 'Flooding' },
];

export default function AlertSettingsScreen() {
  const vm = useAlertSettingsViewModel();

  return (
    <Screen scroll>
      <View style={styles.container}>
        <SectionHeader title="Alert distance" />
        <SegmentedControl
          options={DISTANCE_SEGMENTS}
          value={vm.alertDistanceM}
          onChange={vm.setAlertDistance}
        />

        <SectionHeader title="Alert types" subtitle={vm.message ?? undefined} />
        <View style={styles.stack}>
          {TYPE_ROWS.map(({ type, label }) => {
            const meta = type === 'camera' ? hazardMeta.camera : hazardMeta[type];
            return (
              <ToggleRow
                key={type}
                label={label}
                value={vm.enabledTypes.includes(type)}
                icon={<Text style={styles.typeIcon}>{meta.icon}</Text>}
                onValueChange={() => vm.toggleType(type)}
              />
            );
          })}
        </View>

        <SectionHeader title="Sound & voice" />
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

        <SectionHeader title="Amber warning" subtitle={`Speed turns amber at ${vm.amberThresholdPct}% of the limit`} />
        <SegmentedControl
          options={AMBER_SEGMENTS}
          value={vm.amberThresholdPct}
          onChange={vm.setAmberThreshold}
        />

        <View style={styles.stack}>
          {vm.canTestVoice ? null : (
            <Text style={styles.helper}>Voice alerts are off — turn them on to test</Text>
          )}
          <AppButton
            title="Test voice"
            variant="secondary"
            onPress={vm.testVoice}
            disabled={!vm.canTestVoice}
            accessibilityLabel="Test voice"
          />
          <AppButton
            title="Preview alert"
            onPress={vm.previewAlert}
            accessibilityLabel="Preview alert"
          />
          <AppButton
            title="Reset to defaults"
            variant="ghost"
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
    gap: spacing.lg,
    padding: spacing.md,
  },
  stack: {
    gap: spacing.sm,
  },
  typeIcon: {
    fontSize: 20,
  },
  helper: {
    fontSize: typography.size.caption,
    color: colors.muted,
    textAlign: 'center',
  },
});
