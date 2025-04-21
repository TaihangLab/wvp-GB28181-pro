"""
技能工厂模块，负责创建技能实例
"""
import importlib
import inspect
import logging
import os
import sys
from typing import Dict, Any, Type, List, Optional, Union

from app.skills.skill_base import BaseSkill

logger = logging.getLogger(__name__)

class SkillFactory:
    """
    技能工厂类，负责注册和创建技能实例
    """
    
    def __init__(self):
        """
        初始化技能工厂
        """
        # 注册的技能类，key为技能名称
        self.registered_skills: Dict[str, Type[BaseSkill]] = {}
        
    def register_skill_class(self, skill_class: Type[BaseSkill]) -> bool:
        """
        注册技能类
        
        Args:
            skill_class: 技能类，必须是BaseSkill的子类
            
        Returns:
            是否注册成功
        """
        # 检查是否是BaseSkill的子类
        if not issubclass(skill_class, BaseSkill):
            logger.error(f"注册失败: {skill_class.__name__} 不是BaseSkill的子类")
            return False
            
        # 获取技能名称
        skill_name = getattr(skill_class, "SKILL_NAME", None)
        if not skill_name:
            logger.error(f"注册失败: {skill_class.__name__} 没有定义SKILL_NAME属性")
            return False
        
        # 注册技能类
        if skill_name in self.registered_skills:
            logger.warning(f"技能名称 '{skill_name}' 已注册，将覆盖原有注册")
            
        self.registered_skills[skill_name] = skill_class
        logger.info(f"技能类 '{skill_class.__name__}' 已注册，名称: '{skill_name}'")
        return True
        
    def get_skill_class(self, skill_name: str) -> Optional[Type[BaseSkill]]:
        """
        获取注册的技能类
        
        Args:
            skill_name: 技能名称
            
        Returns:
            技能类或None
        """
        return self.registered_skills.get(skill_name)
        
    def get_registered_skill_names(self) -> List[str]:
        """
        获取所有注册的技能名称
        
        Returns:
            技能名称列表
        """
        return list(self.registered_skills.keys())
        
    def create_skill(self, config: Dict[str, Any]) -> Optional[BaseSkill]:
        """
        根据配置创建技能实例
        
        Args:
            config: 技能配置，必须包含'name'字段
            
        Returns:
            技能实例或None
        """
        # 获取技能名称
        skill_name = config.get('name')
        if not skill_name:
            logger.error("创建技能实例失败: 配置中缺少'name'字段")
            return None
            
        # 获取技能类
        skill_class = self.get_skill_class(skill_name)
        if not skill_class:
            logger.error(f"创建技能实例失败: 未注册的技能名称 '{skill_name}'")
            return None
            
        try:
            # 创建技能实例
            skill_instance = skill_class(config)
            # 初始化技能
            if skill_instance.initialize():
                logger.info(f"已创建并初始化技能实例: 名称='{skill_name}'")
                return skill_instance
            else:
                logger.error(f"技能实例初始化失败: 名称='{skill_name}'")
                return None
        except Exception as e:
            logger.exception(f"创建技能实例异常: 名称='{skill_name}', 错误: {e}")
            return None
            
    @staticmethod
    def load_skill_modules(skill_dir: str) -> bool:
        """
        加载技能目录中的所有技能模块
        
        Args:
            skill_dir: 技能目录路径
            
        Returns:
            是否加载成功
        """
        logger.info(f"从目录加载技能模块: {skill_dir}")
        try:
            # 确保目录存在
            if not os.path.exists(skill_dir) or not os.path.isdir(skill_dir):
                logger.error(f"技能目录不存在或不是目录: {skill_dir}")
                return False
                
            # 获取Python模块名
            package_name = os.path.basename(skill_dir)
            
            # 递归遍历目录
            for root, dirs, files in os.walk(skill_dir):
                for file in files:
                    # 只处理Python文件
                    if file.endswith('.py') and not file.startswith('_'):
                        try:
                            # 计算相对路径
                            rel_path = os.path.relpath(os.path.join(root, file), os.path.dirname(skill_dir))
                            # 转换为模块路径
                            module_path = rel_path.replace(os.sep, '.').replace('.py', '')
                            
                            # 导入模块
                            importlib.import_module(module_path)
                            logger.debug(f"已导入技能模块: {module_path}")
                        except Exception as e:
                            logger.error(f"导入技能模块失败: {file}, 错误: {e}")
                            
            # 扫描已加载的模块，查找并注册技能类
            for module_name, module in sys.modules.items():
                # 只处理app.skills包下的模块
                if module_name.startswith('app.skills') and not module_name.endswith('__init__'):
                    try:
                        # 扫描模块中的所有类
                        for name, obj in inspect.getmembers(module, inspect.isclass):
                            # 检查是否是BaseSkill的子类且不是BaseSkill本身
                            if (issubclass(obj, BaseSkill) and obj is not BaseSkill and 
                                obj.__module__ == module.__name__):
                                # 注册技能类
                                skill_factory.register_skill_class(obj)
                    except Exception as e:
                        logger.error(f"扫描模块失败: {module_name}, 错误: {e}")
                        
            logger.info(f"技能模块加载完成，共注册 {len(skill_factory.get_registered_skill_names())} 个技能类")
            return True
        except Exception as e:
            logger.exception(f"加载技能模块失败: {e}")
            return False

# 创建全局技能工厂实例
skill_factory = SkillFactory() 