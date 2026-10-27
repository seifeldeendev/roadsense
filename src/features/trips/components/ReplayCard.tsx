import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppButton, AppText, Card, IconButton, SegmentedControl } from '@/components/ui';
import type { ReplayControls } from '../viewmodels/useStatsReplayViewModel';

type ReplayRate = 1 | 2 | 4;

const replayRateOptions: readonly { label: string; value: ReplayRate }[] = [
  { label: '\u00d71', value: 1 },
  { label: '\u00d72', value: 2 },
  { label: '\u00d74', value: 4 },
];

type ReplayCardProps = {
  controls: ReplayControls;
};

export function ReplayCard({ controls }: ReplayCardProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const status = statusClass[controls.status];

  return (
    <Card variant="content">
      {controls.tripLabel !== null && (
        <AppText variant="bodySm" color="body">
          {controls.tripLabel}
        </AppText>
      )}
      <View className="flex-row items-baseline gap-xs" accessibilityLabel={`Replay speed ${controls.speedKmh} kilometres per hour`}>
        <AppText variant="displayLg" className={`${status.text} tabular-nums`}>
          {controls.speedKmh}
        </AppText>
        <AppText variant="bodyMd" color="body">
          km/h
        </AppText>
      </View>
      <AppText variant="bodySm" color="body">
        {controls.limitKmh > 0 ? `Limit ${controls.limitKmh} km/h` : 'Select a trip to replay'}
      </AppText>

      <Pressable
        className="mt-sm py-sm"
        accessibilityRole="slider"
        accessibilityLabel="Replay progress"
        accessibilityValue={{ text: `${controls.elapsedLabel} of ${controls.totalLabel}` }}
        onPress={(event) => {
          if (trackWidth === 0) return;
          controls.onSeek(event.nativeEvent.locationX / trackWidth);
        }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View className="h-sm overflow-hidden rounded-full bg-canvas-soft">
          <View
            className={`h-full rounded-full ${status.bg}`}
            style={{ width: `${Math.round(controls.progress * 100)}%` }}
          />
        </View>
      </Pressable>

      <View className="flex-row justify-between">
        <AppText variant="caption" color="body">
          {controls.elapsedLabel}
        </AppText>
        <AppText variant="caption" color="body">
          {controls.totalLabel}
        </AppText>
      </View>

      <View className="my-md flex-row items-center gap-md">
        <IconButton
          icon={controls.isPlaying ? 'pause' : 'play'}
          accessibilityLabel={controls.isPlaying ? 'Pause replay' : 'Play replay'}
          onPress={controls.togglePlay}
        />
        <View className="flex-1">
          <SegmentedControl
            options={replayRateOptions}
            value={controls.rate}
            onChange={controls.setRate}
          />
        </View>
      </View>

      <AppButton
        title="Replay in Drive Mode"
        variant="secondary"
        onPress={controls.replayInDrive}
        disabled={!controls.canReplayInDrive}
        accessibilityLabel="Replay in Drive Mode"
      />
    </Card>
  );
}

// The readout and progress fill take the speed status colour — the one allowed
// non-grayscale accent on this screen.
const statusClass = {
  ok: { text: 'text-status-ok', bg: 'bg-status-ok' },
  near: { text: 'text-status-near', bg: 'bg-status-near' },
  over: { text: 'text-status-over', bg: 'bg-status-over' },
} as const;
