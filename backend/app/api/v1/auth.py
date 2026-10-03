from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login() -> dict:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "login not implemented")


@router.post("/logout")
async def logout() -> dict:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "logout not implemented")


@router.get("/me")
async def me() -> dict:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "session lookup not implemented")
