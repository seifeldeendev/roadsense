import { StyleSheet, Text, View } from 'react-native';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { colors, spacing, typography } from '@/theme/tokens';

type SpeedGaugeProps = {
  speedKmh: number;
  status: SpeedStatus;
};

const RING_COLOR: Record<SpeedStatus, string> = {
  ok: colors.ok,
  near: colors.near,
  over: colors.over,
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
    borderRadius: 999,
    borderWidth: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  speed: {
    fontSize: typography.size.display,
    lineHeight: typography.size.display,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    fontSize: typography.size.body,
    color: colors.muted,
    fontWeight: '600',
  },
});
