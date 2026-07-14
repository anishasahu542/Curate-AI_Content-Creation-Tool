from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()

class ViralScoreRequest(BaseModel):
    content: str
    platform: str

def _analyze_hook(first_line: str) -> tuple[int, str]:
    score = 50
    feedback = []
    
    first_line_clean = first_line.lower().strip()
    
    # Check length of the hook
    words = first_line_clean.split()
    if 5 <= len(words) <= 12:
        score += 20
        feedback.append("Excellent hook length — punchy and easy to scan.")
    elif len(words) < 5:
        score += 5
        feedback.append("Hook is a bit short. Add a strong action verb or emotional trigger.")
    else:
        score -= 10
        feedback.append("First sentence is too long for a hook. Keep it under 15 words to prevent scrollers from passing by.")
        
    # Check curiosity or power words
    power_words = ["secret", "stop", "never", "always", "truth", "myth", "worst", "best", "hack", "mistake", "ruin", "free", "fail", "win"]
    found_power = [w for w in power_words if w in first_line_clean]
    if found_power:
        score += 15
        feedback.append(f"Great use of power words ('{found_power[0]}') to pique curiosity.")
    else:
        score -= 5
        feedback.append("Try incorporating curiosity-inducing words (like 'mistake', 'secret', or 'hack') in your opener.")
        
    # Check punctuation (question or exclamation)
    if "?" in first_line:
        score += 10
        feedback.append("Opening with a question is a proven way to trigger cognitive engagement.")
    if "!" in first_line:
        score += 5
        feedback.append("Exclamation mark adds emotional urgency to your hook.")
        
    # Cap score
    score = min(max(score, 10), 100)
    feedback_str = " ".join(feedback) if feedback else "Hook is decent but could be punchier."
    return score, feedback_str

def _analyze_emotions(content: str) -> tuple[int, str]:
    score = 55
    feedback = []
    
    content_lower = content.lower()
    
    # Emotional keywords
    emotional_words = ["love", "hate", "scared", "fear", "crazy", "mindblown", "shocked", "amazing", "confession", "honest", "regret", "life-changing", "pain", "dream", "success", "fail"]
    matches = [w for w in emotional_words if w in content_lower]
    if len(matches) >= 2:
        score += 20
        feedback.append(f"Strong emotional resonance with words like {', '.join(matches[:2])}.")
    elif len(matches) == 1:
        score += 10
        feedback.append("Good start on emotional triggers, but could pack a larger punch.")
    else:
        score -= 10
        feedback.append("The tone is quite neutral. Add words that evoke curiosity, fear of missing out (FOMO), or excitement.")
        
    # Emojis check
    emojis = re.findall(r'[^\w\s,.:;!?"\'-]', content)
    if len(emojis) >= 3:
        score += 15
        feedback.append("Nice use of emojis to visually support the emotional tone.")
    elif len(emojis) > 0:
        score += 5
        feedback.append("A few emojis are present. Consider adding 1-2 more at strategic points to emphasize emotion.")
    else:
        score -= 5
        feedback.append("No emojis found. Adding 1-2 emojis can help humanize the text and convey tone.")
        
    score = min(max(score, 10), 100)
    feedback_str = " ".join(feedback) if feedback else "Emotional tone is moderate."
    return score, feedback_str

def _analyze_shareability(content: str) -> tuple[int, str]:
    score = 50
    feedback = []
    
    content_lower = content.lower()
    
    # Bookmark triggers
    bookmark_words = ["save", "bookmark", "repost", "share", "send", "forward", "dm", "retweet", "loop in"]
    has_bookmark = any(w in content_lower for w in bookmark_words)
    if has_bookmark:
        score += 25
        feedback.append("Includes a direct share/save prompt, which heavily influences social algorithms.")
    else:
        feedback.append("No explicit share or save prompt found. Add a line like 'Save this for later!' to boost engagement.")
        
    # Bullet points / list format (highly savable)
    if any(marker in content for marker in ["-", "*", "•", "▸", "1.", "2.", "3."]):
        score += 15
        feedback.append("List/bullet formatting makes the information highly bookmark-worthy and referenceable.")
    else:
        score -= 5
        feedback.append("Text is in paragraph format. Breaking it down into a list or key steps increases the value density.")
        
    score = min(max(score, 10), 100)
    feedback_str = " ".join(feedback) if feedback else "Shareability is average."
    return score, feedback_str

def _analyze_cta(content: str) -> tuple[int, str]:
    score = 45
    feedback = []
    
    content_lower = content.lower()
    
    # CTA keywords
    cta_words = ["comment", "below", "subscribe", "follow", "link in bio", "click here", "sign up", "download", "let me know", "what do you think"]
    has_cta = any(w in content_lower for w in cta_words)
    if has_cta:
        score += 40
        feedback.append("Clear call-to-action (CTA) detected. This will guide user conversion or comments.")
    else:
        score -= 10
        feedback.append("Missing a clear call-to-action at the end. Tell your audience exactly what to do next (e.g. comment, follow, click link).")
        
    score = min(max(score, 10), 100)
    feedback_str = " ".join(feedback) if feedback else "CTA presence is moderate."
    return score, feedback_str

def _analyze_trends(content: str, platform: str) -> tuple[int, str]:
    score = 60
    feedback = []
    
    content_lower = content.lower()
    platform_clean = platform.lower().strip()
    
    # Platform-specific features
    if platform_clean == "tiktok" or platform_clean == "instagram":
        if "#" in content:
            score += 15
            feedback.append("Hashtags are included, helping with search and algorithm categorization.")
        else:
            score -= 5
            feedback.append("No hashtags found. Add 3-5 niche hashtags to help the algorithm index your post.")
            
    # Trend keywords
    trend_words = ["ai", "chatgpt", "trends", "secret", "hack", "viral", "algorithm", "2026", "2025", "future", "new way", "automation", "no-code"]
    found_trends = [w for w in trend_words if w in content_lower]
    if len(found_trends) >= 1:
        score += 15
        feedback.append(f"Aligned with trending topics/buzzwords (like '{found_trends[0]}').")
    else:
        feedback.append("To increase viral lift, try linking this topic to broad current trends (like AI, future work, or automation).")
        
    score = min(max(score, 10), 100)
    feedback_str = " ".join(feedback) if feedback else "Trend alignment is moderate."
    return score, feedback_str

def _analyze_readability(content: str) -> tuple[int, str]:
    score = 55
    feedback = []
    
    lines = [line.strip() for line in content.split("\n") if line.strip()]
    if not lines:
        return 0, "No content to analyze."
        
    # Check paragraph spacing
    if len(lines) > 2 and len(content.split("\n\n")) >= len(lines) // 2:
        score += 20
        feedback.append("Excellent use of line breaks and white space, reducing visual load.")
    else:
        score -= 10
        feedback.append("Text feels dense. Use double line breaks between thoughts to make scanning easy.")
        
    # Check sentence length
    avg_sentence_len = len(content.split()) / max(len(lines), 1)
    if avg_sentence_len < 15:
        score += 15
        feedback.append("Short sentence structures maintain a fast reading pace.")
    else:
        score -= 5
        feedback.append("Sentences are quite wordy. Try chopping long explanations into bite-sized lines.")
        
    score = min(max(score, 10), 100)
    feedback_str = " ".join(feedback) if feedback else "Readability is average."
    return score, feedback_str

@router.post("/analyze")
async def analyze_virality(request: ViralScoreRequest):
    from app.api.billing import deduct_credits
    deduct_credits(30)

    content = request.content
    platform = request.platform
    
    lines = [line.strip() for line in content.split("\n") if line.strip()]
    first_line = lines[0] if lines else ""
    
    hook_score, hook_fb = _analyze_hook(first_line)
    emotion_score, emotion_fb = _analyze_emotions(content)
    share_score, share_fb = _analyze_shareability(content)
    cta_score, cta_fb = _analyze_cta(content)
    trend_score, trend_fb = _analyze_trends(content, platform)
    read_score, read_fb = _analyze_readability(content)
    
    # Calculate overall score
    overall_score = int(
        hook_score * 0.25 +
        emotion_score * 0.20 +
        share_score * 0.20 +
        cta_score * 0.15 +
        trend_score * 0.10 +
        read_score * 0.10
    )
    
    # Verdict text
    if overall_score >= 85:
        verdict = "Viral Masterpiece! This content is optimized perfectly across all dimensions. Push it live! 🔥"
    elif overall_score >= 70:
        verdict = "Strong Viral Potential. It has a great foundation. Fine-tune the CTA or readability feedback to maximize reach. 🚀"
    elif overall_score >= 50:
        verdict = "Moderate Potential. Worth publishing, but it would benefit from a punchier hook and more emotional triggers. 📈"
    else:
        verdict = "High Risk of Flop. The content is too dense or lacks key elements like a hook or CTA. Revise using the feedback below. ⚠️"
        
    breakdown = [
        {"metric": "Hook Strength", "score": hook_score, "feedback": hook_fb},
        {"metric": "Emotional Resonance", "score": emotion_score, "feedback": emotion_fb},
        {"metric": "Shareability Factor", "score": share_score, "feedback": share_fb},
        {"metric": "CTA Effectiveness", "score": cta_score, "feedback": cta_fb},
        {"metric": "Trend Alignment", "score": trend_score, "feedback": trend_fb},
        {"metric": "Readability", "score": read_score, "feedback": read_fb}
    ]
    
    return {
        "overall_score": overall_score,
        "verdict": verdict,
        "breakdown": breakdown,
        "platform": platform
    }
