import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useTracksViewChanges } from './MarkerCanvas';

const USER_BUBBLE_SIZE = 36;
const USER_GLYPH_SIZE = 22;

type UserMarkerProps = {
  lat: number;
  lng: number;
  heading: number;
};

export function UserMarker({ lat, lng, heading }: UserMarkerProps) {
  const { colors, scheme } = useTheme();
  const tracksViewChanges = useTracksViewChanges(scheme);
  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      flat
      rotation={heading}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View
        accessibilityLabel="Your position"
        style={[styles.circle, { backgroundColor: colors.ink }]}
      >
        <MaterialCommunityIcons
          name="navigation"
          size={USER_GLYPH_SIZE}
          color={colors.onPrimary}
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: USER_BUBBLE_SIZE,
    height: USER_BUBBLE_SIZE,
    borderRadius: USER_BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
