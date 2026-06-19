from fastapi import APIRouter

router = APIRouter()

async def generate_visuals_internal(niche: str, platform: str):
    if platform.lower() in ["instagram", "tiktok"]:
        scenes = [
            "Scene 1: Close-up talking head with a bold text overlay representing the hook.",
            f"Scene 2: Fast-cut B-roll showing hands typing or working on {niche}.",
            "Scene 3: Text graphic with the key tips pointing out steps.",
            "Scene 4: Dynamic gesture pointing down to the caption for the CTA."
        ]
    else:
        scenes = [
            "Scene 1: High-energy intro overlay with title screen.",
            f"Scene 2: Screen share demo showing step-by-step walk-through of {niche}.",
            "Scene 3: B-roll footage showing workspace layout.",
            "Scene 4: Outro card with subscribe button and recommended video thumbnails."
        ]
    return {
        "scenes": scenes,
        "platform": platform
    }
