import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { rounded, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const ICON_SIZE = 22;
const LARGE_ICON_SIZE = 28;

type MapFabProps = {
  icon: HazardIconName;
  accessibilityLabel: string;
  onPress: () => void;
  // The emphasised action: larger and filled with the primary colour.
  primary?: boolean;
};

// Round floating control that sits over the map (DESIGN.md button-floating, as an icon).
export function MapFab({ icon, accessibilityLabel, onPress, primary = false }: MapFabProps) {
  const { colors, elevation } = useTheme();
  const size = primary ? touch.large : touch.min;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        elevation.level3,
        { width: size, height: size },
        primary
          ? { backgroundColor: pressed ? colors.primaryPressed : colors.primary }
          : { backgroundColor: pressed ? colors.surfacePressed : colors.canvas },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={primary ? LARGE_ICON_SIZE : ICON_SIZE}
        color={primary ? colors.onPrimary : colors.ink}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
