import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useTracksViewChanges } from './MarkerCanvas';

const PIN_SIZE = 32;
const PIN_GLYPH_SIZE = 18;

type PinMarkerProps = {
  lat: number;
  lng: number;
  accessibilityLabel: string;
  onPress?: () => void;
};

export function PinMarker({ lat, lng, accessibilityLabel, onPress }: PinMarkerProps) {
  const { colors } = useTheme();
  const tracksViewChanges = useTracksViewChanges(colors.ink);
  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <View
        accessibilityLabel={accessibilityLabel}
        style={[styles.pin, { backgroundColor: colors.ink }]}
      >
        <MaterialCommunityIcons
          name="flag-checkered"
          size={PIN_GLYPH_SIZE}
          color={colors.onPrimary}
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
