import { NextResponse } from 'next/server';
import { examplesFor } from '@/lib/examples';
import { providerError } from '@/lib/model';

export async function POST(req: Request) {
  const { infinitive } = (await req.json()) as { infinitive?: string };
  if (!infinitive) return NextResponse.json({ error: 'infinitive is required' }, { status: 400 });

  try {
    return NextResponse.json(await examplesFor(infinitive));
  } catch (err) {
    const message = (err as Error).message;
    if (message.startsWith('unknown verb')) return NextResponse.json({ error: message }, { status: 404 });
    return NextResponse.json({ error: providerError(err) }, { status: 500 });
  }
}
