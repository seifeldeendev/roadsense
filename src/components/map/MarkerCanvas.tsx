import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const BUBBLE_SIZE = 32;
const BUBBLE_BORDER = 1.5;
const GLYPH_SIZE = 18;
const DIMMED_OPACITY = 0.4;
const TRACKS_FREEZE_MS = 400;

type MarkerCanvasProps = {
  icon: HazardIconName;
  accessibilityLabel: string;
  dimmed?: boolean;
};

export function MarkerCanvas({ icon, accessibilityLabel, dimmed = false }: MarkerCanvasProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.circle,
        {
          backgroundColor: colors.canvas,
          borderColor: colors.ink,
          opacity: dimmed ? DIMMED_OPACITY : 1,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={GLYPH_SIZE} color={colors.ink} />
    </View>
  );
}

// Custom marker views are snapshotted; re-arm tracking briefly whenever the
// drawn content changes (theme, dimming) so the snapshot is refreshed.
export function useTracksViewChanges(redrawKey: string): boolean {
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setTrackedKey(redrawKey), TRACKS_FREEZE_MS);
    return () => clearTimeout(timer);
  }, [redrawKey]);
  return trackedKey !== redrawKey;
}

const styles = StyleSheet.create({
  circle: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: BUBBLE_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
