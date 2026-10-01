import { env } from '@/config/env';
import { withRoute } from '@/lib/request';
import { liveFeed } from '@/server/live';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const enc = new TextEncoder();

// GET /api/live — Server-Sent Events: hello · sale · tick · alert, plus heartbeat comments.
// One shared simulator feeds every client; the stream ends cleanly when the client disconnects.
export const GET = withRoute('live', async (request, { log, session }) => {
  const { signal } = request;
  let unsubscribe, heartbeat;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event, data) => {
        try { controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); } catch { cleanup(); }
      };
      const cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe?.();
        unsubscribe = undefined;
        try { controller.close(); } catch { /* already closed */ }
      };
      send('hello', { ...liveFeed.snapshot(), recent: liveFeed.recent() });
      unsubscribe = liveFeed.subscribe(send);
      heartbeat = setInterval(() => { try { controller.enqueue(enc.encode(': ping\n\n')); } catch { cleanup(); } }, env.heartbeatMs);
      signal.addEventListener('abort', cleanup, { once: true });
      log.debug('live_client_connected', { user: session.sub, clients: liveFeed.subscriberCount() });
    },
    cancel() { clearInterval(heartbeat); unsubscribe?.(); }
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no' }
  });
}, { auth: true });
