import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { elevation, type HazardIconName } from '@/theme/tokens';
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
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`items-center justify-center rounded-full ${
        primary
          ? 'h-touch-lg w-touch-lg bg-primary active:bg-primary-pressed'
          : 'h-touch w-touch bg-canvas active:bg-surface-pressed'
      }`}
      style={elevation.level3}
    >
      <MaterialCommunityIcons
        name={icon}
        size={primary ? LARGE_ICON_SIZE : ICON_SIZE}
        color={primary ? colors.onPrimary : colors.ink}
      />
    </Pressable>
  );
}
