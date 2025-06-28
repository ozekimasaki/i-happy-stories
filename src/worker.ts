import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import manifest from '__STATIC_CONTENT_MANIFEST'

const app = new Hono()

// API routes
app.get('/api/hello', (c) => {
  return c.text('Hello from Hono!')
})

// Serve static assets from the "dist" folder
app.get('/*', serveStatic({ root: './', manifest }))

export default app 