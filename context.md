# Piyuuu's Tooth Vault — Project Context

## Overview
A cute, PWA-enabled dental study companion for BDS students. Built with Next.js 16, Neon PostgreSQL, and NVIDIA NIM AI. Features flashcards, clinical case studies, and an AI chat buddy named Toothsie.

## Tech Stack
- **Framework:** Next.js 16.2.9 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** Neon (serverless PostgreSQL) via `@neondatabase/serverless`
- **AI:** NVIDIA NIM (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`) via OpenAI SDK
- **Styling:** Tailwind CSS v4 with CSS custom property theming
- **Animations:** Framer Motion 12
- **Fonts:** Fredoka (headings) + Nunito (body) via Google Fonts
- **PWA:** Manifest, standalone display, install prompt

## Environment Variables
See `.env.local`:
- `NVIDIA_API_KEY` — NVIDIA NIM API key
- `DATABASE_URL` — Neon PostgreSQL connection string

## File Structure
```
src/
├── app/api/          # API routes (cases, chat, flashcards, topics, usage)
├── app/cases/        # Case studies page
├── app/chat/         # AI chat page
├── app/study/        # Flashcard study page
├── app/page.tsx      # Home dashboard
├── app/layout.tsx    # Root layout (ThemeProvider, Navigation, ThemePicker)
├── app/globals.css   # Tailwind config + 5 themes
├── components/       # 11 reusable components
└── lib/              # ai.ts, db.ts, ThemeContext, easterEggs, useEasterEggs
```

## Database Tables
- `flashcards` — id, topic, question, answer, difficulty, times_reviewed, confidence, timestamps
- `cases` — id, specialty, title, case_data (JSON), difficulty, created_at
- `topic_history` — id, topic, interaction_type, created_at
- `daily_usage` — id, date (UNIQUE), api_calls, tokens_used
- `learning_context` — id, topic, context_summary, created_at
- `conversations` — id, title, created_at, updated_at
- `messages` — id, conversation_id (FK), role, content, created_at

## API Routes
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/flashcards?topic=` | Get cached flashcards |
| POST | `/api/flashcards` | Generate new flashcards |
| GET | `/api/cases?specialty= or &all=true` | Get cached/all cases |
| POST | `/api/cases` | Generate case study |
| GET | `/api/topics` | List topics with card counts |
| GET | `/api/usage` | Today's API usage stats |
| POST | `/api/chat` | Send message to Toothsie |
| GET | `/api/chat/conversations` | List saved chats |
| POST | `/api/chat/conversations` | Create new chat |
| GET | `/api/chat/conversations/[id]` | Load chat with messages |
| DELETE | `/api/chat/conversations/[id]` | Delete chat |

## Theme System
5 themes defined as CSS classes on `<html>`:
- `piyuu` (default pink mint)
- `piyuu-dark` (dark mode)
- `piyuu-lavender` (soft purple)
- `piyuu-rose` (warm rose)
- `piyuu-ocean` (blue/teal)

Colors are CSS variables (`--pink-50`, `--mint-500`, etc.) mapped through Tailwind's `@theme inline` so existing classes like `bg-pink-500` auto-theme.

## Key Conventions
- All API errors return `{ error: string, message?: string }` with types: `rate_limited`, `generation_failed`, `network_error`, `not_found`
- All pages use Framer Motion `motion.div` with fade/slide entrance animations
- Components use `'use client'` directive for interactivity
- AI calls in `lib/ai.ts` cast to `any` for the OpenAI SDK
- Usage tracking increments per AI call (150-300 tokens)
- Chats auto-title based on first user message
- Study streak and visit counters use `localStorage`
