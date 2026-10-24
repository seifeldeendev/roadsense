import { StyleSheet, View } from 'react-native';
import { AppButton, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

export function LiveMapLoadingOverlay({ label }: { label: string }) {
  const styles = useThemedStyles(overlayStyles, undefined);
  return (
    <View style={styles.fill}>
      <LoadingState label={label} />
    </View>
  );
}

export function LiveMapErrorOverlay({ message, onRetry }: { message: string; onRetry: () => void }) {
  const styles = useThemedStyles(overlayStyles, undefined);
  return (
    <View style={styles.fill}>
      <ErrorState message={message} onRetry={onRetry} />
    </View>
  );
}

type MapEmptyOverlayProps = {
  message: string;
  onReset: () => void;
};

export function LiveMapEmptyOverlay({ message, onReset }: MapEmptyOverlayProps) {
  const styles = useThemedStyles(overlayStyles, undefined);
  return (
    <View pointerEvents="box-none" style={styles.fill}>
      <View style={styles.card}>
        <EmptyState
          icon="filter-variant"
          title="Nothing in view"
          message={message}
          action={
            <AppButton
              title="Reset filters"
              variant="secondary"
              onPress={onReset}
              accessibilityLabel="Reset filters"
            />
          }
        />
      </View>
    </View>
  );
}

function overlayStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    fill: {
      ...StyleSheet.absoluteFill,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      flex: 1,
      justifyContent: 'center',
    },
  });
}
