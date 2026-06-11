'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorState from '@/components/ErrorState';
import ToothMascot from '@/components/ToothMascot';
import SparkleEffect from '@/components/SparkleEffect';

const DENTAL_SPECIALTIES = [
  'Oral Surgery',
  'Prosthodontics',
  'Orthodontics',
  'Periodontics',
  'Endodontics',
  'Pedodontics',
  'Oral Pathology',
  'Oral Medicine',
  'Community Dentistry',
  'Conservative Dentistry',
];

interface CaseData {
  title: string;
  patient: { name: string; age: number; gender: string; occupation: string };
  chief_complaint: string;
  history: string;
  clinical_findings: string;
  diagnosis: string;
  differential_diagnosis: string[];
  treatment_plan: string;
  key_learning_points: string[];
}

interface SavedCase {
  id: number;
  specialty: string;
  title: string;
  case_data: string;
  difficulty: string;
  created_at: string;
}

export default function CasesPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ type: string; message?: string } | null>(null);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showSaved, setShowSaved] = useState(true);
  const [showSparkle, setShowSparkle] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const fetchSavedCases = useCallback(() => {
    fetch('/api/cases?all=true').then(r => r.json()).then(data => setSavedCases(data.cases || []));
  }, []);

  useEffect(() => {
    fetchSavedCases();
  }, [fetchSavedCases]);

  const handleGenerate = async () => {
    if (!selectedSpecialty) return;

    setLoading(true);
    setError(null);
    setShowSaved(false);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty: selectedSpecialty, difficulty }),
      });

      const data = await res.json();

      if (data.error === 'daily_limit_reached') {
        setError({ type: 'limit_reached', message: data.message });
      } else if (data.error) {
        setError({ type: 'generation_failed', message: data.message });
      } else {
        setCurrentCase(data.case);
        setShowSparkle(true);
        fetchSavedCases();
      }
    } catch (err) {
      setError({ type: 'network_error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const showCase = (caseItem: SavedCase) => {
    try {
      const parsed = JSON.parse(caseItem.case_data);
      setCurrentCase(parsed);
      setSelectedSpecialty(caseItem.specialty);
      setShowSaved(false);
    } catch {
      setError({ type: 'generation_failed' });
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <SparkleEffect show={showSparkle} onComplete={() => setShowSparkle(false)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ToothMascot mood="happy" size="md" message="Ready for cases!" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Case Studies 🏥</h1>
        <p className="text-gray-500 text-xs">Practice clinical cases for exams!</p>
      </motion.div>

      {/* Specialty Selection */}
      {!showSaved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-2xl border border-pink-100 focus:border-pink-300 outline-none text-sm appearance-none cursor-pointer"
          >
            <option value="">Select specialty...</option>
            {DENTAL_SPECIALTIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map(d => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  difficulty === d
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-500 border border-pink-100'
                }`}
              >
                {d === 'easy' ? '😊' : d === 'medium' ? '🤔' : '😤'} {d}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={loading || !selectedSpecialty}
              className="flex-1 py-3 bg-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-pink-200 hover:bg-pink-600 disabled:opacity-50 transition-all"
            >
              {loading ? 'Generating...' : 'Generate Case ✨'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowSaved(true); setCurrentCase(null); }}
              className="px-4 py-3 bg-white text-gray-600 rounded-2xl border border-pink-100 text-sm"
            >
              Library 📚
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            <ToothMascot mood="thinking" size="md" showSparkles />
            <p className="mt-4 text-sm text-gray-500 animate-pulse">Creating case study...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <ErrorState
          type={error.type as any}
          message={error.message}
          onRetry={() => { setError(null); handleGenerate(); }}
        />
      )}

      {/* Current Case Display */}
      {!loading && currentCase && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="p-4 bg-white rounded-3xl shadow-lg border border-pink-100">
            <h2 className="text-lg font-bold text-gray-800">{currentCase.title}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {selectedSpecialty} • {currentCase.patient.age}{currentCase.patient.gender} • {currentCase.patient.occupation}
            </p>
          </div>

          {/* Collapsible Sections */}
          {[
            { key: 'complaint', label: 'Chief Complaint', icon: '🗣️', content: currentCase.chief_complaint },
            { key: 'history', label: 'History', icon: '📋', content: currentCase.history },
            { key: 'findings', label: 'Clinical Findings', icon: '🔍', content: currentCase.clinical_findings },
            { key: 'diagnosis', label: 'Diagnosis', icon: '✅', content: currentCase.diagnosis },
            { key: 'treatment', label: 'Treatment Plan', icon: '💊', content: currentCase.treatment_plan },
          ].map(section => (
            <motion.div
              key={section.key}
              className="bg-white rounded-2xl border border-pink-50 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span>{section.icon}</span>
                  {section.label}
                </span>
                <motion.span
                  animate={{ rotate: expandedSection === section.key ? 180 : 0 }}
                  className="text-gray-400"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSection === section.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                      {section.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Differential Diagnosis */}
          {currentCase.differential_diagnosis?.length > 0 && (
            <div className="bg-white rounded-2xl border border-pink-50 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🤔 Differential Diagnosis</h3>
              <ul className="space-y-1">
                {currentCase.differential_diagnosis.map((d, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Points */}
          {currentCase.key_learning_points?.length > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-mint-50 rounded-2xl border border-pink-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Key Learning Points</h3>
              <ul className="space-y-2">
                {currentCase.key_learning_points.map((point, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-pink-400 mt-0.5">✨</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setCurrentCase(null); setShowSaved(true); }}
            className="w-full py-3 bg-white text-gray-600 rounded-2xl border border-pink-100 text-sm font-medium"
          >
            ← Back to Library
          </motion.button>
        </motion.div>
      )}

      {/* Saved Cases Library */}
      {!loading && showSaved && !currentCase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {savedCases.length > 0 ? (
            <>
              <h2 className="text-sm font-semibold text-gray-500 px-1">Your Case Library ({savedCases.length})</h2>
              {savedCases.map((caseItem, i) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => showCase(caseItem)}
                  className="p-4 bg-white rounded-3xl shadow-sm border border-pink-50 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{caseItem.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{caseItem.specialty}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      caseItem.difficulty === 'easy' ? 'bg-mint-100 text-mint-700' :
                      caseItem.difficulty === 'hard' ? 'bg-purple-100 text-purple-700' :
                      'bg-pink-100 text-pink-700'
                    }`}>
                      {caseItem.difficulty}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(caseItem.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <span className="text-5xl block mb-4">🏥</span>
              <p className="text-gray-500 text-sm">
                No cases yet!<br />
                Select a specialty and generate one 💖
              </p>
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSaved(false)}
            className="w-full py-3 bg-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-pink-200"
          >
            Generate New Case ✨
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
