'use client';

const PERMISSION_KEY = 'piyuuu_notif_permission';
const STUDY_REMINDER_KEY = 'piyuuu_reminder_interval';

export async function requestNotifPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  localStorage.setItem(PERMISSION_KEY, result);
  return result === 'granted';
}

export function notifPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function showNotif(title: string, body: string, icon = '/icons/icon-512.svg') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon });
  } catch { /* silently fail */ }
}

export function scheduleStudyReminder(intervalMinutes = 30): number {
  const id = window.setInterval(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return;
    const messages = [
      'Time to brush up on your dental knowledge! 🦷',
      'Toothsie misses you! Come study! 💖',
      'Quick study break? Just 5 minutes! 📚',
      'Your flashcards are waiting! ✨',
      'Don\'t forget your daily dental dose! 🩺',
    ];
    showNotif(
      'Piyuuu\'s Tooth Vault',
      messages[Math.floor(Math.random() * messages.length)]
    );
  }, intervalMinutes * 60 * 1000);
  localStorage.setItem(STUDY_REMINDER_KEY, String(id));
  return id;
}

export function clearStudyReminder(id?: number) {
  if (id) window.clearInterval(id);
  const stored = localStorage.getItem(STUDY_REMINDER_KEY);
  if (stored) window.clearInterval(Number(stored));
  localStorage.removeItem(STUDY_REMINDER_KEY);
}

export function notifyStreakMilestone(streak: number) {
  const messages: Record<number, string> = {
    3: '3-day streak! You\'re building momentum! 🔥',
    5: '5 days in a row! Amazing dedication! ⭐',
    7: 'One week streak! You\'re a true scholar! 🎯',
    10: '10-day streak! Double digits! 💪',
    14: 'Two weeks of non-stop learning! 🏆',
    21: '21-day streak! Habit formed! 🌟',
    30: '30-DAY STREAK! LEGENDARY! 👑',
  };
  if (messages[streak]) {
    showNotif('Study Streak! 🎉', messages[streak]);
  }
}

export function notifyAchievement(icon: string, label: string) {
  showNotif(`Achievement Unlocked! ${icon}`, `You earned: ${label}!`);
}

export function notifyLevelUp(level: number) {
  showNotif('Level Up! 🎉', `You reached level ${level}! Keep it up!`);
}
