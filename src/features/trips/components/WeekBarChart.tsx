import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles } from '@/theme/useTheme';
import type { WeekBar } from '../viewmodels/statsReplayFormat';

const CHART_HEIGHT = 96;
const MIN_BAR_HEIGHT = 4;

type WeekBarChartProps = {
  bars: WeekBar[];
};

export function WeekBarChart({ bars }: WeekBarChartProps) {
  const styles = useThemedStyles(chartStyles, undefined);
  const { colors } = useTheme();
  const maxKm = Math.max(...bars.map((bar) => bar.km), 1);
  return (
    <View style={styles.grid}>
      {bars.map((bar) => {
        const height = bar.km === 0 ? 0 : Math.max(MIN_BAR_HEIGHT, Math.round((bar.km / maxKm) * CHART_HEIGHT));
        return (
          <View key={bar.id} style={styles.column}>
            <View style={styles.valueSlot}>
              {bar.isPeak ? (
                <AppText variant="caption" color="body">
                  {`${bar.km.toFixed(1)} km`}
                </AppText>
              ) : null}
            </View>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: colors.ink,
                    borderTopLeftRadius: rounded.md,
                    borderTopRightRadius: rounded.md,
                  },
                ]}
              />
            </View>
            <AppText variant="caption" color="body">
              {bar.initial}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function chartStyles() {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    column: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
    valueSlot: {
      height: 20,
      justifyContent: 'flex-end',
    },
    barArea: {
      height: CHART_HEIGHT,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bar: {
      width: '70%',
      minHeight: 0,
    },
  });
}
