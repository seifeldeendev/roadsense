import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type StillThereSectionProps = {
  hasVoted: boolean;
  reportedLine: string;
  onVote: (stillThere: boolean) => void;
};

// Community confirmation: round thumbs-up / thumbs-down votes under the alert.
export function StillThereSection({ hasVoted, reportedLine, onVote }: StillThereSectionProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { borderTopColor: colors.hairline }]}>
      <View style={styles.header}>
        <AppText variant="bodyMdStrong">Still there?</AppText>
        <AppText variant="caption" color="body" numberOfLines={1}>
          {reportedLine}
        </AppText>
      </View>
      {hasVoted ? (
        <View style={styles.thanks}>
          <MaterialCommunityIcons name="check" size={16} color={colors.ink} />
          <AppText variant="bodySmStrong">Thanks — vote recorded</AppText>
        </View>
      ) : (
        <View style={styles.votes}>
          <VoteButton icon="thumb-up-outline" label="Yes" a11y="Confirm hazard is still there" primary onPress={() => onVote(true)} />
          <VoteButton icon="thumb-down-outline" label="No" a11y="Hazard is no longer there" onPress={() => onVote(false)} />
        </View>
      )}
    </View>
  );
}

type VoteButtonProps = {
  icon: HazardIconName;
  label: string;
  a11y: string;
  primary?: boolean;
  onPress: () => void;
};

function VoteButton({ icon, label, a11y, primary = false, onPress }: VoteButtonProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.vote}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11y}
        onPress={onPress}
        style={({ pressed }) => [
          styles.voteCircle,
          primary
            ? { backgroundColor: pressed ? colors.primaryPressed : colors.primary }
            : {
                backgroundColor: pressed ? colors.surfacePressed : colors.canvas,
                borderColor: colors.hairline,
                borderWidth: StyleSheet.hairlineWidth,
              },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={24} color={primary ? colors.onPrimary : colors.ink} />
      </Pressable>
      <AppText variant="bodySmStrong">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    gap: spacing.xxs,
  },
  votes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  vote: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  voteCircle: {
    width: touch.large,
    height: touch.large,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
