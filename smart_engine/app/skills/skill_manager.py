"""
技能管理模块，负责技能的加载、初始化、运行和管理
"""
import logging
import os
from typing import Dict, Any, List, Optional, Tuple, Union
import time
import traceback

from sqlalchemy.orm import Session

from app.models.camera import Camera
from app.models.skill import Skill as SkillModel
from app.db.skill_dao import SkillDAO
from app.db.model_dao import ModelDAO
from app.db.camera_dao import CameraDAO
from app.utils.skill_scanner import create_or_update_skill
from app.skills.skill_base import BaseSkill
from app.skills.skill_factory import SkillFactory, skill_factory

logger = logging.getLogger(__name__)

class SkillManager:
    """
    技能管理器，负责管理所有技能实例
    
    技能相关概念解释：
    - skill_name: 技能名称，如'Face Detection'，用于标识和查找技能类
    - skill_id: 技能ID，数据库中的主键，用于在系统中引用具体的技能实例
    """
    def __init__(self, db: Session):
        """
        初始化技能管理器
        
        Args:
            db: 数据库会话
        """
        self.db = db
        self.skills: Dict[str, BaseSkill] = {}  # 按ID索引的技能实例
        self.initialized = False
        
    def initialize(self) -> bool:
        """
        初始化技能管理器，加载所有技能模块和数据库中的技能配置
        
        Returns:
            初始化是否成功
        """
        if self.initialized:
            logger.warning("技能管理器已经初始化，请勿重复初始化")
            return True
            
        try:
            # 1. 加载技能模块
            skill_dir = os.path.dirname(os.path.abspath(__file__))
            skill_factory.load_skill_modules(skill_dir)
            
            # 2. 扫描所有技能类并在数据库中创建或更新对应记录
            self._scan_and_update_skills()
            
            # 3. 从数据库加载技能配置并创建实例
            self._load_skill_instances()
            
            self.initialized = True
            logger.info(f"技能管理器初始化完成，已加载 {len(self.skills)} 个技能")
            return True
        except Exception as e:
            logger.exception(f"初始化技能管理器失败: {e}")
            return False
            
    def _scan_and_update_skills(self) -> None:
        """
        扫描所有注册的技能类，在数据库中创建或更新对应的技能记录
        """
        logger.info("扫描并更新数据库中的技能记录")
        skill_names = skill_factory.get_registered_skill_names()
        
        for skill_name in skill_names:
            skill_class = skill_factory.get_skill_class(skill_name)
            if skill_class:
                try:
                    # 获取技能中文名称
                    chinese_name = getattr(skill_class, "SKILL_NAME_ZH", skill_name)
                    
                    logger.info(f"处理技能: 名称={skill_name}, 中文名称={chinese_name}")
                    
                    # 在数据库中创建或更新技能
                    skill_result = create_or_update_skill(self.db, skill_class)
                    if skill_result:
                        logger.info(f"技能记录 {skill_result.get('name')} ({skill_result.get('status')}) 已同步到数据库")
                    else:
                        logger.warning(f"技能 {skill_name} 同步到数据库失败")
                except Exception as e:
                    logger.error(f"更新技能 {skill_name} 失败: {str(e)}")
            
    def _load_skill_instances(self) -> None:
        """
        从数据库加载所有已启用的技能并创建实例
        """
        logger.info("从数据库加载技能实例")
        try:
            # 获取数据库中所有已启用的技能
            db_skills = SkillDAO.get_all_enabled_skills(self.db)
            logger.info(f"数据库中有 {len(db_skills)} 个已启用的技能")
            
            # 为每个技能创建实例
            for db_skill in db_skills:
                # 准备技能配置
                config = {
                    "id": str(db_skill.id),
                    "name": db_skill.name,  # 技能名称
                    "name_zh": db_skill.name_zh or "",  # 中文名称
                    "config": db_skill.config or {}  # 技能配置参数
                }
                
                # 创建技能实例
                skill = skill_factory.create_skill(config)
                if skill:
                    # 存储技能实例，使用技能ID作为键
                    self.skills[str(db_skill.id)] = skill
                    logger.info(f"已加载技能: 名称={db_skill.name}, ID={db_skill.id}")
                else:
                    logger.error(f"创建技能实例失败: 名称={db_skill.name}, ID={db_skill.id}")
        except Exception as e:
            logger.exception(f"加载技能实例失败: {e}")
    
    def get_skill(self, skill_id: str) -> Optional[BaseSkill]:
        """
        根据ID获取技能实例
        
        Args:
            skill_id: 技能ID (数据库主键)
            
        Returns:
            技能实例或None
        """
        return self.skills.get(skill_id)
        
    def get_skills_by_name(self, skill_name: str) -> List[BaseSkill]:
        """
        获取指定名称的所有技能
        
        Args:
            skill_name: 技能名称
            
        Returns:
            技能实例列表
        """
        return [skill for skill in self.skills.values() if skill.config.get("name") == skill_name]
        
    def get_all_skills(self) -> List[BaseSkill]:
        """
        获取所有技能实例
        
        Returns:
            技能实例列表
        """
        return list(self.skills.values())
        
    def add_skill(self, skill: BaseSkill) -> bool:
        """
        添加技能实例
        
        Args:
            skill: 技能实例
            
        Returns:
            是否添加成功
        """
        # 获取技能ID
        skill_id = skill.config.get("id")
        if not skill_id:
            logger.error("技能配置缺少ID，无法添加")
            return False
            
        # 检查是否已存在同ID的技能
        if skill_id in self.skills:
            logger.warning(f"技能ID {skill_id} 已存在，将覆盖原有技能")
            
        # 添加技能实例
        self.skills[skill_id] = skill
        logger.info(f"添加技能: 名称={skill.config.get('name')}, ID={skill_id}")
        return True
        
    def remove_skill(self, skill_id: str) -> bool:
        """
        移除技能实例
        
        Args:
            skill_id: 技能ID
            
        Returns:
            是否移除成功
        """
        if skill_id not in self.skills:
            logger.warning(f"技能ID {skill_id} 不存在，无法移除")
            return False
            
        # 获取技能信息用于日志
        skill = self.skills.pop(skill_id)
        skill_name = skill.config.get('name', '')
        
        logger.info(f"已移除技能: 名称={skill_name}, ID={skill_id}")
        return True
        
    def reload_skill(self, skill_id: str) -> bool:
        """
        重新加载技能
        
        Args:
            skill_id: 技能ID
            
        Returns:
            是否重新加载成功
        """
        # 1. 从数据库获取最新的技能配置
        db_skill = SkillDAO.get_skill_by_id(skill_id, self.db)
        if not db_skill:
            logger.error(f"数据库中不存在技能ID {skill_id}，无法重新加载")
            return False
            
        # 2. 准备技能配置
        config = {
            "id": str(db_skill.id),
            "name": db_skill.name,  # 技能名称
            "name_zh": db_skill.name_zh or "",  # 中文名称
            "config": db_skill.config or {}  # 技能配置参数
        }
        
        # 3. 移除旧的技能实例
        if skill_id in self.skills:
            self.remove_skill(skill_id)
            
        # 4. 创建新的技能实例
        skill = skill_factory.create_skill(config)
        if not skill:
            logger.error(f"重新创建技能实例失败: 名称={db_skill.name}, ID={skill_id}")
            return False
            
        # 5. 添加新的技能实例
        self.skills[skill_id] = skill
        logger.info(f"已重新加载技能: 名称={db_skill.name}, ID={skill_id}")
        return True
        
    def process(self, data: Dict[str, Any], camera: Camera) -> Dict[str, Any]:
        """
        使用与摄像头关联的技能处理输入数据
        
        Args:
            data: 输入数据
            camera: 摄像头对象
            
        Returns:
            处理结果
        """
        start_time = time.time()
        results = {}
        
        try:
            # 获取与摄像头关联的所有技能
            camera_skills = CameraDAO.get_camera_skills(camera.id, self.db)
            
            if not camera_skills:
                logger.info(f"摄像头 {camera.id} 没有关联的技能，跳过处理")
                return results
                
            # 依次使用每个技能处理数据
            for camera_skill in camera_skills:
                # 获取技能ID
                skill_id = str(camera_skill.skill_id)
                # 获取技能实例
                skill = self.get_skill(skill_id)
                
                if not skill:
                    logger.warning(f"未找到技能实例 ID={skill_id}，跳过处理")
                    continue
                    
                try:
                    # 获取技能信息用于日志
                    skill_name = skill.config.get('name', '')
                    skill_name_zh = skill.config.get('name_zh', '')
                    
                    # 使用技能处理数据
                    skill_start_time = time.time()
                    skill_result = skill.process(data)
                    skill_end_time = time.time()
                    
                    # 记录处理结果
                    results[skill_id] = {
                        "result": skill_result,
                        "processing_time": skill_end_time - skill_start_time
                    }
                    
                    # 使用名称、中文名称或ID作为日志标识
                    display_name = skill_name_zh or skill_name or f"技能ID={skill_id}"
                    logger.debug(f"技能 {display_name} 处理完成，耗时 {skill_end_time - skill_start_time:.3f}s")
                except Exception as e:
                    skill_name = skill.config.get('name', f"技能ID={skill_id}")
                    logger.exception(f"技能 {skill_name} 处理失败: {e}")
                    results[skill_id] = {
                        "error": str(e),
                        "traceback": traceback.format_exc()
                    }
        except Exception as e:
            logger.exception(f"处理数据失败: {e}")
            
        end_time = time.time()
        logger.info(f"数据处理完成，总耗时 {end_time - start_time:.3f}s")
        return results
        
    def get_available_skill_names(self) -> List[Dict[str, Any]]:
        """
        获取所有可用的技能名称信息
        
        Returns:
            技能名称信息列表，包含名称、中文名称和描述
        """
        result = []
        skill_names = skill_factory.get_registered_skill_names()
        
        for skill_name in skill_names:
            skill_class = skill_factory.get_skill_class(skill_name)
            if skill_class:
                # 获取技能描述
                description = getattr(skill_class, "__doc__", "").strip() or None
                # 获取中文名称
                chinese_name = getattr(skill_class, "SKILL_NAME_ZH", skill_name)
                
                skill_info = {
                    "name": skill_name,         # 技能名称
                    "name_zh": chinese_name,    # 技能中文名称
                    "description": description  # 技能描述
                }
                result.append(skill_info)
                
        return result 