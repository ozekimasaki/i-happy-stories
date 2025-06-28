import { Hono } from 'hono';
import { getSupabase } from '../../lib/supabase';

const auth = new Hono();

// サインアップエンドポイント
auth.post('/signup', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      return c.json({ error: 'User already exists' }, 409);
    }
    return c.json({ error: error.message }, 500);
  }

  if (data.session) {
    return c.json({ user: data.user, session: data.session });
  } else {
    return c.json({ message: 'Confirmation email sent. Please verify your email.', user: data.user });
  }
});

// ログインエンドポイント
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ user: data.user, session: data.session });
});

// ここに /login などのルートが追加されます

export default auth; 