'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { scheduleStudyReminder, clearStudyReminder } from './notifications';

export type FontOption = 'default' | 'fredoka' | 'nunito' | 'comic' | 'playfair' | 'system';

export const FONT_OPTIONS: { id: FontOption; label: string; family: string; icon: string; desc: string }[] = [
  { id: 'default', label: 'Default', family: "'Nunito', sans-serif", icon: '✏️', desc: 'Fredoka headings + Nunito body' },
  { id: 'fredoka', label: 'Fredoka', family: "'Fredoka', sans-serif", icon: '🖊️', desc: 'Playful rounded everywhere' },
  { id: 'nunito', label: 'Nunito', family: "'Nunito', sans-serif", icon: '📝', desc: 'Clean sans-serif everywhere' },
  { id: 'comic', label: 'Comic Neue', family: "'Comic Neue', cursive", icon: '🦷', desc: 'Playful comic style' },
  { id: 'playfair', label: 'Playfair Display', family: "'Playfair Display', serif", icon: '📜', desc: 'Elegant serif' },
  { id: 'system', label: 'System', family: "var(--font-sans), -apple-system, sans-serif", icon: '💻', desc: 'Device default font' },
];

interface SettingsValue {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notifEnabled: boolean;
  font: FontOption;
  confettiEnabled: boolean;
  autoRotateTheme: boolean;
}

interface SettingsContextValue extends SettingsValue {
  setSoundEnabled: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
  setNotifEnabled: (v: boolean) => void;
  setFont: (v: FontOption) => void;
  setConfettiEnabled: (v: boolean) => void;
  setAutoRotateTheme: (v: boolean) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  toggleNotif: () => void;
  toggleConfetti: () => void;
  toggleAutoRotate: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  soundEnabled: true,
  hapticEnabled: true,
  notifEnabled: false,
  font: 'default',
  confettiEnabled: true,
  autoRotateTheme: false,
  setSoundEnabled: () => {},
  setHapticEnabled: () => {},
  setNotifEnabled: () => {},
  setFont: () => {},
  setConfettiEnabled: () => {},
  setAutoRotateTheme: () => {},
  toggleSound: () => {},
  toggleHaptic: () => {},
  toggleNotif: () => {},
  toggleConfetti: () => {},
  toggleAutoRotate: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [font, setFont] = useState<FontOption>('default');
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [autoRotateTheme, setAutoRotateTheme] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('piyuuu_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.soundEnabled === 'boolean') setSoundEnabled(parsed.soundEnabled);
        if (typeof parsed.hapticEnabled === 'boolean') setHapticEnabled(parsed.hapticEnabled);
        if (typeof parsed.notifEnabled === 'boolean') setNotifEnabled(parsed.notifEnabled);
        if (typeof parsed.font === 'string') setFont(parsed.font);
        if (typeof parsed.confettiEnabled === 'boolean') setConfettiEnabled(parsed.confettiEnabled);
        if (typeof parsed.autoRotateTheme === 'boolean') setAutoRotateTheme(parsed.autoRotateTheme);
      }
    } catch {}
  }, []);

  // Apply font class to <html>
  useEffect(() => {
    const html = document.documentElement;
    FONT_OPTIONS.forEach(f => html.classList.remove(`font-${f.id}`));
    if (font !== 'default') html.classList.add(`font-${font}`);
  }, [font]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('piyuuu_settings', JSON.stringify({ soundEnabled, hapticEnabled, notifEnabled, font, confettiEnabled, autoRotateTheme }));
  }, [soundEnabled, hapticEnabled, notifEnabled, font, confettiEnabled, autoRotateTheme, mounted]);

  // Manage study reminder based on notifEnabled
  useEffect(() => {
    if (notifEnabled) {
      const id = scheduleStudyReminder(30);
      return () => clearStudyReminder(id);
    } else {
      clearStudyReminder();
    }
  }, [notifEnabled]);

  const toggleSound = useCallback(() => setSoundEnabled(v => !v), []);
  const toggleHaptic = useCallback(() => setHapticEnabled(v => !v), []);
  const toggleNotif = useCallback(() => setNotifEnabled(v => !v), []);
  const toggleConfetti = useCallback(() => setConfettiEnabled(v => !v), []);
  const toggleAutoRotate = useCallback(() => setAutoRotateTheme(v => !v), []);

  return (
    <SettingsContext.Provider value={{ soundEnabled, hapticEnabled, notifEnabled, font, confettiEnabled, autoRotateTheme, setSoundEnabled, setHapticEnabled, setNotifEnabled, setFont, setConfettiEnabled, setAutoRotateTheme, toggleSound, toggleHaptic, toggleNotif, toggleConfetti, toggleAutoRotate }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
