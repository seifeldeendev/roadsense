import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '@/theme/tokens';

type BadgeProps = {
  color: string;
  text: string;
};

export function Badge({ color, text }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: typography.size.caption,
    fontWeight: '700',
    color: '#0B1020',
  },
});
