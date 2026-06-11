import { NextRequest, NextResponse } from 'next/server';
import { getHistoIdentifications, saveHistoIdentification } from '@/lib/db';

export async function GET() {
  try {
    const rows = await getHistoIdentifications();
    return NextResponse.json({ identifications: rows });
  } catch (e) {
    console.error('GET histo identifications error:', e);
    return NextResponse.json({ error: 'generation_failed', message: 'Failed to fetch identifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { result, thumbnail } = await req.json();
    if (!result) {
      return NextResponse.json({ error: 'generation_failed', message: 'Missing result' }, { status: 400 });
    }
    const saved = await saveHistoIdentification(
      typeof result === 'string' ? result : JSON.stringify(result),
      thumbnail || ''
    );
    return NextResponse.json({ identification: saved });
  } catch (e) {
    console.error('POST histo identification error:', e);
    return NextResponse.json({ error: 'generation_failed', message: 'Failed to save identification' }, { status: 500 });
  }
}
