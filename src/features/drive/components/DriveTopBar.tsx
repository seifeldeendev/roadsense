import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GlassSurface } from '@/components/ui';
import { rounded } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type DriveTopBarProps = {
  onGoTo: () => void;
};

// "Where to?" glass search pill floating over the map.
export function DriveTopBar({ onGoTo }: DriveTopBarProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-md">
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Where to?"
        onPress={onGoTo}
        className="flex-1 active:opacity-70"
      >
        <GlassSurface radius={rounded.pill} interactive className="min-h-touch flex-row items-center gap-sm px-lg">
          <MaterialCommunityIcons name="magnify" size={22} color={colors.ink} />
          <AppText variant="bodyMd" color="body">
            Where to?
          </AppText>
        </GlassSurface>
      </Pressable>
    </View>
  );
}
