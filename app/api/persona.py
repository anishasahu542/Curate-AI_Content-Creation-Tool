from fastapi import APIRouter
from pydantic import BaseModel
import hashlib

router = APIRouter()

class PersonaRequest(BaseModel):
    niche: str
    platform: str

def _seeded_int(seed: str, low: int, high: int) -> int:
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    return low + (h % (high - low + 1))

def _seeded_choice(seed: str, items: list) -> any:
    idx = _seeded_int(seed, 0, len(items) - 1)
    return items[idx]

NAMES = ["Sarah Chen", "Marcus Vance", "Elena Rostova", "David Koomson", "Aria Takahashi", "Jordan Miller", "Amira Haddad", "Lucas Silva"]
LOCATIONS = ["San Francisco, CA", "Austin, TX", "London, UK", "Berlin, Germany", "Tokyo, Japan", "New York, NY", "Toronto, Canada", "Sydney, Australia"]
OCCUPATIONS = {
    "tech": ["Software Engineer", "Product Manager", "UX Designer", "Data Analyst"],
    "business": ["Marketing Manager", "Entrepreneur", "Sales Director", "Financial Planner"],
    "creative": ["Freelance Illustrator", "Video Editor", "Content Strategist", "Photographer"],
    "general": ["College Student", "Consultant", "Project Coordinator", "Operations Lead"]
}

PAIN_POINTS_POOL = [
    "Not enough hours in the day to implement current strategies.",
    "Struggling to find reliable, high-quality resources and tools.",
    "Feeling isolated in their professional journey and lacking mentorship.",
    "Difficulty demonstrating clear ROI/value to stakeholders or clients.",
    "Overwhelmed by conflicting advice and changing industry standards.",
    "Stagnant growth in their career advancement or business revenue.",
    "Difficulty staying creative and avoiding burnout under pressure.",
    "High customer/client acquisition costs."
]

DESIRES_POOL = [
    "Achieve financial freedom and flexible working conditions.",
    "Build a strong personal brand that attracts opportunities passively.",
    "Master advanced skills to stay ahead of the competitive curve.",
    "Connect with a supportive community of like-minded peers.",
    "Streamline workflows using automation and AI tools.",
    "Scale their current business operations or project outputs by 2x.",
    "Gain public recognition and authority status in their space.",
    "Build sustainable, long-term habits for physical and mental well-being."
]

BUYING_TRIGGERS_POOL = [
    "Compelling social proof (case studies, testimonials, peer recommendations).",
    "A free trial or low-barrier entry point to test value first-hand.",
    "Time-saving promises backed by step-by-step documentation.",
    "Limited-time discount or exclusive bonus offers.",
    "High-authority endorsement or industry-wide standards alignment.",
    "Interactive product demos that solve their specific pain point immediately.",
    "Direct, transparent pricing with no hidden fees."
]

CONTENT_PREFS = {
    "youtube": ["In-depth video tutorials", "Case study breakdowns", "Tool comparison reviews", "Long-form panel discussions"],
    "instagram": ["Quick actionable tips on Carousel", "Highly relatable Reels", "Behind-the-scenes Stories", "Interactive Q&A polls"],
    "tiktok": ["Fast-paced visual tips", "Trending format memes related to the niche", "Micro-learning tutorials", "Raw unfiltered daily vlogs"],
    "twitter/x": ["Detailed text threads", "Daily punchy insights", "Curated resource link lists", "Niche memes and industry commentary"],
    "linkedin": ["Case studies with metrics", "Professional growth stories", "Industry trend infographics", "Thought leadership articles"],
}

@router.post("/generate")
async def generate_persona(request: PersonaRequest):
    niche = request.niche.strip().lower()
    platform = request.platform.strip().lower()
    
    # Determine general category based on niche
    cat = "general"
    if any(k in niche for k in ["code", "software", "dev", "tech", "web", "ai", "data", "crypto"]):
        cat = "tech"
    elif any(k in niche for k in ["business", "marketing", "sales", "finance", "money", "startup", "seo"]):
        cat = "business"
    elif any(k in niche for k in ["design", "art", "photo", "video", "content", "music", "write", "creative"]):
        cat = "creative"
        
    seed_base = f"{niche}_{platform}"
    
    # Demographics
    name = _seeded_choice(seed_base + "_name", NAMES)
    age = _seeded_int(seed_base + "_age", 22, 48)
    gender = _seeded_choice(seed_base + "_gender", ["Female", "Male", "Non-binary"])
    location = _seeded_choice(seed_base + "_loc", LOCATIONS)
    occupation = _seeded_choice(seed_base + "_occ", OCCUPATIONS[cat])
    income = _seeded_choice(seed_base + "_income", ["$45k - $60k", "$75k - $95k", "$110k - $140k", "$150k+"])
    
    # Platform-specific content preferences
    pref_key = platform if platform in CONTENT_PREFS else "instagram"
    content_preferences = CONTENT_PREFS[pref_key]
    
    # Pain points (pick 3-4)
    pain_points = []
    for i in range(4):
        p = _seeded_choice(seed_base + f"_pain_{i}", PAIN_POINTS_POOL)
        if p not in pain_points:
            pain_points.append(p)
    while len(pain_points) < 3:
        p = _seeded_choice(seed_base + f"_pain_alt_{len(pain_points)}", PAIN_POINTS_POOL)
        if p not in pain_points:
            pain_points.append(p)
            
    # Desires (pick 3-4)
    desires = []
    for i in range(4):
        d = _seeded_choice(seed_base + f"_desire_{i}", DESIRES_POOL)
        if d not in desires:
            desires.append(d)
    while len(desires) < 3:
        d = _seeded_choice(seed_base + f"_desire_alt_{len(desires)}", DESIRES_POOL)
        if d not in desires:
            desires.append(d)
            
    # Platforms used
    platforms_pool = ["YouTube", "Instagram", "TikTok", "Twitter/X", "LinkedIn", "Reddit", "Pinterest"]
    platforms_used = [request.platform.title()]
    for i in range(3):
        plt = _seeded_choice(seed_base + f"_plat_{i}", platforms_pool)
        if plt not in platforms_used and plt.lower() != platform:
            platforms_used.append(plt)
            
    # Buying triggers (pick 3)
    buying_triggers = []
    for i in range(3):
        b = _seeded_choice(seed_base + f"_buy_{i}", BUYING_TRIGGERS_POOL)
        if b not in buying_triggers:
            buying_triggers.append(b)
    while len(buying_triggers) < 3:
        b = _seeded_choice(seed_base + f"_buy_alt_{len(buying_triggers)}", BUYING_TRIGGERS_POOL)
        if b not in buying_triggers:
            buying_triggers.append(b)
            
    # Language Style
    language_styles = [
        "Conversational but highly professional. Prefers bullet points and direct data-driven conclusions.",
        "Casual, conversational, and energetic. Uses emojis, modern slang, and values raw authenticity.",
        "Analytical, skeptic, and precise. Avoids marketing fluff; looks for technical depth and logic.",
        "Inspiring, empathetic, and narrative-focused. Responds strongly to personal stories of growth."
    ]
    language_style = _seeded_choice(seed_base + "_lang", language_styles)
    
    # Strategy Tips
    strategy_tips = [
        f"Address their immediate pain points in the first 3 seconds to ensure they don't scroll past your {request.platform} content.",
        f"Provide clear, actionable takeaways they can implement immediately to build trust and show domain expertise.",
        f"Encourage interaction by asking for their perspective, making them feel like a valuable contributor rather than just a viewer."
    ]
    
    persona = {
        "name": name,
        "age_range": f"{age} ({age-3}-{age+3})",
        "gender": gender,
        "location": location,
        "occupation": occupation,
        "income_level": income,
        "pain_points": pain_points,
        "desires": desires,
        "content_preferences": content_preferences,
        "platforms_used": platforms_used,
        "language_style": language_style,
        "buying_triggers": buying_triggers,
        "content_strategy_tips": strategy_tips
    }
    
    return {
        "persona": persona,
        "niche": request.niche,
        "platform": request.platform
    }
