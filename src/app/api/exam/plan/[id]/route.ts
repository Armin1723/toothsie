import { NextRequest, NextResponse } from 'next/server';
import { getExamPlan, updateExamProgress, softDeleteExamPlan } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = await getExamPlan(parseInt(id));
  if (!plan) {
    return NextResponse.json({ error: 'not_found', message: 'Exam plan not found 🦷' }, { status: 404 });
  }
  return NextResponse.json({
    plan: {
      ...plan,
      plan_data: typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data,
      progress_data: plan.progress_data ? (typeof plan.progress_data === 'string' ? JSON.parse(plan.progress_data) : plan.progress_data) : {},
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getExamPlan(parseInt(id));
    if (!plan) {
      return NextResponse.json({ error: 'not_found', message: 'Exam plan not found 🦷' }, { status: 404 });
    }
    await softDeleteExamPlan(parseInt(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'generation_failed', message: 'Failed to delete exam plan 🦷' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { progress_data } = await request.json();

    const plan = await getExamPlan(parseInt(id));
    if (!plan) {
      return NextResponse.json({ error: 'not_found', message: 'Exam plan not found 🦷' }, { status: 404 });
    }

    await updateExamProgress(parseInt(id), progress_data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'generation_failed', message: 'Failed to update progress 🦷' }, { status: 500 });
  }
}