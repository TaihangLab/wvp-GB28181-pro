"""
API路由器，集中管理所有API端点
"""
from fastapi import APIRouter
from app.api.endpoints import models, skills, cameras

api_router = APIRouter()

# 添加各API端点路由
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"]) 