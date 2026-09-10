import { NextResponse } from 'next/server';
import { load, putCard } from '@/lib/store';
import { infinitiveOf } from '@/lib/scheduler';
import { BY_INFINITIVE } from '@/lib/verbs';
import { newCard, review, qualityFor } from '@/lib/sm2';
import { grade, DRILL_TENSES, type Prompts, type DrillTense } from '@/lib/drill';
import { providerError } from '@/lib/model';

export async function POST(req: Request) {
  const { cardId, prompts, answers } = (await req.json()) as {
    cardId?: string;
    prompts?: Prompts;
    answers?: Record<DrillTense, string>;
  };

  if (!cardId || !prompts || !answers) {
    return NextResponse.json({ error: 'cardId, prompts and answers are required' }, { status: 400 });
  }

  const verb = BY_INFINITIVE.get(infinitiveOf(cardId));
  if (!verb) return NextResponse.json({ error: `no verb for card ${cardId}` }, { status: 404 });

  let result;
  try {
    result = await grade(verb, prompts, answers);
  } catch (err) {
    return NextResponse.json({ error: providerError(err) }, { status: 502 });
  }

  // Count here rather than trusting a model-supplied score.
  const byTense = new Map(result.results.map((r) => [r.tense, r]));
  const correctCount = DRILL_TENSES.filter((t) => byTense.get(t)?.correct).length;

  const existing = load().cards[cardId];
  const card = review(existing ?? newCard(cardId), qualityFor(correctCount));
  putCard(card);

  return NextResponse.json({ ...result, correctCount, passed: correctCount === DRILL_TENSES.length, card });
}
