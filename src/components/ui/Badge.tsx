import { StyleSheet, Text, View } from 'react-native';
import { colors, rounded, spacing, typography } from '@/theme/tokens';

export type BadgeVariant = 'soft' | 'ink';

type BadgeProps = {
  text: string;
  variant?: BadgeVariant;
  color?: string;
};

export function Badge({ text, variant = 'soft', color }: BadgeProps) {
  const background = color ?? (variant === 'ink' ? colors.ink : colors.canvasSoft);
  const textColor = variant === 'ink' ? colors.onDark : colors.ink;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[typography.bodySmStrong, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    alignSelf: 'flex-start',
  },
});
