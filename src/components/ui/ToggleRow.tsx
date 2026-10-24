import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { AppText } from './AppText';
import { colors, rounded, spacing, touch } from '@/theme/tokens';

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
      {icon !== undefined && <View style={styles.iconCircle}>{icon}</View>}
      <View style={styles.textBlock}>
        <AppText variant="bodyMdStrong">{label}</AppText>
        {description !== undefined && <AppText variant="bodySm" color="body">{description}</AppText>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.canvasSoft, true: colors.ink }}
        thumbColor={colors.canvas}
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
    paddingVertical: spacing.lg,
    minHeight: touch.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  pressed: {
    backgroundColor: colors.canvasSofter,
  },
  iconCircle: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
