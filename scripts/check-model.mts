/**
 * Diagnostic: confirms the API key works and the configured model answers.
 *   pnpm run check:model
 */
import { generateText } from 'ai';
import { model } from '../lib/model';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set. Put it in .env.local');
  process.exit(1);
}

const { text } = await generateText({
  model,
  prompt: 'Reply with exactly: the Partizip II of "gehen" and its auxiliary verb.',
});

console.log(`model: ${model.modelId}`);
console.log(`reply: ${text.trim()}`);
