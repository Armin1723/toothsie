'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  loadGamification,
  saveGamification,
  addXp,
  processDailyLogin,
  checkNewAchievements,
  unlockAchievement,
  calcLevel,
  xpForNextLevel,
  type GamificationState,
  type Achievement,
} from '@/lib/gamification';
import { notifyLevelUp } from '@/lib/notifications';

interface GamificationContextValue extends GamificationState {
  earnXp: (amount: number, source?: string) => void;
  incrementStat: (stat: keyof Pick<GamificationState, 'totalStudySessions' | 'totalQuizzes' | 'totalCardsFlipped' | 'totalIdentifies' | 'totalChats'>) => void;
  xpForNext: number;
}

const defaultVal: GamificationContextValue = {
  xp: 0, level: 1, lastDailyDate: '', dailyLoginStreak: 0, achievements: [],
  totalStudySessions: 0, totalQuizzes: 0, totalCardsFlipped: 0, totalIdentifies: 0, totalChats: 0,
  earnXp: () => {}, incrementStat: () => {}, xpForNext: 100,
};

const GamificationContext = createContext<GamificationContextValue>(defaultVal);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>(() => {
    const s = loadGamification();
    return processDailyLogin(s);
  });
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const prevRef = useRef(state);

  // Check achievements on relevant stat changes
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = state;
    const changed =
      prev.totalStudySessions !== state.totalStudySessions ||
      prev.totalQuizzes !== state.totalQuizzes ||
      prev.totalCardsFlipped !== state.totalCardsFlipped ||
      prev.totalIdentifies !== state.totalIdentifies ||
      prev.totalChats !== state.totalChats ||
      prev.xp !== state.xp;
    if (!changed) return;

    const earned = checkNewAchievements(state);
    if (earned.length > 0) {
      setToasts(earned);
      let next = state;
      for (const a of earned) next = unlockAchievement(next, a.id);
      setState(next);
      setTimeout(() => setToasts([]), 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.totalStudySessions, state.totalQuizzes, state.totalCardsFlipped, state.totalIdentifies, state.totalChats, state.xp]);

  const earnXpFn = useCallback((amount: number) => {
    setState(prev => {
      const next = addXp(prev, amount);
      if (next.level > prev.level) notifyLevelUp(next.level);
      return next;
    });
  }, []);

  const incrementStat = useCallback((stat: keyof Pick<GamificationState, 'totalStudySessions' | 'totalQuizzes' | 'totalCardsFlipped' | 'totalIdentifies' | 'totalChats'>) => {
    setState(prev => {
      const next = { ...prev, [stat]: prev[stat] + 1 };
      saveGamification(next);
      next.level = calcLevel(next.xp);
      return next;
    });
  }, []);

  const xpForNext = xpForNextLevel(state.level);

  return (
    <GamificationContext.Provider value={{ ...state, earnXp: earnXpFn, incrementStat, xpForNext }}>
      {children}
      {toasts.map(a => (
        <AchievementToast key={a.id + Date.now()} icon={a.icon} label={a.label} description={a.description} />
      ))}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  return useContext(GamificationContext);
}

function AchievementToast({ icon, label, description }: { icon: string; label: string; description: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed top-20 left-4 right-4 z-[90] max-w-sm mx-auto pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-yellow-200 shadow-2xl p-4 flex items-center gap-3 animate-slide-up">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Achievement Unlocked!</p>
          <p className="text-sm font-bold text-gray-800">{label}</p>
          <p className="text-[10px] text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
