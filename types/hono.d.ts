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
  created_at: string;
  is_public: boolean;
  published_at: string | null;
  illustrations: {
    id: number;
    image_url: string;
    prompt: string;
  }[];
};

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