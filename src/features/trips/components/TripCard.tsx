import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Badge, Card } from '@/components/ui';
import type { Trip } from '@/domain/entities';
import { formatDistance, formatDuration } from '@/shared/format';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { tripTimeRange } from '../viewmodels/tripFormat';

const CHEVRON_GLYPH_SIZE = 24;

type TripCardProps = {
  trip: Trip;
  onPress: () => void;
};

export function TripCard({ trip, onPress }: TripCardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={cardLabel(trip)}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card variant="soft">
          <View style={styles.row}>
            <View style={styles.main}>
              <AppText variant="bodyMdStrong">{tripTimeRange(trip)}</AppText>
              <AppText variant="bodySm" color="body">
                {`${formatDistance(trip.distanceM)} · ${formatDuration(trip.durationS)}`}
              </AppText>
            </View>
            <View style={styles.side}>
              <AppText variant="bodySm" color="body">
                {`${trip.maxSpeedKmh} km/h max`}
              </AppText>
              <OverLimitBadge trip={trip} />
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={CHEVRON_GLYPH_SIZE}
              color={colors.mute}
            />
          </View>
        </Card>
      </Pressable>
  );
}

function OverLimitBadge({ trip }: { trip: Trip }) {
  const badge = trip.overLimitCount > 0
    ? { text: `${trip.overLimitCount} over limit`, variant: 'ink' as const }
    : { text: 'Within limit', variant: 'soft' as const };
  return <Badge text={badge.text} variant={badge.variant} />;
}

function cardLabel(trip: Trip): string {
  const over =
    trip.overLimitCount > 0
      ? `${trip.overLimitCount} over limit`
      : 'within limit';
  return `Open trip ${tripTimeRange(trip)}, ${formatDistance(trip.distanceM)}, ${over}`;
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  main: {
    flex: 1,
    gap: spacing.xxs,
  },
  side: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
});
