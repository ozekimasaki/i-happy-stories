import { Hono } from 'hono';
import { getSupabase } from '../../lib/supabase';

const auth = new Hono<{ Bindings: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string; } }>();

// サインアップエンドポイント
auth.post('/signup', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'メールアドレスとパスワードは必須です' }, 400);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      return c.json({ error: 'このメールアドレスは既に登録されています' }, 409);
    }
    return c.json({ error: error.message }, 500);
  }

  if (data.session) {
    return c.json({ user: data.user, session: data.session });
  } else {
    return c.json({ message: '確認メールを送信しました。メールをご確認ください。', user: data.user });
  }
});

// ログインエンドポイント
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'メールアドレスとパスワードは必須です' }, 400);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ user: data.user, session: data.session });
});

// ここに /login などのルートが追加されます

export default auth; 