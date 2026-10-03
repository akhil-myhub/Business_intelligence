from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import Health

router = APIRouter(tags=["health"])


@router.get("/health", response_model=Health)
async def health() -> Health:
    s = get_settings()
    return Health(status="ok", version=s.version, env=s.app_env)
