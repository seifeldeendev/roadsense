import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, BottomSheet, ToggleRow } from '@/components/ui';
import type { SoundMode } from '@/domain/entities';
import { spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SOUND_OPTIONS: { mode: SoundMode; label: string; icon: HazardIconName }[] = [
  { mode: 'all', label: 'All sounds', icon: 'volume-high' },
  { mode: 'cameras', label: 'Cameras only', icon: 'bell-ring-outline' },
  { mode: 'vibrate', label: 'Vibrate only', icon: 'vibrate' },
  { mode: 'muted', label: 'Muted', icon: 'volume-off' },
];

export function soundModeIcon(mode: SoundMode): HazardIconName {
  return SOUND_OPTIONS.find((option) => option.mode === mode)?.icon ?? 'volume-high';
}

type SoundSheetProps = {
  visible: boolean;
  soundMode: SoundMode;
  onChoose: (mode: SoundMode) => void;
  onClose: () => void;
};

// Radio list of sound modes, shared by the Drive sheet and Alert settings.
export function SoundModeList({ soundMode, onChoose }: { soundMode: SoundMode; onChoose: (mode: SoundMode) => void }) {
  const { colors } = useTheme();
  return (
    <View>
      {SOUND_OPTIONS.map((option) => {
        const selected = option.mode === soundMode;
        return (
          <Pressable
            key={option.mode}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChoose(option.mode)}
            style={[styles.row, { borderBottomColor: colors.hairline }]}
          >
            <MaterialCommunityIcons name={option.icon} size={22} color={colors.ink} />
            <AppText variant="bodyMdStrong" style={styles.label}>
              {option.label}
            </AppText>
            <MaterialCommunityIcons
              name={selected ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={selected ? colors.ink : colors.mute}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function SoundSheet({ visible, soundMode, onChoose, onClose }: SoundSheetProps) {
  return (
    <BottomSheet visible={visible} title="Sound" onClose={onClose}>
      <SoundModeList soundMode={soundMode} onChoose={onChoose} />
    </BottomSheet>
  );
}

type MapOptionsSheetProps = {
  visible: boolean;
  satellite: boolean;
  showTraffic: boolean;
  northUp: boolean;
  onSatellite: (on: boolean) => void;
  onTraffic: (on: boolean) => void;
  onNorthUp: (on: boolean) => void;
  onOpenAppearance: () => void;
  onClose: () => void;
};

export function MapOptionsSheet(props: MapOptionsSheetProps) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={props.visible} title="Map options" onClose={props.onClose}>
      <View>
        <ToggleRow label="Satellite view" value={props.satellite} onValueChange={props.onSatellite} />
        <ToggleRow label="Show traffic" value={props.showTraffic} onValueChange={props.onTraffic} />
        <ToggleRow
          label="Keep north up"
          description="Otherwise the map turns with your direction of travel"
          value={props.northUp}
          onValueChange={props.onNorthUp}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Appearance settings"
          onPress={props.onOpenAppearance}
          style={styles.row}
        >
          <MaterialCommunityIcons name="theme-light-dark" size={22} color={colors.ink} />
          <AppText variant="bodyMdStrong" style={styles.label}>
            Appearance
          </AppText>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.mute} />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.large,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
  },
});
