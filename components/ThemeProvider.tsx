import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, AppSettings } from '../types';

// ----- Theme Context -----

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    settings: AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
    theme: 'system',
    defaultFolderId: null,
    showWordCount: true,
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('promptvault-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Resolve system theme
    useEffect(() => {
        const updateTheme = () => {
            let resolved: 'light' | 'dark';

            if (settings.theme === 'system') {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            } else {
                resolved = settings.theme;
            }

            setResolvedTheme(resolved);
            document.documentElement.setAttribute('data-theme', resolved);
        };

        updateTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', updateTheme);

        return () => mediaQuery.removeEventListener('change', updateTheme);
    }, [settings.theme]);

    // Persist settings
    useEffect(() => {
        localStorage.setItem('promptvault-settings', JSON.stringify(settings));
    }, [settings]);

    const setTheme = (theme: Theme) => {
        setSettings(prev => ({ ...prev, theme }));
    };

    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <ThemeContext.Provider value={{
            theme: settings.theme,
            resolvedTheme,
            setTheme,
            settings,
            updateSettings,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

// ----- Theme Toggle Component -----

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const cycleTheme = () => {
        const themes: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const getIcon = () => {
        if (theme === 'system') {
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
            );
        }
        if (resolvedTheme === 'dark') {
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            );
        }
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
        );
    };

    const getLabel = () => {
        if (theme === 'system') return 'System';
        if (theme === 'dark') return 'Dark';
        return 'Light';
    };

    return (
        <button
            onClick={cycleTheme}
            className={`btn btn-ghost ${className}`}
            title={`Theme: ${getLabel()}`}
            aria-label={`Current theme: ${getLabel()}. Click to change.`}
        >
            {getIcon()}
            <span className="text-xs">{getLabel()}</span>
        </button>
    );
};
