import { StyleSheet, Text, View } from 'react-native';
import { rounded, spacing, typography } from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';
import type { SpeedStatus } from './speedStatusMeta';

type SpeedGaugeProps = {
  speedKmh: number;
  status: SpeedStatus;
};

export function SpeedGauge({ speedKmh, status }: SpeedGaugeProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`Speed ${speedKmh} kilometres per hour`}
      accessibilityRole="text"
      style={[
        styles.gauge,
        { backgroundColor: colors.canvas, borderColor: gaugeBorder(colors, status) },
      ]}
    >
      <Text style={[styles.speed, { color: colors.ink }]} adjustsFontSizeToFit>
        {speedKmh}
      </Text>
      <Text style={[styles.caption, { color: colors.body }]}>km/h</Text>
    </View>
  );
}

function gaugeBorder(colors: ResolvedTheme['colors'], status: SpeedStatus): string {
  return colors.status[status];
}

const styles = StyleSheet.create({
  gauge: {
    width: 168,
    height: 168,
    borderRadius: rounded.full,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  speed: {
    ...typography.displayXxl,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    ...typography.bodySm,
  },
});
