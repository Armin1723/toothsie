'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { histoSlides, shuffleSlides, CATEGORIES, type HistoSlide } from '@/data/histoSlides';
import { compressImage } from '@/lib/compressImage';
import { piyuuuQuotes } from '@/lib/easterEggs';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ROUNDS_PER_GAME = 10;
const MAX_IDENTIFY_PER_DAY = 10;
const HISTORY_KEY = 'piyuuu_histo_identify_history';

interface IdentifyResult {
  tissue: string;
  stain: string;
  magnification: string;
  features: string[];
  description: string;
  confidence: string;
}

interface IdentifyHistoryItem {
  id: number;
  result: IdentifyResult;
  date: string;
}

const TABS = [
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
  { id: 'identify', label: 'Identify', icon: '🔬' },
] as const;

export default function HistoPage() {
  const [tab, setTab] = useState<'quiz' | 'identify'>('quiz');

  // ─── Quiz state ───
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [round, setRound] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [deck, setDeck] = useState<HistoSlide[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [results, setResults] = useState<{ slide: HistoSlide; correct: boolean }[]>([]);
  const [category, setCategory] = useState<string>('All');

  // ─── Identify state ───
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [identifyCount, setIdentifyCount] = useState(0);
  const [history, setHistory] = useState<IdentifyHistoryItem[]>([]);
  const [quote, setQuote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved data
  useEffect(() => {
    const h = localStorage.getItem('piyuuu_histo_high');
    if (h) setHighScore(parseInt(h));
    const s = localStorage.getItem('piyuuu_histo_streak');
    if (s) setBestStreak(parseInt(s));

    // Identify count for today
    const today = new Date().toDateString();
    const countData = localStorage.getItem('piyuuu_identify_count');
    if (countData) {
      const { date, count } = JSON.parse(countData);
      if (date === today) setIdentifyCount(count);
    }

    // Identify history
    const hist = localStorage.getItem(HISTORY_KEY);
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  const incrementIdentifyCount = () => {
    const today = new Date().toDateString();
    const newCount = identifyCount + 1;
    setIdentifyCount(newCount);
    localStorage.setItem('piyuuu_identify_count', JSON.stringify({ date: today, count: newCount }));
  };

  const saveToHistory = (result: IdentifyResult) => {
    const item: IdentifyHistoryItem = {
      id: Date.now(),
      result,
      date: new Date().toLocaleString(),
    };
    const updated = [item, ...history].slice(0, 20); // keep last 20
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIdentifyResult(null);
    setIdentifyError(null);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch {
      setIdentifyError('Failed to process image. Please try another file.');
    }
  };

  const handleIdentify = async () => {
    if (!image || identifying) return;
    if (identifyCount >= MAX_IDENTIFY_PER_DAY) {
      setIdentifyError(`Daily limit reached (${MAX_IDENTIFY_PER_DAY}/day). Try again tomorrow!`);
      return;
    }
    setIdentifying(true);
    setIdentifyResult(null);
    setIdentifyError(null);
    setQuote(pickRandom(piyuuuQuotes.loading));

    const quoteInterval = setInterval(() => {
      setQuote(pickRandom(piyuuuQuotes.loading));
    }, 4000);

    try {
      const res = await fetch('/api/histo/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (data.error) {
        setIdentifyError(data.message || 'Failed to analyze the slide.');
      } else {
        setIdentifyResult(data);
        saveToHistory(data);
        incrementIdentifyCount();
      }
    } catch {
      setIdentifyError('Network error. Please check your connection and try again.');
    } finally {
      clearInterval(quoteInterval);
      setIdentifying(false);
    }
  };

  const resetIdentify = () => {
    setImage(null);
    setFileName('');
    setIdentifyResult(null);
    setIdentifyError(null);
  };

  // ─── Quiz handlers ───
  const filteredSlides = useMemo(() => {
    if (category === 'All') return histoSlides;
    return histoSlides.filter(s => s.category === category);
  }, [category]);

  const startGame = useCallback(() => {
    const slides = shuffleSlides(filteredSlides).slice(0, ROUNDS_PER_GAME);
    setDeck(slides);
    setRound(0);
    setQuizScore(0);
    setStreak(0);
    setSelected(null);
    setRevealed(false);
    setResults([]);
    setGameState('playing');
  }, [filteredSlides]);

  const handleAnswer = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    const correct = index === deck[round].correctIndex;
    if (correct) {
      setQuizScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        if (next > bestStreak) {
          setBestStreak(next);
          localStorage.setItem('piyuuu_histo_streak', next.toString());
        }
        return next;
      });
    } else {
      setStreak(0);
    }
    setResults(r => [...r, { slide: deck[round], correct }]);
  };

  const nextRound = () => {
    if (round + 1 >= deck.length) {
      if (quizScore > highScore) {
        setHighScore(quizScore);
        localStorage.setItem('piyuuu_histo_high', quizScore.toString());
      }
      setGameState('results');
      return;
    }
    setRound(r => r + 1);
    setSelected(null);
    setRevealed(false);
  };

  const currentSlide = deck[round];

  return (
    <div className="px-4 pt-4 pb-2 min-h-[calc(100dvh-5rem)] flex flex-col">
      {/* Tab bar */}
      <div className="flex bg-white rounded-2xl p-1 border border-pink-100 mb-4 shadow-sm">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                : 'text-gray-500 hover:text-pink-500'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ────── QUIZ MODE ────── */}
      {tab === 'quiz' && (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <h1 className="text-lg font-bold text-gray-800">🔬 Histo Slide Guesser</h1>
            <p className="text-xs text-gray-500 mt-0.5">Can you identify the slide?</p>
          </motion.div>

          {gameState === 'menu' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white rounded-2xl p-3 border border-pink-100 text-center shadow-sm">
                  <p className="text-lg font-bold text-pink-500">{highScore}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Best Score</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-pink-100 text-center shadow-sm">
                  <p className="text-lg font-bold text-pink-500">{bestStreak}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Best Streak</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-pink-100 text-center shadow-sm">
                  <p className="text-lg font-bold text-pink-500">{histoSlides.length}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Total Slides</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">Filter by category</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setCategory('All')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === 'All' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'bg-white text-gray-600 border border-pink-100 hover:border-pink-200'}`}>
                    All ({histoSlides.length})
                  </button>
                  {CATEGORIES.map(cat => {
                    const count = histoSlides.filter(s => s.category === cat).length;
                    return (
                      <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === cat ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'bg-white text-gray-600 border border-pink-100 hover:border-pink-200'}`}>
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex items-end">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={startGame} className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-3xl font-bold text-lg shadow-lg shadow-pink-200">
                  {filteredSlides.length < ROUNDS_PER_GAME ? `Start (${filteredSlides.length} slides)` : `Start Game (${ROUNDS_PER_GAME} rounds)`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && currentSlide && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-pink-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((round + 1) / deck.length) * 100}%` }} className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full" />
                </div>
                <span className="text-xs font-bold text-pink-500 whitespace-nowrap">{round + 1}/{deck.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-pink-500">Score: {quizScore}</span>
                  {streak >= 2 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs bg-gradient-to-r from-pink-500 to-pink-600 text-white px-2 py-0.5 rounded-full font-bold">🔥 {streak}</motion.span>}
                </div>
                <span className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded-full border border-pink-50">{currentSlide.category}</span>
              </div>

              <motion.div key={currentSlide.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-5 border border-pink-100 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔬</span>
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Slide #{currentSlide.id}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{currentSlide.description}</p>
              </motion.div>

              <div className="flex-1 space-y-2">
                {currentSlide.options.map((option, i) => {
                  const isCorrect = i === currentSlide.correctIndex;
                  const isSelected = selected === i;
                  let bg = 'bg-white border-pink-100 hover:border-pink-200';
                  if (revealed && isCorrect) bg = 'bg-green-50 border-green-400';
                  else if (revealed && isSelected && !isCorrect) bg = 'bg-red-50 border-red-400';
                  else if (isSelected) bg = 'bg-pink-50 border-pink-400';
                  return (
                    <motion.button key={`${currentSlide.id}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileTap={revealed ? {} : { scale: 0.98 }} onClick={() => handleAnswer(i)} disabled={revealed} className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all ${bg}`}>
                      <div className="flex items-start gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${revealed && isCorrect ? 'bg-green-500 text-white' : revealed && isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(97 + i)}
                        </span>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-mint-50 to-pink-50 rounded-2xl border border-mint-100">
                      <p className="text-[10px] font-bold text-mint-600 mb-0.5">💡 Did you know?</p>
                      <p className="text-xs text-gray-600">{currentSlide.fact}</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextRound} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-200">
                      {round + 1 >= deck.length ? 'See Results' : 'Next Slide →'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
              <div className="text-center mb-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-5xl mb-2">
                  {quizScore === deck.length ? '🏆' : quizScore >= deck.length * 0.7 ? '🌟' : quizScore >= deck.length * 0.5 ? '👏' : '💪'}
                </motion.div>
                <h2 className="text-xl font-bold text-gray-800">{quizScore}/{deck.length} Correct!</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {quizScore === deck.length ? 'Perfect score! You\'re a histology master! 🔬' : quizScore >= deck.length * 0.7 ? 'Great job! Almost perfect!' : quizScore >= deck.length * 0.5 ? 'Not bad! Keep practicing!' : 'Keep studying, you\'ll get there!'}
                </p>
                {quizScore >= highScore && quizScore > 0 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-pink-500 font-bold mt-1">🎉 New High Score!</motion.p>}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 mb-3">
                {results.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`flex items-center gap-2 p-2 rounded-xl text-xs ${r.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span>{r.correct ? '✅' : '❌'}</span>
                    <span className="flex-1 text-gray-700 truncate">{r.slide.category} — {r.slide.options[r.slide.correctIndex]}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setGameState('menu')} className="flex-1 py-3 bg-white text-gray-700 rounded-2xl font-bold text-sm border-2 border-pink-100">Menu</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={startGame} className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-200">Play Again</motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ────── IDENTIFY MODE ────── */}
      {tab === 'identify' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-center mb-3">
            <h1 className="text-lg font-bold text-gray-800">🔬 Slide Identifier</h1>
            <p className="text-xs text-gray-500 mt-0.5">Upload a photo — AI tells you what it is</p>
          </div>

          {/* Daily limit */}
          {identifyCount > 0 && (
            <div className="flex items-center justify-center gap-1 mb-3">
              {Array.from({ length: MAX_IDENTIFY_PER_DAY }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < identifyCount ? 'bg-pink-300' : 'bg-pink-100'}`} />
              ))}
              <span className="text-[10px] text-gray-400 ml-1">{identifyCount}/{MAX_IDENTIFY_PER_DAY}</span>
            </div>
          )}

          {/* Upload area */}
          {!image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-xs">
                <label className="flex flex-col items-center gap-3 p-8 bg-white rounded-3xl border-2 border-dashed border-pink-200 cursor-pointer hover:border-pink-400 transition-colors text-center">
                  <span className="text-5xl">📸</span>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Tap to take a photo</p>
                    <p className="text-[10px] text-gray-400 mt-1">or select from gallery</p>
                  </div>
                  <div className="text-[10px] text-gray-400 bg-pink-50 px-3 py-1.5 rounded-full">
                    JPEG / PNG • Max 5 MB
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {/* Preview */}
          {image && (
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="relative">
                <img
                  src={image}
                  alt="Slide preview"
                  className="w-full rounded-3xl border-2 border-pink-100 shadow-md object-contain max-h-[260px] bg-white"
                />
                {!identifying && !identifyResult && (
                  <button
                    onClick={resetIdentify}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/40 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>

              {fileName && !identifyResult && !identifying && (
                <p className="text-[10px] text-gray-400 text-center truncate">{fileName}</p>
              )}

              {/* Identify button */}
              {!identifying && !identifyResult && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleIdentify}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-200"
                >
                  🔍 Identify This Slide
                </motion.button>
              )}

              {/* Loading */}
              {identifying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3"
                >
                  <div className="flex gap-1.5">
                    {[0, 0.15, 0.3].map(delay => (
                      <motion.span
                        key={delay}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                        className="w-3 h-3 bg-pink-400 rounded-full"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 text-center italic px-4">{quote}</p>
                </motion.div>
              )}

              {/* Error */}
              {identifyError && (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                  <p className="text-xs text-red-700">{identifyError}</p>
                  <button onClick={resetIdentify} className="mt-2 text-xs font-bold text-red-600 underline">Try again</button>
                </div>
              )}

              {/* Result */}
              <AnimatePresence>
                {identifyResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="bg-white rounded-3xl p-4 border border-green-200 shadow-md space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔬</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          identifyResult.confidence === 'high' ? 'bg-green-100 text-green-700' :
                          identifyResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {identifyResult.confidence.toUpperCase()} confidence
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Tissue</p>
                        <p className="text-sm font-bold text-gray-800">{identifyResult.tissue}</p>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Stain</p>
                          <p className="text-sm font-semibold text-gray-700">{identifyResult.stain}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Magnification</p>
                          <p className="text-sm font-semibold text-gray-700">{identifyResult.magnification}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Key Features</p>
                        <div className="flex flex-wrap gap-1">
                          {identifyResult.features.map((f, i) => (
                            <span key={i} className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-gradient-to-r from-mint-50 to-pink-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-mint-600 mb-0.5">📝 Summary</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{identifyResult.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <motion.button whileTap={{ scale: 0.97 }} onClick={resetIdentify} className="flex-1 py-3 bg-white text-gray-700 rounded-2xl font-bold text-sm border-2 border-pink-100">Analyze Another</motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
                        const text = `🔬 Histology Identification\n\nTissue: ${identifyResult.tissue}\nStain: ${identifyResult.stain}\nMagnification: ${identifyResult.magnification}\nFeatures: ${identifyResult.features.join(', ')}\n\n${identifyResult.description}`;
                        navigator.clipboard?.writeText(text);
                      }} className="px-4 py-3 bg-gray-50 text-gray-500 rounded-2xl text-sm border border-gray-200">📋</motion.button>
                    </div>

                    {/* History */}
                    {history.length > 1 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Recent IDs</p>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                          {history.slice(1, 6).map(item => (
                            <div key={item.id} className="flex items-center gap-2 p-2 bg-white/70 rounded-xl text-xs border border-pink-50">
                              <span className="text-gray-400 shrink-0">{item.date.split(',')[0]}</span>
                              <span className="text-gray-700 truncate">{item.result.tissue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
