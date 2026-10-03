from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/{view}")
async def get_data_view(view: str) -> dict:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, f"view '{view}' not implemented")
