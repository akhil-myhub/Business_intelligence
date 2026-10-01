// Input validation for the HTTP boundary. Returns values, never throws.

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function validateQuery(raw, maxLength) {
  if (typeof raw !== 'string') return { ok: false, code: 'QUERY_REQUIRED', message: 'Query parameter "q" is required.' };
  const value = raw.replace(CONTROL, '').replace(/\s+/g, ' ').trim();
  if (!value) return { ok: false, code: 'QUERY_EMPTY', message: 'Query must not be empty.' };
  if (value.length > maxLength) return { ok: false, code: 'QUERY_TOO_LONG', message: `Query must be at most ${maxLength} characters.` };
  return { ok: true, value };
}

const LEVELS = new Set(['warn', 'error']);

// Client log batches: only warn/error are accepted, everything is size-capped.
export function validateLogBatch(body) {
  if (!body || typeof body !== 'object' || !Array.isArray(body.entries)) return { ok: false, message: 'entries[] is required.' };
  const entries = body.entries.slice(0, 20).flatMap(e => {
    if (!e || typeof e !== 'object' || !LEVELS.has(e.level) || typeof e.message !== 'string') return [];
    return [{
      level: e.level,
      message: e.message.replace(CONTROL, '').slice(0, 500),
      context: e.context && typeof e.context === 'object' ? e.context : undefined,
      clientTs: typeof e.ts === 'string' ? e.ts.slice(0, 40) : undefined,
      page: typeof e.url === 'string' ? e.url.slice(0, 200) : undefined
    }];
  });
  return entries.length ? { ok: true, entries } : { ok: false, message: 'No valid entries.' };
}
