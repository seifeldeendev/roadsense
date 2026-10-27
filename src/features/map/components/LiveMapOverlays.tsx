import { View } from 'react-native';
import { AppButton, EmptyState, ErrorState, LoadingState } from '@/components/ui';

export function LiveMapLoadingOverlay({ label }: { label: string }) {
  return (
    <View className="absolute inset-0 justify-center p-lg">
      <LoadingState label={label} />
    </View>
  );
}

export function LiveMapErrorOverlay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="absolute inset-0 justify-center p-lg">
      <ErrorState message={message} onRetry={onRetry} />
    </View>
  );
}

type MapEmptyOverlayProps = {
  message: string;
  onReset: () => void;
};

export function LiveMapEmptyOverlay({ message, onReset }: MapEmptyOverlayProps) {
  return (
    <View pointerEvents="box-none" className="absolute inset-0 justify-center p-lg">
      <View className="flex-1 justify-center">
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
