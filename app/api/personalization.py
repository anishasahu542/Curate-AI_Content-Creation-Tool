from fastapi import APIRouter
router = APIRouter()

async def get_profile_internal(user_id: str):
    return {
        "user_id": user_id,
        "tone": "engaging and professional",
        "audience": "general tech enthusiasts"
    }
