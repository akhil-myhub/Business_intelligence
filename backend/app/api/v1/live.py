from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/live", tags=["live"])


@router.get("")
async def live_endpoint() -> dict:
    """Server-sent events with live sales orders once implemented."""
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "live not implemented")
