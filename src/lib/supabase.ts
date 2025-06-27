import { createClient } from '@supabase/supabase-js'
import { Context } from 'hono'

// グローバルスコープで一度だけクライアントを初期化しない
// export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
 
// 代わりに、リクエストごとにクライアントを生成するファクトリ関数やミドルウェアを用意する
export const createSupabaseClient = (c: Context) => {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)
} 