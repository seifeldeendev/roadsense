import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { typography, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: HazardIconName;
};

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`min-h-touch flex-row items-center justify-center gap-sm rounded-pill px-lg py-sm ${
        selected ? 'bg-primary' : 'bg-canvas-soft active:bg-surface-pressed'
      }`}
    >
      {icon !== undefined && (
        <MaterialCommunityIcons
          name={icon}
          size={typography.bodySmStrong.fontSize}
          color={selected ? colors.onPrimary : colors.ink}
        />
      )}
      <AppText variant="bodySmStrong" color={selected ? 'onPrimary' : 'ink'} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}
