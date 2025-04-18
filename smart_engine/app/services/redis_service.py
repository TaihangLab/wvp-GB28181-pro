"""
Redis服务模块，提供Redis连接和操作的工具函数
"""
import redis
import json
import logging
from typing import List, Dict, Any, Set, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis连接池
_redis_pool = None

def get_redis_client():
    """
    获取Redis客户端连接
    
    Returns:
        redis.Redis: Redis客户端实例
    """
    global _redis_pool
    if _redis_pool is None:
        # 创建连接池
        _redis_pool = redis.ConnectionPool(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            decode_responses=True  # 自动解码为字符串
        )
    
    return redis.Redis(connection_pool=_redis_pool)

# Redis键前缀
SKILL_MODELS_KEY_PREFIX = "skill:models:"  # 存储技能使用的模型列表
MODEL_SKILLS_KEY_PREFIX = "model:skills:"  # 存储模型被哪些技能使用
MODEL_STATUS_KEY_PREFIX = "model:status:"  # 存储模型状态信息

def register_skill_model_relation(skill_id: str, model_names: List[str]) -> bool:
    """
    注册技能和模型的关系
    
    Args:
        skill_id: 技能ID
        model_names: 模型名称列表
        
    Returns:
        bool: 是否成功
    """
    try:
        client = get_redis_client()
        pipe = client.pipeline()
        
        # 技能使用的模型列表键
        skill_models_key = f"{SKILL_MODELS_KEY_PREFIX}{skill_id}"
        
        # 删除旧的关系
        existing_models = client.smembers(skill_models_key)
        for model_name in existing_models:
            model_skills_key = f"{MODEL_SKILLS_KEY_PREFIX}{model_name}"
            pipe.srem(model_skills_key, skill_id)
        
        # 清空技能的模型列表
        pipe.delete(skill_models_key)
        
        # 添加新关系
        if model_names:
            # 设置技能使用的模型
            pipe.sadd(skill_models_key, *model_names)
            
            # 设置每个模型被使用的技能
            for model_name in model_names:
                model_skills_key = f"{MODEL_SKILLS_KEY_PREFIX}{model_name}"
                pipe.sadd(model_skills_key, skill_id)
        
        # 执行事务
        pipe.execute()
        return True
    except Exception as e:
        logger.error(f"注册技能-模型关系失败: {str(e)}")
        return False

def get_skill_models(skill_id: str) -> List[str]:
    """
    获取技能使用的所有模型
    
    Args:
        skill_id: 技能ID
        
    Returns:
        List[str]: 模型名称列表
    """
    try:
        client = get_redis_client()
        skill_models_key = f"{SKILL_MODELS_KEY_PREFIX}{skill_id}"
        models = client.smembers(skill_models_key)
        return list(models)
    except Exception as e:
        logger.error(f"获取技能使用的模型失败: {str(e)}")
        return []

def get_model_skills(model_name: str) -> List[str]:
    """
    获取使用指定模型的所有技能
    
    Args:
        model_name: 模型名称
        
    Returns:
        List[str]: 技能ID列表
    """
    try:
        client = get_redis_client()
        model_skills_key = f"{MODEL_SKILLS_KEY_PREFIX}{model_name}"
        skills = client.smembers(model_skills_key)
        return list(skills)
    except Exception as e:
        logger.error(f"获取使用模型的技能失败: {str(e)}")
        return []

def set_model_status(model_name: str, status: Dict[str, Any]) -> bool:
    """
    设置模型状态信息
    
    Args:
        model_name: 模型名称
        status: 状态信息字典
        
    Returns:
        bool: 是否成功
    """
    try:
        client = get_redis_client()
        model_status_key = f"{MODEL_STATUS_KEY_PREFIX}{model_name}"
        client.set(model_status_key, json.dumps(status))
        return True
    except Exception as e:
        logger.error(f"设置模型状态失败: {str(e)}")
        return False

def get_model_status(model_name: str) -> Optional[Dict[str, Any]]:
    """
    获取模型状态信息
    
    Args:
        model_name: 模型名称
        
    Returns:
        Dict[str, Any]: 状态信息字典，如果不存在则返回None
    """
    try:
        client = get_redis_client()
        model_status_key = f"{MODEL_STATUS_KEY_PREFIX}{model_name}"
        status_json = client.get(model_status_key)
        
        if status_json:
            return json.loads(status_json)
        return None
    except Exception as e:
        logger.error(f"获取模型状态失败: {str(e)}")
        return None

def unregister_skill(skill_id: str) -> bool:
    """
    取消注册技能及其关联的模型
    
    Args:
        skill_id: 技能ID
        
    Returns:
        bool: 是否成功
    """
    try:
        client = get_redis_client()
        pipe = client.pipeline()
        
        # 技能使用的模型列表键
        skill_models_key = f"{SKILL_MODELS_KEY_PREFIX}{skill_id}"
        
        # 获取技能使用的所有模型
        models = client.smembers(skill_models_key)
        
        # 从每个模型的技能列表中移除此技能
        for model_name in models:
            model_skills_key = f"{MODEL_SKILLS_KEY_PREFIX}{model_name}"
            pipe.srem(model_skills_key, skill_id)
        
        # 删除技能的模型列表
        pipe.delete(skill_models_key)
        
        # 执行事务
        pipe.execute()
        return True
    except Exception as e:
        logger.error(f"取消注册技能关系失败: {str(e)}")
        return False

def check_model_used_by_other_skills(model_name: str, exclude_skill_id: Optional[str] = None) -> List[str]:
    """
    检查模型是否被其他技能使用
    
    Args:
        model_name: 模型名称
        exclude_skill_id: 排除的技能ID（例如当前正在卸载模型的技能）
        
    Returns:
        List[str]: 使用该模型的技能ID列表（排除指定技能）
    """
    try:
        redis_client = get_redis_client()
        if not redis_client:
            logger.error("Redis客户端未初始化")
            return []
            
        # 获取使用该模型的所有技能
        skill_ids = redis_client.smembers(f"model:{model_name}:skills")
        skill_ids = [skill_id.decode('utf-8') for skill_id in skill_ids]
        
        # 如果提供了排除的技能ID，则排除它
        if exclude_skill_id and exclude_skill_id in skill_ids:
            skill_ids.remove(exclude_skill_id)
            
        return skill_ids
    except Exception as e:
        logger.error(f"检查模型是否被其他技能使用时出错: {str(e)}")
        return []

# 全局Redis客户端实例
redis_client = get_redis_client() 