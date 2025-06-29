import { createClient } from '@supabase/supabase-js';
import type { Context } from 'hono';

// Supabaseクライアントを初期化する関数
// Honoのコンテキストを引数に取り、環境変数を読み込む
export const getSupabase = (c: Context) => {
  const supabaseUrl = c.env.SUPABASE_URL;
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set.');
  }
  
  // AuthorizationヘッダーからJWTを取得
  const authHeader = c.req.header('Authorization');

  // ヘッダーがある場合は認証済みクライアントを、ない場合は匿名クライアントを返す
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
    },
  });

  return supabase;
}; 