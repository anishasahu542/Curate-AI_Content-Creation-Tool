from fastapi import APIRouter
router = APIRouter()

async def get_trends_internal(niche: str, platform: str):
    return {
        "current_trend": f"Viral topics in {niche} for {platform}",
        "niche": niche,
        "platform": platform
    }
