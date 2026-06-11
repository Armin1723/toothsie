import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'tooth-vault.db');

let db: Database.Database | null = function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
} as any;

function getDatabase(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  const database = getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      times_reviewed INTEGER DEFAULT 0,
      confidence INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_reviewed DATETIME
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      specialty TEXT NOT NULL,
      title TEXT NOT NULL,
      case_data TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS topic_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      interaction_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      api_calls INTEGER DEFAULT 0,
      tokens_used INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS learning_context (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      context_summary TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Flashcard operations
export function getCachedFlashcards(topic: string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM flashcards WHERE topic = ? ORDER BY created_at DESC').all(topic);
}

export function saveFlashcards(topic: string, cards: Array<{question: string; answer: string; difficulty?: string}>) {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO flashcards (topic, question, answer, difficulty) VALUES (?, ?, ?, ?)');
  const insertMany = db.transaction((items: typeof cards) => {
    for (const card of items) {
      stmt.run(topic, card.question, card.answer, card.difficulty || 'medium');
    }
  });
  insertMany(cards);

  // Track topic interaction
  db.prepare('INSERT INTO topic_history (topic, interaction_type) VALUES (?, ?)').run(topic, 'flashcard_generate');
}

export function getAllTopics() {
  const db = getDatabase();
  return db.prepare('SELECT DISTINCT topic, COUNT(*) as card_count FROM flashcards GROUP BY topic ORDER BY card_count DESC').all();
}

// Case operations
export function getCachedCases(specialty: string, limit = 5) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM cases WHERE specialty = ? ORDER BY created_at DESC LIMIT ?').all(specialty, limit);
}

export function saveCase(specialty: string, title: string, caseData: object, difficulty: string) {
  const db = getDatabase();
  db.prepare('INSERT INTO cases (specialty, title, case_data, difficulty) VALUES (?, ?, ?, ?)').run(
    specialty, title, JSON.stringify(caseData), difficulty
  );
  db.prepare('INSERT INTO topic_history (topic, interaction_type) VALUES (?, ?)').run(specialty, 'case_generate');
}

export function getAllCases() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM cases ORDER BY created_at DESC').all();
}

// Usage tracking
export function getTodayUsage() {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const usage = db.prepare('SELECT * FROM daily_usage WHERE date = ?').get(today) as any;
  return usage || { api_calls: 0, tokens_used: 0, date: today };
}

export function incrementUsage(tokens: number) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO daily_usage (date, api_calls, tokens_used) VALUES (?, 1, ?)
    ON CONFLICT(date) DO UPDATE SET api_calls = api_calls + 1, tokens_used = tokens_used + ?
  `).run(today, tokens, tokens);
}

// Learning context
export function getLearningContext(limit = 5) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM learning_context ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
}

export function saveLearningContext(topic: string, summary: string) {
  const db = getDatabase();
  db.prepare('INSERT INTO learning_context (topic, context_summary) VALUES (?, ?)').run(topic, summary);
}

// Topic history for recommendations
export function getTopicHistory(limit = 10) {
  const db = getDatabase();
  return db.prepare(`
    SELECT topic, COUNT(*) as count, MAX(created_at) as last_accessed
    FROM topic_history
    GROUP BY topic
    ORDER BY last_accessed DESC
    LIMIT ?
  `).all(limit);
}
