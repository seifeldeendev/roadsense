import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles } from '@/theme/useTheme';

const COLUMNS = 2;

export type StatTileModel = {
  label: string;
  value: string;
};

type StatTilesProps = {
  tiles: StatTileModel[];
};

export function StatTiles({ tiles }: StatTilesProps) {
  const styles = useThemedStyles(gridStyles, undefined);
  const rows = [];
  for (let i = 0; i < tiles.length; i += COLUMNS) {
    rows.push(tiles.slice(i, i + COLUMNS));
  }
  return (
    <View style={styles.grid}>
      {rows.map((row, index) => (
        <View key={`row-${index}`} style={styles.row}>
          {row.map((tile) => (
            <StatTile key={tile.label} tile={tile} />
          ))}
        </View>
      ))}
    </View>
  );
}

function StatTile({ tile }: { tile: StatTileModel }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`${tile.label}: ${tile.value}`}
      accessibilityRole="text"
      style={[statStyles.tile, { backgroundColor: colors.canvasSoft }]}
    >
      <AppText variant="bodyMdStrong">{tile.value}</AppText>
      <AppText variant="bodySm" color="body" numberOfLines={1}>
        {tile.label}
      </AppText>
    </View>
  );
}

const statStyles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: rounded.xl,
    padding: spacing.md,
    gap: spacing.xxs,
  },
});

function gridStyles() {
  return StyleSheet.create({
    grid: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
  });
}
