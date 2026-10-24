import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppText, Card, IconButton, SegmentedControl } from '@/components/ui';
import { rounded, spacing, typography } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
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
  const styles = useThemedStyles(replayStyles, undefined);
  const [trackWidth, setTrackWidth] = useState(0);
  const fillColor = useThemedStyles(fillColour, controls.status);

  return (
    <Card variant="content">
      {controls.tripLabel !== null && (
        <AppText variant="bodySm" color="body">
          {controls.tripLabel}
        </AppText>
      )}
      <View style={styles.readout}>
        <Text
          style={[styles.speedNumber, { color: fillColor }]}
          accessibilityLabel={`Replay speed ${controls.speedKmh} kilometres per hour`}
        >
          {controls.speedKmh}
        </Text>
        <AppText variant="bodyMd" color="body">
          km/h
        </AppText>
      </View>
      <AppText variant="bodySm" color="body">
        {controls.limitKmh > 0 ? `Limit ${controls.limitKmh} km/h` : 'Select a trip to replay'}
      </AppText>

      <Pressable
        style={styles.trackHit}
        accessibilityRole="slider"
        accessibilityLabel="Replay progress"
        accessibilityValue={{ text: `${controls.elapsedLabel} of ${controls.totalLabel}` }}
        onPress={(event) => {
          if (trackWidth === 0) return;
          controls.onSeek(event.nativeEvent.locationX / trackWidth);
        }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { backgroundColor: fillColor, width: `${Math.round(controls.progress * 100)}%` },
            ]}
          />
        </View>
      </Pressable>

      <View style={styles.timeRow}>
        <AppText variant="caption" color="body">
          {controls.elapsedLabel}
        </AppText>
        <AppText variant="caption" color="body">
          {controls.totalLabel}
        </AppText>
      </View>

      <View style={styles.controlsRow}>
        <IconButton
          icon={controls.isPlaying ? 'pause' : 'play'}
          accessibilityLabel={controls.isPlaying ? 'Pause replay' : 'Play replay'}
          onPress={controls.togglePlay}
        />
        <View style={styles.rateControl}>
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
function fillColour(theme: ResolvedTheme, status: 'ok' | 'near' | 'over') {
  return theme.colors.status[status];
}

function replayStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    readout: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
    },
    speedNumber: {
      ...typography.displayLg,
      fontVariant: ['tabular-nums'] as const,
    },
    trackHit: {
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    track: {
      height: spacing.sm,
      borderRadius: rounded.full,
      backgroundColor: theme.colors.canvasSoft,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: rounded.full,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    rateControl: {
      flex: 1,
    },
  });
}
