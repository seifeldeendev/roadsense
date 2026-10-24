import { useState, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextInputInstance,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { rounded, spacing, touch, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | undefined;
  secureToggle?: boolean;
  ref?: Ref<TextInputInstance>;
};

export function TextField({
  label,
  error,
  secureToggle = false,
  ref,
  placeholder,
  ...inputProps
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(secureToggle);

  const showError = error !== undefined && error.length > 0;
  const borderColor = focused || showError ? colors.ink : 'transparent';

  const boxStyle: ViewStyle = {
    borderColor,
    borderWidth: 1.5,
    backgroundColor: colors.canvasSoft,
    borderRadius: rounded.md,
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
      <View style={[styles.inputRow, boxStyle]}>
        <TextInput
          {...inputProps}
          ref={ref}
          placeholder={placeholder}
          placeholderTextColor={colors.mute}
          style={[styles.input, { color: colors.ink }]}
          secureTextEntry={secure}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
        {secureToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secure ? 'Show password' : 'Hide password'}
            onPress={() => {
              setSecure((value) => !value);
            }}
            style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
            hitSlop={6}
          >
            <MaterialCommunityIcons
              name={secure ? 'eye-off' : 'eye'}
              size={20}
              color={colors.ink}
            />
          </Pressable>
        )}
      </View>
      {showError && (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={16}
            color={colors.ink}
          />
          <Text style={[styles.errorText, { color: colors.ink }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySmStrong,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.min,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  input: {
    ...typography.bodyMd,
    flex: 1,
    minHeight: touch.min,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  toggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    ...typography.bodySm,
  },
});
