'use client';

import { motion } from 'framer-motion';

interface CaseCardProps {
  title: string;
  specialty: string;
  difficulty: string;
  patient: { name: string; age: number; gender: string };
  chiefComplaint: string;
  onClick?: () => void;
}

export default function CaseCard({ title, specialty, difficulty, patient, chiefComplaint, onClick }: CaseCardProps) {
  const difficultyColors = {
    easy: 'bg-mint-100 text-mint-700',
    medium: 'bg-pink-100 text-pink-700',
    hard: 'bg-purple-100 text-purple-700',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 bg-white rounded-3xl shadow-md border border-pink-50 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
          <p className="text-xs text-gray-500">{specialty}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}>
          {difficulty}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
        <span>👤 {patient.age}{patient.gender}</span>
        <span>•</span>
        <span>{chiefComplaint.substring(0, 40)}...</span>
      </div>

      <div className="flex items-center gap-1 text-pink-500 text-xs font-medium">
        <span>View Case</span>
        <span>→</span>
      </div>
    </motion.div>
  );
}
