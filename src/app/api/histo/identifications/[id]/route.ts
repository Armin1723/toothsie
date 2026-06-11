import { NextRequest, NextResponse } from 'next/server';
import { deleteHistoIdentification } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteHistoIdentification(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE histo identification error:', e);
    return NextResponse.json({ error: 'generation_failed', message: 'Failed to delete identification' }, { status: 500 });
  }
}
