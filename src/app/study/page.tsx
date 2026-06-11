'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from '@/components/Flashcard';
import ErrorState from '@/components/ErrorState';
import ToothMascot from '@/components/ToothMascot';
import SparkleEffect from '@/components/SparkleEffect';

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

    try {
      // Try cached first
      const cachedRes = await fetch(`/api/flashcards?topic=${encodeURIComponent(targetTopic)}`);
      const cachedData = await cachedRes.json();

      if (cachedData.flashcards?.length > 0) {
        setFlashcards(cachedData.flashcards);
        setShowSparkle(true);
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ToothMascot mood="thinking" size="md" message="What shall we study?" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Study Buddy 📚</h1>
        <p className="text-gray-500 text-xs">Type any dental topic and get flashcards!</p>
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

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            <ToothMascot mood="thinking" size="md" showSparkles />
            <p className="mt-4 text-sm text-gray-500 animate-pulse">Generating flashcards...</p>
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
          <span className="text-5xl block mb-4">🦷</span>
          <p className="text-gray-500 text-sm">
            Your study vault is empty!<br />
            Type a topic above to start learning 💖
          </p>
        </motion.div>
      )}
    </div>
  );
}
