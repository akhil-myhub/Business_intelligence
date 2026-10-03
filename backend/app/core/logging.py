"""Structured JSON logging (one line per event) - same shape the frontend emits."""
import json
import logging
import sys
from datetime import datetime, timezone

_REDACT = {"password", "authorization", "cookie", "token", "secret"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "msg": record.getMessage(),
            "service": "businessai-api",
        }
        ctx = getattr(record, "ctx", None)
        if ctx:
            payload["ctx"] = {k: ("[redacted]" if k.lower() in _REDACT else v) for k, v in ctx.items()}
        if record.exc_info:
            payload["err"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level.upper())
