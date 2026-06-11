'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingMascotProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  threshold?: number;
  compactSize?: string;
}

export default function FloatingMascot({
  scrollRef,
  children,
  threshold = 60,
}: FloatingMascotProps) {
  const [floating, setFloating] = useState(false);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrolled = el.scrollTop > threshold;
      setFloating(scrolled);
    };

    // Measure initial offset of the mascot's normal position
    const measure = () => {
      const mascotEl = el.querySelector('[data-mascot-anchor]');
      if (mascotEl) {
        const rect = mascotEl.getBoundingClientRect();
        setTopOffset(rect.top);
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    measure();
    // Re-measure on resize
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, [scrollRef, threshold]);

  return (
    <>
      {/* Normal position anchor */}
      <div data-mascot-anchor className={floating ? 'invisible' : ''}>
        {children}
      </div>

      {/* Floating compact version */}
      <AnimatePresence>
        {floating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, x: -20, y: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, x: -20, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-3 left-3 z-50"
            style={{ top: `${Math.max(topOffset, 8)}px` }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
