'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from '@/components/Flashcard';
import ErrorState from '@/components/ErrorState';
import ToothMascot from '@/components/ToothMascot';
import SparkleEffect from '@/components/SparkleEffect';
import Confetti from '@/components/Confetti';
import { useRandomQuote, useTimeBasedMessage, useStudyStreak, useConsoleEasterEgg } from '@/lib/useEasterEggs';
import { piyuuuQuotes } from '@/lib/easterEggs';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FlashcardData {
  question: string;
  answer: string;
  difficulty: string;
}

export default function StudyPage() {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ type: string; message?: string } | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [savedTopics, setSavedTopics] = useState<any[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);
  const [activeTopic, setActiveTopic] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const loadingQuote = useRandomQuote('loading');
  const timeMessage = useTimeBasedMessage();
  const { streak, message: streakMessage, showCelebration, incrementStreak } = useStudyStreak();

  useConsoleEasterEgg();

  const fetchTopics = useCallback(() => {
    fetch('/api/topics').then(r => r.json()).then(data => setSavedTopics(data.topics || []));
  }, []);

  const fetchUsage = useCallback(() => {
    fetch('/api/usage').then(r => r.json()).then(setUsage);
  }, []);

  useEffect(() => {
    fetchTopics();
    fetchUsage();
  }, [fetchTopics, fetchUsage]);

  const handleGenerate = async (selectedTopic?: string) => {
    const targetTopic = selectedTopic || topic;
    if (!targetTopic.trim()) return;

    setLoading(true);
    setError(null);
    setActiveTopic(targetTopic);
    setCompletionMessage('');

    try {
      // Try cached first
      const cachedRes = await fetch(`/api/flashcards?topic=${encodeURIComponent(targetTopic)}`);
      const cachedData = await cachedRes.json();

      if (cachedData.flashcards?.length > 0) {
        setFlashcards(cachedData.flashcards);
        setShowSparkle(true);
        setCompletionMessage(pickRandom(piyuuuQuotes.completion));
        setLoading(false);
        return;
      }

      // Generate new
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: targetTopic, count: 5 }),
      });

      const data = await res.json();

      if (data.error === 'rate_limited') {
        setError({ type: 'rate_limited', message: data.message });
      } else if (data.error) {
        setError({ type: 'generation_failed', message: data.message });
      } else {
        setFlashcards(data.flashcards);
        setShowSparkle(true);
        incrementStreak();
        setCompletionMessage(pickRandom(piyuuuQuotes.completion));

        // Milestone celebrations
        if ([5, 10, 15, 20, 50, 100].includes(streak + 1)) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }

        fetchTopics();
        fetchUsage();
      }
    } catch (err) {
      setError({ type: 'network_error' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate();
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <SparkleEffect show={showSparkle} onComplete={() => setShowSparkle(false)} />
      <Confetti show={showConfetti} />

      {/* Streak Celebration */}
      <AnimatePresence>
        {showCelebration && streakMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-3xl shadow-2xl text-center"
          >
            <p className="text-lg font-bold">🔥 Streak: {streak}!</p>
            <p className="text-sm mt-1">{streakMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ToothMascot mood={streak >= 5 ? 'excited' : streak >= 3 ? 'love' : 'thinking'} size="md" message="What shall we study?" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Study Buddy 📚</h1>
        <p className="text-gray-500 text-xs">{timeMessage}</p>
        {streak > 0 && (
          <motion.p
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-pink-500 mt-1 font-medium"
          >
            🔥 {streak} topic{streak !== 1 ? 's' : ''} today!
          </motion.p>
        )}
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., mandibular nerve anatomy"
          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none text-sm transition-all"
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleGenerate()}
          disabled={loading || !topic.trim()}
          className="px-5 py-3 bg-pink-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-pink-200 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '⏳' : '✨'}
        </motion.button>
      </motion.div>

      {/* Loading state with rotating quotes */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            <ToothMascot mood="thinking" size="md" showSparkles />
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingQuote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-sm text-pink-500 text-center px-4 font-medium"
              >
                {loadingQuote}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion message */}
      <AnimatePresence>
        {completionMessage && !loading && flashcards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-sm text-pink-600 font-medium bg-pink-50 py-2 px-4 rounded-full inline-block">
              {completionMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <ErrorState
          type={error.type as any}
          message={error.message}
          onRetry={() => {
            setError(null);
            handleGenerate();
          }}
        />
      )}

      {/* Flashcards */}
      {!loading && flashcards.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-500 px-1">
            {activeTopic} • {flashcards.length} cards
          </h2>
          {flashcards.map((card, i) => (
            <Flashcard
              key={i}
              question={card.question}
              answer={card.answer}
              difficulty={card.difficulty}
              index={i}
            />
          ))}

          {/* Random dental fact after cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-mint-50 to-pink-50 rounded-2xl border border-mint-100"
          >
            <p className="text-xs text-gray-500 font-medium mb-1">🦷 Did you know?</p>
            <p className="text-sm text-gray-600">{pickRandom(piyuuuQuotes.dentalFacts)}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Saved Topics */}
      {!loading && savedTopics.length > 0 && flashcards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">Quick Access</h2>
          <div className="flex flex-wrap gap-2">
            {savedTopics.map((t: any) => (
              <motion.button
                key={t.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTopic(t.name);
                  handleGenerate(t.name);
                }}
                className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-pink-600 border border-pink-100 hover:bg-pink-50 transition-colors"
              >
                {t.name} ({t.cardCount})
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && flashcards.length === 0 && !error && savedTopics.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <ToothMascot mood="happy" size="lg" />
          <p className="mt-4 text-gray-500 text-sm">
            Your study vault is empty!<br />
            Type a topic above to start learning 💖
          </p>
          <p className="mt-2 text-xs text-pink-300">
            Try: "dental anatomy", "amoxicillin dosage", or "oral pathology"
          </p>
        </motion.div>
      )}
    </div>
  );
}
