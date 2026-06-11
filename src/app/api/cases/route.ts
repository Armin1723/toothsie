import { NextRequest, NextResponse } from 'next/server';
import { getCachedCases, saveCase, getAllCases, getLearningContext, getTodayUsage, incrementUsage } from '@/lib/db';
import { generateCaseStudy, canMakeApiCall, getUsageStats } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get('specialty');
  const all = searchParams.get('all');

  if (all === 'true') {
    const cases = getAllCases();
    return NextResponse.json({ cases });
  }

  if (!specialty) {
    return NextResponse.json({ error: 'Specialty is required' }, { status: 400 });
  }

  const cached = getCachedCases(specialty) as any[];
  return NextResponse.json({ cases: cached, cached: cached.length > 0 });
}

export async function POST(request: NextRequest) {
  try {
    const { specialty, difficulty = 'medium' } = await request.json();

    if (!specialty) {
      return NextResponse.json({ error: 'Specialty is required' }, { status: 400 });
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

    // Get learning context
    const contextEntries = getLearningContext(3);
    const context = contextEntries.map((c: any) => `${c.topic}: ${c.context_summary}`).join('\n');

    // Generate case study
    const caseStudy = await generateCaseStudy(specialty, context, difficulty);
    saveCase(specialty, caseStudy.title, caseStudy as any, difficulty);
    incrementUsage(300); // Approximate tokens

    return NextResponse.json({
      case: caseStudy,
      cached: false,
      stats: getUsageStats(getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Case generation error:', error);
    return NextResponse.json({
      error: 'generation_failed',
      message: "Oops! Our little tooth helper tripped! Let's try again 🦷",
    }, { status: 500 });
  }
}
