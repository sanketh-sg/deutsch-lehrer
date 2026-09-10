/**
 * SM-2 spaced repetition. One pure function, no storage, no dates beyond
 * plain YYYY-MM-DD strings so they sort lexicographically.
 */

export interface Card {
  id: string;
  /** Consecutive successful reviews. Reset to 0 by a lapse. */
  reps: number;
  /** Days until the next review. */
  interval: number;
  /** SM-2 ease factor, floored at 1.3. */
  ease: number;
  due: string;
  lapses: number;
  /** Show the study side before testing. True for new and lapsed cards. */
  needsStudy: boolean;
}

/**
 * The learner's local day, not UTC. Using toISOString here would mean that
 * studying after midnight in a positive-offset timezone reports yesterday's
 * date, and cards due today would stay hidden for hours.
 */
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Pure date arithmetic on YYYY-MM-DD; anchored at UTC midnight to dodge DST. */
const addDays = (from: string, days: number) => {
  const d = new Date(`${from}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export function newCard(id: string, now = today()): Card {
  return { id, reps: 0, interval: 0, ease: 2.5, due: now, lapses: 0, needsStudy: true };
}

/**
 * A verb card is tested in all three tenses and passes only if all three are
 * right, so anything short of 3 maps below the SM-2 pass threshold of 3 and
 * lapses. Getting two tenses right is not knowing the verb; it just lapses
 * more gently than getting none.
 *
 * Quality is computed here rather than asked of the model, because counting
 * correct answers is arithmetic and a model asked for a score will drift.
 */
export function qualityFor(correctCount: number): number {
  return [0, 1, 2, 5][Math.max(0, Math.min(3, correctCount))];
}

/** Standard SM-2. Quality below 3 is a lapse: reps reset, study side returns. */
export function review(card: Card, quality: number, now = today()): Card {
  const ease = Math.max(1.3, card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < 3) {
    return { ...card, reps: 0, interval: 1, ease, due: addDays(now, 1), lapses: card.lapses + 1, needsStudy: true };
  }

  const reps = card.reps + 1;
  const interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(card.interval * card.ease);
  return { ...card, reps, interval, ease, due: addDays(now, interval), needsStudy: false };
}
