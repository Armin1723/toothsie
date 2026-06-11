import { NextRequest, NextResponse } from 'next/server';
import { getTodayUsage, incrementUsage, appendMessage, updateConversationTitle } from '@/lib/db';
import { generateChatResponse, getUsageStats } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { message, history, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const conversation = [
      ...(Array.isArray(history) ? history : []),
      { role: 'user' as const, content: message },
    ];

    const reply = await generateChatResponse(conversation);
    await incrementUsage(150);

    // Persist messages if conversationId is provided
    if (typeof conversationId === 'number') {
      await appendMessage(conversationId, 'user', message);
      await appendMessage(conversationId, 'assistant', reply);

      // Auto-title on first exchange (first user message after creation)
      if (history && history.length === 0) {
        const title = message.length > 50 ? message.slice(0, 50) + '…' : message;
        await updateConversationTitle(conversationId, title);
      }
    }

    return NextResponse.json({
      reply,
      stats: getUsageStats(await getTodayUsage()),
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    if (error?.status === 429 || error?.message?.includes('rate')) {
      return NextResponse.json({
        error: 'rate_limited',
        message: "Toothsie is a bit tired from all the chatting! Wait a moment 🦷💤",
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'generation_failed',
      message: "Toothsie tripped over a toothbrush! Try again 🦷",
    }, { status: 500 });
  }
}
