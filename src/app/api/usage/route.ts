import { NextResponse } from 'next/server';
import { getTodayUsage } from '@/lib/db';
import { getUsageStats } from '@/lib/ai';

export async function GET() {
  try {
    const usage = await getTodayUsage();
    const stats = getUsageStats(usage);

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
