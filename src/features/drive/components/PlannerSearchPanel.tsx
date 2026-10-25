import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, IconButton } from '@/components/ui';
import type { Destination } from '@/domain/entities';
import { rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { PlaceSection } from '../viewmodels/useTripPlannerViewModel';
import { TripInputsCard } from './TripInputsCard';

const ICON_CIRCLE = 40;

type PlannerSearchPanelProps = {
  topInset: number;
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
  const { colors } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: colors.canvas, paddingTop: props.topInset + spacing.md }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" accessibilityLabel="Back to map" onPress={props.onBack} />
        <AppText variant="displaySm">Plan your drive</AppText>
      </View>
      <TripInputsCard originLabel={props.originLabel} query={props.query} onQueryChange={props.onQueryChange} />
      <SectionList
        sections={props.sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <PlaceRow icon="map-marker-radius-outline" title="Set location on map" onPress={props.onSetOnMap} />
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="bodySmStrong" color="body" style={styles.sectionTitle}>
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
          <AppText variant="bodyMd" color="body" style={styles.sectionTitle}>
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
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.hairline }, pressed && { backgroundColor: colors.canvasSoft }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.canvasSoft }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
      </View>
      <View style={styles.text}>
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

const styles = StyleSheet.create({
  panel: { ...StyleSheet.absoluteFill, paddingHorizontal: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sectionTitle: { paddingTop: spacing.lg, paddingBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.large,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: spacing.xxs },
});
