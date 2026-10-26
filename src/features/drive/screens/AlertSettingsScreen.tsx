import { View } from 'react-native';
import { AppButton, AppText, Screen, SectionHeader, SegmentedControl } from '@/components/ui';
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
      <View className="gap-xxxl pb-xl pt-lg">
        <AppText variant="bodyMd" color="body">
          Choose what RoadSense warns you about and how early.
        </AppText>

        <View className="gap-sm">
          <SectionHeader title="Alert distance" />
          <SegmentedControl options={DISTANCE_SEGMENTS} value={vm.alertDistanceM} onChange={vm.setAlertDistance} />
        </View>

        <View className="gap-sm">
          <SectionHeader title="Alert types" />
          {vm.message !== null && <ValidationNote message={vm.message} />}
          <AlertTypeList enabledTypes={vm.enabledTypes} onToggle={vm.toggleType} />
        </View>

        <View className="gap-sm">
          <SectionHeader title="Amber warning" />
          <SegmentedControl options={AMBER_SEGMENTS} value={vm.amberThresholdPct} onChange={vm.setAmberThreshold} />
          <AppText variant="bodySm" color="body">
            Speed turns amber at {vm.amberThresholdPct}% of the limit
          </AppText>
        </View>

        <SpeedAlarmSection vm={display} />

        <View className="gap-md">
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
