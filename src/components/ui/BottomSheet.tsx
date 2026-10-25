import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { rounded, spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const styles = useThemedStyles(sheetStyles, undefined);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View
          accessibilityViewIsModal
          style={[styles.panel, { paddingBottom: spacing.xxl + insets.bottom }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="displaySm">{title}</AppText>
            <IconButton icon="close" accessibilityLabel={`Close ${title}`} onPress={onClose} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function sheetStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.colors.backdrop,
    },
    panel: {
      backgroundColor: theme.colors.canvas,
      borderTopLeftRadius: rounded.xl,
      borderTopRightRadius: rounded.xl,
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.md,
      gap: spacing.lg,
      ...theme.elevation.level2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    handle: {
      alignSelf: 'center',
      width: HANDLE_WIDTH,
      height: HANDLE_HEIGHT,
      borderRadius: rounded.pill,
      backgroundColor: theme.colors.hairline,
    },
  });
}
