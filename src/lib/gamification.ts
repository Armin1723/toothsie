const KEY = 'piyuuu_gamification';

export interface GamificationState {
  xp: number;
  level: number;
  lastDailyDate: string;
  dailyLoginStreak: number;
  achievements: string[];
  totalStudySessions: number;
  totalQuizzes: number;
  totalCardsFlipped: number;
  totalIdentifies: number;
  totalChats: number;
}

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  description: string;
  condition: (state: GamificationState) => boolean;
}

export function getAchievements(): Achievement[] {
  return [
    { id: 'first_study', label: 'First Steps', icon: '📚', description: 'Complete your first study session', condition: s => s.totalStudySessions >= 1 },
    { id: 'streak_3', label: 'Getting Started', icon: '🔥', description: '3-day study streak', condition: s => s.dailyLoginStreak >= 3 },
    { id: 'streak_7', label: 'Dedicated Student', icon: '⭐', description: '7-day study streak', condition: s => s.dailyLoginStreak >= 7 },
    { id: 'streak_30', label: 'True Scholar', icon: '👑', description: '30-day study streak', condition: s => s.dailyLoginStreak >= 30 },
    { id: 'quiz_10', label: 'Quiz Apprentice', icon: '🧠', description: 'Complete 10 quiz rounds', condition: s => s.totalQuizzes >= 10 },
    { id: 'quiz_50', label: 'Quiz Master', icon: '🎓', description: 'Complete 50 quiz rounds', condition: s => s.totalQuizzes >= 50 },
    { id: 'cards_100', label: 'Flashcard Fanatic', icon: '🃏', description: 'Flip 100 flashcards', condition: s => s.totalCardsFlipped >= 100 },
    { id: 'cards_500', label: 'Card Collector', icon: '📇', description: 'Flip 500 flashcards', condition: s => s.totalCardsFlipped >= 500 },
    { id: 'identify_10', label: 'Slide Spotter', icon: '🔬', description: 'Identify 10 histology slides', condition: s => s.totalIdentifies >= 10 },
    { id: 'xp_1000', label: 'Knowledge Seeker', icon: '💡', description: 'Earn 1,000 total XP', condition: s => s.xp >= 1000 },
    { id: 'xp_5000', label: 'Wisdom Collector', icon: '🦉', description: 'Earn 5,000 total XP', condition: s => s.xp >= 5000 },
    { id: 'chat_20', label: 'Chatterbox', icon: '💬', description: 'Send 20 chat messages', condition: s => s.totalChats >= 20 },
  ];
}

function defaultState(): GamificationState {
  return {
    xp: 0,
    level: 1,
    lastDailyDate: '',
    dailyLoginStreak: 0,
    achievements: [],
    totalStudySessions: 0,
    totalQuizzes: 0,
    totalCardsFlipped: 0,
    totalIdentifies: 0,
    totalChats: 0,
  };
}

export function loadGamification(): GamificationState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultState();
}

export function saveGamification(state: GamificationState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(level: number): number {
  const currentXp = (level - 1) ** 2 * 100;
  const nextXp = level ** 2 * 100;
  return nextXp - currentXp;
}

export function addXp(state: GamificationState, amount: number): GamificationState {
  const next = { ...state, xp: state.xp + amount };
  next.level = calcLevel(next.xp);
  saveGamification(next);
  return next;
}

export function processDailyLogin(state: GamificationState): GamificationState {
  const today = new Date().toDateString();
  if (state.lastDailyDate === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const next = { ...state, lastDailyDate: today };
  if (state.lastDailyDate === yesterday) {
    next.dailyLoginStreak = state.dailyLoginStreak + 1;
  } else {
    next.dailyLoginStreak = 1;
  }
  saveGamification(next);
  return next;
}

export function checkNewAchievements(state: GamificationState): Achievement[] {
  return getAchievements().filter(a => !state.achievements.includes(a.id) && a.condition(state));
}

export function unlockAchievement(state: GamificationState, id: string): GamificationState {
  if (state.achievements.includes(id)) return state;
  const next = { ...state, achievements: [...state.achievements, id] };
  saveGamification(next);
  return next;
}
