import { NextRequest, NextResponse } from 'next/server';
import { getCachedFlashcards, saveFlashcards, getLearningContext, getTodayUsage, incrementUsage } from '@/lib/db';
import { generateFlashcards, canMakeApiCall, getUsageStats } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  const cached = getCachedFlashcards(topic) as any[];
  if (cached.length > 0) {
    return NextResponse.json({
      flashcards: cached,
      cached: true,
      count: cached.length,
    });
  }

  return NextResponse.json({ flashcards: [], cached: false, count: 0 });
}

export async function POST(request: NextRequest) {
  try {
    const { topic, count = 5 } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const usage = getTodayUsage();
    if (!canMakeApiCall(usage)) {
      const stats = getUsageStats(usage);
      return NextResponse.json({
        error: 'daily_limit_reached',
        message: "You've used all your study tokens for today! Come back tomorrow for more ✨",
        stats,
      }, { status: 429 });
    }

    // Check cache first
    const cached = getCachedFlashcards(topic) as any[];
    if (cached.length >= count) {
      return NextResponse.json({
        flashcards: cached.slice(0, count),
        cached: true,
        count: cached.length,
        stats: getUsageStats(getTodayUsage()),
      });
    }

    // Get learning context for incremental learning
    const contextEntries = getLearningContext(3);
    const context = contextEntries.map((c: any) => `${c.topic}: ${c.context_summary}`).join('\n');

    // Generate new flashcards
    const flashcards = await generateFlashcards(topic, context, count);
    saveFlashcards(topic, flashcards);
    incrementUsage(200); // Approximate tokens

    return NextResponse.json({
      flashcards,
      cached: false,
      count: flashcards.length,
      stats: getUsageStats(getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json({
      error: 'generation_failed',
      message: "Oops! Our little tooth helper tripped! Let's try again 🦷",
    }, { status: 500 });
  }
}
