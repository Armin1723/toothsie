'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export const THEMES = [
  { id: 'piyuu', label: 'Piyuu', emoji: '🩷', desc: 'Pink mint' },
  { id: 'piyuu-dark', label: 'Piyuu Dark', emoji: '🌙', desc: 'Dark mode' },
  { id: 'piyuu-lavender', label: 'Piyuu Lavender', emoji: '💜', desc: 'Soft lavender' },
  { id: 'piyuu-rose', label: 'Piyuu Rose', emoji: '🌹', desc: 'Warm rose' },
  { id: 'piyuu-ocean', label: 'Piyuu Ocean', emoji: '🌊', desc: 'Ocean blues' },
  { id: 'piyuu-sunset', label: 'Piyuu Sunset', emoji: '🌅', desc: 'Warm sunset' },
  { id: 'piyuu-forest', label: 'Piyuu Forest', emoji: '🌲', desc: 'Forest green' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'piyuu',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('piyuu');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('piyuuu_theme') as ThemeId | null;
    if (saved && THEMES.some(t => t.id === saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.className = `theme-${theme.replace('piyuu-', 'piyuu-')}`;
    localStorage.setItem('piyuuu_theme', theme);
  }, [theme, mounted]);

  const setTheme = useCallback((id: ThemeId) => setThemeState(id), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
