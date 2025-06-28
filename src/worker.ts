import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import manifest from '__STATIC_CONTENT_MANIFEST';
import api from './routes';

const app = new Hono();

// Mount the API routes at /api
app.route('/api', api);

// Serve static assets from the "dist" folder for the frontend
app.get('/*', serveStatic({ root: './', manifest }));

export default app; 