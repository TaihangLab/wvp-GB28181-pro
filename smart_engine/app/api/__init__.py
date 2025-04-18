"""
API包，提供REST API接口
"""
from fastapi import APIRouter
from .endpoints import skills, cameras, models

api_router = APIRouter()
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
api_router.include_router(models.router, prefix="/models", tags=["models"])

__all__ = ["api_router"] 