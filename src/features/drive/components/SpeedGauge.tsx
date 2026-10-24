import { StyleSheet, Text, View } from 'react-native';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { colors, rounded, spacing, typography } from '@/theme/tokens';

type SpeedGaugeProps = {
  speedKmh: number;
  status: SpeedStatus;
};

const RING_COLOR: Record<SpeedStatus, string> = {
  ok: colors.status.ok,
  near: colors.status.near,
  over: colors.status.over,
};

export function SpeedGauge({ speedKmh, status }: SpeedGaugeProps) {
  return (
    <View
      accessibilityLabel={`Speed ${speedKmh} kilometres per hour`}
      accessibilityRole="text"
      style={[styles.gauge, { borderColor: RING_COLOR[status] }]}
    >
      <Text style={styles.speed} adjustsFontSizeToFit>
        {speedKmh}
      </Text>
      <Text style={styles.caption}>km/h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gauge: {
    width: 168,
    height: 168,
    borderRadius: rounded.pill,
    borderWidth: 10,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  speed: {
    ...typography.displayLg,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    ...typography.bodySm,
    color: colors.body,
  },
});
