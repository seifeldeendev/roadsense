import { ScrollView, View } from 'react-native';
import { Chip } from '@/components/ui';
import { elevation } from '@/theme/tokens';
import type { MapFilterChipVm, MapFilterKey } from '../viewmodels/useLiveMapViewModel';

type MapFilterBarProps = {
  chips: MapFilterChipVm[];
  onToggle: (key: MapFilterKey) => void;
};

export function MapFilterBar({ chips, onToggle }: MapFilterBarProps) {
  return (
    <View pointerEvents="box-none" className="absolute left-lg right-lg top-md">
      <View className="rounded-xl bg-canvas" style={elevation.level3}>
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
      </View>
    </View>
  );
}
