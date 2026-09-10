import { VerbBrowser } from '@/components/VerbBrowser';

export const metadata = { title: 'Verbs' };

export default function VerbsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold">Verbs</h1>
      <p className="mb-6 text-sm text-slate-500">
        Every verb with its meaning and its use in past, present and future. Conjugations are exact; example sentences
        are written once and then cached.
      </p>
      <VerbBrowser />
    </main>
  );
}
