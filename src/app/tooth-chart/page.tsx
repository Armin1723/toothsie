'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToothMascot from '@/components/ToothMascot';

type ToothCondition = 'healthy' | 'carious' | 'filled' | 'crowned' | 'root_canal' | 'missing' | 'fractured' | 'impacted';

const CONDITIONS: { id: ToothCondition; label: string; color: string; icon: string }[] = [
  { id: 'healthy', label: 'Healthy', color: '#ffffff', icon: '🦷' },
  { id: 'carious', label: 'Carious', color: '#fca5a5', icon: '🪤' },
  { id: 'filled', label: 'Filled', color: '#93c5fd', icon: '🩹' },
  { id: 'crowned', label: 'Crowned', color: '#fde68a', icon: '👑' },
  { id: 'root_canal', label: 'Root Canal', color: '#d8b4fe', icon: '🔧' },
  { id: 'missing', label: 'Missing', color: '#d1d5db', icon: '❌' },
  { id: 'fractured', label: 'Fractured', color: '#fed7aa', icon: '💔' },
  { id: 'impacted', label: 'Impacted', color: '#a78bfa', icon: '⚠️' },
];

const TEETH = [
  { num: 1, quad: 'UR', label: 'Right Maxillary 3rd Molar', x: 310, y: 45 },
  { num: 2, quad: 'UR', label: 'Right Maxillary 2nd Molar', x: 270, y: 30 },
  { num: 3, quad: 'UR', label: 'Right Maxillary 1st Molar', x: 230, y: 22 },
  { num: 4, quad: 'UR', label: 'Right Maxillary 2nd Premolar', x: 190, y: 18 },
  { num: 5, quad: 'UR', label: 'Right Maxillary 1st Premolar', x: 150, y: 16 },
  { num: 6, quad: 'UR', label: 'Right Maxillary Canine', x: 110, y: 18 },
  { num: 7, quad: 'UR', label: 'Right Maxillary Lateral Incisor', x: 72, y: 24 },
  { num: 8, quad: 'UR', label: 'Right Maxillary Central Incisor', x: 36, y: 30 },
  { num: 9, quad: 'UL', label: 'Left Maxillary Central Incisor', x: 36, y: 80 },
  { num: 10, quad: 'UL', label: 'Left Maxillary Lateral Incisor', x: 72, y: 86 },
  { num: 11, quad: 'UL', label: 'Left Maxillary Canine', x: 110, y: 92 },
  { num: 12, quad: 'UL', label: 'Left Maxillary 1st Premolar', x: 150, y: 96 },
  { num: 13, quad: 'UL', label: 'Left Maxillary 2nd Premolar', x: 190, y: 98 },
  { num: 14, quad: 'UL', label: 'Left Maxillary 1st Molar', x: 230, y: 96 },
  { num: 15, quad: 'UL', label: 'Left Maxillary 2nd Molar', x: 270, y: 92 },
  { num: 16, quad: 'UL', label: 'Left Maxillary 3rd Molar', x: 310, y: 82 },
  { num: 17, quad: 'LL', label: 'Left Mandibular 3rd Molar', x: 310, y: 160 },
  { num: 18, quad: 'LL', label: 'Left Mandibular 2nd Molar', x: 270, y: 168 },
  { num: 19, quad: 'LL', label: 'Left Mandibular 1st Molar', x: 230, y: 174 },
  { num: 20, quad: 'LL', label: 'Left Mandibular 2nd Premolar', x: 190, y: 178 },
  { num: 21, quad: 'LL', label: 'Left Mandibular 1st Premolar', x: 150, y: 178 },
  { num: 22, quad: 'LL', label: 'Left Mandibular Canine', x: 110, y: 176 },
  { num: 23, quad: 'LL', label: 'Left Mandibular Lateral Incisor', x: 72, y: 172 },
  { num: 24, quad: 'LL', label: 'Left Mandibular Central Incisor', x: 36, y: 168 },
  { num: 25, quad: 'RL', label: 'Right Mandibular Central Incisor', x: 36, y: 120 },
  { num: 26, quad: 'RL', label: 'Right Mandibular Lateral Incisor', x: 72, y: 116 },
  { num: 27, quad: 'RL', label: 'Right Mandibular Canine', x: 110, y: 114 },
  { num: 28, quad: 'RL', label: 'Right Mandibular 1st Premolar', x: 150, y: 112 },
  { num: 29, quad: 'RL', label: 'Right Mandibular 2nd Premolar', x: 190, y: 112 },
  { num: 30, quad: 'RL', label: 'Right Mandibular 1st Molar', x: 230, y: 114 },
  { num: 31, quad: 'RL', label: 'Right Mandibular 2nd Molar', x: 270, y: 118 },
  { num: 32, quad: 'RL', label: 'Right Mandibular 3rd Molar', x: 310, y: 125 },
];

const QUAD_LABELS = [
  { label: 'UR (1-8)', x: 350, y: 35 },
  { label: 'UL (9-16)', x: 350, y: 95 },
  { label: 'RL (25-32)', x: 350, y: 135 },
  { label: 'LL (17-24)', x: 350, y: 185 },
];

function drawTooth(d: { num: number; x: number; y: number }) {
  const toothPaths: Record<string, string> = {
    molar: `M${d.x},${d.y + 6} C${d.x + 8},${d.y + 2} ${d.x + 18},${d.y + 2} ${d.x + 24},${d.y + 6} L${d.x + 22},${d.y + 26} C${d.x + 20},${d.y + 30} ${d.x + 14},${d.y + 32} ${d.x + 12},${d.y + 32} C${d.x + 10},${d.y + 32} ${d.x + 4},${d.y + 30} ${d.x + 2},${d.y + 26} Z`,
    premolar: `M${d.x + 2},${d.y + 6} C${d.x + 6},${d.y + 2} ${d.x + 14},${d.y + 2} ${d.x + 18},${d.y + 6} L${d.x + 18},${d.y + 24} C${d.x + 18},${d.y + 28} ${d.x + 14},${d.y + 30} ${d.x + 10},${d.y + 30} C${d.x + 6},${d.y + 30} ${d.x + 2},${d.y + 28} ${d.x + 2},${d.y + 24} Z`,
    canine: `M${d.x + 4},${d.y + 6} C${d.x + 8},${d.y + 2} ${d.x + 14},${d.y + 2} ${d.x + 18},${d.y + 12} L${d.x + 16},${d.y + 26} C${d.x + 14},${d.y + 30} ${d.x + 10},${d.y + 30} ${d.x + 8},${d.y + 26} L${d.x + 4},${d.y + 14} C${d.x + 2},${d.y + 10} ${d.x + 2},${d.y + 8} Z`,
    incisor: `M${d.x + 4},${d.y + 6} C${d.x + 6},${d.y + 2} ${d.x + 14},${d.y + 2} ${d.x + 18},${d.y + 6} L${d.x + 18},${d.y + 24} C${d.x + 18},${d.y + 28} ${d.x + 14},${d.y + 30} ${d.x + 10},${d.y + 30} C${d.x + 6},${d.y + 30} ${d.x + 4},${d.y + 28} ${d.x + 4},${d.y + 24} Z`,
  };

  const isMolar = [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(d.num);
  const isPremolar = [4, 5, 12, 13, 20, 21, 28, 29].includes(d.num);
  const isCanine = [6, 11, 22, 27].includes(d.num);
  const type = isMolar ? 'molar' : isPremolar ? 'premolar' : isCanine ? 'canine' : 'incisor';

  return { path: toothPaths[type], type };
}

export default function ToothChart() {
  const [toothStates, setToothStates] = useState<Record<number, ToothCondition>>({});
  const [activeCondition, setActiveCondition] = useState<ToothCondition>('carious');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showAllNumbers, setShowAllNumbers] = useState(false);

  const handleToothClick = (num: number) => {
    if (selectedTooth === num) {
      setSelectedTooth(null);
    } else {
      setSelectedTooth(num);
    }
  };

  const handleToothLongPress = (num: number) => {
    setToothStates(prev => ({ ...prev, [num]: activeCondition }));
  };

  const handleClearAll = () => {
    setToothStates({});
    setSelectedTooth(null);
  };

  const selectedData = selectedTooth ? TEETH.find(t => t.num === selectedTooth) : null;
  const selectedState = selectedTooth ? toothStates[selectedTooth] || 'healthy' : null;

  return (
    <div className="px-4 py-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <ToothMascot mood="thinking" size="md" message="Interactive Tooth Chart" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Odontogram 🦷</h1>
        <p className="text-gray-500 text-xs mt-1">Tap a tooth to select, tap again to mark</p>
      </motion.div>

      {/* Condition picker */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
        {CONDITIONS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCondition(c.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              activeCondition === c.id
                ? 'ring-2 ring-pink-400 bg-white'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
            style={activeCondition === c.id ? { borderColor: c.color === '#ffffff' ? '#e5e7eb' : c.color, backgroundColor: c.color === '#ffffff' ? '#fff' : undefined } : {}}
          >
            <span className="text-sm">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowAllNumbers(v => !v)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all"
        >
          {showAllNumbers ? 'Hide' : 'Show'} Numbers
        </button>
        <button
          onClick={handleClearAll}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Tooth chart SVG */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-2 shadow-sm border border-gray-100 overflow-x-auto">
        <svg viewBox="0 0 380 210" className="w-full max-w-md mx-auto" style={{ minHeight: 210 }}>
          {/* Midline */}
          <line x1="185" y1="10" x2="185" y2="200" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />

          {/* Quadrant labels */}
          {QUAD_LABELS.map(q => (
            <text key={q.label} x={q.x} y={q.y} fontSize="7" fill="#d1d5db" fontFamily="Nunito, sans-serif">{q.label}</text>
          ))}

          {/* Quadrant backgrounds */}
          <rect x="10" y="10" width="170" height="82" rx="8" fill="rgba(236,72,153,0.03)" />
          <rect x="200" y="10" width="170" height="82" rx="8" fill="rgba(168,85,247,0.03)" />
          <rect x="200" y="95" width="170" height="82" rx="8" fill="rgba(34,197,94,0.03)" />
          <rect x="10" y="95" width="170" height="82" rx="8" fill="rgba(59,130,246,0.03)" />

          {/* Teeth */}
          {TEETH.map(t => {
            const condition = toothStates[t.num] || 'healthy';
            const condData = CONDITIONS.find(c => c.id === condition)!;
            const tooth = drawTooth(t);
            const isSelected = selectedTooth === t.num;

            return (
              <g key={t.num} onClick={() => handleToothClick(t.num)} onDoubleClick={() => handleToothLongPress(t.num)} style={{ cursor: 'pointer' }}>
                {/* Tooth shadow */}
                <path d={tooth.path} fill="#00000010" transform={`translate(1, 1)`} />
                {/* Tooth body */}
                <path
                  d={tooth.path}
                  fill={condition === 'healthy' ? '#fff' : condData.color}
                  stroke={isSelected ? '#ec4899' : condition === 'healthy' ? '#d1d5db' : condData.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />
                {/* Missing X */}
                {condition === 'missing' && (
                  <>
                    <line x1={t.x + 2} y1={t.y + 4} x2={t.x + 22} y2={t.y + 28} stroke="#9ca3af" strokeWidth="2" />
                    <line x1={t.x + 22} y1={t.y + 4} x2={t.x + 2} y2={t.y + 28} stroke="#9ca3af" strokeWidth="2" />
                  </>
                )}
                {/* Number */}
                {showAllNumbers && (
                  <text
                    x={t.x + 12}
                    y={tooth.type === 'incisor' ? t.y + 20 : tooth.type === 'canine' ? t.y + 22 : t.y + 22}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill={condition === 'healthy' ? '#9ca3af' : '#fff'}
                    fontFamily="Nunito, sans-serif"
                  >
                    {t.num}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected tooth detail */}
      <AnimatePresence>
        {selectedData && selectedState !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong rounded-2xl p-4 border border-pink-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Tooth #{selectedData.num}</p>
                <p className="text-[10px] text-gray-500">{selectedData.label} ({selectedData.quad})</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block w-4 h-4 rounded-full border`} style={{ backgroundColor: CONDITIONS.find(c => c.id === selectedState)!.color, borderColor: '#d1d5db' }} />
                  <span className="text-xs font-semibold text-gray-700">{CONDITIONS.find(c => c.id === selectedState)!.label}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end max-w-[200px]">
                {CONDITIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setToothStates(prev => ({ ...prev, [selectedData.num]: c.id }));
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all border ${
                      selectedState === c.id
                        ? 'ring-2 ring-pink-400 scale-110 border-transparent'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                    style={{ backgroundColor: c.color === '#ffffff' ? '#f9fafb' : c.color }}
                    title={c.label}
                  >
                    {c.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium mb-1.5">Quick legend — tap a tooth, then pick a condition:</p>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium text-gray-600 bg-gray-50 border border-gray-100">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color === '#ffffff' ? '#e5e7eb' : c.color }} />
                    {c.icon} {c.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fun footer */}
      <p className="text-center text-[10px] text-gray-400 pb-4">
        Double-tap a tooth to mark with current condition • Universal numbering system (#1-32)
      </p>
    </div>
  );
}