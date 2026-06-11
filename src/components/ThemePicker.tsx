'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, useTheme, type ThemeId } from '@/lib/ThemeContext';
import { useSettings } from '@/lib/SettingsContext';

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 30 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center bg-white/70 backdrop-blur rounded-full shadow-theme-sm border border-pink-100 text-base"
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
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">Settings</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Sound & Haptic toggles */}
              <div className="mb-6 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Feedback</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔊</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Sound Effects</p>
                      <p className="text-[10px] text-gray-400">Flips, sends, celebrations</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      soundEnabled ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                      style={{ transform: soundEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📳</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Haptic Feedback</p>
                      <p className="text-[10px] text-gray-400">Vibration on actions</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleHaptic}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      hapticEnabled ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                      style={{ transform: hapticEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              </div>

              {/* Theme grid */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => {
                  const active = theme === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setTheme(t.id as ThemeId);
                        setOpen(false);
                      }}
                      className={`relative p-4 rounded-2xl text-center transition-all ${
                        active
                          ? 'bg-pink-50 border-2 border-pink-500 shadow-theme-md'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-lg ${
                        t.id === 'piyuu' ? 'bg-pink-100' :
                        t.id === 'piyuu-dark' ? 'bg-gray-800' :
                        t.id === 'piyuu-lavender' ? 'bg-purple-100' :
                        t.id === 'piyuu-rose' ? 'bg-rose-100' :
                        t.id === 'piyuu-ocean' ? 'bg-blue-100' :
                        t.id === 'piyuu-sunset' ? 'bg-orange-100' :
                        'bg-green-100'
                      }`}>
                        {t.emoji}
                      </div>
                      <p className="text-xs font-bold text-gray-800">{t.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
