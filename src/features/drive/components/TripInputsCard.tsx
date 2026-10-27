import { TextInput, View } from 'react-native';
import { AppText, IconButton } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

type TripInputsCardProps = {
  originLabel: string;
  query: string;
  onQueryChange: (text: string) => void;
};

// Pickup and destination stacked like a ride-hailing request: a dot for where you
// are, a square for where you're going, joined by a line. Sits inside the planner's
// glass card, so it has no surface of its own.
export function TripInputsCard({ originLabel, query, onQueryChange }: TripInputsCardProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row gap-md">
      <View className="w-2.5 items-center py-xl">
        <View className="h-2.5 w-2.5 rounded-full bg-ink" />
        <View className="my-xxs w-0.5 flex-1 bg-hairline" />
        <View className="h-2.5 w-2.5 bg-ink" />
      </View>
      <View className="flex-1 gap-sm">
        <View className="min-h-touch justify-center rounded-md bg-canvas-softer px-lg">
          <AppText variant="bodyMd" numberOfLines={1}>
            {originLabel}
          </AppText>
        </View>
        <View className="min-h-touch flex-row items-center rounded-md bg-canvas-soft pl-lg pr-xxs">
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Where to?"
            placeholderTextColor={colors.mute}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search destination"
            className="flex-1 py-sm font-inter text-body-md text-ink"
          />
          {query.length > 0 ? (
            <IconButton icon="close" accessibilityLabel="Clear search" onPress={() => onQueryChange('')} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
