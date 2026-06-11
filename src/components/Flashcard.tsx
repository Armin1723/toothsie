'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FlashcardProps {
  question: string;
  answer: string;
  difficulty: string;
  index: number;
}

export default function Flashcard({ question, answer, difficulty, index }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const difficultyColors = {
    easy: 'bg-mint-100 text-mint-600',
    medium: 'bg-pink-100 text-pink-600',
    hard: 'bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setIsFlipped(!isFlipped)}
      className="cursor-pointer flip-card w-full h-48 perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-lg border-2 border-pink-100 hover:border-pink-200 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.medium} mb-3`}>
            {difficulty}
          </span>
          <p className="text-center font-semibold text-gray-800 leading-relaxed">{question}</p>
          <p className="mt-4 text-xs text-pink-400">tap to flip 🦷</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-mint-50 rounded-3xl shadow-lg border-2 border-pink-200"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-center text-gray-700 leading-relaxed">{answer}</p>
          <p className="mt-4 text-xs text-pink-400">tap to flip back 🦷</p>
        </div>
      </div>
    </motion.div>
  );
}
