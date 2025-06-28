import { Context, Next } from 'hono';
import { getSupabase } from '../lib/supabase';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  const supabase = getSupabase(c);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('user', user);

  await next();
}; 