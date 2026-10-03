"""Session verification (HMAC-signed cookie shared with the frontend) - placeholder seam."""
from fastapi import HTTPException, Request, status


def current_user(request: Request) -> dict:
    """Dependency for protected routes. TODO: verify the signed session cookie with settings.session_secret."""
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
