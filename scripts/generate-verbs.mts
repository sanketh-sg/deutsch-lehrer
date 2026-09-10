/**
 * One-time generator for data/verbs.json. Run with: pnpm run gen:verbs
 *
 * Division of labour, and the whole reason this script exists:
 *   - The MODEL supplies only the verb list, the English gloss and the CEFR
 *     level. Those are judgement calls it is good at.
 *   - german-verbs-dict supplies every conjugated form. A model asked to
 *     conjugate 1000 verbs will get participles wrong somewhere in the tail
 *     and nobody would ever catch it.
 *   - data/auxiliary.ts supplies haben/sein, which the dictionary lacks.
 *
 * Collection runs in two stages, because asking a model for "the verbs ranked
 * 300 to 400 by frequency" does not work; it repeats itself and dries up
 * around 300. Instead:
 *   1. Themed batches. "Common German verbs about cooking" is a question a
 *      model answers well, and themes give natural diversity.
 *   2. Separable-verb harvest. Every prefixed form of an already-collected
 *      base verb that the dictionary knows is a real verb, so we take those
 *      from the dictionary and ask the model only to gloss them.
 *
 * Any verb the dictionary does not know is dropped. Output is committed and
 * meant to be hand-edited; re-running overwrites it.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from '../lib/model';
import { auxFor, type Aux } from '../data/auxiliary';
import { CORE_VERBS } from '../data/coreVerbs';

const TARGET = 1000;

/**
 * Gemini free tier for 3.1 Flash Lite: 10 RPM, 250K TPM, 142 RPD.
 * Spacing requests 7s apart stays inside the per-minute cap. A full run is
 * roughly 45 requests, well under the daily allowance.
 */
const GAP_MS = 7000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const THEMES = [
  'daily routine and habits',
  'movement, travel and transport',
  'speaking, asking and communicating',
  'thinking, knowing and remembering',
  'feelings and emotions',
  'wanting, deciding and planning',
  'work, office and business',
  'school, study and learning',
  'food, cooking and eating',
  'shopping, money and paying',
  'house, cleaning and repairs',
  'body, health and illness',
  'clothing and appearance',
  'weather and nature',
  'technology, computers and phones',
  'reading, writing and media',
  'family, friendship and relationships',
  'law, politics and administration',
  'sport, games and leisure',
  'building, making and producing',
  'giving, taking and owning',
  'time, starting and finishing',
  'helping, caring and serving',
  'conflict, damage and mistakes',
  'change, growth and development',
  'seeing, hearing and the senses',
];

/** Separable prefixes, longest first so "herunter" wins over "her". */
const PREFIXES = [
  'entgegen', 'herunter', 'zusammen', 'gegenüber', 'herauf', 'heraus', 'herein',
  'hinauf', 'hinaus', 'hinein', 'hinunter', 'zurück', 'voran', 'vorbei',
  'weiter', 'wieder', 'durch', 'statt', 'unter', 'über', 'fest', 'fort',
  'heim', 'nach', 'teil', 'vor', 'weg', 'zu', 'ab', 'an', 'auf', 'aus',
  'bei', 'ein', 'her', 'hin', 'los', 'mit', 'um',
].sort((a, b) => b.length - a.length);

const require = createRequire(import.meta.url);
const DICT: Record<string, DictEntry> = require('german-verbs-dict/dist/verbs.json');

type Person = string | string[];
interface DictEntry {
  INF: string;
  PA2?: string[];
  hasPrefix?: boolean;
  'PRÄ'?: { S: Record<string, Person>; P: Record<string, Person> };
  PRT?: { S: Record<string, Person>; P: Record<string, Person> };
}

type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface Verb {
  rank: number;
  infinitive: string;
  english: string;
  level: Level;
  aux: Aux;
  reflexive: boolean;
  separable: boolean;
  partizip: string;
  praesens: string[];
  praeteritum: string[];
}

/** Separable verbs arrive from the dictionary split, e.g. ["stehe","auf"]. */
const flat = (p: Person | undefined) => (Array.isArray(p) ? p.join(' ') : (p ?? ''));

/**
 * ich, du, er, wir, ihr, sie. The dictionary occasionally omits a person
 * (müssen has no 2nd person singular Präteritum), so a missing form is built
 * from the 1st person, which is the regular pattern for both tenses.
 */
function sixForms(t: DictEntry['PRT']): string[] {
  if (!t) return [];
  const forms = ['1', '2', '3'].map((n) => flat(t.S[n])).concat(['1', '2', '3'].map((n) => flat(t.P[n])));
  if (!forms[1] && forms[0]) {
    const [head, ...rest] = forms[0].split(' ');
    forms[1] = [head + (/[sßz]$/.test(head) ? 'est' : 'st'), ...rest].join(' ');
  }
  return forms;
}

const known = (inf: string) => Boolean(DICT[inf]?.PA2?.length);

interface Entry { english: string; level: Level; reflexive: boolean; core: boolean }
const collected = new Map<string, Entry>();
const dropped = new Set<string>();
let seedingCore = true;

/** One retry on a rate-limit bounce. */
async function ask<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 429 && attempt === 0) {
        console.log('  rate limited, waiting 60s');
        await sleep(60_000);
        continue;
      }
      console.log(`  ${label} failed: ${(err as Error).message.slice(0, 120)}`);
      return null;
    }
  }
  return null;
}

const listSchema = z.object({
  verbs: z.array(
    z.object({
      infinitive: z.string().describe('German infinitive, lowercase. Prefix reflexives with "sich ".'),
      english: z.string().describe('Short English gloss, e.g. "to go". Two senses at most.'),
      level: z.enum(['A1', 'A2', 'B1', 'B2']).describe('CEFR level where a learner first meets this verb.'),
    }),
  ),
});

function record(rawInfinitive: string, english: string, level: Level) {
  const raw = rawInfinitive.trim().toLowerCase();
  const infinitive = raw.replace(/^sich\s+/, '');
  if (!infinitive || collected.has(infinitive)) return false;
  if (!known(infinitive)) {
    dropped.add(infinitive);
    return false;
  }
  collected.set(infinitive, {
    english: english.trim(),
    level,
    reflexive: raw.startsWith('sich '),
    core: seedingCore,
  });
  return true;
}

// Stage 0: the hand-written core, seeded first so it always makes the cut and
// takes the lowest ranks. A core verb the dictionary does not know is a loud
// failure, not a silent drop, because these are the ones that matter.
const missingCore: string[] = [];
for (const [infinitive, english, level] of CORE_VERBS) {
  if (!record(infinitive, english, level)) missingCore.push(infinitive);
}
console.log(`core: ${collected.size} of ${CORE_VERBS.length} seeded`);
if (missingCore.length) {
  console.log(`  NOT IN THE DICTIONARY, fix data/coreVerbs.ts: ${missingCore.join(', ')}`);
}
seedingCore = false;

// Stage 1: themed batches.
for (const [i, theme] of THEMES.entries()) {
  if (collected.size >= TARGET) break;
  if (i > 0) await sleep(GAP_MS);

  const out = await ask(
    () =>
      generateText({
        model,
        output: Output.object({ schema: listSchema }),
        prompt: [
          `List 60 common German verbs about: ${theme}.`,
          `Cover A1 through B2 as used in Goethe exam material, from the most basic to the more advanced.`,
          `Include separable verbs where they are common. Infinitives only, lowercase.`,
        ].join('\n'),
      }),
    `theme "${theme}"`,
  );

  let added = 0;
  for (const v of out?.output.verbs ?? []) if (record(v.infinitive, v.english, v.level)) added++;
  console.log(`theme ${i + 1}/${THEMES.length} ${theme}: +${added}, total ${collected.size}`);
}

// Stage 2: harvest separable forms of the base verbs we already have.
const bases = new Set(collected.keys());
const harvest: string[] = [];
for (const inf of Object.keys(DICT)) {
  if (collected.size + harvest.length >= TARGET * 1.5) break;
  if (!DICT[inf].hasPrefix || collected.has(inf) || !known(inf)) continue;
  const prefix = PREFIXES.find((p) => inf.startsWith(p) && bases.has(inf.slice(p.length)));
  if (prefix) harvest.push(inf);
}
harvest.sort((a, b) => a.length - b.length);
console.log(`\nharvested ${harvest.length} separable forms of known base verbs`);

const glossSchema = z.object({
  verbs: z.array(
    z.object({
      infinitive: z.string(),
      english: z.string().describe('Short English gloss, e.g. "to get up".'),
      level: z.enum(['A1', 'A2', 'B1', 'B2']),
    }),
  ),
});

const needed = harvest.slice(0, TARGET - collected.size);
for (let i = 0; i < needed.length && collected.size < TARGET; i += 50) {
  const chunk = needed.slice(i, i + 50);
  if (i > 0) await sleep(GAP_MS);

  const out = await ask(
    () =>
      generateText({
        model,
        output: Output.object({ schema: glossSchema }),
        prompt: [
          `Give a short English gloss and CEFR level for each of these German separable verbs.`,
          `Return one entry per verb, keeping the infinitive exactly as given.`,
          chunk.join('\n'),
        ].join('\n'),
      }),
    `gloss batch ${i / 50 + 1}`,
  );

  let added = 0;
  for (const v of out?.output.verbs ?? []) {
    if (!chunk.includes(v.infinitive.trim().toLowerCase())) continue; // ignore invented entries
    if (record(v.infinitive, v.english, v.level)) added++;
  }
  console.log(`gloss ${i / 50 + 1}: +${added}, total ${collected.size}`);
}

// Rank the hand-written core first, then by level, then by collection order.
// The drill pool draws from the lowest ranks, so this makes the first 150
// cards a learner ever sees deterministic.
const ORDER: Record<Level, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };
const sorted = [...collected.entries()].sort(
  (a, b) => Number(b[1].core) - Number(a[1].core) || ORDER[a[1].level] - ORDER[b[1].level],
);

const verbs: Verb[] = sorted.map(([infinitive, e], i) => {
  const d = DICT[infinitive];
  return {
    rank: i + 1,
    infinitive,
    english: e.english,
    level: e.level,
    aux: auxFor(infinitive),
    reflexive: e.reflexive,
    separable: Boolean(d.hasPrefix),
    partizip: d.PA2![0],
    praesens: sixForms(d['PRÄ']),
    praeteritum: sixForms(d.PRT),
  };
});

/**
 * The dictionary ships pre-1996 orthography: "ich muß", "du ißt", "vergißt",
 * "wußte". Those have been wrong for thirty years and must never reach a
 * learner. Whether ß or ss is correct depends on vowel length, which is not
 * recoverable from the spelling ("aß" keeps ß, "faßt" does not), so no regex
 * gets this right. The model knows the reform cold, so it does the rewrite and
 * we verify mechanically: a correction is accepted only if it differs from the
 * original by ß/ss alone. Anything else is rejected and the original stands.
 */
const withSharpS = [...new Set(verbs.flatMap((v) => [v.partizip, ...v.praesens, ...v.praeteritum]).filter((f) => f.includes('ß')))];

const fixSchema = z.object({
  forms: z.array(z.object({ old: z.string(), fixed: z.string() })),
});

const norm = (s: string) => s.replace(/ß/g, 'ss');
const corrections = new Map<string, string>();

for (let i = 0; i < withSharpS.length; i += 120) {
  const chunk = withSharpS.slice(i, i + 120);
  if (i > 0) await sleep(GAP_MS);

  const out = await ask(
    () =>
      generateText({
        model,
        output: Output.object({ schema: fixSchema }),
        prompt: [
          `These German verb forms are written in pre-1996 orthography.`,
          `Rewrite each in current standard German spelling, applying the ß/ss reform:`,
          `ß stays after a long vowel or diphthong, ss replaces it after a short vowel.`,
          `Change nothing else. Return every form, unchanged if it is already correct.`,
          '',
          chunk.join('\n'),
        ].join('\n'),
      }),
    `orthography batch ${i / 120 + 1}`,
  );

  for (const f of out?.output.forms ?? []) {
    // Only ß/ss may differ. A rewritten stem is a hallucination, so drop it.
    if (norm(f.old) === norm(f.fixed) && f.old !== f.fixed) corrections.set(f.old, f.fixed);
  }
}

const applyFix = (s: string) => corrections.get(s) ?? s;
for (const v of verbs) {
  v.partizip = applyFix(v.partizip);
  v.praesens = v.praesens.map(applyFix);
  v.praeteritum = v.praeteritum.map(applyFix);
}
console.log(`\northography: ${corrections.size} of ${withSharpS.length} ß-forms modernised`);

writeFileSync('data/verbs.json', JSON.stringify(verbs, null, 1) + '\n');
const byLevel = verbs.reduce<Record<string, number>>((a, v) => ({ ...a, [v.level]: (a[v.level] ?? 0) + 1 }), {});
console.log(`\nwrote data/verbs.json: ${verbs.length} verbs`, byLevel);
console.log(`dropped as unknown to the dictionary: ${dropped.size}`);
if (dropped.size) console.log([...dropped].slice(0, 40).join(', '));
