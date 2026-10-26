import { AppText, GlassSurface } from '@/components/ui';
import type { SpeedStatus } from './speedStatusMeta';

const READOUT_SIZE = 88;

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

// Current speed in a floating glass circle.
export function SpeedReadout({ speedKmh, status }: SpeedReadoutProps) {
  return (
    <GlassSurface
      accessibilityRole="text"
      accessibilityLabel={`Speed ${speedKmh} kilometres per hour`}
      radius={READOUT_SIZE / 2}
      className="h-[88px] w-[88px] items-center justify-center"
    >
      <AppText variant="displayLg" className={`${statusText[status]} tabular-nums`}>
        {speedKmh}
      </AppText>
      <AppText variant="caption" color="body">
        km/h
      </AppText>
    </GlassSurface>
  );
}
