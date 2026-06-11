'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFeedback } from '@/lib/useFeedback';
import { useSettings } from '@/lib/SettingsContext';

interface FlashcardProps {
  question: string;
  answer: string;
  difficulty: string;
  index: number;
  total?: number;
  topic?: string;
  onSimplify?: () => string;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-mint-100 text-mint-600 border-mint-200',
  medium: 'bg-pink-100 text-pink-600 border-pink-200',
  hard: 'bg-purple-100 text-purple-600 border-purple-200',
};

const difficultyGradients: Record<string, string> = {
  easy: 'from-mint-400 to-green-300',
  medium: 'from-pink-400 to-rose-300',
  hard: 'from-purple-400 to-violet-300',
};

function getTopicIcon(question: string, topic?: string): string {
  const text = (question + ' ' + (topic || '')).toLowerCase();
  if (text.includes('nerve') || text.includes('nerve') || text.includes('innervation')) return '🧠';
  if (text.includes('muscle') || text.includes('mastication')) return '💪';
  if (text.includes('bone') || text.includes('mandible') || text.includes('maxilla') || text.includes('skull')) return '🦴';
  if (text.includes('tooth') || text.includes('teeth') || text.includes('dental') || text.includes('enamel') || text.includes('dentin') || text.includes('pulp') || text.includes('caries')) return '🦷';
  if (text.includes('artery') || text.includes('vein') || text.includes('blood') || text.includes('vessel')) return '🩸';
  if (text.includes('infection') || text.includes('abscess') || text.includes('bacteria') || text.includes('virus') || text.includes('inflammation')) return '🦠';
  if (text.includes('drug') || text.includes('dose') || text.includes('anesthesia') || text.includes('antibiotic') || text.includes('analgesic')) return '💊';
  if (text.includes('cancer') || text.includes('tumor') || text.includes('carcinoma') || text.includes('lesion')) return '🔬';
  if (text.includes('gland') || text.includes('saliva') || text.includes('duct')) return '🧪';
  if (text.includes('joint') || text.includes('tmj') || text.includes('temporomandibular')) return '🔄';
  if (text.includes('x-ray') || text.includes('radiograph') || text.includes('image') || text.includes('cbct')) return '📡';
  if (text.includes('fracture') || text.includes('trauma') || text.includes('injury')) return '🤕';
  if (text.includes('surgery') || text.includes('extraction') || text.includes('incision')) return '🏥';
  return '📖';
}

export default function Flashcard({ question, answer, difficulty, index, total, topic }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSimple, setShowSimple] = useState(false);
  const feedback = useFeedback();
  const { soundEnabled } = useSettings();

  useEffect(() => {
    setIsFlipped(false);
    setShowSimple(false);
  }, [question]);

  const handleFlip = useCallback(() => {
    setIsFlipped(v => !v);
    feedback.flip();
  }, [feedback]);

  const handleSpeak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleShare = useCallback(async () => {
    const shareText = `🦷 Dental Flashcard\n\nQ: ${question}\nA: ${answer}\n\n— from Piyuuu's Tooth Vault`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Dental Flashcard', text: shareText }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  }, [question, answer]);

  const simpleAnswer = showSimple
    ? answer.length > 100
      ? answer.split('.')[0] + '. ' + (answer.split('.').slice(1, 3).join('. '))
      : answer
    : answer;

  const topicIcon = getTopicIcon(question, topic);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      {/* Progress bar */}
      {total && total > 1 && (
        <div className="flex justify-between items-center mb-1 px-1">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? 'w-6 bg-pink-500' : i < index ? 'w-2 bg-pink-300' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {index + 1} / {total}
          </span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base" title={topic || ''}>{topicIcon}</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${difficultyColors[difficulty] || difficultyColors.medium}`}>
            {difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSpeak(isFlipped ? answer : question)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-xs transition-all"
            title="Pronounce"
          >
            🔊
          </button>
          <button
            onClick={handleShare}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-xs transition-all"
            title="Share"
          >
            📤
          </button>
        </div>
      </div>

      {/* Card */}
      <div onClick={handleFlip}
        className="cursor-pointer flip-card w-full"
        style={{ perspective: '1000px', minHeight: '180px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            minHeight: 'inherit',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-5 sm:p-6 bg-white rounded-3xl shadow-lg border-2 border-pink-100 hover:border-pink-200 transition-colors overflow-y-auto"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${difficultyGradients[difficulty] || difficultyGradients.medium} rounded-t-3xl`} />

            {/* Topic icon large */}
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${difficulty === 'easy' ? 'from-mint-50 to-green-50' : difficulty === 'hard' ? 'from-purple-50 to-violet-50' : 'from-pink-50 to-rose-50'} flex items-center justify-center text-2xl mb-3 shadow-sm`}>
              {topicIcon}
            </div>

            <p className="text-center font-semibold text-gray-800 leading-relaxed text-sm sm:text-base break-words">
              {question}
            </p>
            <p className="mt-4 text-xs text-pink-400 shrink-0">tap to flip 🦷</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-5 sm:p-6 bg-gradient-to-br from-pink-50 to-mint-50 rounded-3xl shadow-lg border-2 border-pink-200 overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${difficultyGradients[difficulty] || difficultyGradients.medium} rounded-t-3xl`} />

            <p className="text-center text-gray-700 leading-relaxed text-sm sm:text-base break-words">
              {showSimple ? simpleAnswer : answer}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <p className="text-xs text-pink-400 shrink-0">tap to flip back 🦷</p>
              {answer.length > 100 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSimple(v => !v); }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-mint-100 text-mint-600 hover:bg-mint-200 transition-all"
                >
                  {showSimple ? '📖 Full' : '🧒 Simple'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
