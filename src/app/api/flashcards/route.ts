import { NextRequest, NextResponse } from 'next/server';
import { getCachedFlashcards, saveFlashcards, getLearningContext, getTodayUsage, incrementUsage } from '@/lib/db';
import { generateFlashcards, getUsageStats } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  const cached = await getCachedFlashcards(topic);
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

    // Check cache first
    const cached = await getCachedFlashcards(topic);
    if (cached.length >= count) {
      return NextResponse.json({
        flashcards: cached.slice(0, count),
        cached: true,
        count: cached.length,
        stats: getUsageStats(await getTodayUsage()),
      });
    }

    // Get learning context for incremental learning
    const contextEntries = await getLearningContext(3);
    const context = contextEntries.map((c: any) => `${c.topic}: ${c.context_summary}`).join('\n');

    // Generate new flashcards
    const flashcards = await generateFlashcards(topic, context, count);
    await saveFlashcards(topic, flashcards);
    await incrementUsage(200);

    return NextResponse.json({
      flashcards,
      cached: false,
      count: flashcards.length,
      stats: getUsageStats(await getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Flashcard generation error:', error);

    if (error?.status === 429 || error?.message?.includes('rate')) {
      return NextResponse.json({
        error: 'rate_limited',
        message: "Our tooth helper is a bit tired! Wait a moment and try again 🦷💤",
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'generation_failed',
      message: "Oops! Our little tooth helper tripped! Let's try again 🦷",
    }, { status: 500 });
  }
}
