import { StyleSheet, Text, View } from 'react-native';
import { colors, rounded, typography } from '@/theme/tokens';

type LimitBadgeProps = {
  limitKmh: number | null;
  size?: 'md' | 'sm';
  over?: boolean;
};

export function LimitBadge({ limitKmh, size = 'md', over = false }: LimitBadgeProps) {
  const dims = size === 'sm' ? styles.small : styles.base;
  return (
    <View
      accessibilityLabel={limitKmh === null ? 'Speed limit unknown' : `Speed limit ${limitKmh}`}
      accessibilityRole="text"
      style={[styles.sign, dims, { borderColor: over ? colors.status.over : colors.ink }]}
    >
      <Text style={[styles.limit, size === 'sm' && styles.limitSmall]} adjustsFontSizeToFit>
        {limitKmh === null ? '–' : limitKmh}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sign: {
    borderRadius: rounded.pill,
    backgroundColor: colors.canvas,
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
    ...typography.displayLg,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  limitSmall: {
    ...typography.displayMd,
  },
});
