import { VERBS } from './verbs';
import { newCard, today, type Card } from './sm2';
import { load, type Progress } from './store';

/**
 * How many verbs are in the drill pool before anything is learned. All 1000
 * are browsable; only the pool is drilled, because 1000 cards would bury the
 * common verbs under the frequency tail for months.
 */
const BASE_POOL = 150;

export const cardId = (infinitive: string) => `verb:${infinitive}`;
export const infinitiveOf = (id: string) => id.slice('verb:'.length);

/** The pool grows as cards mature, unlocking the next band of verbs. */
export function poolSize(p: Progress): number {
  const matured = Object.values(p.cards).filter((c) => c.interval >= 6).length;
  return BASE_POOL + matured;
}

export function dueCount(p: Progress, now = today()): number {
  return Object.values(p.cards).filter((c) => c.due <= now).length;
}

export function learnedCount(p: Progress): number {
  return Object.values(p.cards).filter((c) => c.reps > 0).length;
}

/**
 * Due cards first, earliest due date wins. When nothing is due, introduce the
 * next unseen verb from the pool. Returns null when the pool is exhausted and
 * nothing is due, which means the learner is done for the day.
 */
export function nextCard(p: Progress = load(), now = today()): Card | null {
  const due = Object.values(p.cards)
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id));
  if (due.length) return due[0];

  const pool = [...VERBS.slice(0, poolSize(p)).map((v) => v.infinitive), ...p.pinned];
  const unseen = pool.find((inf) => !p.cards[cardId(inf)]);
  return unseen ? newCard(cardId(unseen), now) : null;
}
