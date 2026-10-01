// Server instrumentation: runs once per server instance, and reports every unhandled server error.

export async function register() {
  // Guarded dynamic import so Node-only code is excluded from the Edge bundle.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}

export async function onRequestError(err, request, context) {
  const { logger } = await import('./src/lib/logger');
  logger.error('request_error', {
    err,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    requestId: request.headers?.['x-request-id']
  });
}
