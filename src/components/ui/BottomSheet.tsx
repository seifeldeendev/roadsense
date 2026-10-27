import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { rounded, spacing } from '@/theme/tokens';
import { GlassSurface } from './GlassSurface';

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-backdrop"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <GlassSurface
          accessibilityViewIsModal
          radius={rounded.xl}
          className="gap-lg px-xxl pt-md"
          style={{ paddingBottom: spacing.xxl + insets.bottom }}
        >
          <View className="h-1 w-10 self-center rounded-pill bg-hairline" />
          <View className="flex-row items-center justify-between">
            <AppText variant="displaySm">{title}</AppText>
            <IconButton icon="close" accessibilityLabel={`Close ${title}`} onPress={onClose} />
          </View>
          {children}
        </GlassSurface>
      </View>
    </Modal>
  );
}
