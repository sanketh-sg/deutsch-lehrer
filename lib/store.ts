import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import type { Card } from './sm2';

/**
 * Learner state. One file, rewritten whole on every answer.
 *
 * ponytail: whole-file rewrite, single learner assumed. A few hundred active
 * cards is nothing to serialise, and there is exactly one writer. Move to
 * SQLite only if this ever serves more than one person.
 */
const FILE = 'data/progress.json';

export interface Progress {
  cards: Record<string, Card>;
  /** Verbs pinned into the drill pool from the browser, by infinitive. */
  pinned: string[];
}

const EMPTY: Progress = { cards: {}, pinned: [] };

export function load(): Progress {
  try {
    const p = JSON.parse(readFileSync(FILE, 'utf8')) as Progress;
    return { cards: p.cards ?? {}, pinned: p.pinned ?? [] };
  } catch {
    return { ...EMPTY };
  }
}

export function save(p: Progress): void {
  mkdirSync('data', { recursive: true });
  writeFileSync(FILE, JSON.stringify(p, null, 1) + '\n');
}

export function putCard(card: Card): void {
  const p = load();
  p.cards[card.id] = card;
  save(p);
}
