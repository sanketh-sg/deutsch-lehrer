import { Redis } from '@upstash/redis';

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (or the KV_REST_API_*
// pair the Vercel Marketplace sets) from the environment.
export const redis = Redis.fromEnv();
