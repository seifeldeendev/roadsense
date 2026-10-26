import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Card } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { MapFab } from './MapFab';

const PIN_SIZE = 44;

type PinPickerOverlayProps = {
  topInset: number;
  bottomInset: number;
  label: string;
  onBack: () => void;
  onConfirm: () => void;
};

// Fixed pin in the middle of the live map: the driver pans the map under it.
export function PinPickerOverlay({ topInset, bottomInset, label, onBack, onConfirm }: PinPickerOverlayProps) {
  const { colors } = useTheme();
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View pointerEvents="box-none" style={[styles.top, { paddingTop: topInset + spacing.md }]}>
        <MapFab icon="arrow-left" accessibilityLabel="Back to search" onPress={onBack} />
      </View>
      {/* The pin tip marks the centre, so the icon sits just above it. */}
      <View pointerEvents="none" style={styles.centre}>
        <MaterialCommunityIcons name="map-marker" size={PIN_SIZE} color={colors.ink} style={styles.pin} />
      </View>
      <View pointerEvents="box-none" style={[styles.bottom, { bottom: bottomInset + spacing.md }]}>
        <Card variant="form">
          <View style={styles.copy}>
            <AppText variant="bodySm" color="body">
              Move the map to set your destination
            </AppText>
            <AppText variant="displaySm" numberOfLines={1}>
              {label}
            </AppText>
          </View>
          <AppButton title="Confirm destination" variant="large" onPress={onConfirm} accessibilityLabel="Confirm destination" />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: spacing.lg },
  centre: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  pin: { marginBottom: PIN_SIZE },
  bottom: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg },
  copy: { gap: spacing.xxs, marginBottom: spacing.md },
});
