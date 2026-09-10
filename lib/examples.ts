import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from './model';
import { BY_INFINITIVE, isModal, type Verb } from './verbs';
import { isCompleteExamples, type Examples } from './tenses';

/**
 * One sentence per verb, in the ich form, written out in all four tenses. Only
 * the verb should change between them, so the learner sees the transformation
 * rather than four unrelated sentences.
 *
 * Generated once per verb and cached, because the free tier allows roughly 142
 * requests a day. The conjugated forms are handed to the model as ground truth
 * instead of being left to it.
 */
const FILE = 'data/examples.json';

type Cache = Record<string, Examples>;

function read(): Cache {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as Cache;
  } catch {
    return {};
  }
}

const line = (what: string) =>
  z.object({
    de: z.string().describe(what),
    en: z.string().describe('Plain English translation, also in the first person.'),
  });

const schema = z.object({
  praesens: line('The sentence in Präsens, starting with "Ich ".'),
  praeteritum: line('The same sentence in Präteritum, starting with "Ich ".'),
  perfekt: line('The same sentence in Perfekt, starting with "Ich ".'),
  futur: line('The same sentence in Futur I, starting with "Ich ".'),
});

export async function examplesFor(infinitive: string): Promise<Examples> {
  const cache = read();
  const hit = cache[infinitive];
  if (isCompleteExamples(hit)) return hit;

  const verb = BY_INFINITIVE.get(infinitive);
  if (!verb) throw new Error(`unknown verb: ${infinitive}`);

  const { output } = await generateText({ model, output: Output.object({ schema }), prompt: buildPrompt(verb) });

  const fresh = read(); // re-read, another request may have written meanwhile
  fresh[infinitive] = output;
  mkdirSync('data', { recursive: true });
  writeFileSync(FILE, JSON.stringify(fresh, null, 1) + '\n');
  return output;
}

function buildPrompt(v: Verb): string {
  // A "both" verb takes sein when it is intransitive and directional, which is
  // the reading a learner meets first ("Ich bin nach Berlin gefahren"). Steer
  // the sentence there rather than letting the model pick and get it wrong.
  const takesSein = v.aux === 'sein' || v.aux === 'both';
  const aux = takesSein ? 'bin' : 'habe';

  return [
    `Write ONE short German sentence in the first person singular using "${v.infinitive}" (${v.english}),`,
    `then write that SAME sentence in four tenses.`,
    ``,
    `Keep the same subject "ich" and the same vocabulary in all four. Change the verb,`,
    `and move words ONLY where German word order requires it. Correct word order always`,
    `wins over keeping words in the same position.`,
    ``,
    `Use exactly these forms, they are correct and must not be altered:`,
    `  Präsens:    Ich ${v.praesens[0]} …`,
    `  Präteritum: Ich ${v.praeteritum[0]} …`,
    isModal(v)
      ? `  Perfekt:    Ich ${aux} … ${v.infinitive}   (modal Ersatzinfinitiv, NOT "${v.partizip}")`
      : `  Perfekt:    Ich ${aux} … ${v.partizip}`,
    `  Futur I:    Ich werde … ${v.infinitive}`,
    ``,
    `The participle in the Perfekt and the infinitive in the Futur go at the very END`,
    `of the sentence, after the time and place words. Never immediately after "ich".`,
    v.separable ? SEPARABLE_RULE : '',
    v.reflexive ? `This verb is reflexive: keep the reflexive pronoun in all four.` : '',
    v.aux === 'both'
      ? [
          ``,
          `This verb takes sein only when it is intransitive and describes movement to a`,
          `place. Write exactly that kind of sentence: no direct object, and a destination`,
          `such as "nach Berlin" or "in die Stadt". Then the Perfekt is "Ich bin … ${v.partizip}".`,
        ].join('\n')
      : '',
    ``,
    `Keep it A2 level, 5 to 9 words. Include a preposition if one is natural,`,
    `since prepositions and their cases are what the learner is practising.`,
    `Give the English translation of each tense in the matching English tense.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Separable prefixes are where "keep the sentence identical" fights German
 * word order and loses. Without a worked example the model produces
 * "Ich stehe auf um sieben Uhr", which is wrong and would be taught as right.
 */
const SEPARABLE_RULE = [
  ``,
  `This verb is SEPARABLE. In Präsens and Präteritum the prefix splits off and moves`,
  `to the very end of the sentence. Follow this pattern exactly:`,
  `  Präsens:    Ich stehe um sieben Uhr auf.`,
  `  Präteritum: Ich stand um sieben Uhr auf.`,
  `  Perfekt:    Ich bin um sieben Uhr aufgestanden.`,
  `  Futur I:    Ich werde um sieben Uhr aufstehen.`,
  `Never write "Ich stehe auf um sieben Uhr".`,
].join('\n');
