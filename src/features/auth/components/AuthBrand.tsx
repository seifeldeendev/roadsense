import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function AuthBrand() {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <View style={[styles.circle, { backgroundColor: colors.canvasSoft }]}>
        <MaterialCommunityIcons name="speedometer" size={24} color={colors.ink} />
      </View>
      <AppText variant="bodyMdStrong">RoadSense</AppText>
    </View>
  );
}

type AuthLinkProps = {
  prompt: string;
  label: string;
  onPress: () => void;
};

export function AuthLink({ prompt, label, onPress }: AuthLinkProps) {
  return (
    <View style={styles.linkRow}>
      <AppText variant="bodyMd" color="body">
        {prompt}
      </AppText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        onPress={onPress}
        hitSlop={8}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <AppText variant="bodyMdStrong" style={styles.underline}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
  },
  circle: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.5,
  },
});
