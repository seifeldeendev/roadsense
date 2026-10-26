import { View } from 'react-native';
import { AppText } from '@/components/ui';

const COLUMNS = 2;

export type StatTileModel = {
  label: string;
  value: string;
};

type StatTilesProps = {
  tiles: StatTileModel[];
};

export function StatTiles({ tiles }: StatTilesProps) {
  const rows = [];
  for (let i = 0; i < tiles.length; i += COLUMNS) {
    rows.push(tiles.slice(i, i + COLUMNS));
  }
  return (
    <View className="gap-sm">
      {rows.map((row, index) => (
        <View key={`row-${index}`} className="flex-row gap-sm">
          {row.map((tile) => (
            <StatTile key={tile.label} tile={tile} />
          ))}
        </View>
      ))}
    </View>
  );
}

function StatTile({ tile }: { tile: StatTileModel }) {
  return (
    <View
      accessibilityLabel={`${tile.label}: ${tile.value}`}
      accessibilityRole="text"
      className="flex-1 gap-xxs rounded-xl bg-canvas-soft p-md"
    >
      <AppText variant="bodyMdStrong">{tile.value}</AppText>
      <AppText variant="bodySm" color="body" numberOfLines={1}>
        {tile.label}
      </AppText>
    </View>
  );
}
