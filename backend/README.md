# BusinessAI API (FastAPI) - structure only

Not started yet. This folder is the agreed skeleton; every endpoint except `GET /api/v1/health` returns 501 until implemented.

```
app/
  main.py            app factory, CORS, request logging, lifespan
  core/              config (env), structured logging, security (session cookie)
  api/v1/            routers: health, auth, data, query (SSE), live (SSE), demo
  schemas/           pydantic models
  services/          analytics, nlq, live - the seams replacing frontend/src/server/*
  db/                session / models (when the schema is defined)
tests/               pytest
Dockerfile           gunicorn + uvicorn workers, non-root, healthcheck
```

Routes mirror the frontend's `/api/*` (auth/login|logout|me, data/{view}, query, live, demo-request, health) under `/api/v1`.

## Run (when you decide to start it)
```
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements-dev.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
pytest
```
Deploy: `docker compose up --build -d`, then proxy `/api/v1` to port 8000 in `frontend/deploy/nginx`.
