'use client';

import { PRONOUNS, perfekt, futur, perfektAux, isModal, type Level, type Verb } from '@/lib/verbs';
import { VERB_PREPOSITIONS } from '@/data/verbPrepositions';
import { DISPLAY_TENSES, tenseHeading, type Example, type Examples } from '@/lib/tenses';

export type { Example, Examples };

/** Grammar facts stay grey so that colour anywhere in the app means one thing: the level. */
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
    {children}
  </span>
);

/**
 * Levels run cool to warm as they get harder, so the colour alone says how far along a verb is.
 * Written out in full because Tailwind only compiles class names it can see.
 */
export const LEVEL_STYLE: Record<Level, { badge: string; chip: string; row: string }> = {
  A1: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    chip: 'bg-emerald-600 text-white',
    row: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  A2: {
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    chip: 'bg-sky-600 text-white',
    row: 'bg-sky-50 dark:bg-sky-950/40',
  },
  B1: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    chip: 'bg-amber-600 text-white',
    row: 'bg-amber-50 dark:bg-amber-950/40',
  },
  B2: {
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    chip: 'bg-rose-600 text-white',
    row: 'bg-rose-50 dark:bg-rose-950/40',
  },
};

/** Prepositions that come with the verb rather than being chosen by meaning. */
const prepositionsFor = (v: Verb) =>
  VERB_PREPOSITIONS.filter((p) => p.verb === v.infinitive || p.verb === `sich ${v.infinitive}`);

function Conjugation({ label, forms }: { label: string; forms: string[] }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        {forms.map((f, i) => (
          <div key={i} className="contents">
            <dt className="text-slate-400">{PRONOUNS[i]}</dt>
            <dd className="font-medium">{f}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Sentence({ label, ex, loading }: { label: string; ex?: Example; loading: boolean }) {
  return (
    <div className="border-l-2 border-slate-200 pl-3 dark:border-slate-700">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      {ex ? (
        <>
          <p className="font-medium">{ex.de}</p>
          <p className="text-sm text-slate-500">{ex.en}</p>
        </>
      ) : (
        <p className="text-sm italic text-slate-400">{loading ? 'writing an example…' : 'no example yet'}</p>
      )}
    </div>
  );
}

/**
 * The study side of a card, and the detail panel in the verb browser. One
 * component in both places so the thing you revise is the thing you were
 * taught.
 */
export function VerbCard({
  verb,
  examples,
  loadingExamples = false,
}: {
  verb: Verb;
  examples?: Examples;
  loadingExamples?: boolean;
}) {
  const aux = perfektAux(verb);

  return (
    <article className="space-y-5">
      <header>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-2xl font-bold">{verb.reflexive ? `sich ${verb.infinitive}` : verb.infinitive}</h2>
          <p className="text-slate-500">{verb.english}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${LEVEL_STYLE[verb.level].badge}`}>
            {verb.level}
          </span>
          <Badge>Perfekt mit {verb.aux === 'both' ? 'haben oder sein' : aux}</Badge>
          {verb.separable && <Badge>trennbar</Badge>}
          {verb.reflexive && <Badge>reflexiv</Badge>}
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2">
        <Conjugation label="Präsens · present" forms={verb.praesens} />
        <Conjugation label="Präteritum · past (written)" forms={verb.praeteritum} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Perfekt · past (spoken)
          </h4>
          <p className="text-sm">
            <span className="font-medium">
              {verb.aux === 'both' ? `bin / habe ${verb.partizip}` : perfekt(verb)}
            </span>{' '}
            <span className="text-slate-400">· Partizip II {verb.partizip}</span>
          </p>
          {verb.aux === 'both' && (
            <p className="mt-1 text-xs text-slate-500">
              <strong>sein</strong> when it means going somewhere, with no object:{' '}
              <em>ich bin nach Berlin {verb.partizip}</em>. <strong>haben</strong> when it takes an object:{' '}
              <em>ich habe das Auto {verb.partizip}</em>.
            </p>
          )}
          {isModal(verb) && (
            <p className="mt-1 text-xs text-slate-500">
              With a second verb the Perfekt uses the infinitive, not the participle:{' '}
              <strong>hat arbeiten {verb.infinitive}</strong>, never <em>hat arbeiten {verb.partizip}</em>.{' '}
              {verb.partizip} is only for the modal on its own.
            </p>
          )}
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Futur I · future</h4>
          <p className="text-sm font-medium">{futur(verb)}</p>
          <p className="mt-1 text-xs text-slate-500">werden + Infinitiv, with the infinitive at the end.</p>
        </div>
      </section>

      {prepositionsFor(verb).length > 0 && (
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Fixed preposition</h3>
          <ul className="space-y-1 text-sm">
            {prepositionsFor(verb).map((p) => (
              <li key={`${p.verb}-${p.prep}`}>
                <span className="font-medium">
                  {p.verb} {p.prep}
                </span>{' '}
                <span className="text-slate-400">+ {p.case}</span>{' '}
                <span className="text-slate-500">· {p.english}</span>
                <p className="text-slate-500">{p.example.de}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">In use</h3>
          <p className="text-xs text-slate-400">One sentence in the ich form. Only the verb changes.</p>
        </div>
        {DISPLAY_TENSES.map((t) => (
          <Sentence key={t} label={tenseHeading(t)} ex={examples?.[t]} loading={loadingExamples} />
        ))}
      </section>
    </article>
  );
}
