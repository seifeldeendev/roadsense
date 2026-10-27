import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type ToggleRowProps = {
  label: string;
  description?: string;
  icon?: ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleRow({ label, description, icon, value, onValueChange }: ToggleRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      className="min-h-touch-lg flex-row items-center gap-md border-hairline py-lg active:bg-canvas-softer"
      style={styles.divider}
    >
      {icon !== undefined && (
        <View className="h-touch w-touch items-center justify-center rounded-full bg-canvas-soft">{icon}</View>
      )}
      <View className="flex-1 gap-xxs">
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
  divider: { borderBottomWidth: StyleSheet.hairlineWidth },
});
