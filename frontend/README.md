# BusinessAI — Business Intelligence frontend

A real web application (Next.js 16 App Router · React 19 · three.js): signed-in sessions, a URL for every
screen, filters that change the numbers, questions that route to the right answer, and a live data stream.

> **Backend status:** the dedicated backend (`../backend`) is not started yet. Until it is, the analytics engine
> and the live feed run inside this app behind one seam, `src/server/` (see *Replacing the stand-in backend*).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  — demo sign-in: demo@businessai.app / Business@2026 (development only)
npm run verify       # lint + unit tests + production build (the CI gate)
```

Production needs explicit secrets (sign-in is fail-closed without them): see `.env.example`.

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint (Next + React + React Compiler rules, unused code is an error) — 0 problems required |
| `npm test` | 44 unit tests: engine calibration/consistency, auth + sessions, question parser, API client, logging, rate limiting |
| `NEXT_DIST_DIR=.next-verify npm run build` | Build without disturbing a running dev server |
| `docker build -t businessai .` | Standalone non-root image with a health check |

## Screens and routes

| URL | Screen |
| --- | --- |
| `/` | Public landing page built from the "BI landing page" Figma frame. Hero, benefits and the demo form are live HTML; the nine product sections are interactive React (Ask demo, 5-level sales drill-down on a real India map, batch recall tracer, insights, forecasting, data foundation, implementation). Only the hero render and the small card illustrations are artwork (`public/landing`). Demo requests → `POST /api/demo-request` |
| `/login` | Sign in (validation, rate limited, `?next=` return, remember me) → lands on `/ask` |
| `/ask` | Ask — type a question; it is interpreted and routed to the screen that answers it (`/ask?ask=…` auto-asks) |
| `/overview` | KPIs + generated key insight; "why" questions produce a diagnosis with drivers |
| `/dashboard` | 3D India map coloured by revenue, trend, top states, **live sales** |
| `/stores/[state]` | Drill-down for any of 30 states: 3D block, cities, store types, channel mix |
| `/products`, `/products/[id]` | Ranking; product detail with 5 working tabs |
| `/market` | Channels, channel share, regional trends, product mix, competitive view |
| `/campaigns` | Incremental sales/reach and sortable campaign table |
| `/reports` | Builder with real **PDF / Excel / PPT / CSV** exports, schedules and history |
| `/settings` | 3D effects, live feed, default region/period, account |

Filters (`region`, `period`, `product`) and tabs live in the URL, so every view is shareable and Back/Forward work.
Keyboard: **Ctrl/Cmd+K** opens search (pages, states, products, or "Ask: …").

## How it works

```
Browser ──► proxy.js (request id, page auth guard)
        ──► app/(app)/…  pages ──► src/screens  ──► useApi/useFilters ──► /api/data/[view]
        ◄── /api/live (SSE) ◄── src/server/live.js ──► adds each sale into the engine
                                 /api/query (SSE)    ◄── src/server/nlq.js (question → screen + filters)
                                 /api/data/[view]    ◄── src/server/analytics.js ◄── src/server/engine/*
```

* **Engine** (`src/server/engine`): a seeded weekly model (96 weeks × 30 states × 6 products × 5 channels).
  Every number on every screen is an aggregation of it, so filters, drill-downs and exports always reconcile.
  It is calibrated so *South India · Last Quarter* shows ₹892 Cr, 8.4 M units, 12.8 % share, 3.6 % conversion.
* **Live feed**: one simulator per server process streams `sale`, `tick` and `alert` events. Sales are added to the
  engine, so KPIs/charts follow the stream; the 3D map pulses where orders land; momentum shifts raise alerts
  (notification bell). `LIVE_SPEEDUP` compresses business time so the demo visibly moves (1 = real time).
* **Auth**: HMAC-signed, `HttpOnly`, `SameSite=Lax` session cookie (Web Crypto, edge-safe); constant-time credential
  check; login rate limit; Origin check on state-changing requests. Pages are guarded in `proxy.js` and again in the
  layout; API routes return 401 JSON.

## Reliability and operations

* Every request has a timeout; the question stream has connect/idle/total limits; failures show an error with Retry —
  **no fabricated data**. Per-screen error boundaries, WebGL feature detection + context-loss recovery, and a useful 2D
  fallback for the map when 3D is off or unavailable.
* Structured JSON logs (one object per line) with request ids, redaction and client-error ingestion (`/api/logs`).
  `GET /api/health` (liveness) and `?deep=1` (readiness).
* Security headers + CSP in production; no third-party runtime requests (fonts via `next/font`, lighting generated locally).
* Dependencies are pinned. `three` is held at 0.182.0 until `@react-three/fiber` ships its `THREE.Clock → Timer`
  migration. `image-size` is overridden to the patched release (it is excluded from browser bundles regardless).

## Replacing the stand-in backend

When `../backend` exists, only these change — routes, auth, validation, UI and tests keep working:

| Now | Replace with |
| --- | --- |
| `src/server/analytics.js` + `engine/` (`getView`) | calls to the backend's analytics API (same JSON shapes) |
| `src/server/live.js` (`liveFeed`) | a consumer of the backend event stream calling the same publish path |
| `src/server/nlq.js` (`interpret`) | the backend/LLM question service (question in → `{ intent, path, summary, filters }`) |
| `src/server/auth.js` + `config/auth.js` (demo user) | the real identity provider / user store |

## Scaling notes

* The rate limiters and the live simulator are per process. Run the limiter in Redis (same `check(key)` contract) and
  fan live events out through a broker when you run several replicas.
* `X-Forwarded-For` is trusted for client IP: make your load balancer overwrite it.
* Scheduled reports are stored in the browser until the backend scheduler exists.

Configuration reference: `.env.example`.
