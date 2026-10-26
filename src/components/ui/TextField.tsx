import { useState, type Ref } from 'react';
import { Pressable, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

// The 1.5px border is always drawn (transparent when idle) so focus does not shift
// layout; padding absorbs it to keep the DESIGN.md text-input at 16 + 24 + 16 = 56.
const TOGGLE_SIZE = 24;

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

  return (
    <View className="gap-sm">
      <AppText variant="bodySmStrong">{label}</AppText>
      <View
        className={`flex-row items-center gap-sm rounded-md border-[1.5px] bg-canvas-soft p-[14.5px] ${
          focused || showError ? 'border-ink' : 'border-transparent'
        }`}
      >
        <TextInput
          {...inputProps}
          ref={ref}
          placeholder={placeholder}
          placeholderTextColor={colors.mute}
          className="h-6 flex-1 p-0 font-inter text-body-md text-ink"
          style={{ includeFontPadding: false, textAlignVertical: 'center' }}
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
            className="h-6 w-6 items-center justify-center active:opacity-50"
            hitSlop={(touch.min - TOGGLE_SIZE) / 2}
          >
            <MaterialCommunityIcons name={secure ? 'eye-off' : 'eye'} size={20} color={colors.ink} />
          </Pressable>
        )}
      </View>
      {showError && (
        <View className="flex-row items-center gap-xs px-xs">
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.ink} />
          <AppText variant="bodySm">{error}</AppText>
        </View>
      )}
    </View>
  );
}
