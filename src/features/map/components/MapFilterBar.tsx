import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import type { MapFilterChipVm, MapFilterKey } from '../viewmodels/useLiveMapViewModel';

type MapFilterBarProps = {
  chips: MapFilterChipVm[];
  onToggle: (key: MapFilterKey) => void;
};

export function MapFilterBar({ chips, onToggle }: MapFilterBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(filterBarStyles, undefined);
  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={[styles.surface, { backgroundColor: colors.canvas }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              icon={chip.icon}
              selected={chip.selected}
              onPress={() => onToggle(chip.key)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function filterBarStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.lg,
      right: spacing.lg,
    },
    surface: {
      borderRadius: rounded.xl,
      ...theme.elevation.level3,
    },
    row: {
      gap: spacing.sm,
      padding: spacing.sm,
    },
  });
}
