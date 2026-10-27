import { View } from 'react-native';
import { AppText } from '@/components/ui';
import type { WeekBar } from '../viewmodels/statsReplayFormat';

const CHART_HEIGHT = 96;
const MIN_BAR_HEIGHT = 4;

type WeekBarChartProps = {
  bars: WeekBar[];
};

export function WeekBarChart({ bars }: WeekBarChartProps) {
  const maxKm = Math.max(...bars.map((bar) => bar.km), 1);
  return (
    <View className="flex-row gap-sm">
      {bars.map((bar) => {
        const height = bar.km === 0 ? 0 : Math.max(MIN_BAR_HEIGHT, Math.round((bar.km / maxKm) * CHART_HEIGHT));
        return (
          <View key={bar.id} className="flex-1 items-center gap-xs">
            <View className="h-5 justify-end">
              {bar.isPeak ? (
                <AppText variant="caption" color="body">
                  {`${bar.km.toFixed(1)} km`}
                </AppText>
              ) : null}
            </View>
            <View className="w-full items-center justify-end" style={{ height: CHART_HEIGHT }}>
              <View className="w-[70%] rounded-t-md bg-ink" style={{ height }} />
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
