import { Pressable, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Card } from '@/components/ui';
import type { Destination } from '@/domain/entities';
import { useTheme } from '@/theme/useTheme';

type RouteSearchCardProps = {
  toValue: string;
  suggestions: Destination[];
  onQueryChange: (text: string) => void;
  chooseDestination: (id: string) => void;
};

export function RouteSearchCard({
  toValue,
  suggestions,
  onQueryChange,
  chooseDestination,
}: RouteSearchCardProps) {
  const { colors } = useTheme();

  return (
    <>
      <Card variant="form">
        <View className="flex-row items-center gap-md rounded-md bg-canvas-soft p-lg">
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.ink} />
          <View className="flex-1 gap-xxs">
            <AppText variant="bodySmStrong" color="body">From</AppText>
            <TextInput
              value="Current location"
              editable={false}
              className="flex-1 font-inter text-body-md text-ink"
              accessibilityLabel="From, current location"
            />
          </View>
        </View>
        <View className="flex-row items-center gap-md rounded-md bg-canvas-soft p-lg">
          <MaterialCommunityIcons name="magnify" size={22} color={colors.ink} />
          <View className="flex-1 gap-xxs">
            <AppText variant="bodySmStrong" color="body">To</AppText>
            <TextInput
              value={toValue}
              onChangeText={onQueryChange}
              placeholder="Where to?"
              placeholderTextColor={colors.mute}
              className="flex-1 font-inter text-body-md text-ink"
              accessibilityLabel="Search destination"
            />
          </View>
        </View>
      </Card>
      {suggestions.map((destination) => (
        <Pressable
          key={destination.id}
          onPress={() => chooseDestination(destination.id)}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${destination.name}`}
          className="flex-row items-center gap-md rounded-md px-sm py-lg active:bg-canvas-soft"
        >
          <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.ink} />
          <View className="flex-1 gap-xxs">
            <AppText variant="bodyMdStrong">{destination.name}</AppText>
            <AppText variant="bodySm" color="body">
              {destination.area}
            </AppText>
          </View>
        </Pressable>
      ))}
    </>
  );
}
