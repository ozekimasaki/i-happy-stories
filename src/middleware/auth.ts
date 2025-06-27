import { Context, Next } from 'hono'
import { createSupabaseClient } from '../lib/supabase'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const supabase = createSupabaseClient(c)

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401)
  }

  c.set('user', data.user)

  await next()
} 