import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initializeDatabase() {
  await sql`CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    times_reviewed INTEGER DEFAULT 0,
    confidence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ
  )`;

  await sql`CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    specialty TEXT NOT NULL,
    title TEXT NOT NULL,
    case_data TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS topic_history (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS daily_usage (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    api_calls INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS learning_context (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL,
    context_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
}

let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// Flashcard operations
export async function getCachedFlashcards(topic: string) {
  await ensureDb();
  return sql`SELECT * FROM flashcards WHERE topic = ${topic} ORDER BY created_at DESC`;
}

export async function saveFlashcards(topic: string, cards: Array<{question: string; answer: string; difficulty?: string}>) {
  await ensureDb();
  for (const card of cards) {
    await sql`INSERT INTO flashcards (topic, question, answer, difficulty) VALUES (${topic}, ${card.question}, ${card.answer}, ${card.difficulty || 'medium'})`;
  }
  await sql`INSERT INTO topic_history (topic, interaction_type) VALUES (${topic}, 'flashcard_generate')`;
}

export async function getAllTopics() {
  await ensureDb();
  return sql`SELECT DISTINCT topic, COUNT(*) as card_count FROM flashcards GROUP BY topic ORDER BY card_count DESC`;
}

// Case operations
export async function getCachedCases(specialty: string, limit = 5) {
  await ensureDb();
  return sql`SELECT * FROM cases WHERE specialty = ${specialty} ORDER BY created_at DESC LIMIT ${limit}`;
}

export async function saveCase(specialty: string, title: string, caseData: object, difficulty: string) {
  await ensureDb();
  await sql`INSERT INTO cases (specialty, title, case_data, difficulty) VALUES (${specialty}, ${title}, ${JSON.stringify(caseData)}, ${difficulty})`;
  await sql`INSERT INTO topic_history (topic, interaction_type) VALUES (${specialty}, 'case_generate')`;
}

export async function getAllCases() {
  await ensureDb();
  return sql`SELECT * FROM cases ORDER BY created_at DESC`;
}

// Usage tracking
export async function getTodayUsage() {
  await ensureDb();
  const today = new Date().toISOString().split('T')[0];
  const rows = await sql`SELECT * FROM daily_usage WHERE date = ${today}`;
  return (rows[0] as any) || { api_calls: 0, tokens_used: 0, date: today };
}

export async function incrementUsage(tokens: number) {
  await ensureDb();
  const today = new Date().toISOString().split('T')[0];
  await sql`
    INSERT INTO daily_usage (date, api_calls, tokens_used) VALUES (${today}, 1, ${tokens})
    ON CONFLICT(date) DO UPDATE SET api_calls = daily_usage.api_calls + 1, tokens_used = daily_usage.tokens_used + ${tokens}
  `;
}

// Learning context
export async function getLearningContext(limit = 5) {
  await ensureDb();
  return sql`SELECT * FROM learning_context ORDER BY created_at DESC LIMIT ${limit}`;
}

export async function saveLearningContext(topic: string, summary: string) {
  await ensureDb();
  await sql`INSERT INTO learning_context (topic, context_summary) VALUES (${topic}, ${summary})`;
}

// Conversation history
export async function createConversation(title = 'New Chat') {
  await ensureDb();
  const rows = await sql`
    INSERT INTO conversations (title) VALUES (${title})
    RETURNING id, title, created_at, updated_at
  `;
  return (rows[0] as any);
}

export async function updateConversationTitle(id: number, title: string) {
  await ensureDb();
  await sql`UPDATE conversations SET title = ${title}, updated_at = NOW() WHERE id = ${id}`;
}

export async function appendMessage(conversationId: number, role: string, content: string) {
  await ensureDb();
  await sql`
    INSERT INTO messages (conversation_id, role, content) VALUES (${conversationId}, ${role}, ${content})
  `;
  await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${conversationId}`;
}

export async function getConversations(limit = 20) {
  await ensureDb();
  return sql`
    SELECT c.id, c.title, c.created_at, c.updated_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as msg_count
    FROM conversations c
    ORDER BY c.updated_at DESC
    LIMIT ${limit}
  `;
}

export async function getConversation(id: number) {
  await ensureDb();
  const conv = await sql`SELECT * FROM conversations WHERE id = ${id}`;
  if (!(conv as any[]).length) return null;
  const msgs = await sql`
    SELECT role, content, created_at FROM messages WHERE conversation_id = ${id} ORDER BY created_at ASC
  `;
  return { conversation: (conv as any[])[0], messages: msgs as any[] };
}

export async function deleteConversation(id: number) {
  await ensureDb();
  await sql`DELETE FROM conversations WHERE id = ${id}`;
}

// Topic history for recommendations
export async function getTopicHistory(limit = 10) {
  await ensureDb();
  return sql`
    SELECT topic, COUNT(*) as count, MAX(created_at) as last_accessed
    FROM topic_history
    GROUP BY topic
    ORDER BY last_accessed DESC
    LIMIT ${limit}
  `;
}
