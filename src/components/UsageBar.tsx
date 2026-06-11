'use client';

interface UsageBarProps {
  used: number;
  tokens_used: number;
}

export default function UsageBar({ used, tokens_used }: UsageBarProps) {
  return (
    <div className="px-4 py-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-pink-50">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500">Today&apos;s Study Stats</span>
        <span className="text-xs font-bold text-pink-600">{used} API calls</span>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{tokens_used.toLocaleString()} tokens used</span>
        <span className="text-[10px] text-mint-500">∞ unlimited</span>
      </div>
    </div>
  );
}
