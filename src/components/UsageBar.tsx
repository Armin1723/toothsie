'use client';

interface UsageBarProps {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export default function UsageBar({ used, limit, remaining, percentage }: UsageBarProps) {
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-400';
    if (percentage >= 70) return 'bg-yellow-400';
    return 'bg-gradient-to-r from-pink-400 to-mint-400';
  };

  return (
    <div className="px-4 py-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-pink-50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-500">Daily Study Tokens</span>
        <span className="text-xs font-bold text-pink-600">{remaining} remaining</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{used} used</span>
        <span className="text-[10px] text-gray-400">{limit} limit</span>
      </div>
    </div>
  );
}
