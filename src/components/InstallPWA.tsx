'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showInstall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-to-r from-pink-500 to-pink-600 rounded-3xl shadow-2xl p-4 z-40"
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-bounce">🦷</div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Install Tooth Vault!</p>
            <p className="text-pink-100 text-xs mt-0.5">Add to home screen for the full experience</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 py-2 bg-white text-pink-600 rounded-xl font-semibold text-sm hover:bg-pink-50 transition-colors"
          >
            Install ✨
          </button>
          <button
            onClick={() => setShowInstall(false)}
            className="px-4 py-2 text-pink-100 text-sm hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
