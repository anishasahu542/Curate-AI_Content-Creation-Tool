from fastapi import APIRouter
from pydantic import BaseModel, Field
import hashlib

router = APIRouter()


class CalendarRequest(BaseModel):
    niche: str
    platform: str
    days: int = Field(default=7, ge=1, le=90)


DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

CONTENT_TYPES = ["Reel", "Carousel", "Story", "Long-form", "Live", "Short", "Poll"]

PLATFORM_TIMES = {
    "instagram": ["9:00 AM", "12:00 PM", "5:00 PM", "7:30 PM", "8:00 PM", "11:00 AM", "6:00 PM"],
    "tiktok": ["7:00 AM", "10:00 AM", "12:00 PM", "3:00 PM", "7:00 PM", "9:00 PM", "11:00 PM"],
    "youtube": ["9:00 AM", "12:00 PM", "2:00 PM", "5:00 PM", "8:00 PM", "3:00 PM", "6:00 PM"],
    "twitter/x": ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM", "9:00 PM", "7:00 PM"],
    "linkedin": ["7:30 AM", "8:30 AM", "10:00 AM", "12:00 PM", "5:00 PM", "6:00 PM", "9:00 AM"],
}

# Topic templates — {niche} gets replaced at runtime
TOPIC_TEMPLATES = [
    "Beginner's guide to {niche}",
    "Top 5 mistakes people make in {niche}",
    "{niche}: myths vs. reality",
    "Behind the scenes of my {niche} journey",
    "The one {niche} hack that changed everything",
    "Day in the life: {niche} edition",
    "How to start {niche} with zero experience",
    "{niche} trends you can't ignore right now",
    "Unpopular opinions about {niche}",
    "My honest {niche} results after 30 days",
    "The future of {niche} — what's coming next",
    "Q&A: Your top {niche} questions answered",
    "{niche} tools I can't live without",
    "If I had to restart {niche} from scratch",
    "The psychology behind successful {niche}",
    "{niche} vs. what people THINK {niche} is",
    "3 {niche} lessons I learned the hard way",
    "How {niche} changed my perspective on life",
    "Reacting to viral {niche} content",
    "The ultimate {niche} checklist",
    "{niche} for busy people — 15 minutes a day",
    "What nobody tells you about {niche}",
    "My {niche} morning routine",
    "{niche} on a budget — it IS possible",
    "{niche}: before vs. after transformation",
    "Storytime: my worst {niche} experience",
    "Advanced {niche} strategies for 2025",
    "{niche} collaboration ideas",
    "Why I'm doubling down on {niche}",
    "The science behind {niche}",
]

TRENDING_ANGLES = [
    "Tie it to a current viral sound or meme format",
    "Use a 'hot take' angle to spark debate in the comments",
    "Create a relatable 'expectation vs. reality' comparison",
    "Leverage FOMO — show what people are missing out on",
    "Use the 'storytime' format for higher watch time",
    "Jump on the 'silent tutorial' aesthetic trend",
    "Frame it as a 'things I wish I knew sooner' list",
    "Partner with a micro-influencer for cross-audience reach",
    "Use duet / stitch format to react to a trending post",
    "Incorporate AI-generated visuals for the wow factor",
    "Ride the nostalgia wave — connect {niche} to the past",
    "Create a mini-documentary style piece for authority",
    "Use poll stickers or interactive elements for engagement",
    "Film a 'get ready with me' while discussing the topic",
    "Apply the 'POV:' format for immersive storytelling",
    "Use text-on-screen with trending background music",
    "Create a challenge related to {niche} and invite participation",
    "Go behind-the-scenes to build authenticity",
    "Use the 'this vs. that' comparison format",
    "Post at peak controversy time to maximize impressions",
    "Share user-generated content and credit the creator",
]


def _seeded_index(seed: str, max_val: int) -> int:
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    return h % max_val


def _get_times(platform: str) -> list[str]:
    return PLATFORM_TIMES.get(platform.lower().strip(), PLATFORM_TIMES["instagram"])


@router.post("/generate")
async def generate_calendar(request: CalendarRequest):
    """Generate an AI content calendar for a given niche and platform."""
    niche_cap = request.niche.strip().title()
    platform_key = request.platform.lower().strip()
    times = _get_times(request.platform)

    calendar = []
    for day_num in range(1, request.days + 1):
        day_name = DAY_NAMES[(day_num - 1) % 7]

        # Pick topic — deterministic but varied
        topic_idx = _seeded_index(f"{request.niche}_{day_num}_topic", len(TOPIC_TEMPLATES))
        topic = TOPIC_TEMPLATES[topic_idx].replace("{niche}", niche_cap)

        # Rotate content types — shift by platform hash so different platforms get different rotations
        platform_shift = _seeded_index(platform_key, len(CONTENT_TYPES))
        content_type = CONTENT_TYPES[(day_num - 1 + platform_shift) % len(CONTENT_TYPES)]

        # Best time — varies across the week
        best_time = times[(day_num - 1) % len(times)]

        # Trending angle
        angle_idx = _seeded_index(f"{request.niche}_{day_num}_angle", len(TRENDING_ANGLES))
        trending_angle = TRENDING_ANGLES[angle_idx].replace("{niche}", niche_cap)

        calendar.append({
            "day": day_num,
            "day_name": day_name,
            "topic": topic,
            "content_type": content_type,
            "best_time": best_time,
            "trending_angle": trending_angle,
        })

    return {
        "calendar": calendar,
        "niche": request.niche,
        "platform": request.platform,
        "total_days": request.days,
    }
