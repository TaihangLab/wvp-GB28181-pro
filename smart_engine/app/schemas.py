"""
通用数据模式定义
"""
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel

class Message(BaseModel):
    """
    通用消息响应模式
    """
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    
    model_config = {
        'json_schema_extra': {
            "example": {
                "success": True,
                "message": "操作成功",
                "data": {}
            }
        }
    } 