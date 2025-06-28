import type { User } from '@supabase/supabase-js';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
  }
}

declare module '__STATIC_CONTENT_MANIFEST' {
  const manifest: string
  export default manifest
} 