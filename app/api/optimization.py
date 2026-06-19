from fastapi import APIRouter

router = APIRouter()

async def generate_optimization_internal(niche: str, platform: str):
    clean_niche = "".join(char for char in niche if char.isalnum() or char.isspace()).replace(" ", "")
    
    if platform.lower() == "instagram":
        hashtags = [f"#{clean_niche}", f"#Learn{clean_niche}", "#InstaTips", "#Growth", "#ContentCreator", "#ReelsViral"]
    elif platform.lower() == "tiktok":
        hashtags = [f"#{clean_niche}", "#TikTokAcademy", "#FYP", "#Trending", "#LearnOnTikTok"]
    else:
        hashtags = [f"#{clean_niche}", "#HowTo", "#Tutorial", "#TechTips", "#YoutubeGrowth"]
        
    return {
        "hashtags": hashtags,
        "seo_title": f"The Ultimate Guide to {niche.title()} in 2026"
    }
