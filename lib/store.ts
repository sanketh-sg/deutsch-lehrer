import type { Card } from './sm2';
import { redis } from './redis';

/**
 * Learner state. One Redis key, rewritten whole on every answer.
 *
 * ponytail: whole-blob rewrite, single learner assumed. A few hundred active
 * cards is nothing to serialise, and there is exactly one writer. Move to
 * per-card hashes only if this ever serves more than one person.
 */
const KEY = 'progress';

export interface Progress {
  cards: Record<string, Card>;
  /** Verbs pinned into the drill pool from the browser, by infinitive. */
  pinned: string[];
}

export async function load(): Promise<Progress> {
  const p = await redis.get<Progress>(KEY);
  return { cards: p?.cards ?? {}, pinned: p?.pinned ?? [] };
}

export async function save(p: Progress): Promise<void> {
  await redis.set(KEY, p);
}

export async function putCard(card: Card): Promise<void> {
  const p = await load();
  p.cards[card.id] = card;
  await save(p);
}
