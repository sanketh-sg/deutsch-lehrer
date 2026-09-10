import { Practice } from '@/components/Practice';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold">Practice</h1>
      <p className="mb-6 text-sm text-slate-500">
        Each verb is tested in present, past and future. Get all three right and it moves further away; miss one and it
        comes back with the study card.
      </p>
      <Practice />
    </main>
  );
}
