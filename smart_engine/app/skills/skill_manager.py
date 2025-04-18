"""
技能管理器模块，负责初始化和管理所有技能
"""
import logging
import threading
import time
from typing import Dict, List, Any, Optional, Set, Tuple

from app.skills.skill_base import BaseSkill, SkillResult
from app.skills.skill_factory import skill_factory, get_available_skill_configs
from app.services.redis_service import (
    register_skill_model_relation,
    get_skill_models,
    get_model_skills,
    check_model_used_by_other_skills,
    set_model_status
)

logger = logging.getLogger(__name__)

class SkillManager:
    """
    技能管理器类，负责初始化和管理所有技能实例
    """
    
    def __init__(self):
        """初始化技能管理器"""
        self._skills: Dict[str, BaseSkill] = {}
        self._lock = threading.RLock()  # 用于线程安全操作
        
        # 模型就绪性缓存，存储格式为：{model_name: {"ready": bool, "timestamp": float}}
        self._model_readiness_cache = {}
        # 缓存过期时间（秒）
        self._cache_expiry_time = 20.0
        
    def initialize(self) -> int:
        """
        初始化所有技能实例
        
        Returns:
            初始化的技能数量
        """
        # 获取所有技能配置
        configs = get_available_skill_configs()
        count = 0
        
        with self._lock:
            for config in configs:
                skill_id = config.get("id")
                if not skill_id:
                    logger.warning(f"跳过没有id的技能配置: {config}")
                    continue
                    
                # 如果技能已经存在且不需要重新加载，跳过
                if skill_id in self._skills and not config.get("reload", False):
                    logger.debug(f"技能已存在，跳过: {skill_id}")
                    continue
                    
                # 创建技能实例
                skill = skill_factory.create_skill(config)
                if skill:
                    self._skills[skill_id] = skill
                    count += 1
                    logger.info(f"初始化技能: {skill.name} (ID: {skill_id}, 类型: {skill.SKILL_TYPE})")
                    
        logger.info(f"初始化了 {count} 个技能实例")
        return count
        
    def get_skill(self, skill_id: str) -> Optional[BaseSkill]:
        """
        获取指定ID的技能实例
        
        Args:
            skill_id: 技能ID
            
        Returns:
            技能实例或None（如果未找到）
        """
        return self._skills.get(skill_id)
        
    def get_skills_by_type(self, skill_type: str) -> List[BaseSkill]:
        """
        获取指定类型的所有技能实例
        
        Args:
            skill_type: 技能类型
            
        Returns:
            技能实例列表
        """
        return [skill for skill in self._skills.values() 
                if skill.SKILL_TYPE == skill_type]
                
    def get_all_skills(self) -> List[BaseSkill]:
        """
        获取所有技能实例
        
        Returns:
            所有技能实例的列表
        """
        return list(self._skills.values())
        
    def add_skill(self, skill: BaseSkill) -> bool:
        """
        添加技能实例
        
        Args:
            skill: 技能实例
            
        Returns:
            是否成功添加
        """
        with self._lock:
            if skill.skill_id in self._skills:
                logger.warning(f"技能ID已存在，无法添加: {skill.skill_id}")
                return False
                
            self._skills[skill.skill_id] = skill
            logger.info(f"添加技能: {skill.name} (ID: {skill.skill_id})")
            return True
            
    def remove_skill(self, skill_id: str) -> bool:
        """
        移除技能实例
        
        Args:
            skill_id: 技能ID
            
        Returns:
            是否成功移除
        """
        with self._lock:
            if skill_id not in self._skills:
                logger.warning(f"技能ID不存在，无法移除: {skill_id}")
                return False
            
            # 从缓存中移除
            del self._skills[skill_id]
            logger.info(f"移除技能: {skill_id}")
            return True
            
    def process(self, skill_id: str, input_data: Any) -> SkillResult:
        """
        使用指定技能处理输入数据
        
        Args:
            skill_id: 技能ID
            input_data: 输入数据
            
        Returns:
            处理结果
            
        Raises:
            ValueError: 如果技能ID不存在
        """
        skill = self.get_skill(skill_id)
        if not skill:
            error_msg = f"技能不存在: {skill_id}"
            logger.error(error_msg)
            return SkillResult.error_result(error_msg)
            
        if not skill.enabled:
            error_msg = f"技能已禁用: {skill_id}"
            logger.warning(error_msg)
            return SkillResult.error_result(error_msg)
            
        # 检查模型就绪性（使用缓存）
        is_ready, error_message = self._check_model_readiness_with_cache(skill)
        if not is_ready:
            logger.warning(f"技能 {skill_id} 所需模型未就绪: {error_message}")
            return SkillResult.error_result(error_message)
            
        try:
            logger.debug(f"执行技能: {skill.name} (ID: {skill_id})")
            result = skill.process(input_data)
            return result
        except Exception as e:
            error_msg = f"技能执行异常: {skill_id}, 错误: {str(e)}"
            logger.exception(error_msg)
            return SkillResult.error_result(error_msg)
            
    def _check_model_readiness_with_cache(self, skill: BaseSkill) -> Tuple[bool, Optional[str]]:
        """
        检查模型就绪性，使用缓存避免频繁请求
        
        Args:
            skill: 技能实例
            
        Returns:
            (bool, str): 是否就绪，如果不就绪返回错误信息
        """
        import time
        from app.services.triton_client import triton_client
        
        # 首先检查服务器是否就绪
        server_key = "_server_"
        current_time = time.time()
        
        # 检查服务器就绪性是否存在于缓存中
        if server_key in self._model_readiness_cache:
            cache_data = self._model_readiness_cache[server_key]
            # 检查缓存是否过期
            if current_time - cache_data["timestamp"] < self._cache_expiry_time:
                # 使用缓存值
                if not cache_data["ready"]:
                    return False, "Triton服务器未就绪"
            else:
                # 缓存过期，删除
                del self._model_readiness_cache[server_key]
        
        # 如果未命中缓存，直接检查服务器状态
        if server_key not in self._model_readiness_cache:
            is_server_ready = triton_client.is_server_ready()
            # 更新缓存
            self._model_readiness_cache[server_key] = {
                "ready": is_server_ready,
                "timestamp": current_time
            }
            if not is_server_ready:
                return False, "Triton服务器未就绪"
        
        # 获取所需模型
        required_models = skill.get_required_models()
        
        # 检查所有模型是否就绪（使用缓存）
        for model_name in required_models:
            if not model_name:
                continue
                
            # 检查模型就绪性是否存在于缓存中
            if model_name in self._model_readiness_cache:
                cache_data = self._model_readiness_cache[model_name]
                # 检查缓存是否过期
                if current_time - cache_data["timestamp"] < self._cache_expiry_time:
                    # 使用缓存值
                    if not cache_data["ready"]:
                        return False, f"模型 {model_name} 未就绪"
                else:
                    # 缓存过期，删除
                    del self._model_readiness_cache[model_name]
            
            # 如果未命中缓存，直接检查模型状态    
            if model_name not in self._model_readiness_cache:
                is_model_ready = triton_client.is_model_ready(model_name)
                # 更新缓存
                self._model_readiness_cache[model_name] = {
                    "ready": is_model_ready,
                    "timestamp": current_time
                }
                if not is_model_ready:
                    return False, f"模型 {model_name} 未就绪"
                    
        return True, None
    
    def load_skill_models(self, skill_id: str) -> Dict[str, bool]:
        """
        加载指定技能所需的所有模型
        
        Args:
            skill_id: 技能ID
            
        Returns:
            Dict[str, bool]: 模型加载结果，格式为 {model_name: success}
        """
        from app.services.triton_client import triton_client
        
        skill = self.get_skill(skill_id)
        if not skill:
            logger.error(f"找不到技能: {skill_id}")
            return {}
            
        # 获取技能所需的模型列表
        required_models = skill.get_required_models()
        if not required_models:
            logger.info(f"技能 {skill_id} 不需要任何模型")
            return {}
            
        # 检查服务器是否就绪
        if not triton_client.is_server_ready():
            logger.error("Triton服务器未就绪，无法加载模型")
            return {model: False for model in required_models}
            
        # 将技能所需模型注册到Redis
        register_skill_model_relation(skill_id, required_models)
        
        # 加载模型并记录结果
        result = {}
        for model_name in required_models:
            if not model_name:
                continue
                
            logger.info(f"正在加载模型: {model_name}")
            try:
                # 检查模型是否已经加载
                if triton_client.is_model_ready(model_name):
                    logger.info(f"模型 {model_name} 已经就绪")
                    result[model_name] = True
                    # 更新缓存和Redis状态
                    self._model_readiness_cache[model_name] = {
                        "ready": True,
                        "timestamp": time.time()
                    }
                    # 更新Redis中的模型状态
                    set_model_status(model_name, {"ready": True, "timestamp": time.time()})
                    continue
                    
                # 尝试加载模型
                success = triton_client.load_model(model_name)
                result[model_name] = success
                
                if success:
                    logger.info(f"成功加载模型: {model_name}")
                    # 更新缓存和Redis状态
                    self._model_readiness_cache[model_name] = {
                        "ready": True,
                        "timestamp": time.time()
                    }
                    # 更新Redis中的模型状态
                    set_model_status(model_name, {"ready": True, "timestamp": time.time()})
                else:
                    logger.error(f"加载模型失败: {model_name}")
                    # 更新Redis中的模型状态
                    set_model_status(model_name, {"ready": False, "timestamp": time.time()})
            except Exception as e:
                logger.exception(f"加载模型 {model_name} 时出错: {str(e)}")
                result[model_name] = False
                
        return result
    
    def unload_skill_models(self, skill_id: str) -> Dict[str, bool]:
        """
        卸载指定技能所需的模型，但会检查其他技能是否也需要这些模型
        
        Args:
            skill_id: 技能ID
            
        Returns:
            Dict[str, bool]: 模型卸载结果，格式为 {model_name: success}
        """
        from app.services.triton_client import triton_client
        import time
        
        skill = self.get_skill(skill_id)
        if not skill:
            logger.error(f"找不到技能: {skill_id}")
            return {}
            
        # 获取技能所需的模型列表
        target_models = skill.get_required_models()
        if not target_models:
            logger.info(f"技能 {skill_id} 不需要任何模型")
            return {}
            
        # 检查服务器是否就绪
        if not triton_client.is_server_ready():
            logger.error("Triton服务器未就绪，无法卸载模型")
            return {model: False for model in target_models}
            
        # 将技能所需模型注册到Redis
        register_skill_model_relation(skill_id, target_models)
        
        # 卸载模型并记录结果
        result = {}
        for model_name in target_models:
            if not model_name:
                continue
                
            # 使用Redis检查是否有其他技能需要此模型
            if check_model_used_by_other_skills(model_name, skill_id):
                logger.info(f"模型 {model_name} 被其他技能使用，不会卸载")
                result[model_name] = False
                continue
                
            logger.info(f"正在卸载模型: {model_name}")
            try:
                # 尝试卸载模型
                success = triton_client.unload_model(model_name)
                result[model_name] = success
                
                if success:
                    logger.info(f"成功卸载模型: {model_name}")
                    # 更新缓存和Redis状态
                    self._model_readiness_cache[model_name] = {
                        "ready": False,
                        "timestamp": time.time()
                    }
                    # 更新Redis中的模型状态
                    set_model_status(model_name, {"ready": False, "timestamp": time.time()})
                else:
                    logger.error(f"卸载模型失败: {model_name}")
            except Exception as e:
                logger.exception(f"卸载模型 {model_name} 时出错: {str(e)}")
                result[model_name] = False
                
        return result
    
    def load_all_enabled_skill_models(self) -> Dict[str, Dict[str, bool]]:
        """
        加载所有启用的技能所需的模型
        
        Returns:
            Dict[str, Dict[str, bool]]: 按技能ID组织的模型加载结果
        """
        results = {}
        
        with self._lock:
            for skill_id, skill in self._skills.items():
                if skill.enabled:
                    results[skill_id] = self.load_skill_models(skill_id)
                    
        return results
            
    def get_skill_info(self) -> List[Dict[str, Any]]:
        """
        获取所有技能的信息
        
        Returns:
            技能信息列表
        """
        with self._lock:
            return [skill.get_metadata() for skill in self._skills.values()]
            
    def cleanup_all(self) -> None:
        """
        清理所有技能实例
        
        在程序关闭时应调用此方法以确保资源得到正确释放
        """
        logger.info("开始清理所有技能实例...")
        with self._lock:
            skill_ids = list(self._skills.keys())
            for skill_id in skill_ids:
                self.remove_skill(skill_id)
        logger.info("所有技能实例已清理完毕")

# 创建全局技能管理器实例
skill_manager = SkillManager() 