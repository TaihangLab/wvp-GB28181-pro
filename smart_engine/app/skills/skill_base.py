"""
技能基类模块，定义所有技能的共同接口
"""
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Union, Tuple

logger = logging.getLogger(__name__)

class SkillResult:
    """
    技能执行结果类
    """
    
    def __init__(self, 
                 success: bool = True, 
                 data: Any = None, 
                 error_message: str = None):
        """
        初始化技能执行结果
        
        Args:
            success: 是否成功
            data: 结果数据
            error_message: 错误信息
        """
        self.success = success
        self.data = data
        self.error_message = error_message
        
    def to_dict(self) -> Dict[str, Any]:
        """
        将结果转换为字典
        
        Returns:
            结果字典
        """
        return {
            "success": self.success,
            "data": self.data,
            "error_message": self.error_message
        }
        
    @classmethod
    def success_result(cls, data: Any = None) -> 'SkillResult':
        """
        创建成功结果
        
        Args:
            data: 结果数据
            
        Returns:
            成功结果
        """
        return cls(True, data)
        
    @classmethod
    def error_result(cls, error_message: str, data: Any = None) -> 'SkillResult':
        """
        创建错误结果
        
        Args:
            error_message: 错误信息
            data: 附加数据
            
        Returns:
            错误结果
        """
        return cls(False, data, error_message)

class BaseSkill(ABC):
    """
    技能基类，所有具体技能实现必须继承此类
    """
    
    # 技能类型标识，子类必须覆盖
    SKILL_TYPE = ""
    
    # 技能所需模型列表，子类应该覆盖
    REQUIRED_MODELS = []
    
    def __init__(self, config_or_name: Union[Dict[str, Any], str] = None):
        """
        初始化技能
        
        Args:
            config_or_name: 技能配置字典或者技能名称字符串
        """
        # 支持两种初始化方式：通过配置字典或者直接给名称
        if isinstance(config_or_name, dict):
            self.config = config_or_name
            self.name = self.config.get("name", self.__class__.__name__)
            self.description = self.config.get("description", "")
            self.enabled = self.config.get("enabled", True)
            self.skill_id = self.config.get("id", f"{self.SKILL_TYPE}_{id(self)}")
        else:
            self.config = {}
            self.name = config_or_name if config_or_name else self.__class__.__name__
            self.description = ""
            self.enabled = True
            self.skill_id = f"{self.SKILL_TYPE}_{id(self)}"
        
        # 初始化技能
        self._initialize()
        
        # 注册模型关系
        self._register_model_relations()
        
    def __str__(self) -> str:
        """返回技能的字符串表示"""
        return f"{self.name}(type={self.SKILL_TYPE}, enabled={self.enabled})"
        
    def _initialize(self) -> None:
        """
        初始化技能，子类可以覆盖此方法进行额外的初始化
        """
        pass
        
    def validate_config(self) -> bool:
        """
        验证配置是否有效
        
        Returns:
            配置有效返回True，否则返回False
        """
        # 如果没有配置，则不需要验证
        if not self.config:
            return True
            
        # 基本验证：确保技能类型匹配
        config_type = self.config.get("type")
        if not config_type or config_type != self.SKILL_TYPE:
            logger.error(f"技能类型不匹配: 配置={config_type}, 预期={self.SKILL_TYPE}")
            return False
            
        return True
        
    @abstractmethod
    def process(self, input_data: Any) -> Any:
        """
        处理输入数据
        
        Args:
            input_data: 输入数据
            
        Returns:
            处理结果
        """
        pass
        
    def is_enabled(self) -> bool:
        """
        判断技能是否启用
        
        Returns:
            技能是否启用
        """
        return self.enabled
        
    def enable(self) -> None:
        """启用技能"""
        self.enabled = True
        
    def disable(self) -> None:
        """禁用技能"""
        self.enabled = False
        
    def log(self, level: str, message: str) -> None:
        """
        记录日志
        
        Args:
            level: 日志级别
            message: 日志消息
        """
        log_method = getattr(logger, level.lower(), logger.info)
        log_method(f"{message}")
        
    def get_metadata(self) -> Dict[str, Any]:
        """
        获取技能元数据
        
        Returns:
            技能元数据
        """
        return {
            "type": self.SKILL_TYPE,
            "name": self.name,
            "description": self.description,
            "enabled": self.enabled,
            "id": self.skill_id
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """
        将技能转换为字典
        
        Returns:
            技能字典
        """
        return {
            **self.get_metadata(),
            "config": self.config
        }
        
    @classmethod
    def get_required_config_fields(cls) -> List[str]:
        """
        获取必须的配置字段列表
        
        Returns:
            必须的配置字段列表
        """
        return ["type"]
        
    def get_required_models(self) -> List[str]:
        """
        获取技能所需的模型列表
        
        Returns:
            模型名称列表
        """
        # 默认使用类的REQUIRED_MODELS
        # 子类可以覆盖此方法提供动态的模型列表
        return self.REQUIRED_MODELS
        
    def check_model_readiness(self) -> Tuple[bool, Optional[str]]:
        """
        检查所需模型和Triton服务器是否就绪
        
        Returns:
            (bool, str): 是否就绪，如果不就绪返回错误信息
        """
        from app.services.triton_client import triton_client
        
        # 检查Triton服务器是否就绪
        if not triton_client.is_server_ready():
            return False, "Triton服务器未就绪"
        
        # 获取所需模型
        required_models = self.get_required_models()
        
        # 检查所有模型是否就绪
        for model_name in required_models:
            if model_name and not triton_client.is_model_ready(model_name):
                return False, f"模型 {model_name} 未就绪"
                
        return True, None

    def _register_model_relations(self) -> None:
        """
        注册技能和模型的关系到Redis
        """
        try:
            from app.services.redis_service import register_skill_model_relation
            
            # 获取所需模型
            required_models = self.get_required_models()
            
            # 注册关系
            if required_models:
                register_skill_model_relation(self.skill_id, required_models)
                self.log("debug", f"已注册技能 '{self.name}' 与模型 {required_models} 的关系")
        except Exception as e:
            self.log("error", f"注册模型关系失败: {str(e)}") 