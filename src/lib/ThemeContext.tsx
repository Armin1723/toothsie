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
  { id: 'piyuu-wild', label: 'Piyuu Wild', emoji: '🌈', desc: 'Random colors' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  regenerateWild: () => void;
}

const WILD_CSS_VARS = [
  '--pink-50','--pink-100','--pink-200','--pink-300','--pink-400','--pink-500','--pink-600','--pink-700',
  '--mint-50','--mint-100','--mint-200','--mint-300','--mint-400','--mint-500','--mint-600','--mint-700',
  '--purple-50','--purple-100','--purple-200','--purple-300','--purple-400','--purple-500','--purple-600','--purple-700',
  '--gray-50','--gray-100','--gray-200','--gray-300','--gray-400','--gray-500','--gray-600','--gray-700','--gray-800','--gray-900',
  '--surface','--surface-glass','--shadow-pink',
] as const;

function hsl(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateWildPalette(): Record<string, string> {
  const h = Math.floor(Math.random() * 360);
  const hMint = (h + 120 + Math.floor(Math.random() * 60)) % 360;
  const hPurp = (h + 50 + Math.floor(Math.random() * 40)) % 360;
  const s = 70 + Math.floor(Math.random() * 20);
  const sM = 65 + Math.floor(Math.random() * 25);

  const p50 = hsl(h, s, 95);
  const p100 = hsl(h, s, 90);
  const p200 = hsl(h, s, 80);
  const p300 = hsl(h, s, 68);
  const p400 = hsl(h, s, 55);
  const p500 = hsl(h, s, 45);
  const p600 = hsl(h, s, 35);
  const p700 = hsl(h, s, 25);

  const m50 = hsl(hMint, sM, 92);
  const m100 = hsl(hMint, sM, 85);
  const m200 = hsl(hMint, sM, 75);
  const m300 = hsl(hMint, sM, 62);
  const m400 = hsl(hMint, sM, 50);
  const m500 = hsl(hMint, sM, 40);
  const m600 = hsl(hMint, sM, 30);
  const m700 = hsl(hMint, sM, 20);

  const pu50 = hsl(hPurp, 60, 95);
  const pu100 = hsl(hPurp, 65, 88);
  const pu200 = hsl(hPurp, 70, 78);
  const pu300 = hsl(hPurp, 75, 65);
  const pu400 = hsl(hPurp, 80, 55);
  const pu500 = hsl(hPurp, 82, 45);
  const pu600 = hsl(hPurp, 80, 35);
  const pu700 = hsl(hPurp, 78, 25);

  const g = h > 30 && h < 150 ? 10 : 0;
  const g50 = hsl(220, g, 98);
  const g100 = hsl(220, g + 3, 95);
  const g200 = hsl(220, g + 5, 88);
  const g300 = hsl(220, g + 5, 78);
  const g400 = hsl(220, g + 3, 65);
  const g500 = hsl(220, g + 2, 52);
  const g600 = hsl(220, g + 3, 40);
  const g700 = hsl(220, g + 4, 30);
  const g800 = hsl(220, g + 5, 20);
  const g900 = hsl(220, g + 5, 12);

  return {
    '--pink-50': p50, '--pink-100': p100, '--pink-200': p200, '--pink-300': p300,
    '--pink-400': p400, '--pink-500': p500, '--pink-600': p600, '--pink-700': p700,
    '--mint-50': m50, '--mint-100': m100, '--mint-200': m200, '--mint-300': m300,
    '--mint-400': m400, '--mint-500': m500, '--mint-600': m600, '--mint-700': m700,
    '--purple-50': pu50, '--purple-100': pu100, '--purple-200': pu200, '--purple-300': pu300,
    '--purple-400': pu400, '--purple-500': pu500, '--purple-600': pu600, '--purple-700': pu700,
    '--gray-50': g50, '--gray-100': g100, '--gray-200': g200, '--gray-300': g300,
    '--gray-400': g400, '--gray-500': g500, '--gray-600': g600, '--gray-700': g700,
    '--gray-800': g800, '--gray-900': g900,
    '--surface': p50,
    '--surface-glass': `hsla(${h}, ${s}%, 95%, 0.85)`,
    '--shadow-pink': `hsla(${h}, ${s}%, 45%, 0.25)`,
  };
}

function applyWildPalette(palette?: Record<string, string>) {
  const p = palette ?? generateWildPalette();
  const root = document.documentElement;
  for (const key of WILD_CSS_VARS) {
    root.style.setProperty(key, p[key]);
  }
}

function clearWildPalette() {
  const root = document.documentElement;
  for (const key of WILD_CSS_VARS) {
    root.style.removeProperty(key);
  }
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'piyuu',
  setTheme: () => {},
  regenerateWild: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('piyuu');
  const [mounted, setMounted] = useState(false);
  const [wildPalette, setWildPalette] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('piyuuu_theme') as ThemeId | null;
    if (saved && THEMES.some(t => t.id === saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    clearWildPalette();
    if (theme === 'piyuu-wild') {
      const palette = wildPalette ?? generateWildPalette();
      if (!wildPalette) setWildPalette(palette);
      applyWildPalette(palette);
      document.documentElement.className = 'theme-piyuu-wild';
    } else {
      document.documentElement.className = theme === 'piyuu' ? '' : `theme-${theme}`;
    }
    localStorage.setItem('piyuuu_theme', theme);
  }, [theme, mounted, wildPalette]);

  // Auto-rotate theme
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem('piyuuu_settings');
    let autoRotate = false;
    if (saved) {
      try { autoRotate = JSON.parse(saved).autoRotateTheme === true; } catch {}
    }
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setThemeState(prev => {
        const others = THEMES.filter(t => t.id !== prev && t.id !== 'piyuu-wild');
        return others[Math.floor(Math.random() * others.length)].id;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  const regenerateWild = useCallback(() => {
    const palette = generateWildPalette();
    setWildPalette(palette);
    if (theme === 'piyuu-wild') {
      applyWildPalette(palette);
    }
  }, [theme]);

  const setTheme = useCallback((id: ThemeId) => {
    if (id === 'piyuu-wild') {
      const palette = generateWildPalette();
      setWildPalette(palette);
    }
    setThemeState(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, regenerateWild }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
