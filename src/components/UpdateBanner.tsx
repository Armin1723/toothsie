'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpdateBanner() {
  const [updateReady, setUpdateReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
      } catch {
        // SW registration failed — not critical
      }
    };

    // Wait for the page to load before registering
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }

    // Detect updates via controller change
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setUpdateReady(false);
  };

  return (
    <AnimatePresence>
      {updateReady && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[80] max-w-lg mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-pink-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
              <span className="text-lg">🦷</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">New version available!</p>
              <p className="text-[10px] text-gray-400">Refresh to get the latest features</p>
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-pink-200 hover:bg-pink-600 transition-colors whitespace-nowrap"
            >
              Update
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
