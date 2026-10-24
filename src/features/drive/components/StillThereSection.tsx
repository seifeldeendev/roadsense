import { StyleSheet, View } from 'react-native';
import { AppButton, Card, AppText } from '@/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme/tokens';

type StillThereSectionProps = {
  hasVoted: boolean;
  reportedLine: string;
  onVote: (stillThere: boolean) => void;
};

export function StillThereSection({ hasVoted, reportedLine, onVote }: StillThereSectionProps) {
  return (
    <Card variant="soft">
      <AppText variant="displaySm" style={styles.centered}>
        Still there?
      </AppText>
      {hasVoted ? (
        <View style={styles.thanks}>
          <MaterialCommunityIcons name="check" size={16} color={colors.ink} />
          <AppText variant="bodySmStrong">Thanks — vote recorded</AppText>
        </View>
      ) : (
        <View style={styles.stack}>
          <View style={styles.row}>
            <View style={styles.half}>
              <AppButton
                title="Yes, still there"
                onPress={() => onVote(true)}
                accessibilityLabel="Confirm hazard is still there"
              />
            </View>
            <View style={styles.half}>
              <AppButton
                title="No, it's gone"
                variant="secondary"
                onPress={() => onVote(false)}
                accessibilityLabel="Hazard is no longer there"
              />
            </View>
          </View>
          <AppText variant="bodySm" color="body" style={styles.centered}>
            {reportedLine}
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  thanks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
});
