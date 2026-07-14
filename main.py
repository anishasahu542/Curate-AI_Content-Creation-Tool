from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, orchestrator, trends, scripts, visuals, optimization, analytics, personalization, repurpose, hooks, calendar_planner, persona, viral_score, billing

app = FastAPI(
    title="AegisCreator AI - Unified Core",
    description="A single monolithic Python FastAPI backend replacing the modular services.",
    version="2.0.0"
)

# CORS middleware for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core / User Management
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["User Management"])

# AI & Orchestration
app.include_router(orchestrator.router, prefix="/api/v1/ai", tags=["AI Orchestration"])
app.include_router(personalization.router, prefix="/api/v1/personalization", tags=["Personalization Engine"])
app.include_router(trends.router, prefix="/api/v1/trends", tags=["Trend Engine"])
app.include_router(scripts.router, prefix="/api/v1/scripts", tags=["Script Engine"])
app.include_router(visuals.router, prefix="/api/v1/visuals", tags=["Visual Engine"])
app.include_router(optimization.router, prefix="/api/v1/optimization", tags=["Optimization Engine"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics Engine"])

# New Creator Tools
app.include_router(repurpose.router, prefix="/api/v1/repurpose", tags=["Content Repurposer"])
app.include_router(hooks.router, prefix="/api/v1/hooks", tags=["Hook Generator"])
app.include_router(calendar_planner.router, prefix="/api/v1/calendar", tags=["Content Calendar"])
app.include_router(persona.router, prefix="/api/v1/persona", tags=["Persona Builder"])
app.include_router(viral_score.router, prefix="/api/v1/viral-score", tags=["Viral Score"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["Billing"])

@app.get("/")
def root():
    return {"message": "AegisCreator AI Monolith API running successfully"}

