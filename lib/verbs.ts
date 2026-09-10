import raw from '../data/verbs.json';
import { auxFor, type Aux } from '../data/auxiliary';

export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface Verb {
  rank: number;
  infinitive: string;
  english: string;
  level: Level;
  aux: Aux;
  reflexive: boolean;
  separable: boolean;
  /** Partizip II, e.g. "gegangen". */
  partizip: string;
  /** ich, du, er/sie/es, wir, ihr, sie/Sie. */
  praesens: string[];
  praeteritum: string[];
}

/**
 * The auxiliary is derived here rather than trusted from the generated file,
 * so correcting data/auxiliary.ts takes effect immediately instead of waiting
 * for a regeneration. Everything else in the record is baked by the generator.
 */
export const VERBS: Verb[] = (raw as Verb[]).map((v) => ({ ...v, aux: auxFor(v.infinitive) }));

export const BY_INFINITIVE = new Map(VERBS.map((v) => [v.infinitive, v]));

export const PRONOUNS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];

/**
 * Modals take the Ersatzinfinitiv: with a dependent infinitive their Perfekt
 * uses the plain infinitive, not the participle. "Ich habe arbeiten müssen",
 * never "gemusst". The participle only appears when the modal stands alone.
 */
export const MODALS = new Set(['können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen']);

export const isModal = (v: Verb) => MODALS.has(v.infinitive);

/** "haben" or "sein", with "both" resolved to its more common reading for display. */
export const perfektAux = (v: Verb) => (v.aux === 'sein' ? 'sein' : 'haben');

/** e.g. "ich bin gegangen" / "ich habe gemacht". */
export function perfekt(v: Verb, person = 0): string {
  const haben = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
  const sein = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
  const aux = perfektAux(v) === 'sein' ? sein : haben;
  return `${aux[person]} ${v.partizip}`;
}

/** e.g. "ich werde gehen". */
export function futur(v: Verb, person = 0): string {
  const werden = ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'];
  return `${werden[person]} ${v.infinitive}`;
}
