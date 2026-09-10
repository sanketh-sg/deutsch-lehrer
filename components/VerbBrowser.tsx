'use client';

import { useMemo, useState } from 'react';
import { VERBS, type Level, type Verb } from '@/lib/verbs';
import { LEVEL_STYLE, VerbCard, type Examples } from './VerbCard';

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];

export function VerbBrowser() {
  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [selected, setSelected] = useState<Verb>(VERBS[0]);
  const [examples, setExamples] = useState<Record<string, Examples>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VERBS.filter(
      (v) =>
        (levels.size === 0 || levels.has(v.level)) &&
        (q === '' || v.infinitive.includes(q) || v.english.toLowerCase().includes(q)),
    );
  }, [query, levels]);

  async function open(verb: Verb) {
    setSelected(verb);
    setError('');
    if (examples[verb.infinitive]) return;

    setLoading(true);
    try {
      const res = await fetch('/api/examples', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ infinitive: verb.infinitive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
      setExamples((prev) => ({ ...prev, [verb.infinitive]: data as Examples }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const toggleLevel = (l: Level) =>
    setLevels((prev) => {
      const next = new Set(prev);
      if (!next.delete(l)) next.add(l);
      return next;
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search German or English…"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="flex gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => toggleLevel(l)}
              aria-pressed={levels.has(l)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                levels.has(l)
                  ? LEVEL_STYLE[l].chip
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {results.length} of {VERBS.length} verbs
        </p>

        <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {results.map((v) => (
            <li key={v.infinitive}>
              <button
                onClick={() => open(v)}
                className={`flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  selected.infinitive === v.infinitive ? LEVEL_STYLE[v.level].row : ''
                }`}
              >
                <span className="font-medium">{v.infinitive}</span>
                <span className="flex-1 truncate text-xs text-slate-500">{v.english}</span>
                <span className={`rounded px-1 py-0.5 text-[10px] font-medium ${LEVEL_STYLE[v.level].badge}`}>
                  {v.level}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded border border-slate-200 p-5 dark:border-slate-800">
        {error && <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <VerbCard verb={selected} examples={examples[selected.infinitive]} loadingExamples={loading} />
      </div>
    </div>
  );
}
