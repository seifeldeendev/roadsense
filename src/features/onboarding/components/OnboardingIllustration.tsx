import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { rounded, spacing, type HazardIconName } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type OnboardingIllustrationProps = {
  icons: [HazardIconName, HazardIconName];
  style?: StyleProp<ViewStyle>;
};

export function OnboardingIllustration({ icons, style }: OnboardingIllustrationProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(illustrationStyles, undefined);
  const [primary, secondary] = icons;

  return (
    <View style={[styles.frame, style]}>
      <View style={styles.stage}>
        <View style={[styles.circle, styles.primaryCircle, { backgroundColor: colors.canvas }]}>
          <MaterialCommunityIcons name={primary} size={44} color={colors.ink} />
        </View>
        <View
          style={[
            styles.circle,
            styles.secondaryCircle,
            { backgroundColor: colors.canvas },
          ]}
        >
          <MaterialCommunityIcons name={secondary} size={36} color={colors.ink} />
        </View>
      </View>
    </View>
  );
}

function illustrationStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    frame: {
      backgroundColor: theme.colors.canvasSoft,
      borderRadius: rounded.xl,
      aspectRatio: 4 / 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stage: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
    },
    circle: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: rounded.full,
    },
    primaryCircle: {
      width: 108,
      height: 108,
    },
    secondaryCircle: {
      width: 88,
      height: 88,
      marginTop: spacing.xxl,
    },
  });
}
