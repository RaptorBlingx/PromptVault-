// ============================================
// PromptVault Mobile - Theme Provider
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { colors, ColorScheme } from './colors';
import { Theme } from '../shared/types';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: 'light' | 'dark';
  colors: ColorScheme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  colorScheme: 'light',
  colors: colors.light,
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({
  children,
  initialTheme = 'system',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const systemColorScheme = useSystemColorScheme();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const resolvedScheme: 'light' | 'dark' =
    theme === 'system'
      ? (systemColorScheme ?? 'light')
      : theme;

  const isDark = resolvedScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const value: ThemeContextValue = {
    theme,
    colorScheme: resolvedScheme,
    colors: themeColors,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
