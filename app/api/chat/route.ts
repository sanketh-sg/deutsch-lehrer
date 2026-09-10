import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { model } from '@/lib/model';
import { VERBS } from '@/lib/verbs';
import { ACCUSATIVE, DATIVE, TWO_WAY } from '@/data/prepositions';

export const maxDuration = 30;

/** The pool the learner is actually drilling, so conversation stays in range. */
const VOCAB = VERBS.slice(0, 150)
  .map((v) => v.infinitive)
  .join(', ');

const INSTRUCTIONS = [
  `You are a patient German tutor talking to an A2 to B1 learner.`,
  ``,
  `Reply in two parts, every turn:`,
  `1. A correction block. If the learner's German had mistakes, show the corrected sentence`,
  `   and name each mistake in English in one short line. If it was correct, say so in three words.`,
  `2. Your reply in simple German, 1 to 2 short sentences, ending with a question so the`,
  `   conversation keeps going.`,
  ``,
  `Keep your German inside these verbs where you can: ${VOCAB}.`,
  ``,
  `Prepositions matter here, so use them and correct them carefully.`,
  `Accusative only: ${ACCUSATIVE.map((p) => p.prep).join(', ')}.`,
  `Dative only: ${DATIVE.map((p) => p.prep).join(', ')}.`,
  `Two-way, accusative for direction and dative for position: ${TWO_WAY.map((p) => p.prep).join(', ')}.`,
  ``,
  `Never switch to English for your own reply, only for the corrections.`,
].join('\n');

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model,
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
