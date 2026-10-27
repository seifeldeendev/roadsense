import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type ToggleRowProps = {
  label: string;
  description?: string;
  icon?: ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleRow({ label, description, icon, value, onValueChange }: ToggleRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(toggleRowStyles, undefined);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.row,
        pressed && pressedRow(colors),
      ]}
    >
      {icon !== undefined && (
        <View style={[styles.iconCircle, { backgroundColor: colors.canvasSoft }]}>{icon}</View>
      )}
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

function toggleRowStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.lg,
      minHeight: touch.large,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.hairline,
    },
    iconCircle: {
      width: touch.min,
      height: touch.min,
      borderRadius: rounded.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
      gap: spacing.xxs,
    },
  });
}

function pressedRow(colors: ResolvedTheme['colors']): ViewStyle {
  return { backgroundColor: colors.canvasSofter };
}
