from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/query", tags=["query"])


@router.post("")
async def query_endpoint() -> dict:
    """Streams the answer (SSE) once implemented."""
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "query not implemented")
