import { StyleSheet, Text, View } from 'react-native';
import { colors, rounded, spacing, typography } from '@/theme/tokens';
import { STATUS_COLOR, type SpeedStatus } from './speedStatusMeta';

type SpeedGaugeProps = {
  speedKmh: number;
  status: SpeedStatus;
};

export function SpeedGauge({ speedKmh, status }: SpeedGaugeProps) {
  return (
    <View
      accessibilityLabel={`Speed ${speedKmh} kilometres per hour`}
      accessibilityRole="text"
      style={[styles.gauge, { borderColor: STATUS_COLOR[status] }]}
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
    borderRadius: rounded.full,
    borderWidth: 10,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  speed: {
    ...typography.displayXxl,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    ...typography.bodySm,
    color: colors.body,
  },
});
