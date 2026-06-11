import { NextRequest, NextResponse } from 'next/server';
import { getCachedCases, saveCase, getAllCases, getLearningContext, getTodayUsage, incrementUsage } from '@/lib/db';
import { generateCaseStudy, getUsageStats } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get('specialty');
  const all = searchParams.get('all');

  if (all === 'true') {
    const cases = await getAllCases();
    return NextResponse.json({ cases });
  }

  if (!specialty) {
    return NextResponse.json({ error: 'Specialty is required' }, { status: 400 });
  }

  const cached = await getCachedCases(specialty);
  return NextResponse.json({ cases: cached, cached: cached.length > 0 });
}

export async function POST(request: NextRequest) {
  try {
    const { specialty, difficulty = 'medium' } = await request.json();

    if (!specialty) {
      return NextResponse.json({ error: 'Specialty is required' }, { status: 400 });
    }

    // Get learning context
    const contextEntries = await getLearningContext(3);
    const context = contextEntries.map((c: any) => `${c.topic}: ${c.context_summary}`).join('\n');

    // Generate case study
    const caseStudy = await generateCaseStudy(specialty, context, difficulty);
    await saveCase(specialty, caseStudy.title, caseStudy as any, difficulty);
    await incrementUsage(300);

    return NextResponse.json({
      case: caseStudy,
      cached: false,
      stats: getUsageStats(await getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Case generation error:', error);

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
