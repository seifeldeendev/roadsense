import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { elevation } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type GlassMode = 'liquid' | 'blur' | 'backdrop' | 'tint';

// The best glass each platform can draw, the same material as the tab bar:
// Liquid Glass on iOS 26+, a system blur on older iOS, a CSS backdrop blur on
// web. Android cannot blur the map's native surface, so it gets a near-opaque
// canvas fill instead.
function detectGlassMode(): GlassMode {
  if (Platform.OS === 'web') return 'backdrop';
  if (Platform.OS !== 'ios') return 'tint';
  try {
    return isLiquidGlassAvailable() ? 'liquid' : 'blur';
  } catch {
    // Not linked (e.g. tests): a plain blur still reads as glass.
    return 'blur';
  }
}

const glassMode = detectGlassMode();

const fillClass: Record<GlassMode, string> = {
  liquid: 'bg-transparent',
  blur: 'bg-transparent',
  backdrop: 'bg-canvas-frost backdrop-blur-xl',
  tint: 'bg-canvas-glass',
};

type GlassSurfaceProps = Omit<ViewProps, 'style'> & {
  children?: ReactNode;
  // Corner radius in points; the glass layer is clipped to it.
  radius: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  // Liquid Glass reacts to touch (iOS 26) — for buttons.
  interactive?: boolean;
};

// A floating translucent surface for anything that sits over the map or content.
export function GlassSurface({ children, radius, className = '', style, interactive = false, ...rest }: GlassSurfaceProps) {
  const { scheme } = useTheme();
  const clipped = glassMode === 'liquid' || glassMode === 'blur';
  return (
    <View
      {...rest}
      className={`${fillClass[glassMode]} ${clipped ? 'overflow-hidden' : ''} ${className}`}
      // Liquid Glass and the system blur draw their own edge; the flat fills get the float shadow.
      style={[{ borderRadius: radius }, clipped ? null : elevation.level3, style]}
    >
      {glassMode === 'liquid' ? (
        <GlassView
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          glassEffectStyle="regular"
          colorScheme={scheme}
          isInteractive={interactive}
        />
      ) : null}
      {glassMode === 'blur' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={80}
          tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        />
      ) : null}
      {children}
    </View>
  );
}
