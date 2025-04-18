"""
技能基类模块，定义所有技能的基础接口
"""
from abc import ABC, abstractmethod
import logging

class Skill(ABC):
    """技能基类
    
    所有技能必须继承此类并实现__call__方法
    """
    def __init__(self, name=None):
        self.name = name or self.__class__.__name__
        self.logger = logging.getLogger(f"skill.{self.name}")
    
    @abstractmethod
    def __call__(self, *args, **kwargs):
        """执行技能的主要功能
        
        Args:
            参数取决于具体技能实现
            
        Returns:
            技能执行结果，格式取决于具体技能
        """
        pass
    
    def log(self, level, message):
        """记录日志
        
        Args:
            level: 日志级别，可选 "debug", "info", "warn", "error"
            message: 日志消息
        """
        if level == "debug":
            self.logger.debug(message)
        elif level == "info":
            self.logger.info(message)
        elif level == "warn":
            self.logger.warning(message)
        elif level == "error":
            self.logger.error(message) 