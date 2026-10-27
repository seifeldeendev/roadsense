import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/theme/tokens';

type LimitBadgeProps = {
  limitKmh: number | null;
  size?: 'md' | 'sm';
};

export function LimitBadge({ limitKmh, size = 'md' }: LimitBadgeProps) {
  const dims = size === 'sm' ? styles.small : styles.base;
  return (
    <View
      accessibilityLabel={limitKmh === null ? 'Speed limit unknown' : `Speed limit ${limitKmh}`}
      accessibilityRole="text"
      style={[styles.sign, dims]}
    >
      <Text style={[styles.limit, size === 'sm' && styles.limitSmall]} adjustsFontSizeToFit>
        {limitKmh === null ? '–' : limitKmh}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sign: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 7,
    borderColor: colors.over,
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
    fontSize: typography.size.heading,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  limitSmall: {
    fontSize: typography.size.title,
  },
});
