import { PrepositionDrill } from '@/components/PrepositionDrill';

export const metadata = { title: 'Prepositions' };

export default function PrepositionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold">Prepositions</h1>
      <p className="mb-6 text-sm text-slate-500">
        Verbs that come with a fixed preposition. Pick the right one; misses come back at the end.
      </p>
      <PrepositionDrill />
    </main>
  );
}
