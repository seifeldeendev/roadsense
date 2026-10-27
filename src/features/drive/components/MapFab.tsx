import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassSurface } from '@/components/ui';
import { elevation, touch, type HazardIconName } from '@/theme/tokens';
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

// Round floating control over the map (DESIGN.md button-floating, as an icon): glass,
// except the primary action, which stays a solid black/white disc.
export function MapFab({ icon, accessibilityLabel, onPress, primary = false }: MapFabProps) {
  const { colors } = useTheme();
  if (primary) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className="h-touch-lg w-touch-lg items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
        style={elevation.level3}
      >
        <MaterialCommunityIcons name={icon} size={LARGE_ICON_SIZE} color={colors.onPrimary} />
      </Pressable>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} className="active:opacity-70">
      <GlassSurface radius={touch.min / 2} interactive className="h-touch w-touch items-center justify-center">
        <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={colors.ink} />
      </GlassSurface>
    </Pressable>
  );
}
