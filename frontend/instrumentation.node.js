// Node.js-only startup hooks. Kept out of instrumentation.js so the Edge bundle never sees Node APIs.
import { logger } from './src/lib/logger';
import { env } from './src/config/env';

logger.info('server_start', { version: env.version, node: process.version, env: env.nodeEnv, logLevel: env.logLevel });

// Last-resort safety nets: log with full context instead of dying silently. After an uncaught
// exception process state is undefined, so we log, flush and let the orchestrator restart us.
process.on('unhandledRejection', reason => logger.error('unhandled_rejection', { err: reason }));
process.on('uncaughtException', err => {
  logger.error('uncaught_exception', { err });
  setTimeout(() => process.exit(1), 100).unref();
});
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => logger.info('shutdown_signal', { signal }));
}
