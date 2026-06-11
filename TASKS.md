# Piyuuu's Tooth Vault - Task List

## Architecture
- [x] Plan architecture: Next.js + SQLite + NVIDIA API
- [x] Decide on smart caching strategy (cache-first, minimize API calls)

## Setup
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Add Tailwind CSS for styling
- [ ] Add Framer Motion for animations
- [ ] Set up project structure

## Backend
- [ ] Set up SQLite database (better-sqlite3)
- [ ] Create flashcards table (id, topic, question, answer, difficulty, created_at)
- [ ] Create cases table (id, specialty, case_data, difficulty, created_at)
- [ ] Create topic_history table (id, topic, interaction_type, created_at)
- [ ] Create daily_usage table (id, date, api_calls, tokens_used)
- [ ] Build API routes: /api/flashcards, /api/cases, /api/topics, /api/usage

## AI Integration
- [ ] Set up NVIDIA API client
- [ ] Build flashcard generation prompt
- [ ] Build case study generation prompt
- [ ] Implement cache-first logic (check DB before API)
- [ ] Implement daily API limit (20 calls/day)
- [ ] Add context from past topics for incremental learning

## Frontend - Study Buddy
- [ ] Home page with cute tooth mascot
- [ ] Study Buddy page: input topic → generate flashcards
- [ ] Flashcard viewer with swipe/tap to flip
- [ ] Topic history sidebar
- [ ] Saved flashcards library

## Frontend - Case Generator
- [ ] Case Generator page: select specialty → generate case
- [ ] Case viewer with patient details
- [ ] Case library (past generated cases)

## Error Handling
- [ ] Cute error states with stickers/gifs
- [ ] API limit reached → "save for later" message
- [ ] Network error → retry with cute animation
- [ ] Loading states with tooth animations

## Easter Eggs
- [ ] Type "piyuuu" → sparkle animation
- [ ] Secret mode after 10 visits
- [ ] Tooth mascot reacts to study streaks
- [ ] Hidden encouragement messages

## PWA
- [ ] Create manifest.json with app icons
- [ ] Set up service worker for offline support
- [ ] Add install button on home page
- [ ] Add to homescreen prompt

## Polish
- [ ] Mobile responsive (375px - 428px primary)
- [ ] Native app feel (no scrollbar, smooth transitions)
- [ ] Touch gestures for flashcards
- [ ] Dark/light mode toggle
