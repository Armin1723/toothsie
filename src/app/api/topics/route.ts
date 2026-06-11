import { NextResponse } from 'next/server';
import { getAllTopics, getTopicHistory } from '@/lib/db';

export async function GET() {
  try {
    const topics = await getAllTopics() as any[];
    const history = await getTopicHistory(10) as any[];

    return NextResponse.json({
      topics: topics.map(t => ({
        name: t.topic,
        cardCount: parseInt(t.card_count) || 0,
      })),
      recentTopics: history.map(h => ({
        topic: h.topic,
        interactionCount: parseInt(h.count) || 0,
        lastAccessed: h.last_accessed,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}
