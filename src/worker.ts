import { Hono } from 'hono';
import api from './routes';

const app = new Hono();

// Global error handler for API routes
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

// Mount the API routes at /api. This is the ONLY responsibility of the worker.
app.route('/api', api);

// For any other request (e.g., /login, /static/asset.js), Hono will not find a route.
// It will automatically return a 404 Not Found response.
// Cloudflare Pages will catch this 404 and then apply its static asset handling,
// including the 'single-page-application' fallback, to serve index.html.

export default app;