import { NextRequest, NextResponse } from 'next/server';
import { getExamPlan, appendStudyContent, incrementUsage, getTodayUsage } from '@/lib/db';
import { generateTopicContent, getUsageStats } from '@/lib/ai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { topicName } = await request.json();

    if (!topicName) {
      return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
    }

    const plan = await getExamPlan(parseInt(id));
    if (!plan) {
      return NextResponse.json({ error: 'not_found', message: 'Exam plan not found 🦷' }, { status: 404 });
    }

    const planData = typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data;
    const studyContent = plan.study_content ? (typeof plan.study_content === 'string' ? JSON.parse(plan.study_content) : plan.study_content) : {};

    const existingContent = studyContent[topicName] || [];
    const topic = planData.topics?.find((t: any) => t.name === topicName);
    const topicContent = topic?.content || [];

    const newParagraphs = await generateTopicContent(plan.paper_name, topicName, [...topicContent, ...existingContent]);
    await appendStudyContent(parseInt(id), topicName, newParagraphs);
    await incrementUsage(200);

    return NextResponse.json({
      paragraphs: newParagraphs,
      stats: getUsageStats(await getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Topic content generation error:', error);

    if (error?.status === 429 || error?.message?.includes('rate')) {
      return NextResponse.json({
        error: 'rate_limited',
        message: "Content generator is resting! Try again in a moment 🦷",
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'generation_failed',
      message: "Could not generate more content right now 🦷",
    }, { status: 500 });
  }
}