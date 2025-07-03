import type { Queue } from '@cloudflare/workers-types';

export interface AudioGenerationMessage {
  storyId: number;
  voice: string;
}

export interface Env {
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AUDIO_QUEUE: Queue<AudioGenerationMessage>;
}
