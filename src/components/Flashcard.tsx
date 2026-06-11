'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFeedback } from '@/lib/useFeedback';

interface FlashcardProps {
  question: string;
  answer: string;
  difficulty: string;
  index: number;
  total?: number;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-mint-100 text-mint-600',
  medium: 'bg-pink-100 text-pink-600',
  hard: 'bg-purple-100 text-purple-600',
};

export default function Flashcard({ question, answer, difficulty, index, total }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const feedback = useFeedback();

  useEffect(() => {
    setIsFlipped(false);
  }, [question]);

  const handleFlip = useCallback(() => {
    setIsFlipped(v => !v);
    feedback.flip();
  }, [feedback]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Progress bar */}
      {total && total > 1 && (
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-mint-400 rounded-t-3xl" />
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${difficultyColors[difficulty] || difficultyColors.medium} mb-3 shrink-0`}>
              {difficulty}
            </span>
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
            <p className="text-center text-gray-700 leading-relaxed text-sm sm:text-base break-words">
              {answer}
            </p>
            <p className="mt-4 text-xs text-pink-400 shrink-0">tap to flip back 🦷</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
