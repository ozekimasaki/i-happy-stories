import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-pages';
import api from './routes';

const app = new Hono();

// Global error handler
app.onError((err, c) => {
  console.error('==================== UNHANDLED ERROR ====================');
  console.error(`Error occurred on: ${c.req.method} ${c.req.url}`);
  console.error('Error details:', err);
  if (err instanceof Error && err.stack) {
    console.error('Stack trace:', err.stack);
  }
  console.error('=========================================================');

  return c.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. We are looking into it.',
    },
    500
  );
});

// Mount the API routes at /api
app.route('/api', api);

// For all other requests, attempt to serve static assets.
// If an asset is not found, Hono will return a 404 response.
// Cloudflare Pages will then use the `not_found_handling` in `wrangler.toml`
// to serve `index.html`, enabling SPA routing.
app.use('*', serveStatic());

export default app;