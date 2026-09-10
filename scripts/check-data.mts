/**
 * Validates data/verbs.json. Run with: pnpm run check:data
 *
 * Errors fail the run. Warnings are printed for a human to judge, because the
 * two soft fields, the English gloss and the auxiliary, are the ones a
 * generator or a hand-edit can plausibly get wrong.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { SEIN, BOTH, auxFor } from '../data/auxiliary';

const require = createRequire(import.meta.url);
const DICT: Record<string, { PA2?: string[] }> = require('german-verbs-dict/dist/verbs.json');

interface Verb {
  rank: number;
  infinitive: string;
  english: string;
  level: string;
  aux: string;
  reflexive: boolean;
  separable: boolean;
  partizip: string;
  praesens: string[];
  praeteritum: string[];
}

const errors: string[] = [];
const warnings: string[] = [];

let verbs: Verb[];
try {
  // Match the app, which derives the auxiliary from data/auxiliary.ts at load
  // rather than trusting the value baked into the generated file.
  verbs = (JSON.parse(readFileSync('data/verbs.json', 'utf8')) as Verb[]).map((v) => ({
    ...v,
    aux: auxFor(v.infinitive),
  }));
} catch {
  console.error('data/verbs.json is missing or unparseable. Run: pnpm run gen:verbs');
  process.exit(1);
}

if (!Array.isArray(verbs) || verbs.length === 0) {
  console.error('data/verbs.json is not a non-empty array');
  process.exit(1);
}

const LEVELS = new Set(['A1', 'A2', 'B1', 'B2']);
const seen = new Set<string>();

for (const v of verbs) {
  const at = `${v.infinitive} (rank ${v.rank})`;

  if (seen.has(v.infinitive)) errors.push(`duplicate: ${at}`);
  seen.add(v.infinitive);

  if (!v.english?.trim()) errors.push(`missing gloss: ${at}`);
  if (!LEVELS.has(v.level)) errors.push(`bad level "${v.level}": ${at}`);
  if (!['haben', 'sein', 'both'].includes(v.aux)) errors.push(`bad aux "${v.aux}": ${at}`);
  if (!v.partizip?.trim()) errors.push(`missing Partizip II: ${at}`);

  for (const [name, forms] of [['praesens', v.praesens], ['praeteritum', v.praeteritum]] as const) {
    if (forms?.length !== 6) errors.push(`${name} needs 6 forms, has ${forms?.length}: ${at}`);
    else if (forms.some((f) => !f.trim())) errors.push(`${name} has a blank form: ${at}`);
  }

  // The forms must still match the dictionary, which catches a bad hand-edit.
  const d = DICT[v.infinitive];
  if (!d) errors.push(`not in the dictionary: ${at}`);
  else if (d.PA2?.length && !d.PA2.includes(v.partizip)) {
    errors.push(`Partizip "${v.partizip}" is not one of ${d.PA2.join('/')}: ${at}`);
  }
}

const ranks = verbs.map((v) => v.rank).sort((a, b) => a - b);
if (ranks[0] !== 1 || ranks[ranks.length - 1] !== verbs.length) {
  errors.push(`ranks should run 1..${verbs.length}, got ${ranks[0]}..${ranks[ranks.length - 1]}`);
}

/**
 * Heuristic audit of the hand-written auxiliary list. A verb whose gloss reads
 * like motion or change of state but which fell through to haben is probably
 * an omission from data/auxiliary.ts.
 */
const MOTION =
  /\bto (go|come|run|walk|travel|drive|fly|arrive|depart|leave|fall|climb|rise|sink|swim|ride|move|die|grow|become|happen|occur|wake|escape|flee|jump|land|enter|return|disappear|appear|emerge|set off|get up|wake up|fall asleep)\b/i;

for (const v of verbs) {
  if (v.aux === 'haben' && MOTION.test(v.english)) {
    warnings.push(`aux=haben but the gloss looks like motion: ${v.infinitive} — "${v.english}"`);
  }
}

const present = new Set(verbs.map((v) => v.infinitive));
const unusedSein = [...SEIN, ...BOTH].filter((v) => !present.has(v));

console.log(`verbs: ${verbs.length}`);
const byLevel = verbs.reduce<Record<string, number>>((a, v) => ({ ...a, [v.level]: (a[v.level] ?? 0) + 1 }), {});
console.log('by level:', byLevel);
const byAux = verbs.reduce<Record<string, number>>((a, v) => ({ ...a, [v.aux]: (a[v.aux] ?? 0) + 1 }), {});
console.log('by auxiliary:', byAux);
console.log(`separable: ${verbs.filter((v) => v.separable).length}`);
console.log(`reflexive: ${verbs.filter((v) => v.reflexive).length}`);

if (unusedSein.length) {
  console.log(`\n${unusedSein.length} entries in auxiliary.ts are not among the verbs (harmless, just unused):`);
  console.log('  ' + unusedSein.join(', '));
}

if (warnings.length) {
  console.log(`\n${warnings.length} warnings:`);
  for (const w of warnings) console.log('  ' + w);
}

if (errors.length) {
  console.error(`\n${errors.length} ERRORS:`);
  for (const e of errors.slice(0, 50)) console.error('  ' + e);
  process.exit(1);
}

console.log('\nno errors');
