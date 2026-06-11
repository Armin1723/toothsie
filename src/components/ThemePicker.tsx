'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, useTheme, type ThemeId } from '@/lib/ThemeContext';
import { useSettings, FONT_OPTIONS, type FontOption } from '@/lib/SettingsContext';
import { useGamification } from '@/lib/GamificationContext';
import { getAchievements } from '@/lib/gamification';
import { requestNotifPermission, notifPermission } from '@/lib/notifications';

function CuteSelect<T extends string>({
  value,
  onChange,
  options,
  renderOption,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { id: T; label: string; icon?: string }[];
  renderOption?: (opt: { id: T; label: string; icon?: string }) => React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = options.find(o => o.id === value) ?? options[0];

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50/70 hover:bg-gray-100 text-left text-sm font-semibold text-gray-800 transition-all"
      >
        {renderOption ? renderOption(current) : (
          <span>{current.icon ?? ''} {current.label}</span>
        )}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 shrink-0"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-all ${
                  opt.id === value
                    ? 'bg-pink-50 text-pink-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                }`}
              >
                {renderOption ? renderOption(opt) : (
                  <span>{opt.icon ?? ''} {opt.label}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const THEME_COLORS: Record<string, string> = {
  piyuu: 'bg-pink-200',
  'piyuu-dark': 'bg-gray-800',
  'piyuu-lavender': 'bg-purple-200',
  'piyuu-rose': 'bg-rose-200',
  'piyuu-ocean': 'bg-blue-200',
  'piyuu-sunset': 'bg-orange-200',
  'piyuu-forest': 'bg-green-200',
  'piyuu-wild': 'bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300',
};

export default function ThemePicker() {
  const { theme, setTheme, regenerateWild } = useTheme();
  const { soundEnabled, hapticEnabled, notifEnabled, font, confettiEnabled, autoRotateTheme, toggleSound, toggleHaptic, toggleNotif, setFont, toggleConfetti, toggleAutoRotate } = useSettings();
  const { achievements, xp, level, dailyLoginStreak } = useGamification();
  const [open, setOpen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const hasNotif = typeof window !== 'undefined' && 'Notification' in window;

  return (
    <>
      {/* Trigger */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 30 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center glass rounded-full shadow-theme-sm text-base"
        aria-label="Settings"
      >
        🎨
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => { setOpen(false); setShowAchievements(false); }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                  {showAchievements ? '🏆 Achievements' : 'Settings'}
                </h2>
                <button
                  onClick={() => { setOpen(false); setShowAchievements(false); }}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm"
                >
                  ✕
                </button>
              </div>

              {showAchievements ? (
                /* ── Achievement wall ── */
                <div>
                  <p className="text-xs text-gray-400 mb-4">
                    {achievements.length} / {getAchievements().length} unlocked
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {getAchievements().map(a => {
                      const unlocked = achievements.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          className={`p-3 rounded-2xl text-center transition-all ${
                            unlocked
                              ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-sm'
                              : 'bg-gray-50 border border-gray-100 opacity-50'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{unlocked ? a.icon : '🔒'}</span>
                          <p className={`text-[11px] font-bold ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{a.label}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{a.description}</p>
                        </div>
                      );
                    })}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAchievements(false)}
                    className="mt-4 w-full py-3 bg-gray-100 rounded-2xl text-sm font-semibold text-gray-600"
                  >
                    ← Back
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Player summary */}
                  <div className="mb-5 p-4 glass-strong rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-mint-200 flex items-center justify-center text-xl shrink-0">
                        ⭐
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">Level {level}</p>
                        <p className="text-[10px] text-gray-400">{xp.toLocaleString()} XP • {dailyLoginStreak}-day streak</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAchievements(true)}
                        className="px-3 py-1.5 bg-yellow-50 rounded-xl text-[10px] font-bold text-yellow-700 border border-yellow-200"
                      >
                        🏆 {achievements.length}
                      </motion.button>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="mb-6 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Preferences</h3>

                    <ToggleRow
                      icon="🔊"
                      label="Sound Effects"
                      desc="Flips, sends, celebrations"
                      enabled={soundEnabled}
                      onToggle={toggleSound}
                    />
                    <ToggleRow
                      icon="📳"
                      label="Haptic Feedback"
                      desc="Vibration on actions"
                      enabled={hapticEnabled}
                      onToggle={toggleHaptic}
                    />
                    {hasNotif && (
                      <ToggleRow
                        icon="🔔"
                        label="Study Reminders"
                        desc="Notifications every 30 min"
                        enabled={notifEnabled}
                        onToggle={async () => {
                          if (notifPermission() === 'default') await requestNotifPermission();
                          toggleNotif();
                        }}
                      />
                    )}
                    <ToggleRow
                      icon="🎊"
                      label="Confetti"
                      desc="Celebration animations"
                      enabled={confettiEnabled}
                      onToggle={toggleConfetti}
                    />
                    <ToggleRow
                      icon="🎠"
                      label="Auto-Rotate Theme"
                      desc="Cycle every 30 seconds"
                      enabled={autoRotateTheme}
                      onToggle={toggleAutoRotate}
                    />
                  </div>

                  {/* Font dropdown */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Font</h3>
                    <CuteSelect<FontOption>
                      value={font}
                      onChange={setFont}
                      options={FONT_OPTIONS as readonly { id: FontOption; label: string; icon?: string }[]}
                      renderOption={(opt) => (
                        <span style={{ fontFamily: FONT_OPTIONS.find(f => f.id === opt.id)?.family ?? undefined }}>
                          {opt.icon} {opt.label}
                        </span>
                      )}
                    />
                  </div>

                  {/* Theme dropdown */}
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CuteSelect<ThemeId>
                        value={theme}
                        onChange={(id) => { setTheme(id); setOpen(false); }}
                        options={THEMES as readonly { id: ThemeId; label: string; icon?: string }[]}
                        renderOption={(opt) => (
                          <>
                            <div className={`w-5 h-5 rounded-full shrink-0 ${THEME_COLORS[opt.id] ?? 'bg-gray-200'}`} />
                            <span className="truncate">{opt.icon} {opt.label}</span>
                          </>
                        )}
                      />
                    </div>
                    {theme === 'piyuu-wild' && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ rotate: 180 }}
                        onClick={() => { regenerateWild(); }}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50/70 hover:bg-gray-100 rounded-2xl shrink-0 text-base transition-all"
                        title="Randomize colors"
                      >
                        🎲
                      </motion.button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ToggleRow({ icon, label, desc, enabled, onToggle }: { icon: string; label: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-2xl">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-[10px] text-gray-400">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          enabled ? 'bg-pink-500' : 'bg-gray-300'
        }`}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
