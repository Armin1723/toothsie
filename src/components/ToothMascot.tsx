'use client';

import { useState, useEffect } from 'react';

interface ToothMascotProps {
  mood?: 'happy' | 'excited' | 'sleepy' | 'thinking' | 'love';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showSparkles?: boolean;
}

export default function ToothMascot({ mood = 'happy', size = 'md', message, showSparkles = false }: ToothMascotProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const moodEmojis = {
    happy: '😊',
    excited: '✨',
    sleepy: '😴',
    thinking: '🤔',
    love: '😍',
  };

  useEffect(() => {
    if (showSparkles) {
      const interval = setInterval(() => {
        setSparkles(prev => {
          const newSparkle = {
            id: Date.now(),
            x: Math.random() * 60 - 30,
            y: Math.random() * 60 - 30,
          };
          return [...prev.slice(-4), newSparkle];
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [showSparkles]);

  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative">
        {/* Main tooth shape */}
        <div className={`${sizeClasses[size]} animate-tooth-bounce relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Tooth body */}
            <path
              d="M50 10 C30 10 15 25 15 45 C15 65 25 75 35 95 C38 100 42 100 45 95 C48 90 50 80 50 80 C50 80 52 90 55 95 C58 100 62 100 65 95 C75 75 85 65 85 45 C85 25 70 10 50 10 Z"
              fill="white"
              stroke="#f9a8d4"
              strokeWidth="2"
            />
            {/* Cheeks */}
            <circle cx="35" cy="50" r="6" fill="#fce7f3" opacity="0.8" />
            <circle cx="65" cy="50" r="6" fill="#fce7f3" opacity="0.8" />
            {/* Eyes */}
            <ellipse cx="40" cy="42" rx="3" ry={mood === 'sleepy' ? 1 : 3} fill="#1f1f1f" />
            <ellipse cx="60" cy="42" rx="3" ry={mood === 'sleepy' ? 1 : 3} fill="#1f1f1f" />
            {/* Smile */}
            {mood === 'happy' || mood === 'love' ? (
              <path d="M42 55 Q50 62 58 55" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
            ) : mood === 'excited' ? (
              <ellipse cx="50" cy="57" rx="6" ry="4" fill="#f472b6" />
            ) : mood === 'thinking' ? (
              <path d="M44 56 L56 56" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M45 57 Q50 54 55 57" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
            )}
            {/* Crown sparkle */}
            {(mood === 'excited' || mood === 'love') && (
              <text x="50" y="25" textAnchor="middle" fontSize="12">✨</text>
            )}
          </svg>
        </div>
        
        {/* Sparkles */}
        {showSparkles && sparkles.map(sparkle => (
          <span
            key={sparkle.id}
            className="absolute animate-sparkle text-pink-400 pointer-events-none"
            style={{
              left: `calc(50% + ${sparkle.x}px)`,
              top: `calc(50% + ${sparkle.y}px)`,
              fontSize: '12px',
            }}
          >
            ✦
          </span>
        ))}
      </div>
      
      {/* Speech bubble */}
      {message && (
        <div className="mt-2 px-3 py-1.5 bg-white rounded-2xl shadow-md border border-pink-100 max-w-[200px] text-center text-sm animate-slide-up relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white" />
          <span className="text-pink-600 font-medium">{message}</span>
        </div>
      )}
    </div>
  );
}
