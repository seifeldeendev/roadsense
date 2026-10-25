import { StyleSheet, TextInput, View } from 'react-native';
import { AppText, IconButton } from '@/components/ui';
import { rounded, spacing, touch, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const MARKER_SIZE = 10;
const CONNECTOR_WIDTH = 2;

type TripInputsCardProps = {
  originLabel: string;
  query: string;
  onQueryChange: (text: string) => void;
};

// Pickup and destination stacked like a ride-hailing request: a dot for where you
// are, a square for where you're going, joined by a line.
export function TripInputsCard({ originLabel, query, onQueryChange }: TripInputsCardProps) {
  const { colors, elevation } = useTheme();
  return (
    <View style={[styles.card, elevation.level2, { backgroundColor: colors.canvas }]}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: colors.ink }]} />
        <View style={[styles.connector, { backgroundColor: colors.hairline }]} />
        <View style={[styles.square, { backgroundColor: colors.ink }]} />
      </View>
      <View style={styles.fields}>
        <View style={[styles.field, { backgroundColor: colors.canvasSofter }]}>
          <AppText variant="bodyMd" numberOfLines={1}>
            {originLabel}
          </AppText>
        </View>
        <View style={[styles.field, styles.inputRow, { backgroundColor: colors.canvasSoft }]}>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Where to?"
            placeholderTextColor={colors.mute}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search destination"
            style={[styles.input, { color: colors.ink }]}
          />
          {query.length > 0 ? (
            <IconButton icon="close" accessibilityLabel="Clear search" onPress={() => onQueryChange('')} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: rounded.xl },
  rail: { alignItems: 'center', paddingVertical: spacing.xl, width: MARKER_SIZE },
  dot: { width: MARKER_SIZE, height: MARKER_SIZE, borderRadius: rounded.full },
  connector: { flex: 1, width: CONNECTOR_WIDTH, marginVertical: spacing.xxs },
  square: { width: MARKER_SIZE, height: MARKER_SIZE },
  fields: { flex: 1, gap: spacing.sm },
  field: { minHeight: touch.min, borderRadius: rounded.md, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.xxs },
  input: { ...typography.bodyMd, flex: 1, paddingVertical: spacing.sm },
});
