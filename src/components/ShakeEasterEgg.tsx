'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shakeMessages } from '@/lib/easterEggs';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SHAKE_THRESHOLD = 18;
const SHAKE_COOLDOWN = 4000;

export default function ShakeEasterEgg() {
  const [showShake, setShowShake] = useState(false);
  const [message, setMessage] = useState('');
  const [intensity, setIntensity] = useState(0);
  const lastShake = useRef(0);
  const listening = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc?.x || !acc?.y || !acc?.z) return;

      const magnitude = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2
      );
      const shakeIntensity = Math.abs(magnitude - 9.81);

      if (shakeIntensity > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShake.current < SHAKE_COOLDOWN) return;
        lastShake.current = now;

        setIntensity(Math.min(Math.round(shakeIntensity), 60));
        setMessage(pickRandom(shakeMessages));
        setShowShake(true);
        setTimeout(() => setShowShake(false), 3000);

        // Vibrate as feedback
        try {
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
          }
        } catch { /* silent */ }
      }
    };

    // Request permission for iOS 13+
    const requestPermission = async () => {
      if (
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        try {
          const result = await (DeviceMotionEvent as any).requestPermission();
          if (result === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            listening.current = true;
          }
        } catch { /* silent */ }
      } else {
        // No permission needed (Android / older iOS)
        window.addEventListener('devicemotion', handleMotion);
        listening.current = true;
      }
    };

    // Auto-start on devices that don't require permission
    if (
      typeof (DeviceMotionEvent as any).requestPermission !== 'function'
    ) {
      window.addEventListener('devicemotion', handleMotion);
      listening.current = true;
    }

    // Show a one-time instruction toast on first visit
    const shakeHinted = localStorage.getItem('piyuuu_shake_hinted');
    if (!shakeHinted) {
      // We show nothing — user discovers naturally
      localStorage.setItem('piyuuu_shake_hinted', 'true');
    }

    return () => {
      if (listening.current) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {showShake && (
        <motion.div
          key="shake-toast"
          initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.3, rotate: 20, y: 50 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{
              x: [0, -8, 8, -6, 6, -3, 3, 0],
            }}
            transition={{ duration: 0.5 }}
            className="bg-white/95 backdrop-blur px-6 py-5 rounded-3xl shadow-2xl border-2 border-pink-200 max-w-xs mx-4 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-5xl mb-2"
            >
              🦷
            </motion.div>
            <motion.div
              className="text-xs font-bold text-pink-500 mb-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, repeat: 3 }}
            >
              🌪️ SHAKE DETECTED! 🌪️
            </motion.div>
            <p className="text-sm text-gray-700">{message}</p>
            <div className="mt-2 h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min((intensity / 60) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Shake intensity: {intensity}g
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
