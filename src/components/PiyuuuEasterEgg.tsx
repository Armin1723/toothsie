'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PiyuuuEasterEgg() {
  const [visits, setVisits] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [input, setInput] = useState('');
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('piyuuu_visits') || '0';
    const count = parseInt(stored) + 1;
    setVisits(count);
    localStorage.setItem('piyuuu_visits', count.toString());
    
    if (count >= 10) {
      setShowSecret(true);
    }
  }, []);

  useEffect(() => {
    if (input.toLowerCase().includes('piyuuu')) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 2000);
    }
  }, [input]);

  return (
    <>
      {/* Hidden input that detects "piyuuu" */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Sparkle effect when piyuuu is typed */}
      <AnimatePresence>
        {showSparkle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                className="absolute text-3xl"
              >
                {['✨', '🦷', '💖', '⭐', '🌟'][i % 5]}
              </motion.span>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-pink-600 bg-white/90 px-6 py-3 rounded-full shadow-xl"
            >
              You're amazing, Piyuuu! 💖
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret mode for 10+ visits */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-pink-100 p-4 z-40"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl animate-bounce">🦷</span>
              <div>
                <p className="text-sm font-bold text-pink-600">Secret Mode Unlocked!</p>
                <p className="text-xs text-gray-500 mt-1">
                  You've visited {visits} times! You're a study superstar, Piyuuu! ⭐
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
