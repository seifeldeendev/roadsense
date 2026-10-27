import { StyleSheet, Text, View } from 'react-native';
import { rounded, typography } from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';

type LimitBadgeProps = {
  limitKmh: number | null;
  size?: 'md' | 'sm';
  over?: boolean;
};

export function LimitBadge({ limitKmh, size = 'md', over = false }: LimitBadgeProps) {
  const { colors } = useTheme();
  const dims = size === 'sm' ? styles.small : styles.base;
  return (
    <View
      accessibilityLabel={limitKmh === null ? 'Speed limit unknown' : `Speed limit ${limitKmh}`}
      accessibilityRole="text"
      style={[
        styles.sign,
        dims,
        {
          backgroundColor: colors.canvas,
          borderColor: limitBorder(colors, over),
        },
      ]}
    >
      <Text style={[styles.limit, { color: colors.ink }]} adjustsFontSizeToFit>
        {limitKmh === null ? '–' : limitKmh}
      </Text>
    </View>
  );
}

function limitBorder(colors: ResolvedTheme['colors'], over: boolean): string {
  return over ? colors.status.over : colors.ink;
}

const styles = StyleSheet.create({
  sign: {
    borderRadius: rounded.full,
    borderWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    width: 88,
    height: 88,
  },
  small: {
    width: 56,
    height: 56,
    borderWidth: 5,
  },
  limit: {
    ...typography.displayMd,
    fontVariant: ['tabular-nums'],
  } as const,
});
