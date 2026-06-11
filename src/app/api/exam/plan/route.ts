import { NextRequest, NextResponse } from 'next/server';
import { getExamPlans, saveExamPlan, getTodayUsage, incrementUsage } from '@/lib/db';
import { generateExamPlan, getUsageStats } from '@/lib/ai';

export async function GET() {
  const plans = await getExamPlans();
  return NextResponse.json({ plans });
}

export async function POST(request: NextRequest) {
  try {
    const { paperName } = await request.json();

    if (!paperName || typeof paperName !== 'string') {
      return NextResponse.json({ error: 'Paper name is required' }, { status: 400 });
    }

    const planData = await generateExamPlan(paperName);
    const saved = await saveExamPlan(paperName, planData);
    await incrementUsage(400);

    return NextResponse.json({
      plan: {
        id: saved.id,
        paper_name: saved.paper_name,
        plan_data: typeof saved.plan_data === 'string' ? JSON.parse(saved.plan_data) : saved.plan_data,
        progress_data: saved.progress_data ? (typeof saved.progress_data === 'string' ? JSON.parse(saved.progress_data) : saved.progress_data) : {},
        created_at: saved.created_at,
        updated_at: saved.updated_at,
      },
      stats: getUsageStats(await getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Exam plan generation error:', error);

    if (error?.status === 429 || error?.message?.includes('rate')) {
      return NextResponse.json({
        error: 'rate_limited',
        message: "Our study planner is catching its breath! Wait a moment 🦷📋",
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'generation_failed',
      message: "Oops! Our study planner stumbled! Let's try again 🦷",
    }, { status: 500 });
  }
}