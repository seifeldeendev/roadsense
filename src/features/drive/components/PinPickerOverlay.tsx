import { View } from 'react-native';
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
    <View pointerEvents="box-none" className="absolute inset-0">
      <View pointerEvents="box-none" className="absolute left-lg top-0" style={{ paddingTop: topInset + spacing.md }}>
        <MapFab icon="arrow-left" accessibilityLabel="Back to search" onPress={onBack} />
      </View>
      {/* The pin tip marks the centre, so the icon sits just above it. */}
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <MaterialCommunityIcons name="map-marker" size={PIN_SIZE} color={colors.ink} style={{ marginBottom: PIN_SIZE }} />
      </View>
      <View pointerEvents="box-none" className="absolute left-lg right-lg" style={{ bottom: bottomInset + spacing.md }}>
        <Card variant="form">
          <View className="mb-md gap-xxs">
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
