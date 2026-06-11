'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { secretMessages, piyuuuQuotes } from '@/lib/easterEggs';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PiyuuuEasterEgg() {
  const [visits, setVisits] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');
  const [showSecretToast, setShowSecretToast] = useState(false);
  const [tapSequence, setTapSequence] = useState<number[]>([]);
  const [showHiddenMode, setShowHiddenMode] = useState(false);
  const [hiddenFact, setHiddenFact] = useState('');

  // Track visits
  useEffect(() => {
    const stored = localStorage.getItem('piyuuu_visits') || '0';
    const count = parseInt(stored) + 1;
    setVisits(count);
    localStorage.setItem('piyuuu_visits', count.toString());

    if (count === 5 || count === 15 || count === 25 || count === 50) {
      setSecretMessage(pickRandom(secretMessages));
      setShowSecretToast(true);
      setTimeout(() => setShowSecretToast(false), 4000);
    }

    if (count >= 10) {
      setShowSecret(true);
    }
  }, []);

  // Secret tap sequence (tap the tooth 3 times quickly)
  const handleToothTap = useCallback(() => {
    const now = Date.now();
    const newSequence = [...tapSequence.filter(t => now - t < 1500), now];
    setTapSequence(newSequence);

    if (newSequence.length >= 3) {
      setShowHiddenMode(true);
      setHiddenFact(pickRandom(piyuuuQuotes.dentalFacts));
      setTapSequence([]);
      setTimeout(() => setShowHiddenMode(false), 5000);
    }
  }, [tapSequence]);

  // Keyboard shortcut: type "piyuuu"
  useEffect(() => {
    let buffer = '';
    const handler = (e: KeyboardEvent) => {
      buffer += e.key.toLowerCase();
      if (buffer.length > 10) buffer = buffer.slice(-10);
      if (buffer.includes('piyuuu')) {
        buffer = '';
        const msg = pickRandom([
          "You're amazing, Piyuuu! 💖",
          "The world is better with you in it! 🌍",
          "You're going to be the best dentist ever! 🩺",
          "Your smile is contagious! 😊",
          "Piyuuu = Pure Brilliance! ✨",
          "You make teeth happy! 🦷",
          "Future Dr. Piyuuu, coming soon! 🎓",
        ]);
        setSecretMessage(msg);
        setShowSecretToast(true);
        setTimeout(() => setShowSecretToast(false), 4000);
      }
    };
    window.addEventListener('keypress', handler);
    return () => window.removeEventListener('keypress', handler);
  }, []);

  return (
    <>
      {/* Secret toast notification */}
      <AnimatePresence>
        {showSecretToast && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 left-4 right-4 z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-mint-400 text-white p-4 rounded-3xl shadow-2xl text-center"
          >
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="text-lg font-bold"
            >
              ✨ Secret Found! ✨
            </motion.p>
            <p className="text-sm mt-1 opacity-90">{secretMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden dental fact mode */}
      <AnimatePresence>
        {showHiddenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur px-8 py-6 rounded-3xl shadow-2xl border-2 border-pink-200 max-w-sm mx-4 pointer-events-auto">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-5xl text-center mb-3"
              >
                🦷
              </motion.div>
              <p className="text-sm text-gray-500 text-center font-medium">SECRET DENTAL FACT</p>
              <p className="text-sm text-gray-700 text-center mt-2">{hiddenFact}</p>
              <button
                onClick={() => setShowHiddenMode(false)}
                className="mt-4 w-full py-2 bg-pink-100 text-pink-600 rounded-xl text-sm font-semibold"
              >
                Cool! 😎
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret mode banner (10+ visits) */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-pink-100 p-4 z-40"
          >
            <div className="flex items-start gap-3">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl cursor-pointer"
                onClick={handleToothTap}
              >
                🦷
              </motion.span>
              <div className="flex-1">
                <p className="text-sm font-bold text-pink-600">Secret Mode Active!</p>
                <p className="text-xs text-gray-500 mt-1">
                  {visits} visits! You&apos;re a superstar, Piyuuu! ⭐
                </p>
                <p className="text-[10px] text-pink-300 mt-1 italic">
                  Hint: tap the tooth 3 times quickly...
                </p>
              </div>
              <button
                onClick={() => setShowSecret(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
