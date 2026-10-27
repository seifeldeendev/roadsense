import { View } from 'react-native';
import { AppText, SectionHeader, SegmentedControl } from '@/components/ui';
import { SPEED_ALARM_OPTIONS } from '@/shared/constants';
import type { DisplaySettingsViewModel, SpeedAlarmChoice } from '../viewmodels/useDisplaySettingsViewModel';

const SPEED_ALARM_SEGMENTS: readonly { label: string; value: SpeedAlarmChoice }[] = [
  { label: 'Off', value: 0 },
  ...SPEED_ALARM_OPTIONS.map((kmh) => ({ label: `${kmh}`, value: kmh })),
];

// Personal over-speed warning, independent of the road limit.
export function SpeedAlarmSection({ vm }: { vm: DisplaySettingsViewModel }) {
  return (
    <View className="gap-sm">
      <SectionHeader title="Speed alarm" />
      <SegmentedControl options={SPEED_ALARM_SEGMENTS} value={vm.speedAlarm} onChange={vm.setSpeedAlarm} />
      <AppText variant="bodySm" color="body">
        {vm.speedAlarm === 0
          ? 'Warns you above a speed you choose, whatever the road limit'
          : `You'll be warned once each time you go above ${vm.speedAlarm} km/h`}
      </AppText>
    </View>
  );
}
