# Deutsch Lehrer

A local German tutor. Browse 1,000 verbs with their meaning and their use in past, present and future, then drill them with spaced repetition until all three tenses stick.

## Setup

```bash
pnpm install
cp .env.local.example .env.local   # then paste a key from https://aistudio.google.com/apikey
pnpm run check:model               # confirms the key and model work
pnpm dev                           # http://localhost:3000
```

## The two halves

**Verbs** (`/verbs`) lists all 1,000, searchable in German or English and filterable by level. Opening one shows its full Präsens and Präteritum tables, its Partizip II with the right auxiliary, its Futur I, any preposition fixed to it, and three example sentences.

**Practice** (`/`) schedules what you are weakest at. A verb card has two phases:

- **Study** shows the verb and all three tenses. You get it on a new verb and on any verb you just failed.
- **Test** asks for the same verb in all three tenses. You pass only if all three are right; anything less lapses the card and brings the study side back.

Three modes: straight drill, explain-then-drill, and free conversation with inline corrections.

## Where the German comes from

This matters, because a model asked to conjugate 1,000 verbs will get participles wrong somewhere in the tail and nobody would catch it.

| Part | Source |
| --- | --- |
| Every conjugated form | `german-verbs-dict`, a build-time dependency |
| haben vs sein | `data/auxiliary.ts`, hand-written |
| The core 201 verbs | `data/coreVerbs.ts`, hand-written |
| Prepositions and their cases | `data/prepositions.ts`, `data/verbPrepositions.ts`, hand-written |
| Verb list, glosses, levels | Generated once, validated against the dictionary |
| Example sentences, exercises, marking | The model, with the correct forms supplied to it |

Two dictionary defects are corrected during generation. It ships pre-1996 orthography (`ich muß`, `du ißt`), and it omits the occasional person form. The orthography rewrite is done by the model and then verified mechanically: a correction is accepted only if it differs by ß/ss alone, so no stem can be silently altered.

## Scripts

```bash
pnpm run check:model   # is the API key working
pnpm run gen:verbs     # regenerate data/verbs.json (~30 API requests)
pnpm run check:data    # validate the verb data, prints warnings worth reading
pnpm test              # spaced repetition tests
```

`pnpm run check:data` is worth running after any hand-edit. It flags duplicates, blank forms, participles that disagree with the dictionary, and verbs whose English gloss looks like motion but which were left on `haben`.

## Swapping the model

All provider choice lives in `lib/model.ts`. To move to Claude:

```bash
pnpm add @ai-sdk/anthropic
```

```ts
import { anthropic } from '@ai-sdk/anthropic';
export const model = anthropic(process.env.MODEL_ID ?? 'claude-sonnet-5');
```

Nothing else imports a provider. `MODEL_ID` in `.env.local` overrides the default without touching code.

## Notes

The Gemini free tier allows about 142 requests a day. A new verb costs three, a review costs two. Example sentences are generated once per verb and cached in `data/examples.json`, so browsing is free after the first visit.

`data/progress.json` holds your learner state and is gitignored. Delete it to start over.
