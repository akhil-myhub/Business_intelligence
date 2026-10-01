import { getInsights, pipeline } from '@/data/mock';

// The only seam between the UI and the data source. Replace the body of `loadInsights`
// with a call to your warehouse / BI API / LLM; the route handler, validation, streaming,
// logging and UI do not change. Keep it abortable (honour `signal`) and bounded by a timeout.
export async function loadInsights(query, { signal } = {}) {
  signal?.throwIfAborted();
  return getInsights(query);
}

export { pipeline };
