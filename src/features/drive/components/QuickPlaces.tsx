import { Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GlassSurface } from '@/components/ui';
import type { Destination } from '@/domain/entities';
import { rounded } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { PlaceItem } from '../viewmodels/useTripPlannerViewModel';

type QuickPlacesProps = {
  places: PlaceItem[];
  onChoose: (place: Destination) => void;
};

// One-tap destinations under the "Where to?" pill, like a ride-hailing home screen.
export function QuickPlaces({ places, onChoose }: QuickPlacesProps) {
  const { colors } = useTheme();
  if (places.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
      {places.map((place) => (
        <Pressable
          key={place.id}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${place.name}`}
          onPress={() => onChoose(place)}
          className="active:opacity-70"
        >
          <GlassSurface radius={rounded.pill} interactive className="min-h-touch flex-row items-center gap-xs px-lg">
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.ink} />
            <AppText variant="bodySmStrong" numberOfLines={1}>
              {place.name}
            </AppText>
          </GlassSurface>
        </Pressable>
      ))}
    </ScrollView>
  );
}
