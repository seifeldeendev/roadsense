import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, IconButton } from '@/components/ui';
import type { Destination } from '@/domain/entities';
import { spacing, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { PlaceSection } from '../viewmodels/useTripPlannerViewModel';
import { TripInputsCard } from './TripInputsCard';

type PlannerSearchPanelProps = {
  topInset: number;
  bottomInset: number;
  originLabel: string;
  query: string;
  sections: PlaceSection[];
  onQueryChange: (text: string) => void;
  onChoose: (place: Destination) => void;
  onSetOnMap: () => void;
  onBack: () => void;
};

// The "Where to?" panel that expands over the map, ride-hailing style.
export function PlannerSearchPanel(props: PlannerSearchPanelProps) {
  return (
    <View className="absolute inset-0 gap-md bg-canvas px-lg" style={{ paddingTop: props.topInset + spacing.md }}>
      <View className="flex-row items-center gap-md">
        <IconButton icon="arrow-left" accessibilityLabel="Back to map" onPress={props.onBack} />
        <AppText variant="displaySm">Plan your drive</AppText>
      </View>
      <TripInputsCard originLabel={props.originLabel} query={props.query} onQueryChange={props.onQueryChange} />
      <SectionList
        sections={props.sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: props.bottomInset }}
        ListHeaderComponent={
          <PlaceRow icon="map-marker-radius-outline" title="Set location on map" onPress={props.onSetOnMap} />
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="bodySmStrong" color="body" className="bg-canvas pb-xs pt-lg">
            {section.title}
          </AppText>
        )}
        renderItem={({ item, section }) => (
          <PlaceRow
            icon={section.kind === 'recent' ? 'clock-outline' : 'map-marker-outline'}
            title={item.name}
            subtitle={item.area}
            trailing={item.distanceLabel}
            accessibilityLabel={`Choose ${item.name}`}
            onPress={() => props.onChoose(item)}
          />
        )}
        ListEmptyComponent={
          <AppText variant="bodyMd" color="body" className="pb-xs pt-lg">
            No places match — try another name
          </AppText>
        }
      />
    </View>
  );
}

type PlaceRowProps = {
  icon: HazardIconName;
  title: string;
  subtitle?: string;
  trailing?: string;
  accessibilityLabel?: string;
  onPress: () => void;
};

function PlaceRow({ icon, title, subtitle, trailing, accessibilityLabel, onPress }: PlaceRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      className="min-h-touch-lg flex-row items-center gap-md border-hairline py-md active:bg-canvas-soft"
      style={divider.bottom}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-canvas-soft">
        <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
      </View>
      <View className="flex-1 gap-xxs">
        <AppText variant="bodyMdStrong" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySm" color="body" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? (
        <AppText variant="bodySm" color="body">
          {trailing}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const divider = StyleSheet.create({
  bottom: { borderBottomWidth: StyleSheet.hairlineWidth },
});
