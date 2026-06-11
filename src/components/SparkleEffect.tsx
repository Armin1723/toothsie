'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SparkleEffectProps {
  show: boolean;
  onComplete?: () => void;
}

export default function SparkleEffect({ show, onComplete }: SparkleEffectProps) {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 0.3,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {sparkles.map(sparkle => (
            <motion.div
              key={sparkle.id}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, sparkle.scale, 0],
                x: sparkle.x,
                y: sparkle.y,
              }}
              transition={{
                duration: 1,
                delay: sparkle.delay,
                ease: 'easeOut',
              }}
              className="absolute text-pink-400"
              style={{ fontSize: '20px' }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
