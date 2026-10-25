import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { MapFab } from './MapFab';

type DriveTopBarProps = {
  onGoTo: () => void;
  onOpenSettings: () => void;
};

// "Where to?" search pill and the settings button floating over the map.
export function DriveTopBar({ onGoTo, onOpenSettings }: DriveTopBarProps) {
  const { colors, elevation } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Where to?"
        onPress={onGoTo}
        style={({ pressed }) => [
          styles.search,
          elevation.level3,
          { backgroundColor: pressed ? colors.surfacePressed : colors.canvas },
        ]}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={colors.ink} />
        <AppText variant="bodyMd" color="body">
          Where to?
        </AppText>
      </Pressable>
      <MapFab icon="cog-outline" accessibilityLabel="Alert settings" onPress={onOpenSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  search: {
    flex: 1,
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: rounded.pill,
  },
});
