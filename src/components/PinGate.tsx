'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PIN = '1710';

const KEY_LABELS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(true);
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unlocked = sessionStorage.getItem('piyuuu_unlocked');
    if (unlocked === '1') setLocked(false);
  }, []);

  const handleKey = useCallback((key: string) => {
    if (key === '⌫') {
      setDigits(prev => prev.slice(0, -1));
      setError(false);
    } else if (digits.length < 4) {
      const next = [...digits, key];
      setDigits(next);
      setError(false);
      if (next.length === 4) {
        if (next.join('') === PIN) {
          sessionStorage.setItem('piyuuu_unlocked', '1');
          setTimeout(() => setLocked(false), 150);
        } else {
          setError(true);
          setTimeout(() => setDigits([]), 400);
        }
      }
    }
  }, [digits]);

  return (
    <>
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-gradient-to-b from-pink-100 via-white to-mint-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
              className="text-center px-6"
            >
              {/* Tooth icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl mb-4"
              >
                🦷🔒
              </motion.div>

              <h1 className="text-2xl font-bold font-heading text-gray-800 mb-1">
                Piyuuu's Tooth Vault
              </h1>
              <p className="text-sm text-pink-400 mb-8">Enter PIN to unlock</p>

              {/* Dots */}
              <div className="flex justify-center gap-3 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={error ? {
                      x: [0, -4, 4, -4, 4, 0],
                      backgroundColor: '#f43f5e',
                    } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      i < digits.length
                        ? 'bg-pink-500 border-pink-500 scale-110'
                        : error
                        ? 'border-rose-400'
                        : 'border-pink-200'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
                {KEY_LABELS.flat().map((key) => (
                  key === '' ? (
                    <div key="empty" />
                  ) : (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleKey(key)}
                      className={`h-14 rounded-2xl text-lg font-semibold shadow-sm transition-colors ${
                        key === '⌫'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-white text-gray-800 border-2 border-pink-100'
                      }`}
                    >
                      {key === '⌫' ? '⌫' : key}
                    </motion.button>
                  )
                ))}
              </div>

              {/* Hint */}
              <p className="mt-6 text-[10px] text-pink-300">Hint: It's a special date 💖</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
