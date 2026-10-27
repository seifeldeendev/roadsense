import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import type { Destination } from '@/domain/entities';
import { rounded, spacing, typography } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

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
  const styles = useThemedStyles(searchCardStyles, undefined);

  return (
    <>
      <Card variant="form">
        <View style={[styles.row, { backgroundColor: colors.canvasSoft }]}>
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.ink} />
          <View style={styles.field}>
            <Text style={[typography.bodySmStrong, { color: colors.body }]}>From</Text>
            <TextInput
              value="Current location"
              editable={false}
              style={[styles.value, { color: colors.ink }]}
              accessibilityLabel="From, current location"
            />
          </View>
        </View>
        <View style={[styles.row, { backgroundColor: colors.canvasSoft }]}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.ink} />
          <View style={styles.field}>
            <Text style={[typography.bodySmStrong, { color: colors.body }]}>To</Text>
            <TextInput
              value={toValue}
              onChangeText={onQueryChange}
              placeholder="Where to?"
              placeholderTextColor={colors.mute}
              style={[styles.value, { color: colors.ink }]}
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
          style={({ pressed }) => [
            styles.suggestion,
            pressed && { backgroundColor: colors.canvasSoft },
          ]}
        >
          <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.ink} />
          <View style={styles.field}>
            <Text style={[typography.bodyMdStrong, { color: colors.ink }]}>
              {destination.name}
            </Text>
            <Text style={[typography.bodySm, { color: colors.body }]}>{destination.area}</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

function searchCardStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderRadius: rounded.md,
      padding: spacing.lg,
    },
    value: {
      flex: 1,
      ...typography.bodyMd,
    },
    field: {
      flex: 1,
      gap: spacing.xxs,
    },
    suggestion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
  });
}
