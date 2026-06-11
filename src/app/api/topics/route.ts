import { NextResponse } from 'next/server';
import { getAllTopics, getTopicHistory } from '@/lib/db';

export async function GET() {
  try {
    const topics = getAllTopics() as any[];
    const history = getTopicHistory(10) as any[];

    return NextResponse.json({
      topics: topics.map(t => ({
        name: t.topic,
        cardCount: t.card_count,
      })),
      recentTopics: history.map(h => ({
        topic: h.topic,
        interactionCount: h.count,
        lastAccessed: h.last_accessed,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}
