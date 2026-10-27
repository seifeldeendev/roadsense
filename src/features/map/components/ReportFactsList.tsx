import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';

export type FactsRow = { label: string; value: string };

type ReportFactsListProps = {
  facts: FactsRow[];
};

export function ReportFactsList({ facts }: ReportFactsListProps) {
  return (
    <View>
      {facts.map((fact) => (
        <View
          key={fact.label}
          className="flex-row items-center justify-between gap-md border-hairline py-lg"
          style={divider.bottom}
          accessibilityLabel={`${fact.label}: ${fact.value}`}
          accessibilityRole="text"
        >
          <AppText variant="bodyMdStrong">{fact.label}</AppText>
          <AppText variant="bodyMd" color="body" numberOfLines={1} className="shrink text-right">
            {fact.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const divider = StyleSheet.create({
  bottom: { borderBottomWidth: StyleSheet.hairlineWidth },
});
