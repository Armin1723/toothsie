# Future Features & Modules

## High Priority
- [ ] **Quiz Mode** — Timed multiple-choice quizzes generated from flashcard topics, with score tracking
- [ ] **Spaced Repetition** — Leitner system or SM-2 algorithm for flashcard scheduling based on confidence
- [ ] **Audio Pronunciation** — Play audio for dental terms (using Web Speech API or TTS)
- [ ] **Progress Dashboard** — Charts and stats over time (cards studied, streak history, topics mastered)
- [ ] **Image Support in Flashcards** — Allow uploading or AI-generating diagrams for dental anatomy

## Modules / Pages
- [ ] **Drug Calculator** — Dental drug dosage calculator (amoxicillin, lidocaine, etc.) with BSA/weight
- [ ] **Tooth Chart / Odontogram** — Interactive dental chart for marking caries, restorations, and missing teeth
- [ ] **Exam Timer / Pomodoro** — Study session timer with dental-themed break reminders
- [ ] **Clinical Guidelines** — Browse/search key guidelines from ADA, NICE, etc.
- [ ] **Revision Notes** — Save personal notes per topic, Markdown support
- [ ] **Flashcard Import/Export** — Import from Anki APKG or export as PDF/CSV
- [ ] **Community Flashcards** — Shared public flashcard decks from other BDS students

## AI Enhancements
- [ ] **AI Image Generation** — Generate dental anatomy diagrams from prompts via NVIDIA NIM
- [ ] **Voice Chat with Toothsie** — Speech-to-text + text-to-speech for hands-free study
- [ ] **Topic Recommendations** — AI suggests next topic based on weak areas and history
- [ ] **Explain Like I'm 5** — Toothsie simplifies complex dental concepts

## UI / UX
- [ ] **Offline Mode** — Service worker caching for flashcards and cases when no internet
- [ ] **Widgets** — Home screen widgets (iOS + Android) for streak, quick study
- [ ] **Haptic Feedback** — Light vibrations on flip, correct answer, milestones (PWA)
- [ ] **Onboarding Flow** — First-time user tutorial with tooth mascot guide
- [ ] **Accessibility** — Screen reader support, high contrast mode, larger tap targets

## Gamification
- [ ] **Achievement Badges** — "First Flashcard", "7-Day Streak", "50 Cases", etc.
- [ ] **XP & Level System** — Earn XP for studying, level up from "Dental Student" to "Oral Surgeon"
- [ ] **Daily Challenges** — "Study 3 cards from Periodontics" or "Answer 5 quick questions"
- [ ] **Leaderboard** — (Optional) Compare streaks with friends

## Social / Sharing
- [ ] **Share Flashcards** — Generate shareable image cards with question/answer
- [ ] **Study Groups** — Create groups, share notes, compete on streaks
- [ ] **Ask a Professor** — Flag confusing topics; answers could be crowdsourced

## Technical
- [ ] **Rate Limiting** — Server-side enforcement on API calls per day
- [ ] **Analytics** — Track feature usage to improve content
- [ ] **Sentry / Error Tracking** — Log client and server errors
- [ ] **Database Migrations** — Proper migration system instead of CREATE IF NOT EXISTS
- [ ] **Tests** — Unit tests for AI parsing, DB operations, component rendering
- [ ] **CI/CD** — GitHub Actions for lint, typecheck, build on PR
