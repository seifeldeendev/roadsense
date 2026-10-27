import { Pressable, SectionList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GlassSurface, IconButton } from '@/components/ui';
import type { Destination } from '@/domain/entities';
import { rounded, spacing, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { PlaceSection } from '../viewmodels/useTripPlannerViewModel';
import { TripInputsCard } from './TripInputsCard';

// The list stops well above the keyboard and leaves the map visible below.
const LIST_HEIGHT_SHARE = 0.42;

type PlannerDropdownProps = {
  topInset: number;
  originLabel: string;
  query: string;
  sections: PlaceSection[];
  onQueryChange: (text: string) => void;
  onChoose: (place: Destination) => void;
  onSetOnMap: () => void;
  onClose: () => void;
};

// "Where to?" opens in place on the home map: the search pill grows into a glass
// card with the trip inputs and places, and tapping the map closes it.
export function PlannerDropdown(props: PlannerDropdownProps) {
  const { height } = useWindowDimensions();
  return (
    <View className="absolute inset-0">
      <Pressable
        className="absolute inset-0"
        accessibilityRole="button"
        accessibilityLabel="Close planner"
        onPress={props.onClose}
      />
      <View pointerEvents="box-none" className="px-lg" style={{ paddingTop: props.topInset + spacing.md }}>
        <GlassSurface radius={rounded.xl} className="gap-md p-lg">
          <View className="flex-row items-center justify-between">
            <AppText variant="bodyMdStrong">Plan your drive</AppText>
            <IconButton icon="close" accessibilityLabel="Back to map" onPress={props.onClose} />
          </View>
          <TripInputsCard originLabel={props.originLabel} query={props.query} onQueryChange={props.onQueryChange} />
          <SectionList
            style={{ maxHeight: height * LIST_HEIGHT_SHARE }}
            sections={props.sections}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={
              <PlaceRow icon="map-marker-radius-outline" title="Set location on map" onPress={props.onSetOnMap} />
            }
            renderSectionHeader={({ section }) => (
              <AppText variant="bodySmStrong" color="body" className="pb-xs pt-lg">
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
        </GlassSurface>
      </View>
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
      className="min-h-touch-lg flex-row items-center gap-md border-hairline py-md active:opacity-70"
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
