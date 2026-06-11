'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

const confettiColors = ['#ec4899', '#f472b6', '#a855f7', '#14b8a6', '#fbbf24', '#f43f5e'];
const confettiShapes = ['🦷', '✨', '⭐', '💖', '🎉', '🌟'];

export default function Confetti({ show, duration = 3000 }: ConfettiProps) {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: confettiColors[i % confettiColors.length],
    shape: confettiShapes[i % confettiShapes.length],
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
          {pieces.map(piece => (
            <motion.div
              key={piece.id}
              initial={{
                opacity: 1,
                y: -20,
                x: `${piece.x}vw`,
                rotate: 0,
                scale: piece.scale,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: '100vh',
                rotate: piece.rotation,
                scale: piece.scale,
              }}
              transition={{
                duration: duration / 1000,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              className="absolute text-2xl"
              style={{ left: `${piece.x}%` }}
            >
              {piece.shape}
            </motion.div>
          ))}

          {/* Center celebration message */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white/95 backdrop-blur px-8 py-6 rounded-3xl shadow-2xl border-2 border-pink-200 text-center">
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-4xl mb-2"
              >
                🎉
              </motion.p>
              <p className="text-lg font-bold text-pink-600">Amazing Streak!</p>
              <p className="text-sm text-gray-500 mt-1">Keep it up, Piyuuu!</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
