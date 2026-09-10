import { NextResponse } from 'next/server';
import { load } from '@/lib/store';
import { nextCard, infinitiveOf, dueCount, learnedCount, poolSize } from '@/lib/scheduler';
import { BY_INFINITIVE } from '@/lib/verbs';
import { makePrompts, type Mode } from '@/lib/drill';
import { providerError } from '@/lib/model';

export async function POST(req: Request) {
  const { mode = 'drill' } = (await req.json().catch(() => ({}))) as { mode?: Mode };

  const progress = load();
  const card = nextCard(progress);
  const stats = {
    due: dueCount(progress),
    learned: learnedCount(progress),
    pool: poolSize(progress),
  };

  if (!card) return NextResponse.json({ done: true, stats });

  const verb = BY_INFINITIVE.get(infinitiveOf(card.id));
  if (!verb) return NextResponse.json({ error: `no verb for card ${card.id}` }, { status: 500 });

  try {
    const prompts = await makePrompts(verb, mode);
    return NextResponse.json({
      cardId: card.id,
      phase: card.needsStudy ? 'study' : 'test',
      verb,
      prompts,
      stats,
    });
  } catch (err) {
    return NextResponse.json({ error: providerError(err) }, { status: 502 });
  }
}
