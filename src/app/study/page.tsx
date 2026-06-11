'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from '@/components/Flashcard';
import ErrorState from '@/components/ErrorState';
import ToothMascot from '@/components/ToothMascot';
import SparkleEffect from '@/components/SparkleEffect';
import Confetti from '@/components/Confetti';
import { useRandomQuote, useTimeBasedMessage, useStudyStreak, useConsoleEasterEgg } from '@/lib/useEasterEggs';
import { piyuuuQuotes } from '@/lib/easterEggs';
import { useFeedback } from '@/lib/useFeedback';
import { useGamification } from '@/lib/GamificationContext';
import { useSettings } from '@/lib/SettingsContext';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface FlashcardData {
  question: string;
  answer: string;
  difficulty: string;
}

type Mode = 'flashcard' | 'quiz';

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
  const [mode, setMode] = useState<Mode>('flashcard');
  const [eli5Mode, setEli5Mode] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const quizScoreRef = useRef(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const loadingQuote = useRandomQuote('loading');
  const timeMessage = useTimeBasedMessage();
  const feedback = useFeedback();
  const { streak, message: streakMessage, showCelebration, incrementStreak } = useStudyStreak();
  const gamification = useGamification();
  const { confettiEnabled } = useSettings();

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

  // Generate quiz options when mode changes or flashcards change
  useEffect(() => {
    if (mode === 'quiz' && flashcards.length >= 3 && quizIndex < flashcards.length) {
      generateQuizOptions(quizIndex);
    }
  }, [mode, flashcards, quizIndex]);

  function generateQuizOptions(index: number) {
    const correct = flashcards[index].answer;
    const others = flashcards.filter((_, i) => i !== index).map(f => f.answer);
    const wrong = shuffle(others).slice(0, 3);
    while (wrong.length < 3 && flashcards.length > 1) {
      wrong.push(flashcards[0].answer);
    }
    setQuizOptions(shuffle([correct, ...wrong]));
    setSelectedAnswer(null);
  }

  const handleGenerate = async (selectedTopic?: string) => {
    const targetTopic = selectedTopic || topic;
    if (!targetTopic.trim()) return;

    setLoading(true);
    setError(null);
    setActiveTopic(targetTopic);
    setCompletionMessage('');
    setQuizIndex(0);
    setQuizScore(0);
    setQuizDone(false);

    try {
      const cachedRes = await fetch(`/api/flashcards?topic=${encodeURIComponent(targetTopic)}`);
      const cachedData = await cachedRes.json();

      if (cachedData.flashcards?.length > 0) {
        setFlashcards(cachedData.flashcards);
        setShowSparkle(true);
        setCompletionMessage(pickRandom(piyuuuQuotes.completion));
        setLoading(false);
        gamification.incrementStat('totalStudySessions');
        gamification.earnXp(3);
        return;
      }

      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: targetTopic, count: 5, eli5: eli5Mode }),
      });

      const data = await res.json();

      if (data.error === 'rate_limited') {
        setError({ type: 'rate_limited', message: data.message });
      } else if (data.error) {
        setError({ type: 'generation_failed', message: data.message });
      } else {
        feedback.generate();
        setFlashcards(data.flashcards);
        setShowSparkle(true);
        incrementStreak();
        setCompletionMessage(pickRandom(piyuuuQuotes.completion));
        gamification.incrementStat('totalStudySessions');
        gamification.incrementStat('totalCardsFlipped');
        gamification.earnXp(data.flashcards.length * 3);

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

  const handleQuizAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === flashcards[quizIndex].answer;
    if (correct) {
      setQuizScore(prev => {
        const next = prev + 1;
        quizScoreRef.current = next;
        return next;
      });
      feedback.success();
    } else {
      feedback.error();
    }

    setTimeout(() => {
      if (quizIndex + 1 >= flashcards.length) {
        setQuizDone(true);
        gamification.earnXp(quizScoreRef.current * 5);
      } else {
        setQuizIndex(prev => prev + 1);
      }
    }, 1200);
  };

  const handleShareAll = useCallback(async () => {
    if (flashcards.length === 0) return;
    const text = `🦷 Piyuuu's Tooth Vault — ${activeTopic}\n\n${flashcards.map((f, i) => `Q${i + 1}: ${f.question}\nA: ${f.answer}`).join('\n\n')}\n\n— from Tooth Vault 🦷`;
    if (navigator.share) {
      try { await navigator.share({ title: `Dental Flashcards: ${activeTopic}`, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [flashcards, activeTopic]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate();
  };

  const handleRetry = () => {
    setQuizIndex(0);
    setQuizScore(0);
    quizScoreRef.current = 0;
    setQuizDone(false);
    setMode('flashcard');
  };

  return (
    <div className="px-4 py-6 space-y-5">
      <SparkleEffect show={showSparkle} onComplete={() => setShowSparkle(false)} />
      {confettiEnabled && <Confetti show={showConfetti} />}

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

      {/* ELI5 toggle — set before generating */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setEli5Mode(v => !v)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            eli5Mode
              ? 'bg-mint-100 text-mint-700 border-mint-300 shadow-sm'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-mint-200'
          }`}
        >
          🧒 {eli5Mode ? 'ELI5 Mode ON — super simple!' : 'Explain Like I\'m 5'}
        </button>
        {eli5Mode && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] text-mint-500"
          >
            Results will be super simple ✨
          </motion.span>
        )}
      </div>

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

      {/* Mode toggles (only when cards loaded) */}
      {!loading && flashcards.length > 0 && !quizDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex bg-white rounded-2xl border border-pink-100 p-1">
            <button
              onClick={() => { setMode('flashcard'); setEli5Mode(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${mode === 'flashcard' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-pink-600'}`}
            >
              📇 Flashcards
            </button>
            <button
              onClick={() => { setMode('quiz');     setQuizIndex(0);
    setQuizScore(0);
    quizScoreRef.current = 0;
    setQuizDone(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${mode === 'quiz' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-pink-600'}`}
            >
              🧪 Quiz
            </button>
          </div>
          <button
            onClick={() => setEli5Mode(v => !v)}
            className={`px-3 py-2 rounded-2xl text-xs font-semibold transition-all border ${eli5Mode ? 'bg-mint-100 text-mint-700 border-mint-300' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-mint-200'}`}
          >
            {eli5Mode ? '🧒 ELI5 ON' : '🧒 ELI5'}
          </button>
          <button
            onClick={handleShareAll}
            className="px-3 py-2 rounded-2xl text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200 hover:border-pink-200 transition-all"
            title="Share all cards"
          >
            📤
          </button>
        </motion.div>
      )}

      {/* Completion message */}
      <AnimatePresence>
        {completionMessage && !loading && flashcards.length > 0 && !quizDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-sm text-pink-600 font-medium glass py-2 px-4 rounded-full inline-block">
              {completionMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
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

      {/* Quiz mode */}
      {!loading && mode === 'quiz' && flashcards.length > 0 && !quizDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Quiz progress */}
          <div className="flex items-center justify-between px-1">
            <div className="flex gap-1">
              {flashcards.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${
                  i === quizIndex ? 'w-6 bg-pink-500' : i < quizIndex ? 'w-2 bg-mint-400' : 'w-2 bg-gray-200'
                }`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Score: {quizScore}/{quizIndex + (selectedAnswer ? 1 : 0)}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={quizIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-5 bg-white rounded-3xl shadow-lg border-2 border-pink-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">❓</span>
                <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">Question {quizIndex + 1}/{flashcards.length}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-4">{flashcards[quizIndex].question}</p>
              <div className="space-y-2">
                {quizOptions.map((opt, i) => {
                  const isCorrect = opt === flashcards[quizIndex].answer;
                  const isSelected = selectedAnswer === opt;
                  const showResult = selectedAnswer !== null;

                  let btnClass = 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700';
                  if (showResult && isCorrect) btnClass = 'bg-mint-100 border-mint-400 text-mint-700 ring-2 ring-mint-400';
                  else if (showResult && isSelected && !isCorrect) btnClass = 'bg-red-100 border-red-300 text-red-700';

                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(opt)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-3 rounded-2xl border text-sm font-medium transition-all ${btnClass}`}
                    >
                      <span className="mr-2 text-xs text-gray-400">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quiz done */}
      {!loading && mode === 'quiz' && quizDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 glass rounded-3xl"
        >
          <span className="text-4xl block mb-3">🎉</span>
          <h2 className="text-lg font-bold text-gray-800">Quiz Complete!</h2>
          <p className="text-3xl font-bold text-pink-500 mt-2">{quizScore}/{flashcards.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {quizScore === flashcards.length ? 'Perfect score! You are a dental genius! 🦷✨' :
             quizScore >= flashcards.length * 0.8 ? 'Great job! Almost perfect! 💪' :
             quizScore >= flashcards.length * 0.6 ? 'Good effort! Keep studying! 📚' :
             'Keep practicing! You will get there! 💖'}
          </p>
          <p className="text-xs text-gray-400 mt-2">+{quizScore * 5} XP earned!</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={handleRetry} className="px-4 py-2 bg-pink-500 text-white rounded-2xl text-sm font-semibold">🔄 Retry</button>
            <button onClick={() => { setMode('flashcard'); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl text-sm font-semibold">📇 Review Cards</button>
          </div>
        </motion.div>
      )}

      {/* Flashcards */}
      {!loading && mode === 'flashcard' && flashcards.length > 0 && (
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
              total={flashcards.length}
              topic={activeTopic}
            />
          ))}

          {/* Dental fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 glass rounded-2xl border border-mint-100"
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
                className="px-3 py-1.5 glass rounded-full text-xs font-medium text-pink-600 border border-pink-100 hover:bg-pink-50 transition-colors"
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
            Try: &ldquo;dental anatomy&rdquo;, &ldquo;amoxicillin dosage&rdquo;, or &ldquo;oral pathology&rdquo;
          </p>
        </motion.div>
      )}
    </div>
  );
}