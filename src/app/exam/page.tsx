'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToothMascot from '@/components/ToothMascot';
import ErrorState from '@/components/ErrorState';

interface Topic {
  name: string;
  description: string;
  keyPoints: string[];
  studyTime: string;
  resource?: { title: string; url?: string };
  content?: string[];
}

interface Resource {
  type: string;
  title: string;
  description: string;
  url?: string;
}

interface ExamPlan {
  id: number;
  paper_name: string;
  plan_data: {
    topics: Topic[];
    resources: Resource[];
    quiz: { question: string; options: string[]; correct: number; explanation: string }[];
    checklist: { item: string; phase: string }[];
  };
  progress_data: {
    completedTopics: string[];
    checkedItems: string[];
    studySessions: number;
    currentTopic: string;
  };
  study_content?: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

type Tab = 'topics' | 'resources' | 'quiz' | 'checklist' | 'progress';

const LOADING_MESSAGES = [
  'Analyzing your paper requirements... 📋',
  'Creating topic roadmap... 🗺️',
  'Gathering key concepts... 📚',
  'Finding best resources... 🔍',
  'Crafting practice questions... ✍️',
  'Building study checklist... ✅',
  'Organizing your study plan... 🗂️',
  'Almost ready! Just polishing... ✨',
];

export default function ExamPage() {
  const [paperName, setPaperName] = useState('');
  const [plans, setPlans] = useState<ExamPlan[]>([]);
  const [activePlan, setActivePlan] = useState<ExamPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadMsgIndex, setLoadMsgIndex] = useState(0);
  const [error, setError] = useState<{ type: string; message?: string } | null>(null);
  const [tab, setTab] = useState<Tab>('topics');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [studyContent, setStudyContent] = useState<Record<string, string[]>>({});
  const [fetchingTopic, setFetchingTopic] = useState<string | null>(null);
  const [speakingTopic, setSpeakingTopic] = useState<string | null>(null);
  const [deletingPara, setDeletingPara] = useState<{ topic: string; idx: number } | null>(null);

  useEffect(() => {
    fetch('/api/exam/plan').then(r => r.json()).then(d => setPlans(d.plans || []));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!paperName.trim()) return;
    setLoading(true);
    setError(null);
    setActivePlan(null);

    try {
      const res = await fetch('/api/exam/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperName: paperName.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        setError({ type: data.error, message: data.message });
      } else {
        setActivePlan(data.plan);
        setStudyContent(data.plan.study_content || {});
        setPlans(prev => [data.plan, ...prev]);
        setPaperName('');
        setQuizAnswers({});
        setQuizSubmitted(false);
        setTab('topics');
      }
    } catch {
      setError({ type: 'network_error' });
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = (plan: ExamPlan) => {
    setActivePlan(plan);
    setStudyContent(plan.study_content || {});
    setShowHistory(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setTab('topics');
  };

  const toggleTopic = (topicName: string) => {
    if (!activePlan) return;
    const completed = activePlan.progress_data?.completedTopics || [];
    const updated = completed.includes(topicName)
      ? completed.filter(t => t !== topicName)
      : [...completed, topicName];
    updateProgress({ ...activePlan.progress_data, completedTopics: updated, currentTopic: topicName });
  };

  const toggleChecklist = (item: string) => {
    if (!activePlan) return;
    const checked = activePlan.progress_data?.checkedItems || [];
    const updated = checked.includes(item)
      ? checked.filter(i => i !== item)
      : [...checked, item];
    updateProgress({ ...activePlan.progress_data, checkedItems: updated });
  };

  const updateProgress = async (progress: any) => {
    if (!activePlan) return;
    setActivePlan(prev => prev ? { ...prev, progress_data: progress } : null);
    try {
      await fetch(`/api/exam/plan/${activePlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress_data: progress }),
      });
    } catch {}
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const quizScore = activePlan
    ? Object.entries(quizAnswers).filter(([i, ans]) => ans === activePlan.plan_data.quiz[parseInt(i)]?.correct).length
    : 0;

  const startNew = () => {
    setActivePlan(null);
    setPaperName('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setError(null);
  };

  const confirmDelete = (id: number) => {
    setPlanToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (planToDelete === null) return;
    setDeleting(true);
    try {
      await fetch(`/api/exam/plan/${planToDelete}`, { method: 'DELETE' });
      setPlans(prev => prev.filter(p => p.id !== planToDelete));
      if (activePlan?.id === planToDelete) setActivePlan(null);
    } catch {}
    setDeleting(false);
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const fetchMoreContent = async (topicName: string) => {
    if (!activePlan || fetchingTopic) return;
    setFetchingTopic(topicName);
    try {
      const res = await fetch(`/api/exam/plan/${activePlan.id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName }),
      });
      const data = await res.json();
      if (!data.error) {
        setStudyContent(prev => ({
          ...prev,
          [topicName]: [...(prev[topicName] || []), ...data.paragraphs],
        }));
      }
    } catch {}
    setFetchingTopic(null);
  };

  const readAloud = (topicName: string, content: string[]) => {
    if (speakingTopic === topicName) {
      window.speechSynthesis.cancel();
      setSpeakingTopic(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.join('. '));
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => setSpeakingTopic(null);
    utterance.onerror = () => setSpeakingTopic(null);
    setSpeakingTopic(topicName);
    window.speechSynthesis.speak(utterance);
  };

  const deleteParagraph = async (topicName: string, idx: number) => {
    const current = studyContent[topicName] || [];
    if (idx < 0 || idx >= current.length) return;
    const updated = [...current.slice(0, idx), ...current.slice(idx + 1)];
    const newStudyContent = { ...studyContent, [topicName]: updated };
    setStudyContent(newStudyContent);
    if (activePlan) {
      try {
        await fetch(`/api/exam/plan/${activePlan.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ study_content: newStudyContent }),
        });
      } catch {}
    }
  };

  const plan = activePlan;
  const topics = plan?.plan_data?.topics || [];
  const resources = plan?.plan_data?.resources || [];
  const quiz = plan?.plan_data?.quiz || [];
  const checklist = plan?.plan_data?.checklist || [];
  const completedTopics = plan?.progress_data?.completedTopics || [];
  const checkedItems = plan?.progress_data?.checkedItems || [];
  const progressPct = topics.length > 0 ? Math.round((completedTopics.length / topics.length) * 100) : 0;

  return (
    <div className="px-4 py-6 space-y-5 min-h-[100dvh]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <ToothMascot mood="thinking" size="md" message="Exam Mode — full study plan" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Exam Mode 📋</h1>
        <p className="text-gray-500 text-xs mt-1">Generate a complete study plan for any BDS paper</p>
      </motion.div>

      {/* Input */}
      {!activePlan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={paperName}
              onChange={e => setPaperName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
              placeholder="e.g., BDS 2nd Year — Oral Pathology"
              className="flex-1 px-4 py-3 bg-white rounded-2xl border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none text-sm transition-all"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={loading || !paperName.trim()}
              className="px-5 py-3 bg-pink-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-pink-200 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '⏳' : '✨ Plan'}
            </motion.button>
          </div>

          {/* History */}
          {plans.length > 0 && (
            <button onClick={() => setShowHistory(true)} className="text-xs text-pink-500 font-medium mx-auto block">
              📂 View saved plans ({plans.length})
            </button>
          )}
        </motion.div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12">
            <ToothMascot mood="thinking" size="lg" showSparkles />
            <AnimatePresence mode="wait">
              <motion.p key={loadMsgIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-sm text-pink-500 text-center font-medium">
                {LOADING_MESSAGES[loadMsgIndex]}
              </motion.p>
            </AnimatePresence>
            <motion.div className="mt-6 w-48 h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-pink-400 to-mint-400 rounded-full" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !loading && (
        <ErrorState type={error.type as any} message={error.message} onRetry={handleGenerate} />
      )}

      {/* Plan view */}
      {plan && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-800 truncate">{plan.paper_name}</h2>
              <p className="text-[10px] text-gray-400">
                {topics.length} topics • {quiz.length} questions • {progressPct}% done
              </p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={startNew} className="px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">+ New</button>
              <button onClick={() => confirmDelete(plan.id)} className="px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all">🗑️</button>
              <button onClick={() => { setShowHistory(true); }} className="px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">📂</button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-400 to-mint-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-pink-100 p-1 overflow-x-auto">
            {(['topics', 'resources', 'quiz', 'checklist', 'progress'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all ${
                  tab === t ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-pink-600'
                }`}
              >
                {t === 'topics' && '📋 Topics'}
                {t === 'resources' && '📚 Resources'}
                {t === 'quiz' && '🧪 Quiz'}
                {t === 'checklist' && '✅ Checklist'}
                {t === 'progress' && '📈 Progress'}
              </button>
            ))}
          </div>

          {/* Topics tab */}
          {tab === 'topics' && (
            <div className="space-y-2">
              {topics.map((topic, i) => {
                const done = completedTopics.includes(topic.name);
                const allContent = [...(topic.content || []), ...(studyContent[topic.name] || [])];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-4 rounded-2xl border transition-all ${done ? 'bg-mint-50/50 border-mint-200' : 'glass border-gray-100'}`}
                  >
                    <div
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => toggleTopic(topic.name)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? 'bg-mint-400 border-mint-400' : 'border-gray-300'}`}>
                        {done && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${done ? 'text-mint-700' : 'text-gray-800'}`}>{topic.name}</p>
                        <p className="text-[11px] text-gray-500 mt-1">{topic.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-medium bg-pink-50 text-pink-500">{topic.studyTime}</span>
                          {topic.resource?.title && (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(topic.resource.title + ' ' + topic.resource.url || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                            >
                              📖 {topic.resource.title}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Study content */}
                    {allContent.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-[10px] text-pink-500 font-medium cursor-pointer hover:text-pink-600 transition-colors">
                          📝 Study Notes ({allContent.length} paragraphs)
                        </summary>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); readAloud(topic.name, allContent); }}
                            className={`px-3 py-1 rounded-xl text-[10px] font-semibold transition-all ${
                              speakingTopic === topic.name
                                ? 'bg-red-100 text-red-600'
                                : 'bg-mint-100 text-mint-700 hover:bg-mint-200'
                            }`}
                          >
                            {speakingTopic === topic.name ? '⏹ Stop' : '🔊 Read Aloud'}
                          </button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {allContent.map((para, j) => (
                            <div key={j} className="group flex items-start gap-1.5">
                              <p className="flex-1 text-[12px] text-gray-700 leading-relaxed">{para}</p>
                              {j >= (topic.content || []).length && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteParagraph(topic.name, j - (topic.content || []).length); }}
                                  className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all mt-0.5"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => { e.stopPropagation(); fetchMoreContent(topic.name); }}
                          disabled={fetchingTopic === topic.name}
                          className="mt-2 w-full py-2 rounded-xl text-[10px] font-semibold bg-pink-50 text-pink-600 hover:bg-pink-100 transition-all disabled:opacity-50"
                        >
                          {fetchingTopic === topic.name ? '⏳ Fetching more...' : '➕ Fetch More Study Content'}
                        </motion.button>
                      </details>
                    )}

                    {topic.keyPoints.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-[10px] text-pink-500 font-medium cursor-pointer">Key points</summary>
                        <ul className="mt-1.5 space-y-0.5">
                          {topic.keyPoints.map((kp, j) => (
                            <li key={j} className="text-[11px] text-gray-600 flex gap-1.5">
                              <span className="text-pink-300">•</span>
                              {kp}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Resources tab */}
          {tab === 'resources' && (
            <div className="space-y-2">
              {resources.map((r, i) => {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(r.title + ' ' + (r.url || '') + ' BDS dentistry')}`;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 glass rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg shrink-0">
                          {r.type === 'Textbook' ? '📖' : r.type === 'YouTube' ? '📺' : r.type === 'Website' ? '🌐' : r.type === 'Research Paper' ? '📄' : r.type === 'App' ? '📱' : '📌'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-gray-800">{r.title}</p>
                            <span className="shrink-0 text-[10px] opacity-40">↗</span>
                          </div>
                          <p className="text-[10px] text-pink-500 font-medium">{r.type}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{r.description}</p>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Quiz tab */}
          {tab === 'quiz' && (
            <div className="space-y-3">
              {quiz.map((q, i) => {
                const selected = quizAnswers[i] ?? null;
                const showResult = quizSubmitted;
                const correctIdx = q.correct;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 glass rounded-2xl border border-gray-100"
                  >
                    <p className="text-xs font-bold text-gray-800 mb-2">
                      <span className="text-pink-500 mr-1">Q{i + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, j) => {
                        let cls = 'bg-gray-50 border-gray-200 text-gray-700';
                        if (showResult && j === correctIdx) cls = 'bg-mint-100 border-mint-400 text-mint-700';
                        else if (showResult && selected === j && j !== correctIdx) cls = 'bg-red-100 border-red-300 text-red-700';
                        else if (selected === j && !showResult) cls = 'bg-pink-50 border-pink-300 text-pink-700';
                        return (
                          <button
                            key={j}
                            onClick={() => { if (!showResult) setQuizAnswers(prev => ({ ...prev, [i]: j })); }}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${cls}`}
                          >
                            <span className="mr-1.5 font-medium text-gray-400">{String.fromCharCode(65 + j)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {showResult && (
                      <p className="mt-2 text-[10px] text-gray-500 italic">{q.explanation}</p>
                    )}
                  </motion.div>
                );
              })}

              {quiz.length > 0 && !quizSubmitted && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleQuizSubmit}
                  className="w-full py-3 bg-pink-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-pink-200"
                >
                  ✅ Submit Answers
                </motion.button>
              )}

              {quizSubmitted && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-5 glass rounded-3xl">
                  <span className="text-3xl block mb-2">
                    {quizScore === quiz.length ? '🎉' : quizScore >= quiz.length * 0.7 ? '💪' : '📚'}
                  </span>
                  <p className="text-lg font-bold text-gray-800">{quizScore}/{quiz.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {quizScore === quiz.length ? 'Perfect! You are exam-ready!' :
                     quizScore >= quiz.length * 0.7 ? 'Great job! Almost there!' :
                     'Keep studying — you will improve!'}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Checklist tab */}
          {tab === 'checklist' && (
            <div className="space-y-1">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Revision', 'Ongoing'].map(phase => {
                const items = checklist.filter(c => c.phase === phase);
                if (items.length === 0) return null;
                const done = items.filter(i => checkedItems.includes(i.item)).length;
                return (
                  <div key={phase} className="mb-3">
                    <div className="flex items-center justify-between px-1 mb-1.5">
                      <p className="text-[11px] font-bold text-gray-500">{phase}</p>
                      <span className="text-[10px] text-gray-400">{done}/{items.length}</span>
                    </div>
                    {items.map((c, i) => {
                      const checked = checkedItems.includes(c.item);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer ${checked ? 'opacity-50' : 'hover:bg-gray-50'}`}
                          onClick={() => toggleChecklist(c.item)}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${checked ? 'bg-mint-400 border-mint-400' : 'border-gray-300'}`}>
                            {checked && <span className="text-white text-[8px]">✓</span>}
                          </div>
                          <p className={`text-xs ${checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{c.item}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress tab */}
          {tab === 'progress' && (
            <div className="space-y-4">
              <div className="p-5 glass rounded-2xl">
                <p className="text-xs font-bold text-gray-500 mb-3">📊 Overall Progress</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fce7f3" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray={`${progressPct}, 100`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-pink-600">{progressPct}%</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800">{completedTopics.length}/{topics.length} topics done</p>
                    <p className="text-[11px] text-gray-500">{(plan.progress_data?.studySessions || 0)} study sessions</p>
                    <p className="text-[11px] text-gray-500">{checkedItems.length}/{checklist.length} checklist items done</p>
                  </div>
                </div>
              </div>

              {/* Topic status list */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-500 mb-2">📋 Topic Status</p>
                {topics.map((t, i) => {
                  const done = completedTopics.includes(t.name);
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50">
                      <div className={`w-3 h-3 rounded-full ${done ? 'bg-mint-400' : 'bg-gray-200'}`} />
                      <p className={`text-xs flex-1 ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.name}</p>
                      <span className="text-[9px] text-gray-400">{t.studyTime}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => updateProgress({ ...plan.progress_data, studySessions: (plan.progress_data?.studySessions || 0) + 1 })}
                className="w-full py-3 bg-mint-100 text-mint-700 rounded-2xl text-sm font-semibold hover:bg-mint-200 transition-all"
              >
                + Log Study Session
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center"
            >
              <span className="text-4xl block mb-3">🗑️</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Exam Plan?</h3>
              <p className="text-xs text-gray-500 mb-5">
                This will move the plan to trash. You can always generate a new one later! 💖
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History sheet */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Saved Exam Plans</h2>
                <button onClick={() => setShowHistory(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {plans.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-3">📋</span>
                    <p className="text-gray-500 text-sm">No exam plans yet!</p>
                    <p className="text-xs text-gray-400 mt-1">Generate your first study plan 💖</p>
                  </div>
                ) : (
                  plans.map(p => (
                    <motion.button
                      key={p.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadPlan(p)}
                      className="w-full text-left p-3 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.paper_name}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {p.plan_data?.topics?.length || 0} topics • {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}