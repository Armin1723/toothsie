'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ToothMascot from '@/components/ToothMascot';
import UsageBar from '@/components/UsageBar';

interface UsageStats {
  used: number;
  tokens_used: number;
}

interface Topic {
  name: string;
  cardCount: number;
}

export default function Home() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetch('/api/usage').then(r => r.json()).then(setStats);
    fetch('/api/topics').then(r => r.json()).then(data => setTopics(data.topics || []));
  }, []);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ToothMascot mood="excited" size="lg" showSparkles message="Let's study!" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">
          {greeting}, Piyuuu! 💖
        </h1>
        <p className="text-gray-500 text-sm mt-1">What shall we learn today?</p>
      </motion.div>

      {/* Usage Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <UsageBar {...stats} />
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/study">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-6 bg-white rounded-3xl shadow-lg border border-pink-100 text-center"
          >
            <span className="text-4xl block mb-3">📚</span>
            <h3 className="font-bold text-gray-800">Study Buddy</h3>
            <p className="text-xs text-gray-500 mt-1">Flashcards & notes</p>
          </motion.div>
        </Link>

        <Link href="/cases">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-6 bg-white rounded-3xl shadow-lg border border-mint-100 text-center"
          >
            <span className="text-4xl block mb-3">🏥</span>
            <h3 className="font-bold text-gray-800">Case Studies</h3>
            <p className="text-xs text-gray-500 mt-1">Clinical cases</p>
          </motion.div>
        </Link>
      </div>

      {/* Recent Topics */}
      {topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">Your Study Topics</h2>
          <div className="space-y-2">
            {topics.slice(0, 5).map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/80 rounded-2xl border border-pink-50"
              >
                <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                <span className="text-xs text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                  {topic.cardCount} cards
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fun footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-pink-300 pb-4"
      >
        Made with 💖 for Piyuuu's dental journey 🦷
      </motion.p>
    </div>
  );
}
