'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ToothMascot from '@/components/ToothMascot';
import UsageBar from '@/components/UsageBar';
import { useTimeBasedMessage, useStudyStreak, useConsoleEasterEgg } from '@/lib/useEasterEggs';
import { piyuuuQuotes } from '@/lib/easterEggs';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
  const [randomFact, setRandomFact] = useState('');
  const [visits, setVisits] = useState(0);

  const timeMessage = useTimeBasedMessage();
  const { streak } = useStudyStreak();
  useConsoleEasterEgg();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else if (hour < 21) setGreeting('Good evening');
    else setGreeting('Burning the midnight oil');

    setRandomFact(pickRandom(piyuuuQuotes.dentalFacts));

    const stored = localStorage.getItem('piyuuu_visits') || '0';
    setVisits(parseInt(stored));

    fetch('/api/usage').then(r => r.json()).then(setStats);
    fetch('/api/topics').then(r => r.json()).then(data => setTopics(data.topics || []));
  }, []);

  const getMascotMood = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return 'sleepy';
    if (streak >= 5) return 'excited';
    if (streak >= 2) return 'love';
    return 'happy';
  };

  const getSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return "Late night study session? You're a star! 🌙";
    if (hour < 10) return "Early bird catches the knowledge! 🐦";
    if (streak >= 5) return "You're on FIRE today! Keep going! 🔥";
    if (streak >= 2) return "Building momentum! 💪";
    return "What shall we learn today?";
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ToothMascot mood={getMascotMood()} size="lg" showSparkles message="Let's study!" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">
          {greeting}, Piyuuu! 💖
        </h1>
        <p className="text-gray-500 text-sm mt-1">{getSubtitle()}</p>

        {/* Visit milestone */}
        <AnimatePresence>
          {visits > 0 && (
            <motion.p
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-pink-300 mt-2"
            >
              Visit #{visits} — {visits === 1 ? 'Welcome!' : visits < 10 ? 'Nice to see you again!' : visits < 50 ? 'Regular student!' : 'True loyal student!'} 💖
            </motion.p>
          )}
        </AnimatePresence>
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
            className="p-6 bg-white rounded-3xl shadow-lg border border-pink-100 text-center relative overflow-hidden"
          >
            {streak >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl rounded-tr-xl"
              >
                🔥 {streak}
              </motion.div>
            )}
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

      {/* Random dental fact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-gradient-to-r from-mint-50 to-pink-50 rounded-2xl border border-mint-100"
      >
        <p className="text-xs text-gray-400 font-medium mb-1">🦷 Daily Dental Fact</p>
        <p className="text-sm text-gray-600">{randomFact}</p>
      </motion.div>

      {/* Recent Topics */}
      {topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">Your Study Topics</h2>
          <div className="space-y-2">
            {topics.slice(0, 5).map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
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

      {/* Fun footer with rotating messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center pb-4"
      >
        <p className="text-xs text-pink-300">Made with 💖 for Piyuuu's dental journey 🦷</p>
        <p className="text-[10px] text-pink-200 mt-1 italic">{timeMessage}</p>
      </motion.div>
    </div>
  );
}
