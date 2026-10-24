import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme/tokens';

type ReportButtonProps = {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
};

export function ReportButton({ icon, label, color, onPress }: ReportButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Report ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { borderColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: touch.large,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: typography.size.caption,
    fontWeight: '700',
    color: colors.text,
  },
});
