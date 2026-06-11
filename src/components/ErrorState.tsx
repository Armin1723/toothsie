'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ErrorStateProps {
  type: 'limit_reached' | 'generation_failed' | 'network_error' | 'not_found';
  message?: string;
  onRetry?: () => void;
}

const errorConfigs = {
  limit_reached: {
    emoji: '😴',
    title: "Time for a study break!",
    subtitle: "You've learned enough for today. Come back tomorrow!",
    sticker: '🦷💤',
    bgClass: 'from-purple-50 to-pink-50',
  },
  generation_failed: {
    emoji: '🙈',
    title: "Oops! Our tooth helper tripped!",
    subtitle: "Don't worry, it happens! Let's try again?",
    sticker: '🦷🩹',
    bgClass: 'from-orange-50 to-yellow-50',
  },
  network_error: {
    emoji: '📡',
    title: "No internet? No problem!",
    subtitle: "Check your connection and try again!",
    sticker: '🦷📵',
    bgClass: 'from-blue-50 to-cyan-50',
  },
  not_found: {
    emoji: '🔍',
    title: "Nothing here yet!",
    subtitle: "Generate some content to get started!",
    sticker: '🦷✨',
    bgClass: 'from-gray-50 to-slate-50',
  },
};

export default function ErrorState({ type, message, onRetry }: ErrorStateProps) {
  const config = errorConfigs[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b ${config.bgClass} border border-white/50 shadow-xl`}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          {config.emoji}
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{config.title}</h3>
        <p className="text-gray-500 text-center text-sm mb-2">{message || config.subtitle}</p>
        <p className="text-3xl mb-4">{config.sticker}</p>
        
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors"
          >
            Try Again ✨
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
