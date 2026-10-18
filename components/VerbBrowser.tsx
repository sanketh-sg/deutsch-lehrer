'use client';

import { useMemo, useRef, useState } from 'react';
import { VERBS, type Level, type Verb } from '@/lib/verbs';
import { LEVEL_STYLE, VerbCard, type Examples } from './VerbCard';

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];

// On phones the list and details are side-by-side snap panes; this slides one into view.
const slideTo = (pane: HTMLElement | null) =>
  pane?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });

export function VerbBrowser() {
  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [selected, setSelected] = useState<Verb>(VERBS[0]);
  const [examples, setExamples] = useState<Record<string, Examples>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listPane = useRef<HTMLDivElement>(null);
  const detailPane = useRef<HTMLDivElement>(null);

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
    slideTo(detailPane.current);
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

  // Swipe in the details pane: left = next verb, right = previous (or back to the list from the first).
  const touchStart = useRef<[number, number]>([0, 0]);
  const index = results.findIndex((v) => v.infinitive === selected.infinitive);

  function swipe(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStart.current[0];
    const dy = e.changedTouches[0].clientY - touchStart.current[1];
    if (Math.abs(dx) < 60 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
    if (dx < 0) {
      if (results[index + 1]) open(results[index + 1]);
    } else if (index > 0) open(results[index - 1]);
    else slideTo(listPane.current);
  }

  const toggleLevel = (l: Level) =>
    setLevels((prev) => {
      const next = new Set(prev);
      if (!next.delete(l)) next.add(l);
      return next;
    });

  return (
    <div className="flex snap-x snap-mandatory overflow-x-hidden max-lg:h-[80dvh] max-lg:touch-pan-y lg:grid lg:grid-cols-[20rem_1fr] lg:gap-6 lg:overflow-visible">
      <div ref={listPane} className="flex min-h-0 flex-col space-y-3 max-lg:w-full max-lg:shrink-0 max-lg:snap-start max-lg:px-6 lg:block">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search German or English…"
          className="w-full rounded border border-slate-300 px-3 py-2 text-base sm:text-sm dark:border-slate-700 dark:bg-slate-900"
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

        <ul className="min-h-0 flex-1 divide-y lg:max-h-[70vh] lg:flex-none divide-slate-100 overflow-y-auto rounded border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
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

      <div
        ref={detailPane}
        onTouchStart={(e) => (touchStart.current = [e.touches[0].clientX, e.touches[0].clientY])}
        onTouchEnd={swipe}
        className="rounded border border-slate-200 p-5 max-lg:touch-pan-y max-lg:w-full max-lg:shrink-0 max-lg:snap-start max-lg:overflow-x-hidden max-lg:overflow-y-auto dark:border-slate-800"
      >
        <div className="mb-3 flex items-center justify-between text-sm text-slate-500 lg:hidden">
          <span>{index >= 0 && `${index + 1} / ${results.length}`}</span>
          <button onClick={() => slideTo(listPane.current)}>← Back</button>
        </div>
        {error && <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <VerbCard verb={selected} examples={examples[selected.infinitive]} loadingExamples={loading} />
      </div>
    </div>
  );
}
