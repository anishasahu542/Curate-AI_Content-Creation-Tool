from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class GenerateRequest(BaseModel):
    user_id: Optional[str] = "demo_user"
    niche: Optional[str] = None
    platform: str
    goal: Optional[str] = "viral content"
    topic: Optional[str] = None

@router.post("/generate")
async def generate_content(request: GenerateRequest):
    req_dict = request.dict()
    # Fallback/alias logic for topic -> niche
    if not req_dict.get("niche") and req_dict.get("topic"):
        req_dict["niche"] = req_dict["topic"]
    if not req_dict.get("user_id"):
        req_dict["user_id"] = "demo_user"

    from app.api.billing import deduct_credits
    deduct_credits(50)

    from app.services.workflow_service import execute_workflow
    result = await execute_workflow(req_dict)
    
    # Extract the script text so the frontend can read response.data.script directly
    script_text = ""
    if isinstance(result, dict) and "script" in result:
        script_val = result["script"]
        if isinstance(script_val, dict) and "script" in script_val:
            script_text = script_val["script"]
        else:
            script_text = str(script_val)
            
    return {
        "script": script_text,
        "full_content_package": result
    }
