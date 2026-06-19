from app.api.personalization import get_profile_internal
from app.api.trends import get_trends_internal
from app.api.scripts import generate_script_internal
from app.api.visuals import generate_visuals_internal
from app.api.optimization import generate_optimization_internal

async def execute_workflow(payload: dict):
    user_id = payload.get("user_id") or "demo_user"
    niche = payload.get("niche") or "general content"
    platform = payload.get("platform") or "YouTube"

    # 1. Fetch style
    style_ctx = await get_profile_internal(user_id)
    tone = style_ctx.get("tone", "engaging")
    
    # 2. Fetch trend 
    trend_ctx = await get_trends_internal(niche, platform)

    # 3. Build context & Script
    script_ctx = await generate_script_internal(niche, platform, tone)
    script_ctx["context"] = [style_ctx, trend_ctx]

    # 4. Visuals Plan
    visual_plan = await generate_visuals_internal(niche, platform)

    # 5. Optimization
    opt_ctx = await generate_optimization_internal(niche, platform)

    return {
        "user_id": user_id,
        "trend": trend_ctx,
        "script": script_ctx,
        "visual_plan": visual_plan,
        "optimized_content": opt_ctx
    }
