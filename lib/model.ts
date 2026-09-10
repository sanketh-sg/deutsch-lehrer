import { google } from '@ai-sdk/google';

/**
 * Single place where the provider is chosen. Every route imports `model`,
 * never a provider directly, so switching to Claude is:
 *   pnpm add @ai-sdk/anthropic
 *   import { anthropic } from '@ai-sdk/anthropic';
 *   export const model = anthropic(process.env.MODEL_ID ?? 'claude-sonnet-5');
 *
 * Needs GOOGLE_GENERATIVE_AI_API_KEY in .env.local.
 */
export const model = google(process.env.MODEL_ID ?? 'gemini-3.1-flash-lite');

/**
 * Provider failures carry the request URL, headers and sometimes the API key.
 * Keep the detail in the server log and hand the browser a plain sentence.
 */
export function providerError(err: unknown): string {
  console.error('model request failed', err);
  return 'The tutor could not answer just now. Try again.';
}
