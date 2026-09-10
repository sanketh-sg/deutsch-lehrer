import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from './model';
import { perfekt, perfektAux, futur, isModal, type Verb } from './verbs';
import { ACCUSATIVE, DATIVE, TWO_WAY } from '@/data/prepositions';
import { VERB_PREPOSITIONS } from '@/data/verbPrepositions';

import { DRILL_TENSES, TENSE_LABEL, type DrillTense } from './tenses';

export { DRILL_TENSES, TENSE_LABEL };
export type { DrillTense };

export type Mode = 'drill' | 'chat' | 'explain';

/** The forms the model must not invent, passed into every call about this verb. */
function groundTruth(v: Verb): string {
  return [
    `Verb: ${v.infinitive} (${v.english}), level ${v.level}.`,
    `These forms are correct and must be used exactly:`,
    `  Präsens: ${v.praesens.join(', ')}`,
    `  Perfekt: ${perfektAux(v)} + ${v.partizip}, e.g. "ich ${perfekt(v)}"`,
    `  Futur I: "ich ${futur(v)}"`,
    v.separable ? `  Separable: the prefix moves to the end of the clause in Präsens.` : '',
    v.reflexive ? `  Reflexive: a reflexive pronoun is required.` : '',
    isModal(v) ? modalRule(v) : '',
    fixedPrepositions(v),
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Verbs whose preposition is fixed by the verb rather than chosen by meaning,
 * so "warten auf" is always accusative. Where one exists it is the single most
 * useful thing to drill about that verb, so the exercise is steered onto it.
 */
function fixedPrepositions(v: Verb): string {
  const matches = VERB_PREPOSITIONS.filter(
    (vp) => vp.verb === v.infinitive || vp.verb === `sich ${v.infinitive}`,
  );
  if (!matches.length) return '';
  return [
    `  Fixed preposition, use one of these and keep its case:`,
    ...matches.map((m) => `    ${m.verb} ${m.prep} + ${m.case} — ${m.english} — "${m.example.de}"`),
  ].join('\n');
}

/** The double-infinitive rule, which the participle in the data does not convey. */
const modalRule = (v: Verb) =>
  [
    `  Modal verb, so the Perfekt takes the Ersatzinfinitiv: with a dependent`,
    `  infinitive write "hat arbeiten ${v.infinitive}", never "hat arbeiten ${v.partizip}".`,
    `  "${v.partizip}" is correct only when the modal stands alone with no second verb.`,
  ].join('\n');

const PREPOSITION_NOTE = [
  `Where a preposition fits naturally, use one, because the learner is also practising cases.`,
  `Accusative only: ${ACCUSATIVE.map((p) => p.prep).join(', ')}.`,
  `Dative only: ${DATIVE.map((p) => p.prep).join(', ')}.`,
  `Two-way (accusative for direction, dative for position): ${TWO_WAY.map((p) => p.prep).join(', ')}.`,
].join('\n');

const promptSchema = z.object({
  praesens: z.string().describe('English sentence to translate, in the present.'),
  perfekt: z.string().describe('English sentence to translate, in the past.'),
  futur: z.string().describe('English sentence to translate, in the future.'),
  lesson: z.string().describe('Two or three sentences of English explanation, or an empty string.'),
});

export type Prompts = z.infer<typeof promptSchema>;

/**
 * Three English sentences for the learner to render in German, one per tense.
 * Generated in a single call to stay inside the free tier's request budget.
 */
export async function makePrompts(verb: Verb, mode: Mode): Promise<Prompts> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: promptSchema }),
    prompt: [
      `You are setting a short German exercise for an A2 to B1 learner.`,
      ``,
      groundTruth(verb),
      ``,
      `Write three English sentences for the learner to translate into German, one per tense.`,
      `Each must force the verb "${verb.infinitive}" and describe a different everyday situation.`,
      `Keep each to 5 to 10 words. Do not include the German anywhere.`,
      ``,
      PREPOSITION_NOTE,
      ``,
      mode === 'explain'
        ? `Also write a "lesson": two or three sentences of English explaining the one grammar point this verb best illustrates, such as its auxiliary in the Perfekt or its separable prefix.`
        : `Leave "lesson" as an empty string.`,
    ].join('\n'),
  });
  return output;
}

const gradeSchema = z.object({
  results: z.array(
    z.object({
      tense: z.enum(DRILL_TENSES),
      correct: z.boolean().describe('True only if the sentence is fully correct German.'),
      corrected: z.string().describe('The corrected German sentence, or the original if it was right.'),
      errors: z.array(
        z.object({
          type: z.enum([
            'case',
            'word-order',
            'verb-form',
            'auxiliary',
            'preposition',
            'gender',
            'spelling',
            'other',
          ]),
          wrong: z.string().describe('The learner’s wrong fragment.'),
          right: z.string().describe('What it should be.'),
          explanation: z.string().describe('One sentence in English explaining the rule.'),
        }),
      ),
    }),
  ),
  note: z.string().describe('One encouraging sentence in English about the overall attempt.'),
});

export type GradeResult = z.infer<typeof gradeSchema>;

export async function grade(verb: Verb, prompts: Prompts, answers: Record<DrillTense, string>): Promise<GradeResult> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: gradeSchema }),
    prompt: [
      `You are marking a German exercise. Explain in English; the learner is not fluent.`,
      ``,
      groundTruth(verb),
      ``,
      `Mark each of these three attempts. Return one result per tense, in this order: praesens, perfekt, futur.`,
      ...DRILL_TENSES.map((t) =>
        [
          ``,
          `${TENSE_LABEL[t]}`,
          `  Asked: ${prompts[t]}`,
          `  Wrote: ${answers[t]?.trim() || '(no answer)'}`,
        ].join('\n'),
      ),
      ``,
      `Mark "correct" true only if the German is fully correct and in the tense asked for.`,
      `An empty answer is never correct. Accept any natural wording that fits the English prompt;`,
      `do not insist on one particular translation. List one error entry per distinct mistake,`,
      `and pick the most specific type: a wrong article after a preposition is "case", not "other".`,
    ].join('\n'),
  });
  return output;
}
