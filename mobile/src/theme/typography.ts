// ============================================
// PromptVault Mobile - Typography Tokens
// ============================================

import { Platform } from 'react-native';

export const fontFamily = {
  sans: Platform.select({
    ios: 'Inter',
    android: 'Inter',
    default: 'Inter',
  }) as string,
  mono: Platform.select({
    ios: 'JetBrainsMono',
    android: 'JetBrainsMono',
    default: 'JetBrainsMono',
  }) as string,
  // Fallbacks when custom fonts haven't loaded
  sansFallback: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,
  monoFallback: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) as string,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeight = {
  tight: 1.3,
  normal: 1.6,
  relaxed: 1.8,
};
