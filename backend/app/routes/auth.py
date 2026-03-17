from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/check")
async def check_auth():
    """Check if password is required"""
    return {"required": bool(settings.APP_PASSWORD)}


@router.post("/verify")
async def verify_password(data: dict):
    """Verify the access password"""
    password = data.get("password", "")
    if not settings.APP_PASSWORD:
        return {"valid": True}
    return {"valid": password == settings.APP_PASSWORD}
