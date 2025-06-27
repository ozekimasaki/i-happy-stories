import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createSupabaseClient } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'

const auth = new Hono()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

auth.post(
  '/signup',
  zValidator('json', signupSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid input', issues: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const supabase = createSupabaseClient(c)
    const { email, password } = c.req.valid('json')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return c.json({ error: error.message }, 400)
    }

    return c.json({ user: data.user }, 201)
  }
)

auth.post(
  '/login',
  zValidator('json', loginSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid input', issues: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const supabase = createSupabaseClient(c)
    const { email, password } = c.req.valid('json')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return c.json({ error: error.message }, 401) // Unauthorized
    }

    return c.json({ session: data.session, user: data.user })
  }
)

auth.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ user })
})

export default auth 