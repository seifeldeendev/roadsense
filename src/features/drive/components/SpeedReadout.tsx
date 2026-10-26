import { View } from 'react-native';
import { AppText } from '@/components/ui';
import { elevation } from '@/theme/tokens';
import type { SpeedStatus } from './speedStatusMeta';

// The number takes the speed-status colour, the one allowed accent.
const statusText: Record<SpeedStatus, string> = {
  ok: 'text-status-ok',
  near: 'text-status-near',
  over: 'text-status-over',
};

type SpeedReadoutProps = {
  speedKmh: number;
  status: SpeedStatus;
};

// Current speed in a floating circle.
export function SpeedReadout({ speedKmh, status }: SpeedReadoutProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Speed ${speedKmh} kilometres per hour`}
      className="h-[88px] w-[88px] items-center justify-center rounded-full bg-canvas"
      style={elevation.level3}
    >
      <AppText variant="displayLg" className={`${statusText[status]} tabular-nums`}>
        {speedKmh}
      </AppText>
      <AppText variant="caption" color="body">
        km/h
      </AppText>
    </View>
  );
}
