import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

export type FactsRow = { label: string; value: string };

type ReportFactsListProps = {
  facts: FactsRow[];
};

export function ReportFactsList({ facts }: ReportFactsListProps) {
  const styles = useThemedStyles(factsStyles, undefined);
  return (
    <View>
      {facts.map((fact) => (
        <View
          key={fact.label}
          style={styles.row}
          accessibilityLabel={`${fact.label}: ${fact.value}`}
          accessibilityRole="text"
        >
          <AppText variant="bodyMdStrong">{fact.label}</AppText>
          <AppText variant="bodyMd" color="body" numberOfLines={1} style={styles.value}>
            {fact.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function factsStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.hairline,
    },
    value: {
      flexShrink: 1,
      textAlign: 'right',
    },
  });
}
