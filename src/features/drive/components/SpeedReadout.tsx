import { StyleSheet, Text, View } from 'react-native';
import { AppText } from '@/components/ui';
import { rounded, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { SpeedStatus } from './speedStatusMeta';

const READOUT_SIZE = 88;

type SpeedReadoutProps = {
  speedKmh: number;
  status: SpeedStatus;
};

// Current speed in a floating circle; the number takes the speed-status colour.
export function SpeedReadout({ speedKmh, status }: SpeedReadoutProps) {
  const { colors, elevation } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Speed ${speedKmh} kilometres per hour`}
      style={[styles.circle, elevation.level3, { backgroundColor: colors.canvas }]}
    >
      <Text style={[styles.speed, { color: colors.status[status] }]}>{speedKmh}</Text>
      <AppText variant="caption" color="body">
        km/h
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: READOUT_SIZE,
    height: READOUT_SIZE,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speed: {
    ...typography.displayLg,
    fontVariant: ['tabular-nums'],
  },
});
