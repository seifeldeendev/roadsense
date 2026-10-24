import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui';
import { colors, spacing, typography } from '@/theme/tokens';

type StillThereSectionProps = {
  hasVoted: boolean;
  reportedLine: string;
  onVote: (stillThere: boolean) => void;
};

export function StillThereSection({ hasVoted, reportedLine, onVote }: StillThereSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>Still there?</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <AppButton
            title="Yes"
            onPress={() => onVote(true)}
            disabled={hasVoted}
            accessibilityLabel="Confirm hazard is still there"
          />
        </View>
        <View style={styles.half}>
          <AppButton
            title="No"
            variant="secondary"
            onPress={() => onVote(false)}
            disabled={hasVoted}
            accessibilityLabel="Hazard is no longer there"
          />
        </View>
      </View>
      {hasVoted ? (
        <Text style={styles.thanks}>Thanks — vote recorded</Text>
      ) : (
        <Text style={styles.meta}>{reportedLine}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    paddingTop: spacing.md,
  },
  question: {
    ...typography.bodyLg,
    color: colors.ink,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  thanks: {
    ...typography.bodySmStrong,
    color: colors.ink,
    textAlign: 'center',
  },
  meta: {
    ...typography.caption,
    color: colors.body,
    textAlign: 'center',
  },
});
