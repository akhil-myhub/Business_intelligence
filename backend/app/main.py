"""BusinessAI API entry point:  uvicorn app.main:app  (see README)."""
import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging

log = logging.getLogger("businessai.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    s = get_settings()
    configure_logging(s.log_level)
    log.info("server_start", extra={"ctx": {"env": s.app_env, "version": s.version}})
    yield
    log.info("server_stop")


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title="BusinessAI API", version=s.version, lifespan=lifespan, docs_url=None if s.is_production else "/docs")
    app.add_middleware(CORSMiddleware, allow_origins=s.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

    @app.middleware("http")
    async def request_log(request: Request, call_next):
        rid = request.headers.get("x-request-id") or str(uuid.uuid4())
        start = time.perf_counter()
        response = await call_next(request)
        response.headers["x-request-id"] = rid
        log.info("request", extra={"ctx": {"id": rid, "method": request.method, "path": request.url.path,
                                           "status": response.status_code, "ms": round((time.perf_counter() - start) * 1000, 1)}})
        return response

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
