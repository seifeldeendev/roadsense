import { vars } from 'nativewind';
import type { ThemeColors } from './tokens';

const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// The active palette as CSS variables for NativeWind classes (bg-canvas, text-ink…).
export function themeVars(colors: ThemeColors) {
  const entries: Record<string, string> = {};
  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === 'string') entries[`--color-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(colors.status)) entries[`--color-status-${name}`] = value;
  return vars(entries);
}
