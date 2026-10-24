import { useContext, useMemo, type Context } from 'react';
import { ThemeContext, type ResolvedTheme, type ThemeScheme } from './ThemeProvider';

export function useTheme(): ResolvedTheme {
  const context = useContext<ResolvedTheme>(ThemeContext as Context<ResolvedTheme>);
  return context;
}

export type { ThemeScheme, ResolvedTheme };

export function useThemedStyles<S, P = undefined>(
  factory: (theme: ResolvedTheme, props: P) => S,
  props: P,
): S {
  const theme = useTheme();
  return useMemo(() => factory(theme, props), [theme, factory, props]);
}
