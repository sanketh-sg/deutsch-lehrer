'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const OPENERS = [
  'Hallo! Was machst du heute?',
  'Wie war dein Wochenende?',
  'Was hast du gestern gegessen?',
];

/**
 * Free conversation. Corrections come back inline from the model rather than
 * through the grading route, so this mode does not feed the scheduler; it is
 * for fluency, and the drill is what proves a verb is learned.
 */
export function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const [input, setInput] = useState('');
  const busy = status !== 'ready';

  const send = (text: string) => {
    if (!text.trim()) return;
    sendMessage({ text });
    setInput('');
  };

  return (
    <div className="space-y-4 rounded border border-slate-200 p-5 dark:border-slate-800">
      {messages.length === 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            Write in German. Every reply corrects your mistakes in English first, then continues the conversation with a
            question.
          </p>
          <div className="flex flex-wrap gap-2">
            {OPENERS.map((o) => (
              <button
                key={o}
                onClick={() => send(o)}
                className="rounded bg-slate-100 px-2.5 py-1 text-sm dark:bg-slate-800"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === 'user'
                ? 'ml-auto max-w-[80%] rounded bg-indigo-600 px-3 py-2 text-sm text-white'
                : 'max-w-[85%] whitespace-pre-wrap rounded bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800'
            }
          >
            {m.parts.map((part, i) => (part.type === 'text' ? <span key={i}>{part.text}</span> : null))}
          </div>
        ))}
        {busy && <p className="text-sm text-slate-400">…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="Schreib auf Deutsch…"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
