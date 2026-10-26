import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import type { HazardIconName } from '@/theme/tokens';
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
    <View className="gap-md border-hairline pt-md" style={hairline.top}>
      <View className="gap-xxs">
        <AppText variant="bodyMdStrong">Still there?</AppText>
        <AppText variant="caption" color="body" numberOfLines={1}>
          {reportedLine}
        </AppText>
      </View>
      {hasVoted ? (
        <View className="flex-row items-center justify-center gap-xs">
          <MaterialCommunityIcons name="check" size={16} color={colors.ink} />
          <AppText variant="bodySmStrong">Thanks — vote recorded</AppText>
        </View>
      ) : (
        <View className="flex-row justify-center gap-xxxl">
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
    <View className="items-center gap-xs">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11y}
        onPress={onPress}
        className={`h-touch-lg w-touch-lg items-center justify-center rounded-full ${
          primary ? 'bg-primary active:bg-primary-pressed' : 'border-hairline bg-canvas active:bg-surface-pressed'
        }`}
        style={primary ? undefined : hairline.all}
      >
        <MaterialCommunityIcons name={icon} size={24} color={primary ? colors.onPrimary : colors.ink} />
      </Pressable>
      <AppText variant="bodySmStrong">{label}</AppText>
    </View>
  );
}

const hairline = StyleSheet.create({
  top: { borderTopWidth: StyleSheet.hairlineWidth },
  all: { borderWidth: StyleSheet.hairlineWidth },
});
