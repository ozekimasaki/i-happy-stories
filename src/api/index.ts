import { Hono } from 'hono'
import auth from './auth'

const api = new Hono()

api.route('/auth', auth)

api.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default api 