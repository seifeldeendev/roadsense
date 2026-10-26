import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, BottomSheet, RadioList, ToggleRow } from '@/components/ui';
import type { SoundMode } from '@/domain/entities';
import type { HazardIconName } from '@/theme/tokens';
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

// Radio list of sound modes for the Drive sheet.
export function SoundModeList({ soundMode, onChoose }: { soundMode: SoundMode; onChoose: (mode: SoundMode) => void }) {
  return <RadioList options={SOUND_OPTIONS.map(({ mode, label, icon }) => ({ value: mode, label, icon }))} value={soundMode} onChange={onChoose} />;
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
          className="min-h-touch-lg flex-row items-center gap-md border-hairline py-lg active:bg-canvas-soft"
          style={divider.bottom}
        >
          <MaterialCommunityIcons name="theme-light-dark" size={22} color={colors.ink} />
          <AppText variant="bodyMdStrong" className="flex-1">
            Appearance
          </AppText>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.mute} />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const divider = StyleSheet.create({
  bottom: { borderBottomWidth: StyleSheet.hairlineWidth },
});
