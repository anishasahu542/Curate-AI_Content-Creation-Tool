from fastapi import APIRouter
from pydantic import BaseModel
import hashlib

router = APIRouter()


class HookRequest(BaseModel):
    topic: str
    platform: str


def _seeded_int(seed: str, low: int, high: int) -> int:
    """Deterministic pseudo-random integer in [low, high] from a seed string."""
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    return low + (h % (high - low + 1))


def _capitalize_topic(topic: str) -> str:
    return topic.strip().title()


PLATFORM_TONES = {
    "instagram": {"opener": "Double-tap if", "audience": "scrollers", "format": "carousel or Reel"},
    "tiktok": {"opener": "POV:", "audience": "viewers", "format": "short-form video"},
    "youtube": {"opener": "In this video", "audience": "viewers", "format": "long-form video"},
    "twitter/x": {"opener": "Thread:", "audience": "followers", "format": "tweet thread"},
    "linkedin": {"opener": "Here's what I learned", "audience": "professionals", "format": "article or post"},
}


def _get_tone(platform: str) -> dict:
    return PLATFORM_TONES.get(platform.lower().strip(), PLATFORM_TONES["instagram"])


def _generate_curiosity_hook(topic: str, tone: dict) -> dict:
    topic_cap = _capitalize_topic(topic)
    templates = [
        f"Nobody talks about this side of {topic_cap} — but it changes everything.",
        f"I spent 3 years studying {topic_cap}. Here's what 99% of people get wrong.",
        f"The hidden truth about {topic_cap} that experts won't share publicly.",
        f"What if everything you knew about {topic_cap} was backwards?",
        f"There's a secret about {topic_cap} that only insiders know.",
    ]
    idx = _seeded_int(topic + "_curiosity", 0, len(templates) - 1)
    hook = templates[idx]
    score = _seeded_int(topic + "_curiosity_score", 78, 96)
    return {
        "style": "Curiosity",
        "hook_text": hook,
        "score": score,
        "why_it_works": (
            "Curiosity hooks exploit the information gap — the audience feels compelled to "
            "keep consuming to close the gap between what they know and what you're promising to reveal."
        ),
    }


def _generate_shock_hook(topic: str, tone: dict) -> dict:
    topic_cap = _capitalize_topic(topic)
    templates = [
        f"STOP doing this with {topic_cap} — it's literally killing your results.",
        f"Unpopular opinion: Most {topic_cap} advice on {tone['format']} is dead wrong.",
        f"I was WRONG about {topic_cap} for years. Here's my honest confession.",
        f"This {topic_cap} mistake costs people thousands — and almost nobody realizes it.",
        f"Hot take: {topic_cap} is NOT what {tone['audience']} think it is. Let me explain.",
    ]
    idx = _seeded_int(topic + "_shock", 0, len(templates) - 1)
    hook = templates[idx]
    score = _seeded_int(topic + "_shock_score", 72, 93)
    return {
        "style": "Shock / Controversy",
        "hook_text": hook,
        "score": score,
        "why_it_works": (
            "Shock and controversy hooks trigger an emotional response that interrupts the scroll. "
            "They create cognitive dissonance — the audience needs to resolve the tension by engaging."
        ),
    }


def _generate_story_hook(topic: str, tone: dict) -> dict:
    topic_cap = _capitalize_topic(topic)
    templates = [
        f"Two years ago I knew nothing about {topic_cap}. Today it changed my life. Here's how.",
        f"I almost gave up on {topic_cap}. Then something unexpected happened at 2 AM.",
        f"A stranger taught me more about {topic_cap} in 5 minutes than 4 years of school did.",
        f"My biggest failure with {topic_cap} turned into the best thing that ever happened to me.",
        f"The day I discovered {topic_cap}, I was broke, frustrated, and ready to quit.",
    ]
    idx = _seeded_int(topic + "_story", 0, len(templates) - 1)
    hook = templates[idx]
    score = _seeded_int(topic + "_story_score", 74, 95)
    return {
        "style": "Story",
        "hook_text": hook,
        "score": score,
        "why_it_works": (
            "Story hooks activate the narrative-processing part of the brain. People are wired to "
            "follow stories to their conclusion — it's almost impossible to disengage mid-narrative."
        ),
    }


def _generate_statistic_hook(topic: str, tone: dict) -> dict:
    topic_cap = _capitalize_topic(topic)
    stat_num = _seeded_int(topic + "_stat_num", 67, 94)
    templates = [
        f"{stat_num}% of people fail at {topic_cap} because of ONE simple mistake.",
        f"Studies show only {100 - stat_num}% of {tone['audience']} actually understand {topic_cap}.",
        f"The {topic_cap} industry is worth $B — yet {stat_num}% of people ignore this key insight.",
        f"After analyzing 10,000+ posts about {topic_cap}, here's what the data says.",
        f"Only 1 in {_seeded_int(topic + '_ratio', 5, 20)} {tone['audience']} know this {topic_cap} fact.",
    ]
    idx = _seeded_int(topic + "_statistic", 0, len(templates) - 1)
    hook = templates[idx]
    score = _seeded_int(topic + "_stat_score", 70, 91)
    return {
        "style": "Statistic",
        "hook_text": hook,
        "score": score,
        "why_it_works": (
            "Statistic hooks leverage the authority of data. Numbers feel objective and credible, "
            "which builds instant trust and makes the audience lean in for the explanation."
        ),
    }


def _generate_question_hook(topic: str, tone: dict) -> dict:
    topic_cap = _capitalize_topic(topic)
    templates = [
        f"Are you making these {topic_cap} mistakes without even realizing it?",
        f"What would your life look like if you actually mastered {topic_cap}?",
        f"Why do some people crush it with {topic_cap} while others struggle for years?",
        f"Have you ever wondered why {topic_cap} feels so hard? Here's the real reason.",
        f"What's the #1 thing holding you back from success with {topic_cap}?",
    ]
    idx = _seeded_int(topic + "_question", 0, len(templates) - 1)
    hook = templates[idx]
    score = _seeded_int(topic + "_question_score", 65, 89)
    return {
        "style": "Question",
        "hook_text": hook,
        "score": score,
        "why_it_works": (
            "Question hooks engage the brain's automatic response mechanism — when you read a question, "
            "your mind involuntarily starts formulating an answer, pulling you deeper into the content."
        ),
    }


@router.post("/generate")
async def generate_hooks(request: HookRequest):
    """Generate 5 hook variations for a given topic and platform, scored and ranked."""
    tone = _get_tone(request.platform)

    hooks = [
        _generate_curiosity_hook(request.topic, tone),
        _generate_shock_hook(request.topic, tone),
        _generate_story_hook(request.topic, tone),
        _generate_statistic_hook(request.topic, tone),
        _generate_question_hook(request.topic, tone),
    ]

    # Sort by score descending
    hooks.sort(key=lambda h: h["score"], reverse=True)

    return {
        "hooks": hooks,
        "topic": request.topic,
        "platform": request.platform,
    }
