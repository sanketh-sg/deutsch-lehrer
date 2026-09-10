/**
 * Tense names and the shape of an example set. Kept in its own module with no
 * imports so client components can use it without dragging the AI SDK and the
 * provider into the browser bundle.
 */

/** Shown on a verb card: one sentence rendered in all four. */
export const DISPLAY_TENSES = ['praesens', 'praeteritum', 'perfekt', 'futur'] as const;
export type Tense = (typeof DISPLAY_TENSES)[number];

/**
 * Tested in the drill. Präteritum is reference-only, because outside sein,
 * haben and the modals it is a written form a learner rarely produces.
 */
export const DRILL_TENSES = ['praesens', 'perfekt', 'futur'] as const;
export type DrillTense = (typeof DRILL_TENSES)[number];

/** German names, used verbatim in prompts to the model. */
export const TENSE_LABEL: Record<Tense, string> = {
  praesens: 'Präsens',
  praeteritum: 'Präteritum',
  perfekt: 'Perfekt',
  futur: 'Futur I',
};

/** Shown alongside the German name, because "Perfekt" does not read as a past tense. */
export const TENSE_ENGLISH: Record<Tense, string> = {
  praesens: 'present',
  praeteritum: 'simple past',
  perfekt: 'present perfect',
  futur: 'simple future',
};

export const tenseHeading = (t: Tense) => `${TENSE_LABEL[t]} · ${TENSE_ENGLISH[t]}`;

export interface Example {
  de: string;
  en: string;
}

/**
 * One sentence in the ich form, rendered in every tense. The whole point is
 * that only the verb changes between the four, so the transformation is
 * visible at a glance.
 */
export type Examples = Record<Tense, Example>;

/** A cache entry written before Präteritum was added is regenerated, not served. */
export const isCompleteExamples = (e: unknown): e is Examples =>
  !!e && DISPLAY_TENSES.every((t) => typeof (e as Examples)[t]?.de === 'string');
