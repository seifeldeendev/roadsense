import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type VoteBarProps = {
  confirmations: number;
  denials: number;
};

const MIN_TOTAL = 1;
const BAR_HEIGHT = 28;

export function VoteBar({ confirmations, denials }: VoteBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(voteBarStyles, undefined);
  const total = Math.max(confirmations + denials, MIN_TOTAL);
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${confirmations} confirmations, ${denials} denials`}
      style={styles.bar}
    >
      <View style={[styles.segment, { flex: (confirmations / total) * 10, backgroundColor: colors.ink }]}>
        {confirmations > 0 ? <AppText variant="caption" color="onInverse">{confirmations}</AppText> : null}
      </View>
      <View style={[styles.segment, { flex: (denials / total) * 10, backgroundColor: colors.mute }]}>
        {denials > 0 ? <AppText variant="caption" color="inverse">{denials}</AppText> : null}
      </View>
    </View>
  );
}

function voteBarStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      height: BAR_HEIGHT,
      borderRadius: rounded.pill,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.hairline,
    },
    segment: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
    },
  });
}
