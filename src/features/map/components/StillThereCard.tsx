import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Card } from '@/components/ui';
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
      <AppText variant="displaySm" className="text-center">
        Still there?
      </AppText>
      {isExpired ? (
        <AppText variant="bodySm" color="body" className="text-center">
          {VOTING_CLOSED}
        </AppText>
      ) : hasVoted ? (
        <View className="flex-row items-center justify-center gap-xs">
          <MaterialCommunityIcons name="check" size={16} color={colors.ink} />
          <AppText variant="bodySmStrong">Thanks — vote recorded</AppText>
        </View>
      ) : (
        <View className="flex-row gap-md">
          <View className="flex-1">
            <AppButton
              title="Yes, still there"
              onPress={() => onVote(true)}
              accessibilityLabel="Confirm hazard is still there"
            />
          </View>
          <View className="flex-1">
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
