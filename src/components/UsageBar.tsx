'use client';

import { useGamification } from '@/lib/GamificationContext';

interface UsageBarProps {
  used?: number;
  tokens_used?: number;
}

export default function UsageBar({ used = 0, tokens_used = 0 }: UsageBarProps) {
  const { xp, level, xpForNext } = useGamification();
  const xpInLevel = level === 1 ? xp : xp - (level - 1) ** 2 * 100;
  const levelTotal = xpForNext;
  const pct = Math.min((xpInLevel / levelTotal) * 100, 100);

  return (
    <div className="space-y-2">
      {/* XP & Level */}
      <div className="px-4 py-3 glass rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <span className="text-sm font-bold text-gray-800">Level {level}</span>
              <span className="text-[10px] text-gray-400 ml-2">{xp.toLocaleString()} XP</span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400">
            {xpInLevel.toLocaleString()} / {levelTotal.toLocaleString()} XP
          </span>
        </div>
        <div className="mt-1.5 h-2 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-mint-400 rounded-full animate-xp-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* API Usage */}
      <div className="px-4 py-3 glass rounded-2xl shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Today&apos;s API Usage</span>
          <span className="text-xs font-bold text-pink-600">{used} calls</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">{tokens_used.toLocaleString()} tokens used</span>
          <span className="text-[10px] text-mint-500">∞ unlimited</span>
        </div>
      </div>
    </div>
  );
}
