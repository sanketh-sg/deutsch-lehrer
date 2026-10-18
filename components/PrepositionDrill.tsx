'use client';

import { useState } from 'react';
import { VERB_PREPOSITIONS, type VerbPreposition } from '@/data/verbPrepositions';

const PREPS = [...new Set(VERB_PREPOSITIONS.map((p) => p.prep))];
const WORD = 'A-Za-zÄÖÜäöüß';

// ponytail: sort-based shuffle is slightly biased, fine for a 46-card study deck.
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/** The right preposition plus three wrong ones, none of which is another valid pair for the same verb. */
const optionsFor = (p: VerbPreposition) => {
  const wrong = PREPS.filter((x) => !VERB_PREPOSITIONS.some((q) => q.verb === p.verb && q.prep === x));
  return shuffle([p.prep, ...shuffle(wrong).slice(0, 3)]);
};

const gapped = (p: VerbPreposition) =>
  p.example.de.replace(new RegExp(`(?<![${WORD}])${p.prep}(?![${WORD}])`, 'i'), '_____');

const start = () => {
  const deck = shuffle(VERB_PREPOSITIONS);
  return { deck, options: optionsFor(deck[0]) };
};

/**
 * Multiple-choice drill on the verb + preposition pairs. All data is local, so it
 * costs no AI calls, and like Chat it does not feed the scheduler.
 */
export function PrepositionDrill() {
  const [{ deck, options }, setRound] = useState(start);
  const [picked, setPicked] = useState<string | null>(null);
  const current = deck[0];

  function next() {
    const rest = deck.slice(1);
    // A miss goes to the back of the deck so it comes round again.
    const nextDeck = picked === current.prep ? rest : [...rest, current];
    setRound({ deck: nextDeck, options: nextDeck[0] ? optionsFor(nextDeck[0]) : [] });
    setPicked(null);
  }

  if (!current) {
    return (
      <div className="rounded border border-slate-200 p-6 text-center dark:border-slate-800">
        <p className="font-medium">All {VERB_PREPOSITIONS.length} pairs done.</p>
        <button
          onClick={() => setRound(start())}
          className="mt-3 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Go again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded border border-slate-200 p-5 dark:border-slate-800">
      <p className="text-xs text-slate-500">
        {VERB_PREPOSITIONS.length - deck.length} / {VERB_PREPOSITIONS.length} done
      </p>

      <div>
        <p className="text-xl font-bold">{current.verb}</p>
        <p className="text-slate-500">{current.english}</p>
      </div>
      <p className="text-lg">{gapped(current)}</p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const state =
            picked === null
              ? 'border-slate-300 dark:border-slate-700'
              : o === current.prep
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                : o === picked
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'border-slate-200 opacity-50 dark:border-slate-800';
          return (
            <button
              key={o}
              onClick={() => setPicked(o)}
              disabled={picked !== null}
              className={`rounded border px-3 py-3 text-base font-medium ${state}`}
            >
              {o}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="space-y-3">
          <div className="border-l-2 border-slate-200 pl-3 dark:border-slate-700">
            <p className="font-medium">{current.example.de}</p>
            <p className="text-sm text-slate-500">{current.example.en}</p>
            <p className="mt-1 text-sm">
              {current.verb} <strong>{current.prep}</strong> + {current.case}
            </p>
          </div>
          <button onClick={next} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
