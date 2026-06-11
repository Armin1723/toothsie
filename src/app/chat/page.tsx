'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToothMascot from '@/components/ToothMascot';
import ErrorState from '@/components/ErrorState';
import { useTimeBasedMessage, useConsoleEasterEgg } from '@/lib/useEasterEggs';
import { piyuuuQuotes } from '@/lib/easterEggs';
import { useFeedback } from '@/lib/useFeedback';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  msg_count: number;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hii Piyuuu! I'm Toothsie, your tiny tooth study buddy! 🦷✨ Ask me anything about dentistry — I'm here to help! 💖",
};

const QUICK_QUESTIONS = [
  'What are the layers of a tooth?',
  'Tell me about dental caries',
  'What is a root canal?',
  'Explain malocclusion types',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ type: string; message?: string } | null>(null);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Conversation management
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const timeMessage = useTimeBasedMessage();
  const feedback = useFeedback();
  useConsoleEasterEgg();

  const fetchConversations = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/chat/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConversation = async () => {
    try {
      const res = await fetch('/api/chat/conversations', { method: 'POST' });
      const data = await res.json();
      if (data.conversation) {
        setConversationId(data.conversation.id);
        return data.conversation.id;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const loadConversation = async (id: number) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}`);
      const data = await res.json();
      if (data.messages && data.conversation) {
        setConversationId(id);
        setMessages([
          WELCOME_MESSAGE,
          ...data.messages.map((m: any) => ({ role: m.role, content: m.content })),
        ]);
        setShowQuickQuestions(false);
        setShowHistory(false);
        setError(null);
      }
    } catch {
      setError({ type: 'generation_failed' });
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setShowQuickQuestions(true);
    setShowHistory(false);
    setError(null);
  };

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    setInput('');
    setError(null);
    setShowQuickQuestions(false);
    feedback.send();

    const userMessage: ChatMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Auto-create conversation on first send
      let activeId = conversationId;
      if (!activeId) {
        activeId = await createConversation();
        setConversationId(activeId);
      }

      const history = updatedMessages.slice(1); // exclude welcome

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: history.slice(0, -1), // exclude latest user msg (API appends it)
          conversationId: activeId,
        }),
      });

      const data = await res.json();

      if (data.error === 'rate_limited') {
        setError({ type: 'rate_limited', message: data.message });
      } else if (data.error) {
        setError({ type: 'generation_failed', message: data.message });
      } else {
        feedback.receive();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        fetchConversations(); // refresh list
      }
    } catch {
      setError({ type: 'network_error' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="px-4 pt-4 pb-2 space-y-3 flex flex-col h-[calc(100dvh-5rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative"
      >
        <div className="flex items-center justify-center gap-2">
          <ToothMascot mood="love" size="md" message="Chat with Toothsie!" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { fetchConversations(); setShowHistory(true); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-theme-sm border border-pink-100 text-sm"
            aria-label="Chat history"
          >
            📋
          </motion.button>
        </div>
        <h1 className="mt-2 text-xl font-bold text-gray-800">Chat Buddy 💬</h1>
        <p className="text-gray-500 text-xs">{timeMessage}</p>
        {conversationId && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNewChat}
            className="mt-1 text-[10px] text-pink-500 font-medium"
          >
            + New Chat
          </motion.button>
        )}
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-pink-500 text-white rounded-br-md shadow-md'
                    : 'bg-white text-gray-700 border border-pink-100 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md p-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 0.15, 0.3].map((delay) => (
                    <motion.span
                      key={delay}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                      className="w-2 h-2 bg-pink-300 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick questions */}
        <AnimatePresence>
          {showQuickQuestions && messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pt-2 space-y-2"
            >
              <p className="text-xs text-gray-400 text-center">Try asking:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-pink-600 border border-pink-100 hover:bg-pink-50 transition-colors"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dental fact after a few messages */}
        {messages.length > 3 && messages.length % 4 === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-gradient-to-r from-mint-50 to-pink-50 rounded-2xl border border-mint-100"
          >
            <p className="text-[10px] text-gray-400 font-medium mb-0.5">🦷 Dental Snack</p>
            <p className="text-xs text-gray-600">{pickRandom(piyuuuQuotes.dentalFacts)}</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <ErrorState
            type={error.type as any}
            message={error.message}
            onRetry={() => {
              setError(null);
              const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
              if (lastUserMsg) handleSend(lastUserMsg.content);
            }}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 items-end"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Toothsie anything about dentistry..."
          rows={1}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none text-sm resize-none transition-all"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-pink-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-pink-200 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '⏳' : '💬'}
        </motion.button>
      </motion.div>

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
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Chat History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {historyLoading ? (
                  <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-3">💬</span>
                    <p className="text-gray-500 text-sm">No chats yet!</p>
                    <p className="text-xs text-gray-400 mt-1">Start a conversation with Toothsie 💖</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-colors ${
                        conv.id === conversationId
                          ? 'bg-pink-50 border border-pink-200'
                          : 'bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate flex-1">
                          {conv.title}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatDate(conv.updated_at)}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {conv.msg_count} message{conv.msg_count !== 1 ? 's' : ''}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startNewChat}
                className="mt-4 w-full py-3 bg-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-pink-200"
              >
                + New Chat
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
