import type { User } from '@supabase/supabase-js';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
  }
}

export type Story = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  audio_url: string | null;
  audio_status: 'not_started' | 'queued' | 'in_progress' | 'completed' | 'failed';
  illustrations: Illustration[];
  audios: Audio[];
};

export type Audio = {
  id: number;
  story_id: number;
  audio_url: string;
  voice_name: string | null;
  created_at: string;
}

export type Illustration = {
  id: number;
  story_id: number;
  image_url: string;
  prompt: string;
  created_at: string;
};

declare module '__STATIC_CONTENT_MANIFEST' {
  const manifest: string
  export default manifest
} 