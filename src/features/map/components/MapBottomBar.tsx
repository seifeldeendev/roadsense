import { View } from 'react-native';
import { AppButton, AppText, Card } from '@/components/ui';

type MapBottomBarProps = {
  summaryLine: string;
  onPlanRoute: () => void;
  // Distance from the screen bottom, clearing the floating tab bar.
  bottomInset: number;
};

export function MapBottomBar({ summaryLine, onPlanRoute, bottomInset }: MapBottomBarProps) {
  return (
    <View className="absolute left-lg right-lg" style={{ bottom: bottomInset }}>
      <Card variant="form">
        <AppText variant="bodyMdStrong">{summaryLine}</AppText>
        <AppButton
          title="Plan a route"
          onPress={onPlanRoute}
          accessibilityLabel="Plan a route"
        />
      </Card>
    </View>
  );
}
