import { createContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, elevation, lightColors, type ThemeColors, type ThemeElevation } from './tokens';

export type ThemeScheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export type ResolvedTheme = {
  scheme: ThemeScheme;
  colors: ThemeColors;
  elevation: ThemeElevation;
};

export const ThemeContext = createContext<ResolvedTheme>({
  scheme: 'light',
  colors: lightColors,
  elevation,
});

type ThemeProviderProps = {
  children: ReactNode;
  preference: ThemePreference;
};

export function resolveThemeScheme(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' | null | undefined,
): ThemeScheme {
  if (preference === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
  return preference;
}

export function ThemeProvider({ children, preference }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const theme = useMemo<ResolvedTheme>(() => {
    const scheme = resolveThemeScheme(preference, systemScheme);
    return {
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      elevation: buildThemedElevation(scheme),
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

function buildThemedElevation(scheme: ThemeScheme): ThemeElevation {
  if (scheme === 'light') return elevation;
  const hairlineBorder = { borderWidth: 1, borderColor: darkColors.hairline };
  return {
    level0: { ...elevation.level0 },
    level1: { ...elevation.level1, ...hairlineBorder },
    level2: { ...elevation.level2, ...hairlineBorder },
    level3: { ...elevation.level3, ...hairlineBorder },
  };
}
