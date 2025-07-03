import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import type {
  MessageBatch,
  ExecutionContext,
} from '@cloudflare/workers-types';
import api from './routes';
import manifest from '__STATIC_CONTENT_MANIFEST';
import { processAudioGenerationTask } from './services/storyService';
import type { Env, AudioGenerationMessage } from '../types/worker';

const app = new Hono<{ Bindings: Env }>();

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

// The worker entrypoint
export default {
  // The fetch handler is for HTTP requests.
  fetch: app.fetch,

  // The queue handler is for messages from the queue.
  async queue(
    batch: MessageBatch<AudioGenerationMessage>,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    console.log(
      `[QueueConsumer] Received a batch of ${batch.messages.length} messages from queue ${batch.queue}.`
    );

    const promises = batch.messages.map(async (message) => {
      try {
        console.log(`[QueueConsumer] Processing message ${message.id}...`);
        await processAudioGenerationTask(env, message.body);
        message.ack();
        console.log(
          `[QueueConsumer] Successfully processed and acknowledged message ${message.id}.`
        );
      } catch (err) {
        console.error(
          `[QueueConsumer] Error processing message ${message.id}:`,
          err
        );
        // If an error occurs, retry the message.
        message.retry();
      }
    });

    // Wait for all messages in the batch to be processed.
    await Promise.all(promises);
  },
};