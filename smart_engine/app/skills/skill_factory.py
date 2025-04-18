"""
技能工厂模块，用于创建和管理技能实例
"""
import logging
import os
import glob
import json
from typing import Dict, Any, List, Optional, Type
import importlib

from app.skills.skill_base import BaseSkill

logger = logging.getLogger(__name__)

# 技能配置目录
DEFAULT_SKILL_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "configs")

class SkillFactory:
    """
    技能工厂类，负责根据配置创建和管理各种技能实例
    """
    
    # 已注册的技能类
    _skill_classes = {}
    
    @classmethod
    def register_skill_class(cls, skill_type: str, skill_class: Type[BaseSkill]) -> None:
        """
        注册技能类
        
        Args:
            skill_type: 技能类型标识
            skill_class: 技能类
        """
        cls._skill_classes[skill_type] = skill_class
        logger.debug(f"已注册技能类: {skill_type} -> {skill_class.__name__}")
        
    @classmethod
    def get_registered_skill_types(cls) -> List[str]:
        """
        获取所有已注册的技能类型
        
        Returns:
            技能类型列表
        """
        return list(cls._skill_classes.keys())
    
    @classmethod
    def get_skill_class(cls, skill_type: str) -> Optional[Type[BaseSkill]]:
        """
        获取技能类
        
        Args:
            skill_type: 技能类型
            
        Returns:
            技能类或None（如果未注册）
        """
        return cls._skill_classes.get(skill_type)
        
    @classmethod
    def create_skill(cls, config: Dict[str, Any]) -> Optional[BaseSkill]:
        """
        根据配置创建技能实例
        
        Args:
            config: 技能配置
            
        Returns:
            技能实例，如果创建失败则返回None
        """
        skill_type = config.get("type")
        if not skill_type:
            logger.error(f"技能配置缺少类型字段: {config}")
            return None
            
        # 获取对应的技能类
        skill_class = cls._skill_classes.get(skill_type)
        if not skill_class:
            logger.error(f"未注册的技能类型: {skill_type}")
            return None
            
        try:
            # 创建技能实例
            skill = skill_class(config)
            
            # 验证配置
            if not skill.validate_config():
                logger.error(f"技能配置验证失败: {config}")
                return None
                
            logger.info(f"成功创建技能: {skill}")
            return skill
        except Exception as e:
            logger.exception(f"创建技能失败: {str(e)}")
            return None
            
    @classmethod
    def create_skills_from_configs(cls, configs: List[Dict[str, Any]]) -> List[BaseSkill]:
        """
        根据配置列表创建多个技能实例
        
        Args:
            configs: 技能配置列表
            
        Returns:
            技能实例列表
        """
        skills = []
        
        for config in configs:
            skill = cls.create_skill(config)
            if skill:
                skills.append(skill)
                
        logger.info(f"从配置创建了 {len(skills)} 个技能")
        return skills
        
    @classmethod
    def load_skill_modules(cls, skill_dir: str) -> None:
        """
        从目录加载技能模块
        
        Args:
            skill_dir: 技能模块目录
        """
        logger.info(f"从目录加载技能模块: {skill_dir}")
        
        # 扫描目录加载所有技能模块
        try:
            for filename in os.listdir(skill_dir):
                if filename.endswith(".py") and not filename.startswith("__"):
                    module_name = filename[:-3]  # 去掉.py后缀
                    try:
                        module_path = f"app.skills.{module_name}"
                        module = importlib.import_module(module_path)
                        
                        # 查找并注册模块中的技能类
                        for attr_name in dir(module):
                            attr = getattr(module, attr_name)
                            if (isinstance(attr, type) and 
                                issubclass(attr, BaseSkill) and 
                                attr != BaseSkill and
                                hasattr(attr, 'SKILL_TYPE') and
                                attr.SKILL_TYPE):
                                cls.register_skill_class(attr.SKILL_TYPE, attr)
                                
                    except (ImportError, AttributeError) as e:
                        logger.warning(f"加载技能模块 {module_name} 失败: {str(e)}")
        except Exception as e:
            logger.exception(f"扫描技能目录失败: {str(e)}")

def create_skill_instance(skill_type: str, config: Dict[str, Any]) -> Optional[BaseSkill]:
    """
    创建技能实例
    
    Args:
        skill_type: 技能类型
        config: 技能配置
        
    Returns:
        技能实例或None（如果创建失败）
    """
    config_with_type = config.copy()
    config_with_type["type"] = skill_type
    return skill_factory.create_skill(config_with_type)

def get_available_skill_types() -> List[str]:
    """
    获取所有可用的技能类型
    
    Returns:
        技能类型列表
    """
    return skill_factory.get_registered_skill_types()
            
def register_available_skill_classes() -> int:
    """
    扫描并注册所有可用的技能类
    
    此函数从app/skills目录加载所有技能模块，并注册所有继承自BaseSkill的类
    
    Returns:
        注册的技能数量
    """
    # 获取skills目录的路径
    skills_dir = os.path.dirname(__file__)
    logger.info(f"扫描技能目录: {skills_dir}")
    
    # 扫描并注册所有技能
    return discover_and_register_skills(skill_factory, skills_dir)

def get_available_skill_configs(config_path: str = None) -> List[Dict[str, Any]]:
    """
    获取可用的技能配置
    
    Args:
        config_path: 配置文件目录，默认为DEFAULT_SKILL_CONFIG_PATH
        
    Returns:
        技能配置列表
    """
    if config_path is None:
        config_path = DEFAULT_SKILL_CONFIG_PATH
        
    if not os.path.exists(config_path):
        # 自动创建技能配置目录而不是仅仅发出警告
        try:
            os.makedirs(config_path, exist_ok=True)
            logger.info(f"已创建技能配置目录: {config_path}")
        except Exception as e:
            logger.warning(f"无法创建技能配置目录: {config_path}, 错误: {str(e)}")
            return []
            
    # 检查是否为空目录
    config_files = glob.glob(os.path.join(config_path, "*.json"))
    if not config_files:
        logger.info(f"技能配置目录为空: {config_path}")
        return []
        
    configs = []
    for file_path in config_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                if not isinstance(config, dict):
                    logger.warning(f"无效的技能配置文件格式: {file_path}, 应为JSON对象")
                    continue
                    
                # 添加配置文件路径信息
                config["config_file"] = file_path
                configs.append(config)
        except Exception as e:
            logger.error(f"加载技能配置文件失败: {file_path}, 错误: {str(e)}")
            
    logger.info(f"加载了 {len(configs)} 个技能配置")
    return configs

def discover_and_register_skills(skill_factory: SkillFactory, package_path: str = None) -> int:
    """
    发现并注册所有技能类
    
    Args:
        skill_factory: 技能工厂实例
        package_path: 技能包路径，默认为当前目录
        
    Returns:
        注册的技能数量
    """
    if package_path is None:
        package_path = os.path.dirname(__file__)
        
    count = 0
    
    # 查找所有Python文件（排除__init__.py和当前文件）
    python_files = glob.glob(os.path.join(package_path, "*.py"))
    module_names = [os.path.basename(f)[:-3] for f in python_files 
                   if not f.endswith("__init__.py") and not f.endswith("skill_factory.py")]
    
    for module_name in module_names:
        try:
            # 导入模块 - 使用app.skills前缀
            module = importlib.import_module(f"app.skills.{module_name}")
            
            # 寻找所有BaseSkill子类
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (isinstance(attr, type) and 
                    issubclass(attr, BaseSkill) and 
                    attr != BaseSkill and
                    getattr(attr, 'SKILL_TYPE', None)):
                    
                    skill_factory.register_skill_class(getattr(attr, 'SKILL_TYPE'), attr)
                    count += 1
                    logger.debug(f"从模块 {module_name} 注册技能: {attr.__name__}")
        except Exception as e:
            logger.exception(f"自动注册技能时出错, 模块: {module_name}, 错误: {str(e)}")
            
    logger.info(f"自动注册了 {count} 个技能类")
    return count

# 创建全局技能工厂实例
skill_factory = SkillFactory() 