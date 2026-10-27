import { Text, View } from 'react-native';

type LimitBadgeProps = {
  limitKmh: number | null;
  size?: 'md' | 'sm';
  over?: boolean;
};

// Round speed-limit sign; the ring turns to the over-limit status colour.
export function LimitBadge({ limitKmh, size = 'md', over = false }: LimitBadgeProps) {
  const dims = size === 'sm' ? 'h-14 w-14 border-[5px]' : 'h-[88px] w-[88px] border-[7px]';
  return (
    <View
      accessibilityLabel={limitKmh === null ? 'Speed limit unknown' : `Speed limit ${limitKmh}`}
      accessibilityRole="text"
      className={`items-center justify-center rounded-full bg-canvas ${dims} ${over ? 'border-status-over' : 'border-ink'}`}
    >
      <Text className="font-inter-bold text-display-md tabular-nums text-ink" adjustsFontSizeToFit>
        {limitKmh === null ? '–' : limitKmh}
      </Text>
    </View>
  );
}
