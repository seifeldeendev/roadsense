import { ScrollView, View } from 'react-native';
import { Chip, GlassSurface } from '@/components/ui';
import { rounded } from '@/theme/tokens';
import type { MapFilterChipVm, MapFilterKey } from '../viewmodels/useLiveMapViewModel';

type MapFilterBarProps = {
  chips: MapFilterChipVm[];
  onToggle: (key: MapFilterKey) => void;
};

export function MapFilterBar({ chips, onToggle }: MapFilterBarProps) {
  return (
    <View pointerEvents="box-none" className="absolute left-lg right-lg top-md">
      <GlassSurface radius={rounded.xl}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-sm p-sm"
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
      </GlassSurface>
    </View>
  );
}
