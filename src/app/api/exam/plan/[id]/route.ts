import { NextRequest, NextResponse } from 'next/server';
import { getExamPlan, updateExamProgress, softDeleteExamPlan, updateStudyContent } from '@/lib/db';

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
      study_content: plan.study_content ? (typeof plan.study_content === 'string' ? JSON.parse(plan.study_content) : plan.study_content) : {},
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
    const body = await request.json();

    const plan = await getExamPlan(parseInt(id));
    if (!plan) {
      return NextResponse.json({ error: 'not_found', message: 'Exam plan not found 🦷' }, { status: 404 });
    }

    if (body.progress_data) {
      await updateExamProgress(parseInt(id), body.progress_data);
    }
    if (body.study_content) {
      await updateStudyContent(parseInt(id), body.study_content);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'generation_failed', message: 'Failed to update 🦷' }, { status: 500 });
  }
}