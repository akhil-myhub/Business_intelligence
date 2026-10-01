# Lumen AI — Business Intelligence frontend

Next.js 16 (App Router) + React 19 + three.js. The Next server acts as a thin BFF: the browser only talks to
`/api/*` on its own origin, and `src/server/insights.js` is the single seam to your real data source.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run lint` | ESLint (Next + React + React Compiler rules) — must be 0 problems |
| `npm test` | Unit tests (validation, rate limit, logging/redaction, HTTP retry/timeout, stream client, route wrapper) |
| `npm run verify` | lint + test + production build (the CI gate) |
| `docker build -t lumen-bi .` | Standalone, non-root image with a health check |

Use `NEXT_DIST_DIR=.next-verify npm run build` to verify a build without disturbing a running dev server.

## Layout

```
app/                    routes only: pages, error/global-error/not-found, api/*
  api/query             GET  SSE stream of the AI pipeline (validated, rate limited, abort-aware, heartbeat)
  api/logs              POST browser warn/error ingestion (size capped, validated, rate limited)
  api/health            GET  liveness; ?deep=1 readiness (exercises the data layer)
proxy.js                request-id on every request (replaces deprecated "middleware")
instrumentation*.js     server start log, unhandled rejection/exception, onRequestError; client window errors
src/config              env.js (server, validated+clamped) · client.js (timeouts/cadences)
src/lib                 logger · http (timeouts, retry) · request (route wrapper) · rateLimit · validation · webgl
src/server              insights.js — the only place that talks to the data source
src/services            queryClient.js — streaming client: idle + total timeout, graceful fallback
src/hooks               useLive (visibility-aware feed) · useGeo (timeout + retry + cache)
src/components          ui kit · ErrorBoundary (catchError)
src/screens             the 10 screens
src/three               SceneShell (WebGL detect, context loss, boundary, loading/error) + scenes
public/geo              simplified India state / Tamil Nadu district boundaries
```

## Reliability guarantees

* **Nothing waits forever.** Every request has a timeout; the query stream has a 6 s connect, 8 s idle and 25 s total
  limit; the server sends heartbeats so proxies do not cut quiet streams. On failure the UI degrades to local data and
  says so — the "processing" state is always released (`finally`).
* **Cancellation is real.** Navigating away aborts the request; a client disconnect stops server work (`client_aborted`).
* **Failures are contained.** Per-screen error boundaries, 3D scene boundaries, WebGL feature detection and context-loss
  recovery, geo-load retry UI, `global-error` for root failures.
* **Abuse protection.** Input validation + length caps, per-IP rate limiting with `Retry-After`, bounded memory.
* **Background-friendly.** The live feed pauses while the tab is hidden.

## Logging

One JSON object per line on stdout/stderr (`ts, level, msg, service, env, version, requestId, route, ctx`).
Browser `warn`/`error` are batched to `/api/logs` and re-emitted server-side with `source:"browser"`, so both sides are
searchable by `requestId`. Keys matching password/token/secret/authorization/cookie/api-key/email/session are redacted;
query text is never logged (length only). Control verbosity with `LOG_LEVEL` / `NEXT_PUBLIC_LOG_LEVEL`.

## Security

Strict security headers + CSP in production (`next.config.mjs`), no third-party runtime requests (fonts via `next/font`,
3D lighting generated locally), `poweredByHeader` off, non-root container.

## Scaling notes

* The rate limiter is per instance. Behind multiple replicas, enforce limits at the gateway or swap
  `src/lib/rateLimit.js` for a Redis-backed store (same `check(key)` contract).
* `X-Forwarded-For` is trusted for client IP: make your load balancer overwrite it.
* Replace the timer in `src/hooks/useLive.js` with a WebSocket/SSE subscription for true push data, and the body of
  `loadInsights` in `src/server/insights.js` with your warehouse / BI API / LLM call.
* Dependencies are pinned. `three` is held at 0.182.0 because 0.183+ logs a `THREE.Clock` deprecation that
  `@react-three/fiber@9.8.1` still triggers; upgrade both together when fiber ships its Timer migration.

Configuration reference: `.env.example`.
