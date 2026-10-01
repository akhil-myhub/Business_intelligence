// Runs in the browser before the app becomes interactive: global safety nets so no failure is silent.
import { logger } from './src/lib/logger';

window.addEventListener('error', event => {
  // Resource load errors (img/script) have no .error; ignore the noisy ResizeObserver benign case.
  if (!event.error || /ResizeObserver loop/.test(event.message)) return;
  logger.error('window_error', { err: event.error, source: event.filename, line: event.lineno });
});

window.addEventListener('unhandledrejection', event => {
  logger.error('unhandled_rejection', { err: event.reason });
});
