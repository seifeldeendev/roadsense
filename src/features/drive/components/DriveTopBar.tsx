import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { elevation } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type DriveTopBarProps = {
  onGoTo: () => void;
};

// "Where to?" search pill floating over the map.
export function DriveTopBar({ onGoTo }: DriveTopBarProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-md">
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Where to?"
        onPress={onGoTo}
        className="min-h-touch flex-1 flex-row items-center gap-sm rounded-pill bg-canvas px-lg active:bg-surface-pressed"
        style={elevation.level3}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={colors.ink} />
        <AppText variant="bodyMd" color="body">
          Where to?
        </AppText>
      </Pressable>
    </View>
  );
}
