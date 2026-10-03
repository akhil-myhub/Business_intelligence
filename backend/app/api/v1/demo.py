from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/demo-request", tags=["demo"])


@router.post("")
async def demo_endpoint() -> dict:
    """Stores a demo request once implemented."""
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "demo not implemented")
