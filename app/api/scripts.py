from fastapi import APIRouter

router = APIRouter()

async def generate_script_internal(niche: str, platform: str, tone: str):
    niche_title = niche.strip().title()
    
    if platform.lower() == "instagram":
        script = (
            f"🎬 INSTAGRAM REEL SCRIPT\n"
            f"Topic: {niche_title}\n"
            f"Tone: {tone}\n\n"
            f"[0:00 - 0:03] 🔥 Hook:\n"
            f"Want to master '{niche}'? Most people fail because of one simple mistake. Here is how you do it right.\n\n"
            f"[0:03 - 0:15] 💡 Step 1: Learn the basics\n"
            f"Stop chasing advanced hacks. Focus on the core fundamentals of {niche}. Build a solid foundation first.\n\n"
            f"[0:15 - 0:25] ⚡ Step 2: Practice in public\n"
            f"Share your progress daily. Build projects, write blogs, or post here on Instagram. Networking is your cheat code.\n\n"
            f"[0:25 - 0:30] 🚀 Call to Action:\n"
            f"Drop a 'YES' below if you want my free guide on {niche}, and follow for daily tips!"
        )
    elif platform.lower() == "tiktok":
        script = (
            f"⚡ TIKTOK SCRIPT\n"
            f"Topic: {niche_title}\n"
            f"Tone: {tone}\n\n"
            f"[0:00 - 0:02] 🎯 HOOK:\n"
            f"Stop scrolling! If you are interested in {niche}, you need to know this right now.\n\n"
            f"[0:02 - 0:10] 📈 THE SECRET:\n"
            f"You don't need a degree or years of experience. You just need consistency and this one tool.\n\n"
            f"[0:10 - 0:20] 🛠️ ACTIONS:\n"
            f"1. Search for top creators in {niche}.\n"
            f"2. Deconstruct their most popular post.\n"
            f"3. Put your own unique spin on it.\n\n"
            f"[0:20 - 0:25] 🙌 CTA:\n"
            f"Hit that share button and save this for later!"
        )
    else: # YouTube or others
        script = (
            f"📺 YOUTUBE VIDEO OUTLINE & SCRIPT\n"
            f"Topic: {niche_title}\n"
            f"Tone: {tone}\n\n"
            f"--- 1. INTRODUCTION (0:00 - 1:30) ---\n"
            f"• Hook: Hey everyone! Today we are diving deep into '{niche}'. If you've been struggling to get started, this video is for you.\n"
            f"• Agenda: I'm breaking down the 3 steps to succeed in {niche} from scratch.\n\n"
            f"--- 2. BODY SECTION (1:30 - 8:00) ---\n"
            f"• Point 1: Why {niche} is booming right now.\n"
            f"• Point 2: The step-by-step roadmap to go from beginner to pro.\n"
            f"• Point 3: Common pitfalls and how to avoid them.\n\n"
            f"--- 3. CONCLUSION & CTA (8:00 - 9:00) ---\n"
            f"• Wrap-up: Success in {niche} takes time, but these steps will fast-track your journey.\n"
            f"• CTA: If you found value in this video, smash the like button and subscribe for more in-depth tutorials!"
        )
        
    return {
        "script": script,
        "niche": niche,
        "platform": platform,
        "tone": tone
    }
