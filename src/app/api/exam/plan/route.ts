import { NextRequest, NextResponse } from 'next/server';
import { getExamPlans, saveExamPlan, getTodayUsage, incrementUsage } from '@/lib/db';
import { generateExamPlan, getUsageStats } from '@/lib/ai';

export async function GET() {
  const plans = await getExamPlans();
  const parsed = (plans as any[]).map(p => ({
    ...p,
    plan_data: typeof p.plan_data === 'string' ? JSON.parse(p.plan_data) : p.plan_data,
    progress_data: p.progress_data ? (typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : p.progress_data) : {},
    study_content: p.study_content ? (typeof p.study_content === 'string' ? JSON.parse(p.study_content) : p.study_content) : {},
  }));
  return NextResponse.json({ plans: parsed });
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
        study_content: saved.study_content ? (typeof saved.study_content === 'string' ? JSON.parse(saved.study_content) : saved.study_content) : {},
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

    if (error?.status === 422) {
      return NextResponse.json({
        error: 'generation_failed',
        message: "The AI couldn't structure the study plan. Try a different paper name or try again 🦷",
      }, { status: 422 });
    }

    return NextResponse.json({
      error: 'generation_failed',
      message: "Our study planner stumbled! Try again in a moment 🦷",
    }, { status: 500 });
  }
}