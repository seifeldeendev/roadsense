import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type MapBottomBarProps = {
  summaryLine: string;
  onPlanRoute: () => void;
  // Distance from the screen bottom, clearing the floating tab bar.
  bottomInset: number;
};

export function MapBottomBar({ summaryLine, onPlanRoute, bottomInset }: MapBottomBarProps) {
  const styles = useThemedStyles(bottomBarStyles, undefined);
  return (
    <View style={[styles.wrap, { bottom: bottomInset }]}>
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

function bottomBarStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      bottom: spacing.lg,
      left: spacing.lg,
      right: spacing.lg,
    },
  });
}
