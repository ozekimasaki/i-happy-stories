import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import api from './routes';
import manifest from '__STATIC_CONTENT_MANIFEST';

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

// Serve static assets from the 'dist' directory and handle SPA fallback
app.use('*', serveStatic({ manifest }));
app.get('*', serveStatic({ path: './index.html', manifest }));

export default app;