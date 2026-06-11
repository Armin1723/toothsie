'use client';

import { useState, useEffect, useCallback } from 'react';
import { piyuuuQuotes, studyStreakMessages, secretMessages } from './easterEggs';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useRandomQuote(type: keyof typeof piyuuuQuotes = 'loading') {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(pickRandom(piyuuuQuotes[type]));
    const interval = setInterval(() => {
      setQuote(pickRandom(piyuuuQuotes[type]));
    }, 4000);
    return () => clearInterval(interval);
  }, [type]);

  return quote;
}

export function useTimeBasedMessage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      setMessage(pickRandom(piyuuuQuotes.lateNight));
    } else if (hour >= 6 && hour < 10) {
      setMessage(pickRandom(piyuuuQuotes.earlyMorning));
    } else {
      setMessage(pickRandom(piyuuuQuotes.random));
    }
  }, []);

  return message;
}

export function useStudyStreak() {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('piyuuu_study_streak') || '0';
    const lastDate = localStorage.getItem('piyuuu_last_study_date');
    const today = new Date().toDateString();

    if (lastDate === today) {
      setStreak(parseInt(stored));
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        const newStreak = parseInt(stored) + 1;
        setStreak(newStreak);
        localStorage.setItem('piyuuu_study_streak', newStreak.toString());
      } else {
        setStreak(1);
        localStorage.setItem('piyuuu_study_streak', '1');
      }
      localStorage.setItem('piyuuu_last_study_date', today);
    }
  }, []);

  const incrementStreak = useCallback(() => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('piyuuu_study_streak', newStreak.toString());
    localStorage.setItem('piyuuu_last_study_date', new Date().toDateString());

    // Check for milestone messages
    const milestone = Object.keys(studyStreakMessages)
      .map(Number)
      .sort((a, b) => b - a)
      .find(key => newStreak === key);

    if (milestone) {
      setMessage(studyStreakMessages[milestone as keyof typeof studyStreakMessages]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setMessage(pickRandom(piyuuuQuotes.encouragement));
    }

    return newStreak;
  }, [streak]);

  return { streak, message, showCelebration, incrementStreak };
}

export function useSecretMode() {
  const [tapCount, setTapCount] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');

  const handleSecretTap = useCallback(() => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount === 5) {
      setSecretUnlocked(true);
      setSecretMessage(pickRandom(secretMessages));
      setTimeout(() => {
        setSecretUnlocked(false);
        setTapCount(0);
      }, 3000);
    }

    // Reset after 2 seconds of no taps
    setTimeout(() => {
      setTapCount(0);
    }, 2000);
  }, [tapCount]);

  return { secretUnlocked, secretMessage, handleSecretTap, tapCount };
}

export function useConsoleEasterEgg() {
  useEffect(() => {
    console.log('%c🦷 Piyuuu\'s Tooth Vault', 'font-size: 24px; font-weight: bold; color: #ec4899;');
    console.log('%cYou found the secret console! You\'re a true developer! 💖', 'font-size: 14px; color: #f472b6;');
    console.log('%cFun fact: If you\'re reading this, you\'re probably a nerd. And that\'s awesome! 🤓', 'font-size: 12px; color: #a855f7;');
    console.log('%cKeep studying, Piyuuu! The world needs more dentists! 🌍', 'font-size: 12px; color: #14b8a6;');
  }, []);
}
