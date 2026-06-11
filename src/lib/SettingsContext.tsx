'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface SettingsValue {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

interface SettingsContextValue extends SettingsValue {
  setSoundEnabled: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  soundEnabled: true,
  hapticEnabled: true,
  setSoundEnabled: () => {},
  setHapticEnabled: () => {},
  toggleSound: () => {},
  toggleHaptic: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('piyuuu_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.soundEnabled === 'boolean') setSoundEnabled(parsed.soundEnabled);
        if (typeof parsed.hapticEnabled === 'boolean') setHapticEnabled(parsed.hapticEnabled);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('piyuuu_settings', JSON.stringify({ soundEnabled, hapticEnabled }));
  }, [soundEnabled, hapticEnabled, mounted]);

  const toggleSound = useCallback(() => setSoundEnabled(v => !v), []);
  const toggleHaptic = useCallback(() => setHapticEnabled(v => !v), []);

  return (
    <SettingsContext.Provider value={{ soundEnabled, hapticEnabled, setSoundEnabled, setHapticEnabled, toggleSound, toggleHaptic }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
