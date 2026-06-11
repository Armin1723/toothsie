import { NextRequest, NextResponse } from 'next/server';
import { identifyHistoSlide } from '@/lib/ai';
import { incrementUsage } from '@/lib/db';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Validate image size (base64 length ~ 1.37x byte size)
    const approxBytes = Math.ceil(image.length * 0.75);
    if (approxBytes > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Image too large. Please compress to under 5 MB.' },
        { status: 400 }
      );
    }

    const result = await identifyHistoSlide(image);

    // Track usage (~150 tokens for vision analysis)
    await incrementUsage(150).catch(() => {});

    return NextResponse.json(result);
  } catch (error: any) {
    const message = error?.message || '';
    if (message.includes('429') || message.includes('rate')) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'You\'ve used too many API calls. Please wait a moment.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'generation_failed', message: 'Failed to analyze the slide. Please try again with a clearer image.' },
      { status: 500 }
    );
  }
}
