'use client';

import { useCallback, useState } from 'react';
import type { Verb } from '@/lib/verbs';
import { DRILL_TENSES, tenseHeading, type DrillTense } from '@/lib/tenses';
import type { Mode, Prompts } from '@/lib/drill';
import { VerbCard, type Examples } from './VerbCard';
import { Chat } from './Chat';

interface Exercise {
  cardId: string;
  phase: 'study' | 'test';
  verb: Verb;
  prompts: Prompts;
  stats: { due: number; learned: number; pool: number };
}

interface Feedback {
  results: {
    tense: DrillTense;
    correct: boolean;
    corrected: string;
    errors: { type: string; wrong: string; right: string; explanation: string }[];
  }[];
  note: string;
  correctCount: number;
  passed: boolean;
}

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'drill', label: 'Drill', hint: 'Straight to the three tenses.' },
  { id: 'explain', label: 'Explain then drill', hint: 'A short lesson first.' },
  { id: 'chat', label: 'Free conversation', hint: 'Open German chat with inline corrections.' },
];

const EMPTY_ANSWERS = { praesens: '', perfekt: '', futur: '' };

export function Practice() {
  const [mode, setMode] = useState<Mode>('drill');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [phase, setPhase] = useState<'study' | 'test'>('test');
  const [answers, setAnswers] = useState<Record<DrillTense, string>>(EMPTY_ANSWERS);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [examples, setExamples] = useState<Examples | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const loadExamples = useCallback(async (infinitive: string) => {
    setExamples(undefined);
    try {
      const res = await fetch('/api/examples', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ infinitive }),
      });
      if (res.ok) setExamples((await res.json()) as Examples);
    } catch {
      // Examples are a nicety; the conjugation table is the substance.
    }
  }, []);

  const nextExercise = useCallback(async (forMode: Mode = mode) => {
    setBusy(true);
    setError('');
    setFeedback(null);
    setAnswers(EMPTY_ANSWERS);
    setExamples(undefined);
    try {
      const res = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: forMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      if (data.done) {
        setDone(true);
        setExercise(null);
        return;
      }
      setDone(false);
      setExercise(data as Exercise);
      setPhase(data.phase);
      if (data.phase === 'study') void loadExamples(data.verb.infinitive);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [mode, loadExamples]);

  function selectMode(m: Mode) {
    setMode(m);
    if (m === 'chat') {
      setExercise(null);
      setDone(false);
    } else {
      void nextExercise(m);
    }
  }

  async function submit() {
    if (!exercise) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cardId: exercise.cardId, prompts: exercise.prompts, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setFeedback(data as Feedback);
      // The study side is the answer, so reveal it once the attempt is marked.
      if (!examples) void loadExamples(exercise.verb.infinitive);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const answeredAll = DRILL_TENSES.every((t) => answers[t].trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => selectMode(m.id)}
            title={m.hint}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              mode === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {m.label}
          </button>
        ))}
        {exercise && (
          <p className="ml-auto text-xs text-slate-500">
            {exercise.stats.due} due · {exercise.stats.learned} learned · pool of {exercise.stats.pool}
          </p>
        )}
      </div>

      {error && <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/50">{error}</p>}

      {mode === 'chat' && <Chat />}

      {done && (
        <div className="rounded border border-slate-200 p-6 text-center dark:border-slate-800">
          <p className="font-medium">Nothing due right now.</p>
          <p className="mt-1 text-sm text-slate-500">
            Come back later, or pin more verbs from the Verbs page to widen the pool.
          </p>
        </div>
      )}

      {mode !== 'chat' && !exercise && !done && (
        <div className="rounded border border-slate-200 p-6 text-center dark:border-slate-800">
          <p className="mb-3 text-sm text-slate-500">
            {busy ? 'Picking your next verb…' : 'Ready when you are.'}
          </p>
          <button
            onClick={() => nextExercise()}
            disabled={busy}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Start practising
          </button>
        </div>
      )}

      {exercise && phase === 'study' && !feedback && (
        <div className="space-y-5 rounded border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">New verb · study first</p>
          {exercise.prompts.lesson && (
            <p className="rounded bg-indigo-50 px-3 py-2 text-sm dark:bg-indigo-950/40">{exercise.prompts.lesson}</p>
          )}
          <VerbCard verb={exercise.verb} examples={examples} loadingExamples={!examples} />
          <button
            onClick={() => setPhase('test')}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            Got it, test me
          </button>
        </div>
      )}

      {exercise && phase === 'test' && !feedback && (
        <div className="space-y-4 rounded border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-sm text-slate-500">
            Write each sentence in German using <strong>{exercise.verb.infinitive}</strong>. All three must be right to
            pass the card.
          </p>
          {DRILL_TENSES.map((t) => (
            <div key={t}>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {tenseHeading(t)}
              </label>
              <p className="mb-1 text-sm">{exercise.prompts[t]}</p>
              <input
                value={answers[t]}
                onChange={(e) => setAnswers({ ...answers, [t]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && answeredAll && !busy) void submit();
                }}
                placeholder="auf Deutsch…"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          ))}
          <button
            onClick={submit}
            disabled={busy || !answeredAll}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? 'Marking…' : 'Check all three'}
          </button>
        </div>
      )}

      {exercise && feedback && (
        <div className="space-y-4 rounded border border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-bold">
              {feedback.passed ? 'Passed' : `${feedback.correctCount} of 3 right`}
            </h3>
            <p className="text-sm text-slate-500">{feedback.note}</p>
          </div>

          {feedback.results.map((r) => (
            <div key={r.tense} className="border-l-2 pl-3" style={{ borderColor: r.correct ? '#10b981' : '#f43f5e' }}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {tenseHeading(r.tense)}
              </div>
              <p className="text-sm text-slate-400 line-through decoration-slate-300">
                {answers[r.tense] || '(no answer)'}
              </p>
              <p className="font-medium">{r.corrected}</p>
              {r.errors.map((e, i) => (
                <p key={i} className="mt-1 text-sm">
                  <span className="rounded bg-slate-100 px-1 text-xs font-medium dark:bg-slate-800">{e.type}</span>{' '}
                  <span className="text-rose-600">{e.wrong}</span> → <span className="text-emerald-600">{e.right}</span>{' '}
                  <span className="text-slate-500">{e.explanation}</span>
                </p>
              ))}
            </div>
          ))}

          {!feedback.passed && (
            <div className="rounded bg-slate-50 p-4 dark:bg-slate-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Study this again</p>
              <VerbCard verb={exercise.verb} examples={examples} loadingExamples={!examples} />
            </div>
          )}

          <button
            onClick={() => nextExercise()}
            disabled={busy}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Next verb
          </button>
        </div>
      )}
    </div>
  );
}
