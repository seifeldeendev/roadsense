import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type ToggleRowProps = {
  label: string;
  description?: string;
  icon?: ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleRow({ label, description, icon, value, onValueChange }: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon !== undefined && <View style={styles.icon}>{icon}</View>}
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {description !== undefined && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
        thumbColor={value ? colors.background : colors.muted}
        accessibilityLabel={label}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 56,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 28,
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.size.body,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: typography.size.caption,
    color: colors.muted,
  },
});
