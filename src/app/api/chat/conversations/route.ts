import { NextResponse } from 'next/server';
import { getConversations, createConversation } from '@/lib/db';

export async function GET() {
  try {
    const conversations = await getConversations();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ conversations: [] });
  }
}

export async function POST() {
  try {
    const conversation = await createConversation();
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
