from .auth import router as auth_router
from .users import router as users_router
from .trends import router as trends_router
from .scripts import router as scripts_router
from .visuals import router as visuals_router
from .optimization import router as optimization_router
from .analytics import router as analytics_router
from .personalization import router as personalization_router
from .orchestrator import router as orchestrator_router

# Creates empty router maps internally so `main.py` can load successfully
from fastapi import APIRouter

router = APIRouter()
