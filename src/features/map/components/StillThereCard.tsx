import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Card } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type StillThereCardProps = {
  isExpired: boolean;
  hasVoted: boolean;
  onVote: (stillThere: boolean) => void;
};

const VOTING_CLOSED =
  'This report has expired — voting is closed';

export function StillThereCard({ isExpired, hasVoted, onVote }: StillThereCardProps) {
  const { colors } = useTheme();
  return (
    <Card variant="soft">
      <AppText variant="displaySm" style={styles.centered}>
        Still there?
      </AppText>
      {isExpired ? (
        <AppText variant="bodySm" color="body" style={styles.centered}>
          {VOTING_CLOSED}
        </AppText>
      ) : hasVoted ? (
        <View style={styles.thanks}>
          <MaterialCommunityIcons name="check" size={16} color={colors.ink} />
          <AppText variant="bodySmStrong">Thanks — vote recorded</AppText>
        </View>
      ) : (
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
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
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
