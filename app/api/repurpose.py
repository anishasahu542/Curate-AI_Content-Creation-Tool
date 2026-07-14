from fastapi import APIRouter
from pydantic import BaseModel
import hashlib
import re

router = APIRouter()

PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn"]


class RepurposeRequest(BaseModel):
    content: str
    source_platform: str


def _extract_sentences(text: str) -> list[str]:
    """Split text into sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def _extract_keywords(text: str) -> list[str]:
    """Pull out significant words (5+ chars) for hashtag generation."""
    words = re.findall(r'\b[a-zA-Z]{5,}\b', text.lower())
    seen = set()
    unique = []
    for w in words:
        if w not in seen:
            seen.add(w)
            unique.append(w)
    return unique[:8]


def _pseudo_random(seed: str, n: int) -> int:
    """Deterministic pseudo-random number from a seed string."""
    h = int(hashlib.md5(seed.encode()).hexdigest(), 16)
    return h % n


EMOJIS_POOL = ["🔥", "✨", "💡", "🚀", "💪", "🎯", "👇", "❤️", "😍", "🙌",
               "⚡", "💥", "🌟", "📌", "🤯", "💎", "👀", "🎬", "📈", "🏆"]

HASHTAG_PREFIXES = ["trending", "viral", "daily", "real", "best", "top", "pro", "new"]


def _pick_emojis(seed: str, count: int = 4) -> list[str]:
    start = _pseudo_random(seed + "_emoji", len(EMOJIS_POOL) - count)
    return EMOJIS_POOL[start:start + count]


def _generate_hashtags(keywords: list[str], seed: str) -> str:
    tags = [f"#{kw}" for kw in keywords[:4]]
    idx = _pseudo_random(seed, len(HASHTAG_PREFIXES))
    tags.append(f"#{HASHTAG_PREFIXES[idx]}content")
    tags.append("#fyp")
    return " ".join(tags)


def _repurpose_instagram(content: str, sentences: list[str], keywords: list[str]) -> str:
    emojis = _pick_emojis(content[:20])
    lines = []
    # Strong opening
    if sentences:
        lines.append(f"{emojis[0]} {sentences[0].upper()}")
    lines.append("")
    # Body — short punchy lines with emojis
    for i, s in enumerate(sentences[1:], 1):
        emoji = emojis[i % len(emojis)]
        lines.append(f"{emoji} {s}")
    lines.append("")
    lines.append("💬 Drop a comment if this resonates!")
    lines.append("📌 Save this for later")
    lines.append("")
    lines.append(_generate_hashtags(keywords, "ig"))
    return "\n".join(lines)


def _repurpose_tiktok(content: str, sentences: list[str], keywords: list[str]) -> str:
    lines = []
    # Fast hook — first 3 seconds matter
    if sentences:
        hook = sentences[0]
        lines.append(f"⚡ WAIT — {hook}")
    else:
        lines.append("⚡ WAIT — You need to hear this...")
    lines.append("")

    # Middle — rapid-fire value
    lines.append("Here's what nobody tells you 👇")
    lines.append("")
    for i, s in enumerate(sentences[1:], 1):
        lines.append(f"▸ {s}")
    lines.append("")

    # CTA
    lines.append("Follow for more 🔥 | Like if you agree")
    lines.append("")
    lines.append(_generate_hashtags(keywords, "tt") + " #tiktok #fyp")
    return "\n".join(lines)


def _repurpose_youtube(content: str, sentences: list[str], keywords: list[str]) -> str:
    lines = []
    lines.append("📹 VIDEO OUTLINE")
    lines.append("=" * 40)
    lines.append("")

    # Title suggestion
    if sentences:
        lines.append(f"🎬 TITLE IDEA: \"{sentences[0]}\" — Here's the Truth")
    lines.append("")

    # Hook (first 30 seconds)
    lines.append("🔴 HOOK (0:00 - 0:30)")
    if sentences:
        lines.append(f"   Open with: \"{sentences[0]}\"")
    lines.append("   Ask a provocative question to keep viewers watching.")
    lines.append("")

    # Body sections
    lines.append("📋 MAIN SECTIONS:")
    section_titles = ["The Problem", "Why It Matters", "The Solution", "Real Examples", "Action Steps"]
    body_sentences = sentences[1:] if len(sentences) > 1 else ["Elaborate on the core idea."]
    for i, title in enumerate(section_titles):
        timestamp_min = 0 + (i + 1) * 2
        talking_point = body_sentences[i % len(body_sentences)]
        lines.append(f"   [{timestamp_min}:00] {title}")
        lines.append(f"      → {talking_point}")
    lines.append("")

    # CTA
    lines.append("🔔 OUTRO & CTA (10:00+)")
    lines.append("   → Recap the key takeaway")
    lines.append("   → Ask viewers to like, comment & subscribe")
    lines.append(f"   → Suggest related video on: {keywords[0] if keywords else 'this topic'}")
    lines.append("")

    # Description
    lines.append("📝 DESCRIPTION TEMPLATE:")
    lines.append(f"   {sentences[0] if sentences else 'Watch this video to learn...'}")
    lines.append(f"   🔗 Related links below")
    lines.append(f"   Tags: {', '.join(keywords[:5])}")
    return "\n".join(lines)


def _repurpose_twitter(content: str, sentences: list[str], keywords: list[str]) -> str:
    lines = []
    lines.append("🧵 THREAD:")
    lines.append("")

    # Tweet 1 — Hook
    if sentences:
        lines.append(f"1/ {sentences[0]}")
        lines.append("")
        lines.append("   Here's what I learned 👇")
    else:
        lines.append("1/ This is something everyone needs to know 👇")
    lines.append("")

    # Body tweets
    for i, s in enumerate(sentences[1:], 2):
        lines.append(f"{i}/ {s}")
        lines.append("")

    # Final tweet
    final_num = len(sentences) + 1 if len(sentences) > 1 else 3
    lines.append(f"{final_num}/ That's a wrap!")
    lines.append("")
    lines.append("If you found this valuable:")
    lines.append("  ♻️ Repost to help others")
    lines.append("  ❤️ Like if you agree")
    lines.append(f"  👤 Follow me for more on {keywords[0] if keywords else 'this topic'}")
    return "\n".join(lines)


def _repurpose_linkedin(content: str, sentences: list[str], keywords: list[str]) -> str:
    lines = []

    # Professional hook
    if sentences:
        lines.append(f"{sentences[0]}")
    lines.append("")
    lines.append("Here's a perspective I think is worth sharing.")
    lines.append("")

    # Body — professional paragraphs
    body = sentences[1:] if len(sentences) > 1 else []
    for i, s in enumerate(body):
        if i > 0 and i % 2 == 0:
            lines.append("")
        lines.append(s)
    lines.append("")

    # Takeaway
    lines.append("Key takeaway:")
    if body:
        lines.append(f"→ {body[-1]}")
    else:
        lines.append("→ The insight above can reshape how we approach this topic.")
    lines.append("")

    # CTA
    lines.append("What's your take on this? I'd love to hear different perspectives in the comments.")
    lines.append("")
    lines.append("---")
    lines.append(f"♻️ Repost if this resonates with your network.")
    lines.append(f"🔔 Follow me for more insights on {keywords[0] if keywords else 'professional growth'}.")
    return "\n".join(lines)


REPURPOSE_MAP = {
    "Instagram": _repurpose_instagram,
    "TikTok": _repurpose_tiktok,
    "YouTube": _repurpose_youtube,
    "Twitter/X": _repurpose_twitter,
    "LinkedIn": _repurpose_linkedin,
}


@router.post("/generate")
async def repurpose_content(request: RepurposeRequest):
    """Take content written for one platform and repurpose it for every other platform."""
    from app.api.billing import deduct_credits
    deduct_credits(30)

    sentences = _extract_sentences(request.content)
    keywords = _extract_keywords(request.content)
    source = request.source_platform.strip()

    result = {}
    for platform in PLATFORMS:
        if platform.lower() == source.lower():
            continue
        func = REPURPOSE_MAP.get(platform)
        if func:
            result[platform] = func(request.content, sentences, keywords)

    return {
        "source_platform": source,
        "original_content": request.content,
        "repurposed": result,
        "platforms_generated": list(result.keys()),
    }
